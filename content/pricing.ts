export type PackageId = 'starter' | 'professional' | 'premium';

export type Package = {
  id: PackageId;
  name: string;
  /** Price in LKR. Set to null while the price is still to be decided. */
  price: number | null;
  turnaround: string;
  summary: string;
  includes: string[];
  revisions: number;
  popular?: boolean;
};

/**
 * Single source of truth for prices. The pricing page, the home page preview
 * and the order form all read from here, so the numbers can never drift apart.
 *
 * These are the live prices. Changing a number here changes it everywhere,
 * including the total the order form writes to the database.
 */
export const packages: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4500,
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
    price: 8500,
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
    price: 17500,
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
};

export const addOns: AddOn[] = [
  {
    id: 'express',
    name: 'Express delivery',
    price: 3000,
    description: 'Your order moves to the front of the queue and ships in 48 hours.',
  },
  {
    id: 'domain',
    name: 'Custom domain setup',
    price: 2500,
    description: 'We point your own domain (e.g. yourname.lk) at your portfolio. Domain fee not included.',
  },
  {
    id: 'revision',
    name: 'Extra revision round',
    price: 1500,
    description: 'One more round of edits after your included revisions are used.',
  },
  {
    id: 'maintenance',
    name: 'Portfolio maintenance (1 year)',
    price: 6000,
    description: 'Content updates and fixes on your portfolio site for twelve months.',
  },
];

export const getPackage = (id: string) => packages.find((p) => p.id === id);
export const getAddOn = (id: string) => addOns.find((a) => a.id === id);

export const formatLkr = (value: number | null) =>
  value === null
    ? 'Ask us'
    : new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 0,
      }).format(value);

export const calculateTotal = (packageId: string, addOnIds: string[]) => {
  const pkg = getPackage(packageId);
  const base = pkg?.price ?? 0;
  const extras = addOnIds.reduce((sum, id) => sum + (getAddOn(id)?.price ?? 0), 0);
  return base + extras;
};
