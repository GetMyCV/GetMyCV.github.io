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
| Payments | Stripe (cards), plus bank transfer |
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
npm run previews    # re-shoot sample preview images and CV PDFs (after a build)
```

`npm run brand` needs `sharp` and `npm run previews` needs `playwright`. Neither
is a project dependency (they would slow every CI build for scripts that rarely
run):

```bash
npm install --no-save sharp && npm run brand
npm run build && npm install --no-save playwright && npm run previews
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
| `content/cvs.ts` | The sample CVs at `/cv/<slug>/`, and their PDFs |
| `content/steps.ts` | The four "how it works" steps |
| `content/testimonials.ts` | Client quotes |

### Before launch

1. **Contact details** — set the real WhatsApp number (digits only, no `+`), email
   and bank account in `content/site.ts`.
2. **Testimonials** — replace the samples in `content/testimonials.ts` with real,
   permission-granted quotes.
3. **Samples** — after editing any sample content, run `npm run previews` so the
   gallery images and CV PDFs match.

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

## Sample CVs

Six one-page A4 CVs, one per profession, at `/cv/<slug>/`, in three layouts:

| Slug | Layout | Accent |
| --- | --- | --- |
| `senior-accountant` | Classic: centred serif name, ruled sections, one column | blue |
| `software-engineer` | Modern: tinted skills sidebar, headline numbers | teal |
| `digital-marketer` | Executive: solid header band with three results | raspberry |
| `civil-engineer` | Classic | amber |
| `registered-nurse` | Executive | cyan |
| `graduate` | Modern | violet |

All six render from `content/cvs.ts` through one component
(`components/CvDocument.tsx`). The same markup is shown on the page, printed to
the downloadable PDF and screenshotted for the gallery, so the three never
disagree. Every layout reads top to bottom in a single column underneath, which
keeps them ATS-friendly; side columns are CSS grid only.

On a phone the page scales the sheet down rather than reflowing it, so what you
see is exactly what prints. Printing a `/cv/` page gives one clean A4 sheet.

### Preview images

Gallery thumbnails are real screenshots, not mock-ups. `npm run previews` serves
`./out`, opens every sample in Chromium and writes to `public/samples/`:

| File | Used for |
| --- | --- |
| `cv-<slug>.jpg` | CV card thumbnail |
| `cv-<slug>-full.jpg` | Full-size preview (2×) when a card is clicked |
| `cv-<slug>.pdf` | Download PDF |
| `portfolio-<slug>.jpg` | Portfolio card thumbnail (first screen) |
| `portfolio-<slug>-full.jpg` | Full-page preview when a card is clicked |

It fails if any CV runs past its A4 page, so an over-long edit is caught before
it ships. Set `CHROMIUM_PATH` to use a browser that is already installed.

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

## Card payments (Stripe)

After placing an order, the success page offers **Pay by card**, which opens
Stripe's hosted checkout, alongside the bank details. Card data never touches
this site.

Prices are in **US dollars** (whole dollars, converted from the original LKR
prices at about 329 LKR/USD in September 2026). The products live in the
Stripe account in **live mode**:

| Site id | Stripe product | Price id | USD |
| --- | --- | --- | --- |
| `starter` | Starter CV package | `price_1UJAGe2asN2vvApXuwCXLm9U` | 14 |
| `professional` | Professional CV package | `price_1UJAGq2asN2vvApXzzSqCzvM` | 26 |
| `premium` | Premium CV + portfolio package | `price_1UJAGu2asN2vvApXWB7w7wtT` | 53 |
| `express` | Express delivery | `price_1UJAGw2asN2vvApXL0P8YxEy` | 9 |
| `domain` | Custom domain setup | `price_1UJAGz2asN2vvApXYUt6RRKj` | 8 |
| `revision` | Extra revision round | `price_1UJAH22asN2vvApXsBJYHFxl` | 5 |
| `maintenance` | Portfolio maintenance (1 year) | `price_1UJAH62asN2vvApXpOoNLYwR` | 18 |

The earlier LKR prices and Payment Links on the same products are archived.

Each product carries `metadata.getmycv_id` matching the id in `content/pricing.ts`.

How a card payment is started depends on where the order went:

| Order backend | Card payment | How it is confirmed |
| --- | --- | --- |
| Web3Forms / WhatsApp | The package's **Payment Link**, with the reference as `client_reference_id` and the email prefilled. Add-ons appear as optional extras; the page tells the client which to tick. | Look the reference up under Payments in the Stripe dashboard. |
| Worker | `POST /checkout` creates a **Checkout Session** for exactly the stored order. | The webhook marks the order `Paid` when the amount matches. |

The Payment Links (one per package, redirecting back to
`/order/success/?paid=1`) work today with nothing to deploy. `?paid=1` only
changes what the page says; always check the dashboard before starting work.

**Changing a price** means changing it in three places: create a new Price on
the product in Stripe (prices are immutable), then update `content/pricing.ts`
and `STRIPE_PRICES`/`PACKAGES`/`ADD_ONS` in `worker/src/index.ts`. The Payment
Links point at specific prices, so they need a new link too (or edit the link's
line items in the dashboard).

### Enabling card payments on the Worker

```bash
cd worker
npx wrangler secret put STRIPE_SECRET_KEY       # a restricted key (rk_live_…) with
                                                # Checkout Sessions: write is enough
npx wrangler deploy
```

Then, in the Stripe dashboard → Developers → Webhooks, add an endpoint at
`https://<worker-url>/stripe/webhook` for `checkout.session.completed` and
`checkout.session.async_payment_succeeded`, and store its signing secret:

```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET   # whsec_…
```

The webhook verifies Stripe's signature and only marks an order `Paid` when
Stripe collected exactly its stored total in USD. It also catches Payment Link
payments that carry a Worker order's reference. The `stripe_session_id` and
`paid_at` columns it writes are already on `getmycv-orders`
(`worker/migrations/0002_stripe_payments.sql`). The `total_lkr` column keeps
its old name but now stores whole US dollars.

## Search engines (Google)

What the site already does, all generated at build time:

| Piece | Where |
| --- | --- |
| `<meta name="google-site-verification">` | `site.googleSiteVerification` in `content/site.ts`, rendered by `app/layout.tsx` |
| HTML verification file | `public/google6bd9d15b3ecc4bf4.html`, served at the site root |
| `/sitemap.xml` with image entries for every sample | `app/sitemap.ts` |
| `/robots.txt` pointing at the sitemap | `app/robots.ts` |
| `/manifest.webmanifest` | `app/manifest.ts` |
| Canonical URL, Open Graph and Twitter card per page | `pageMetadata()` in `lib/metadata.ts` |
| Structured data: business + website graph, breadcrumbs, pricing offers, FAQ, CV documents | `app/layout.tsx`, `components/JsonLd.tsx`, individual pages |

Every indexable page has one `<h1>`, a unique title of 30–65 characters and a
description of 120–160 characters. The order-received page and the 404 page are
`noindex`.

### Search Console setup

1. Add a **URL-prefix** property for `https://getmycv.github.io/`. A *Domain*
   property (the one that asks for a DNS TXT or CNAME record) is not possible
   here: `github.io` belongs to GitHub, so no one can add DNS records to it.
   Do **not** put Google's CNAME value in a `CNAME` file in this repo; on GitHub
   Pages that file sets the site's custom domain and would take the site down.
2. Verify with **HTML tag** or **HTML file**; both are already deployed.
3. Sitemaps → submit `sitemap.xml`.
4. URL inspection → request indexing for `/`, `/services/`, `/pricing/` and
   `/portfolio/` to speed up the first crawl.

If the site later moves to a custom domain (e.g. `getmycv.lk`), that is when a
Domain property and DNS verification become possible. Update `site.url` then,
so canonicals, the sitemap and structured data follow.

Testimonials are samples, so they deliberately carry no `Review` or
`AggregateRating` markup; Google treats invented reviews as spam. Add it only
once the quotes are real.

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

- **Admin dashboard.** The Worker exposes `GET /orders` and `PATCH /orders/:ref`
  behind `ADMIN_TOKEN`; there is no UI on top of them yet.
- **Turnstile.** The form has a honeypot and Web3Forms adds its own spam check.
  A real CAPTCHA needs server-side verification, so it belongs in the Worker.
- **Upload retention.** Only relevant on the Worker path; R2 lifecycle rules can
  expire the `getmycv-uploads` bucket after 90 days to match the privacy notice.
