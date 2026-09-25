import Link from 'next/link';
import Section from '@/components/Section';
import PricingCard from '@/components/PricingCard';
import Faq from '@/components/Faq';
import CallToAction from '@/components/CallToAction';
import { addOns, formatPrice, packages } from '@/content/pricing';
import JsonLd, { Breadcrumbs } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';
import { site } from '@/content/site';

export const metadata = pageMetadata({
  title: 'CV Writing Prices & Packages',
  description: `CV writing from ${formatPrice(packages[0].price)}, CV plus cover letter and LinkedIn for ${formatPrice(
    packages[1].price,
  )}, or a full portfolio website for ${formatPrice(packages[2].price)}. Clear turnaround times and revisions included.`,
  path: '/pricing/',
});

const offersJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: packages.map((pkg, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Service',
      name: `${pkg.name} package`,
      description: pkg.summary,
      serviceType: 'CV writing',
      provider: { '@id': `${site.url}/#business` },
      areaServed: { '@type': 'Country', name: site.areaServed },
      offers: {
        '@type': 'Offer',
        price: pkg.price ?? undefined,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${site.url}/order/?package=${pkg.id}`,
      },
    },
  })),
};

export default function PricingPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Pricing', path: '/pricing/' }]} />
      <Section
        headingLevel="h1"
        eyebrow="Pricing"
        title="Pick the package that matches the job you want"
        intro="Prices are in US dollars and include everything listed — revisions, editable files and delivery."
      >
        <div data-reveal-stagger className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <PricingCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <p className="mt-6 text-sm text-navy-700/70 dark:text-slate-400">
          Paying from overseas or ordering for a team?{' '}
          <Link href="/order/" className="font-semibold text-teal-700 underline dark:text-teal">
            Tell us in the order notes
          </Link>{' '}
          and we will work it out.
        </p>
      </Section>

      <Section
        tone="muted"
        eyebrow="Add-ons"
        title="Extras you can bolt on"
        intro="Add these while ordering, or later — they are priced the same either way."
      >
        <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white dark:border-white/10 dark:bg-white/5">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Add-on services and prices in US dollars</caption>
            <thead className="bg-navy-50 text-navy dark:bg-white/10 dark:text-white">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Add-on</th>
                <th scope="col" className="hidden px-5 py-3 font-semibold sm:table-cell">What it does</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10 dark:divide-white/10">
              {addOns.map((addOn) => (
                <tr key={addOn.id}>
                  <th scope="row" className="px-5 py-4 text-left font-semibold text-navy dark:text-white">
                    {addOn.name}
                    <span className="mt-1 block text-xs font-normal text-navy-700/70 dark:text-slate-400 sm:hidden">
                      {addOn.description}
                    </span>
                  </th>
                  <td className="hidden px-5 py-4 text-navy-700/80 dark:text-slate-300 sm:table-cell">
                    {addOn.description}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-navy dark:text-white">
                    {formatPrice(addOn.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Turnaround"
        title="When your files land"
        intro="Counted in working days from the moment your payment is confirmed, not from when you place the order."
      >
        <div data-reveal-stagger className="grid gap-6 sm:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card card-hover">
              <h3 className="text-base">{pkg.name}</h3>
              <p className="mt-2 font-heading text-2xl font-bold text-teal-700 dark:text-teal">
                {pkg.turnaround}
              </p>
              <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">
                {pkg.revisions} revision {pkg.revisions === 1 ? 'round' : 'rounds'} included
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted" eyebrow="Questions" title="Before you pay">
        <Faq />
      </Section>

      <CallToAction title="Know which package you want?" />

      <JsonLd data={offersJsonLd} />
    </>
  );
}
