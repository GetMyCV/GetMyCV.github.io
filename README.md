# GetMyCv

The GetMyCv website: a mobile-first Next.js site that explains the services, shows
prices, and lets a visitor place an order in about three minutes. It is exported as
static files and served free from GitHub Pages at <https://getmycv.github.io>.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript, `output: 'export'` |
| Styling | Tailwind CSS, light and dark themes |
| Forms | React Hook Form + Zod, validated per step |
| Order storage | Supabase Postgres (insert-only via row-level security) |
| Uploads | Supabase Storage (private bucket) |
| Analytics | Optional, cookieless (Plausible-compatible) |
| Hosting | GitHub Pages via GitHub Actions |

GitHub Pages serves static files only, so there are no API routes, no Server Actions
and no image optimizer. Anything dynamic happens in the browser against Supabase, or
in a Supabase Edge Function later.

## Running it locally

```bash
npm install
cp .env.example .env.local   # optional — the form falls back to WhatsApp without it
npm run dev
```

Other scripts:

```bash
npm run build       # static export into ./out
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run brand       # regenerate logos, icons and the OG image from /brand
npm run samples     # regenerate the placeholder sample previews
```

`npm run brand` and `npm run samples` need `sharp`, which is deliberately not a
project dependency (it would slow every CI build for two scripts that rarely run):

```bash
npm install --no-save sharp && npm run brand
```

## Editing content

Everything a non-developer needs to change lives in `content/`. No component holds a
price or a phone number of its own.

| File | What it controls |
| --- | --- |
| `content/site.ts` | Business name, email, WhatsApp number, bank details, social links |
| `content/pricing.ts` | Packages, prices, turnarounds, add-ons — the single source of truth |
| `content/services.ts` | The five services and their bullet points |
| `content/faq.ts` | FAQ, which also feeds the FAQ structured data |
| `content/samples.ts` | Portfolio and CV samples shown on `/portfolio/` |
| `content/steps.ts` | The four "how it works" steps |
| `content/testimonials.ts` | Client quotes |

### Before launch

1. **Prices** — replace the placeholders in `content/pricing.ts`.
2. **Contact details** — set the real WhatsApp number (digits only, no `+`), email
   and bank account in `content/site.ts`.
3. **Testimonials** — replace the samples in `content/testimonials.ts` with real,
   permission-granted quotes.
4. **Samples** — drop real screenshots into `public/samples/` and point
   `content/samples.ts` at the live demo URLs.

## Supabase setup

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It creates the `orders` table, the
   private `order-uploads` bucket, and the row-level security policies.
3. Copy the project URL and the anon key into `.env.local`, and add both as
   repository secrets named `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

The anon key is public by design — it is inlined into the static bundle. What keeps
orders safe is the row-level security policy: the anon role may `INSERT` and nothing
else, so the browser can place an order but can never read one back. Reading and
updating orders happens in the Supabase dashboard, which uses the service role.

To be emailed about new orders, add a Database Webhook on `orders` (insert) pointing
at your email service or a Supabase Edge Function.

If the environment variables are absent, the order form still works: it produces a
reference and hands the visitor a prefilled WhatsApp message instead of failing.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which typechecks, lints,
builds, and publishes `out/` to GitHub Pages.

One-time setup: in the repository, go to **Settings → Pages** and set the source to
**GitHub Actions**. The repository must be named `getmycv.github.io` to serve from
the root URL without a base path.

`public/.nojekyll` stops GitHub from hiding the `_next` folder. `trailingSlash: true`
makes routes like `/pricing/` resolve to real directories.

## Order flow

```
/order/  →  4 steps  →  Supabase insert (+ file upload)  →  /order/success/?ref=…
```

- The package can be preselected with `/order/?package=premium`.
- Each step validates before it will advance; the total updates live.
- A honeypot field blocks the simplest bots. The consent tick is stored with a
  timestamp on the order row, as the Personal Data Protection Act expects.
- The reference (`GMC-2026-0042`) is generated in the browser and shown on the
  success page along with payment instructions.

## Accessibility and performance

Verified with Lighthouse (mobile preset) against the production export:

| Page | Perf | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 90 | 100 | 100 | 100 |
| `/services/` | 97 | 100 | 100 | 100 |
| `/pricing/` | 94 | 100 | 100 | 100 |
| `/portfolio/` | 96 | 100 | 100 | 100 |
| `/order/` | 95 | 100 | 100 | 100 |
| `/order/success/` | 98 | 100 | 100 | n/a (noindex) |
| `/privacy/` | 98 | 100 | 100 | 100 |
| `/terms/` | 98 | 100 | 100 | 100 |

Performance scores move a point or two between runs; re-measure against the built
`out/` folder, not `npm run dev`.

Text colours meet WCAG 2.1 AA, tap targets are at least 44 × 44 px, the multi-step
form is keyboard-navigable, and motion respects `prefers-reduced-motion`.

## Brand assets

Masters live in `brand/`; everything served is generated from them by
`npm run brand`:

| Output | Used for |
| --- | --- |
| `public/brand/logo.png` | Wordmark on light backgrounds |
| `public/brand/logo-white.png` | Wordmark on navy and in dark mode |
| `public/icon.png`, `icon-192.png`, `apple-icon.png`, `favicon.ico` | App and browser icons |
| `public/og-image.png` | Link previews on WhatsApp, LinkedIn and X |
| `public/brand/icon-monogram.png` | The alternative "gm" mark, for social avatars |

Colours: navy `#0F2A4A`, teal `#14B8A6`, amber `#F59E0B` (the "most popular" badge
only). Headings are Plus Jakarta Sans, body text Inter, both self-hosted by
`next/font`.

## Dependency notes

`npm audit` reports a `postcss` advisory against the copy pinned inside Next.js
itself (our own `postcss` is on a patched 8.5.x). It affects CSS processing at build
time only — nothing in the exported static site — and clearing it needs a major
upgrade to Next 16. Worth doing on the next maintenance pass.

## Not built yet

- **Card payments.** Launch takes bank transfer. A gateway such as PayHere needs its
  payment hash signed off the browser, which means a Supabase Edge Function.
- **Admin dashboard.** Orders are managed in the Supabase dashboard for now.
- **Turnstile.** The form has a honeypot; a CAPTCHA needs a server-side verification
  step, so it belongs with the Edge Function work above.
- **Upload retention job.** The privacy notice promises uploads are deleted after 90
  days; schedule the query at the bottom of `supabase/schema.sql` with pg_cron.
