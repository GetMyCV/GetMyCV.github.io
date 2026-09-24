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
 *   POST /checkout        start a Stripe card payment for an order (public)
 *   POST /stripe/webhook  Stripe event receiver       (Stripe signature)
 */

export interface Env {
  DB: D1Database;
  UPLOADS?: R2Bucket;
  ALLOWED_ORIGINS: string;
  ADMIN_TOKEN?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

/**
 * Prices live here as well as in the site's content/pricing.ts. The browser is
 * free to send any total it likes, so the amount stored is the one this table
 * produces — never the one that arrived in the request.
 */
/**
 * Amounts are whole US dollars. The D1 column is still called total_lkr from
 * when the site priced in rupees; it holds USD now.
 */
const PACKAGES: Record<string, { price: number; turnaround: string }> = {
  starter: { price: 14, turnaround: '3 days' },
  professional: { price: 26, turnaround: '5 days' },
  premium: { price: 53, turnaround: '7–10 days' },
};

const ADD_ONS: Record<string, number> = {
  express: 9,
  domain: 8,
  revision: 5,
  maintenance: 18,
};

/**
 * Stripe Price ids for the same packages and add-ons, in USD. They must match
 * the amounts above: Stripe charges what the Price says, and the webhook only
 * marks an order Paid when the amount Stripe collected equals total_lkr.
 */
const STRIPE_PRICES: Record<string, string> = {
  starter: 'price_1UJAGe2asN2vvApXuwCXLm9U',
  professional: 'price_1UJAGq2asN2vvApXzzSqCzvM',
  premium: 'price_1UJAGu2asN2vvApXWB7w7wtT',
  express: 'price_1UJAGw2asN2vvApXL0P8YxEy',
  domain: 'price_1UJAGz2asN2vvApXYUt6RRKj',
  revision: 'price_1UJAH22asN2vvApXsBJYHFxl',
  maintenance: 'price_1UJAH62asN2vvApXpOoNLYwR',
};

/** Stripe counts USD in cents, so $14 is 1400. */
const toStripeAmount = (usd: number) => usd * 100;

/** How long an unused webhook signature stays acceptable, per Stripe's guidance. */
const WEBHOOK_TOLERANCE_SECONDS = 300;

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
          `Total: USD ${order.total.toLocaleString()}`,
          `Name: ${order.name}`,
          `Email: ${order.email}`,
        ].join('\n'),
      }),
    });
  } catch {
    // Swallowed on purpose: the order is already saved.
  }
}

/** Minimal Stripe REST call: form-encoded body, secret key as bearer token. */
async function stripeRequest<T>(env: Env, path: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });
  const body = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(`Stripe: ${body.error?.message ?? response.status}`);
  return body;
}

type OrderRow = {
  ref_code: string;
  package: string;
  add_ons: string;
  total_lkr: number;
  email: string;
  status: Status;
};

/**
 * Creates a Checkout Session for an order already in D1. Line items come from
 * the stored row, never from the request, so the browser only names the order.
 */
async function createCheckoutSession(env: Env, order: OrderRow, siteOrigin: string) {
  const items = [order.package, ...(JSON.parse(order.add_ons) as string[])];
  const params: Record<string, string> = {
    mode: 'payment',
    client_reference_id: order.ref_code,
    customer_email: order.email,
    'metadata[ref]': order.ref_code,
    'payment_intent_data[description]': `GetMyCv order ${order.ref_code}`,
    'payment_intent_data[metadata][ref]': order.ref_code,
    success_url: `${siteOrigin}/order/success/?paid=1&ref=${order.ref_code}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteOrigin}/order/success/?ref=${order.ref_code}`,
  };
  items.forEach((id, index) => {
    const price = STRIPE_PRICES[id];
    if (!price) throw new Error(`No Stripe price for ${id}`);
    params[`line_items[${index}][price]`] = price;
    params[`line_items[${index}][quantity]`] = '1';
  });
  return stripeRequest<{ id: string; url: string }>(env, 'checkout/sessions', params);
}

const hex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Constant-time string comparison, for tokens and signatures. */
const safeEqual = (a: string, b: string) => {
  // Length check first so the loop below is over equal-length strings.
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
};

/**
 * Verifies the Stripe-Signature header: HMAC-SHA256 of `${t}.${payload}` with
 * the endpoint secret, checked against every v1 signature, within tolerance.
 */
async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(',').map((part) => part.split('=') as [string, string]);
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = hex(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)),
  );
  return signatures.some((signature) => safeEqual(signature, expected));
}

type CheckoutSessionEvent = {
  type: string;
  data: {
    object: {
      id: string;
      client_reference_id: string | null;
      payment_status: string;
      amount_total: number | null;
      currency: string | null;
    };
  };
};

/**
 * Marks the order Paid when a Checkout Session completes. Covers both the
 * Worker's own sessions and the site's Payment Links, which carry the order
 * reference as client_reference_id. An order only flips to Paid when Stripe
 * collected exactly its stored total, so a Payment Link paid without the
 * right add-ons is left New for a person to look at.
 */
async function handleStripeEvent(env: Env, event: CheckoutSessionEvent) {
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return;
  }
  const session = event.data.object;
  if (session.payment_status !== 'paid' || !session.client_reference_id) return;

  const order = await env.DB.prepare('SELECT total_lkr FROM orders WHERE ref_code = ?')
    .bind(session.client_reference_id)
    .first<{ total_lkr: number }>();
  if (!order) return;

  if (session.currency !== 'usd' || session.amount_total !== toStripeAmount(order.total_lkr)) {
    console.warn(`Payment for ${session.client_reference_id} does not match its total`, session.id);
    return;
  }

  await env.DB.prepare(
    `UPDATE orders SET status = 'Paid', paid_at = ?, stripe_session_id = ?
     WHERE ref_code = ? AND status = 'New'`,
  )
    .bind(new Date().toISOString(), session.id, session.client_reference_id)
    .run();
}

const isAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_TOKEN) return false;
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return safeEqual(token, env.ADMIN_TOKEN);
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

      if (url.pathname === '/checkout' && request.method === 'POST') {
        if (!originOk) return json({ error: 'Origin not allowed' }, 403, origin, env);
        if (!env.STRIPE_SECRET_KEY) {
          return json({ error: 'Card payments are not enabled' }, 503, origin, env);
        }

        const body = (await request.json()) as { ref?: unknown };
        const ref = str(body.ref, 40);
        const order = await env.DB.prepare(
          'SELECT ref_code, package, add_ons, total_lkr, email, status FROM orders WHERE ref_code = ?',
        )
          .bind(ref)
          .first<OrderRow>();

        if (!order) return json({ error: 'Order not found' }, 404, origin, env);
        if (order.status !== 'New') return json({ error: 'This order is already paid' }, 409, origin, env);

        // Return visitors to the origin they came from (the live site or local dev).
        const siteOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
        const session = await createCheckoutSession(env, order, siteOrigin);

        await env.DB.prepare('UPDATE orders SET stripe_session_id = ? WHERE ref_code = ?')
          .bind(session.id, order.ref_code)
          .run();

        return json({ url: session.url }, 200, origin, env);
      }

      if (url.pathname === '/stripe/webhook' && request.method === 'POST') {
        if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Webhooks not enabled' }, 503, origin, env);

        // The signature is over the raw bytes, so read text before parsing.
        const payload = await request.text();
        const signature = request.headers.get('Stripe-Signature') ?? '';
        if (!(await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
          return json({ error: 'Bad signature' }, 400, origin, env);
        }

        await handleStripeEvent(env, JSON.parse(payload) as CheckoutSessionEvent);
        return json({ received: true }, 200, origin, env);
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
