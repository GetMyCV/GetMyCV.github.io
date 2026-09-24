export type PackageId = 'starter' | 'professional' | 'premium';

export type Package = {
  id: PackageId;
  name: string;
  /** Price in whole US dollars. Set to null while the price is still to be decided. */
  price: number | null;
  turnaround: string;
  summary: string;
  includes: string[];
  revisions: number;
  popular?: boolean;
  /** Stripe Price for this package (USD, one-time). Public, safe to commit. */
  stripePriceId: string;
  /**
   * Stripe Payment Link for this package, used for card payments when the
   * Worker is not deployed. It offers every add-on as an optional extra.
   */
  paymentLink: string;
};

/**
 * Single source of truth for prices. The pricing page, the home page preview
 * and the order form all read from here, so the numbers can never drift apart.
 *
 * These are the live prices. Changing a number here changes it everywhere,
 * including the total the order form writes to the database.
 *
 * Stripe keeps its own copy of each price. Stripe prices cannot be edited, so
 * changing a number here also means creating a new Price in the Stripe
 * dashboard (on the same product) and pasting its id into `stripePriceId` —
 * and into STRIPE_PRICES in worker/src/index.ts.
 */
export const packages: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 14,
    stripePriceId: 'price_1UJAGe2asN2vvApXuwCXLm9U',
    paymentLink: 'https://buy.stripe.com/7sY8wIaIhcgm3tob44dUY03',
    turnaround: '3 days',
    summary: 'A clean, ATS-friendly CV that gets past the filters.',
    revisions: 1,
    includes: [
      'Professional ATS-friendly CV',
      'PDF and editable Word file',
      'Keyword tuning for your target role',
      '1 round of revisions',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 26,
    stripePriceId: 'price_1UJAGq2asN2vvApXzzSqCzvM',
    paymentLink: 'https://buy.stripe.com/6oU5kw3fP1BI6FA6NOdUY04',
    turnaround: '5 days',
    summary: 'Everything in Starter, plus the extras recruiters actually read.',
    revisions: 2,
    popular: true,
    includes: [
      'Everything in Starter',
      'Tailored cover letter',
      'LinkedIn profile makeover',
      '2 rounds of revisions',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 53,
    stripePriceId: 'price_1UJAGu2asN2vvApXWB7w7wtT',
    paymentLink: 'https://buy.stripe.com/4gMcMY9Ed2FM9RMeggdUY05',
    turnaround: '7–10 days',
    summary: 'Your own portfolio website, live on the internet.',
    revisions: 3,
    includes: [
      'Everything in Professional',
      'Personal portfolio website on GitHub Pages',
      'Custom subdomain setup',
      '3 rounds of revisions',
    ],
  },
];

export type AddOn = {
  id: string;
  name: string;
  price: number;
  description: string;
  /** Stripe Price for this add-on (USD, one-time). */
  stripePriceId: string;
};

export const addOns: AddOn[] = [
  {
    id: 'express',
    name: 'Express delivery',
    price: 9,
    stripePriceId: 'price_1UJAGw2asN2vvApXL0P8YxEy',
    description: 'Your order moves to the front of the queue and ships in 48 hours.',
  },
  {
    id: 'domain',
    name: 'Custom domain setup',
    price: 8,
    stripePriceId: 'price_1UJAGz2asN2vvApXYUt6RRKj',
    description: 'We point your own domain (e.g. yourname.lk) at your portfolio. Domain fee not included.',
  },
  {
    id: 'revision',
    name: 'Extra revision round',
    price: 5,
    stripePriceId: 'price_1UJAH22asN2vvApXsBJYHFxl',
    description: 'One more round of edits after your included revisions are used.',
  },
  {
    id: 'maintenance',
    name: 'Portfolio maintenance (1 year)',
    price: 18,
    stripePriceId: 'price_1UJAH62asN2vvApXpOoNLYwR',
    description: 'Content updates and fixes on your portfolio site for twelve months.',
  },
];

export const getPackage = (id: string) => packages.find((p) => p.id === id);
export const getAddOn = (id: string) => addOns.find((a) => a.id === id);

export const formatPrice = (value: number | null) =>
  value === null
    ? 'Ask us'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);

export const calculateTotal = (packageId: string, addOnIds: string[]) => {
  const pkg = getPackage(packageId);
  const base = pkg?.price ?? 0;
  const extras = addOnIds.reduce((sum, id) => sum + (getAddOn(id)?.price ?? 0), 0);
  return base + extras;
};
