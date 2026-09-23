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
| Orders | Web3Forms (email), or the Cloudflare Worker in `/worker` (D1) |
| Uploads | Cloudflare R2, only on the Worker path |
| Analytics | Optional, cookieless (Plausible-compatible) |
| Hosting | GitHub Pages via GitHub Actions |

GitHub Pages serves static files only, so there are no API routes, no Server Actions
and no image optimizer. Order submission therefore happens from the browser, against
whichever backend is configured.

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
| `content/samples.ts` | The cards shown in the gallery at `/portfolio/` |
| `content/portfolios.ts` | The demo portfolio pages at `/portfolio/<slug>/` |
| `content/steps.ts` | The four "how it works" steps |
| `content/testimonials.ts` | Client quotes |

### Before launch

1. **Contact details** — set the real WhatsApp number (digits only, no `+`), email
   and bank account in `content/site.ts`.
2. **Testimonials** — replace the samples in `content/testimonials.ts` with real,
   permission-granted quotes.
3. **Samples** — drop real screenshots into `public/samples/` and point
   `content/samples.ts` at the live demo URLs.

## Demo portfolios

`/portfolio/` is the gallery; each card links to a full sample portfolio page at
`/portfolio/<slug>/`, one per profession — the thing a Premium client actually
receives, filled with invented content.

| Slug | Category |
| --- | --- |
| `software-developer` | Software |
| `senior-accountant` | Accounting |
| `digital-marketer` | Marketing |
| `civil-engineer` | Engineering |
| `registered-nurse` | Healthcare |
| `graduate` | Graduate |

They are generated from `content/portfolios.ts` by one template
(`components/PortfolioDemo.tsx`), so adding a seventh category means adding a
data entry and a matching card in `content/samples.ts` — no new page code.

Two things about how they render:

- **The GetMyCv header and footer are hidden on them** (`components/SiteChrome.tsx`),
  so a visitor sees the client's own site rather than ours wrapped around it. A
  banner at the top provides the way back and the call to action.
- **Every person on them is invented**, and each page says so twice — in the
  banner and in the footer. Each has its own accent colour, all checked to meet
  WCAG AA on both white and their tinted backgrounds.

## Where orders go

Submission is pluggable, in `lib/order-api.ts`. It picks the first configured
option and always degrades rather than breaking:

| # | Backend | Set via | What you get |
| --- | --- | --- | --- |
| 1 | Cloudflare Worker + D1 | `NEXT_PUBLIC_ORDERS_API` | Real database, server-side price checks, CV uploads |
| 2 | Web3Forms | `NEXT_PUBLIC_WEB3FORMS_KEY` (repo secret or variable), or `site.web3formsKey` | Each order emailed to you, no backend to run |
| 3 | Neither | — | Order still gets a reference and a prefilled WhatsApp message |

### Option 2: Web3Forms (no backend)

1. Get a free access key at <https://web3forms.com> using the address that should
   receive orders. The key arrives by email.
2. Store it as the repository secret (or variable) `NEXT_PUBLIC_WEB3FORMS_KEY`.
   Alternatively paste it into `web3formsKey` in `content/site.ts`.

Either is fine. The key is public by design — it only permits submissions and
can never read anything back — and note that a secret does not make it private
here: every `NEXT_PUBLIC_` value is inlined into the published JavaScript. A
secret keeps it out of the repository and the build logs, not out of the bundle.

The deploy workflow prints which backend it found under "Check order backend",
so a misnamed secret shows up as a warning instead of a site that quietly falls
back to WhatsApp.

### Option 1: Cloudflare Worker + D1 (full database)

The Worker in `/worker` is written and its D1 database already exists
(`getmycv-orders`, id `e76e95c9-bb53-42ba-8852-a0ea32ebf056`, APAC region, schema
in `worker/schema.sql`). It validates each order, **recomputes the price
server-side** so a tampered browser cannot set its own total, and writes to D1.

```bash
cd worker
npm install
npx wrangler secret put ADMIN_TOKEN     # any long random string
npx wrangler deploy
```

Then set the repository variable `NEXT_PUBLIC_ORDERS_API` to the deployed URL
(e.g. `https://getmycv-orders.<subdomain>.workers.dev`) and push. It takes
precedence over Web3Forms.

Optional extras on this path:

- **CV uploads** — enable R2 in the Cloudflare dashboard, create a bucket named
  `getmycv-uploads`, uncomment the `[[r2_buckets]]` block in `worker/wrangler.toml`
  and redeploy.
- **Order emails** — `npx wrangler secret put RESEND_API_KEY` and
  `npx wrangler secret put NOTIFY_EMAIL`.

Reading orders back:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<worker-url>/orders
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H 'Content-Type: application/json' -d '{"status":"Paid"}' \
     https://<worker-url>/orders/GMC-2026-0042
```

Statuses are `New`, `Paid`, `In progress`, `Review`, `Delivered`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which typechecks, lints,
builds, and publishes `out/` to GitHub Pages.

**One-time setup, and it is not optional: Settings → Pages → Source must be set
to "GitHub Actions".**

If it is left on "Deploy from a branch", GitHub runs its Jekyll builder on every
push in addition to this workflow. Jekyll renders the repository root, which has
no `index.html`, so `README.md` becomes the home page — and it deploys in
parallel with the real site. Both publish an artifact named `github-pages`, so
whichever finishes last wins and the site flips between the real thing and the
README.

This cannot be automated: changing the Pages source needs repository admin
rights, which the Actions `GITHUB_TOKEN` does not have (`403 Resource not
accessible by integration`). You can tell it is still wrong if a run named
"pages build and deployment" appears in the Actions tab after a push. The repository must be named `getmycv.github.io` to serve from
the root URL without a base path.

`public/.nojekyll` stops GitHub from hiding the `_next` folder. `trailingSlash: true`
makes routes like `/pricing/` resolve to real directories.

## Order flow

```
/order/  →  4 steps  →  Web3Forms email or Worker+D1  →  /order/success/?ref=…
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
  payment hash signed off the browser — that belongs in the Worker, which already
  has a place to hold the merchant secret.
- **Admin dashboard.** The Worker exposes `GET /orders` and `PATCH /orders/:ref`
  behind `ADMIN_TOKEN`; there is no UI on top of them yet.
- **Turnstile.** The form has a honeypot and Web3Forms adds its own spam check.
  A real CAPTCHA needs server-side verification, so it belongs in the Worker.
- **Upload retention.** Only relevant on the Worker path; R2 lifecycle rules can
  expire the `getmycv-uploads` bucket after 90 days to match the privacy notice.
