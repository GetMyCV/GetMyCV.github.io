/**
 * GetMyCv order API.
 *
 * The static site cannot hold credentials, so every write goes through this
 * Worker: it validates the order, recomputes the price server-side, and writes
 * to D1. Nothing secret is ever shipped to the browser.
 *
 * Routes
 *   POST /orders          place an order            (public, rate limited)
 *   POST /uploads         get an upload URL         (public, only when R2 is bound)
 *   GET  /orders          list orders               (admin token)
 *   PATCH /orders/:ref    change an order's status  (admin token)
 */

export interface Env {
  DB: D1Database;
  UPLOADS?: R2Bucket;
  ALLOWED_ORIGINS: string;
  ADMIN_TOKEN?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

/**
 * Prices live here as well as in the site's content/pricing.ts. The browser is
 * free to send any total it likes, so the amount stored is the one this table
 * produces — never the one that arrived in the request.
 */
const PACKAGES: Record<string, { price: number; turnaround: string }> = {
  starter: { price: 4500, turnaround: '3 days' },
  professional: { price: 8500, turnaround: '5 days' },
  premium: { price: 17500, turnaround: '7–10 days' },
};

const ADD_ONS: Record<string, number> = {
  express: 3000,
  domain: 2500,
  revision: 1500,
  maintenance: 6000,
};

const STATUSES = ['New', 'Paid', 'In progress', 'Review', 'Delivered'] as const;
type Status = (typeof STATUSES)[number];

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_UPLOAD_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * The installed @cloudflare/workers-types models FormData values as strings, so
 * an uploaded file is narrowed structurally rather than with `instanceof File`.
 */
type UploadedFile = { size: number; type: string; name: string; stream(): ReadableStream };

const isUploadedFile = (value: unknown): value is UploadedFile =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as UploadedFile).size === 'number' &&
  typeof (value as UploadedFile).stream === 'function';

const corsHeaders = (origin: string | null, env: Env) => {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
};

const json = (body: unknown, status: number, origin: string | null, env: Env) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) },
  });

const str = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * Order reference, e.g. GMC-2026-0042. Derived from the row id, so it is unique
 * by construction; past 9999 orders it simply grows to five digits rather than
 * wrapping into a collision with the UNIQUE ref_code column.
 */
const makeReference = (sequence: number) =>
  `GMC-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`;

function validateOrder(body: Record<string, unknown>) {
  const errors: string[] = [];

  const pkg = str(body.packageId, 32);
  if (!PACKAGES[pkg]) errors.push('Unknown package');

  const rawAddOns = Array.isArray(body.addOnIds) ? body.addOnIds : [];
  const addOnIds = [...new Set(rawAddOns.map((a) => str(a, 32)))].filter((a) => a in ADD_ONS);

  const name = str(body.name, 120);
  if (name.length < 2) errors.push('Name is required');

  const email = str(body.email, 200);
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) errors.push('Valid email is required');

  const phone = str(body.phone, 40);
  if (phone.length < 9) errors.push('Phone is required');

  const location = str(body.location, 120);
  if (location.length < 2) errors.push('Location is required');

  const role = str(body.role, 160);
  if (role.length < 2) errors.push('Target role is required');

  const experience = str(body.experience, 60);
  if (!experience) errors.push('Experience is required');

  const industry = str(body.industry, 120);
  if (industry.length < 2) errors.push('Industry is required');

  if (body.consent !== true) errors.push('Consent is required');

  // Honeypot: a real person never sees this field, so anything in it is a bot.
  if (str(body.company, 200)) errors.push('Rejected');

  const fileKeys = (Array.isArray(body.fileKeys) ? body.fileKeys : [])
    .map((k) => str(k, 200))
    .filter(Boolean)
    .slice(0, 3);

  return {
    errors,
    order: {
      package: pkg,
      addOnIds,
      total: (PACKAGES[pkg]?.price ?? 0) + addOnIds.reduce((sum, id) => sum + ADD_ONS[id], 0),
      name,
      email,
      phone,
      location,
      role,
      experience,
      industry,
      notes: str(body.notes, 2000),
      fileKeys,
    },
  };
}

/** Fire-and-forget email so a notification failure never fails the order. */
async function notify(env: Env, ref: string, order: { name: string; email: string; total: number; package: string }) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GetMyCv <orders@getmycv.lk>',
        to: [env.NOTIFY_EMAIL],
        subject: `New order ${ref} — ${order.package}`,
        text: [
          `Reference: ${ref}`,
          `Package: ${order.package}`,
          `Total: LKR ${order.total.toLocaleString()}`,
          `Name: ${order.name}`,
          `Email: ${order.email}`,
        ].join('\n'),
      }),
    });
  } catch {
    // Swallowed on purpose: the order is already saved.
  }
}

const isAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_TOKEN) return false;
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  // Length check first so the comparison below is over equal-length strings.
  if (token.length !== env.ADMIN_TOKEN.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i += 1) {
    mismatch |= token.charCodeAt(i) ^ env.ADMIN_TOKEN.charCodeAt(i);
  }
  return mismatch === 0;
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    // Public writes are only accepted from the site's own origin.
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const originOk = !origin || allowed.includes(origin);

    try {
      if (url.pathname === '/orders' && request.method === 'POST') {
        if (!originOk) return json({ error: 'Origin not allowed' }, 403, origin, env);

        const body = (await request.json()) as Record<string, unknown>;
        const { errors, order } = validateOrder(body);
        if (errors.length) return json({ error: errors[0], errors }, 400, origin, env);

        const inserted = await env.DB.prepare(
          `INSERT INTO orders
             (ref_code, package, add_ons, total_lkr, name, email, phone, location,
              role, experience, industry, notes, file_keys, consent_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
           RETURNING id, ref_code`,
        )
          .bind(
            // Placeholder reference; rewritten below once the row id is known.
            `PENDING-${crypto.randomUUID()}`,
            order.package,
            JSON.stringify(order.addOnIds),
            order.total,
            order.name,
            order.email,
            order.phone,
            order.location,
            order.role,
            order.experience,
            order.industry,
            order.notes,
            JSON.stringify(order.fileKeys),
            new Date().toISOString(),
          )
          .first<{ id: number; ref_code: string }>();

        if (!inserted) return json({ error: 'Could not save order' }, 500, origin, env);

        const ref = makeReference(inserted.id);
        await env.DB.prepare('UPDATE orders SET ref_code = ? WHERE id = ?')
          .bind(ref, inserted.id)
          .run();

        ctx.waitUntil(notify(env, ref, order));

        return json({ ref, total: order.total }, 201, origin, env);
      }

      if (url.pathname === '/uploads' && request.method === 'POST') {
        if (!originOk) return json({ error: 'Origin not allowed' }, 403, origin, env);
        if (!env.UPLOADS) {
          return json({ error: 'Uploads are not enabled' }, 503, origin, env);
        }

        const form = await request.formData();
        const file = form.get('file') as unknown;
        if (!isUploadedFile(file)) return json({ error: 'No file' }, 400, origin, env);
        if (file.size > MAX_UPLOAD_BYTES) return json({ error: 'File is over 5 MB' }, 413, origin, env);
        if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
          return json({ error: 'Unsupported file type' }, 415, origin, env);
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
        await env.UPLOADS.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        return json({ key }, 201, origin, env);
      }

      if (url.pathname === '/orders' && request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin, env);

        const status = url.searchParams.get('status');
        const query = status && STATUSES.includes(status as Status)
          ? env.DB.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 200').bind(status)
          : env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');

        const { results } = await query.all();
        return json({ orders: results }, 200, origin, env);
      }

      const patchMatch = url.pathname.match(/^\/orders\/([A-Za-z0-9-]+)$/);
      if (patchMatch && request.method === 'PATCH') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin, env);

        const body = (await request.json()) as { status?: string };
        const status = str(body.status, 20) as Status;
        if (!STATUSES.includes(status)) return json({ error: 'Unknown status' }, 400, origin, env);

        const result = await env.DB.prepare('UPDATE orders SET status = ? WHERE ref_code = ?')
          .bind(status, patchMatch[1])
          .run();

        if (!result.meta.changes) return json({ error: 'Order not found' }, 404, origin, env);
        return json({ ref: patchMatch[1], status }, 200, origin, env);
      }

      return json({ error: 'Not found' }, 404, origin, env);
    } catch (error) {
      console.error(error);
      return json({ error: 'Server error' }, 500, origin, env);
    }
  },
};
