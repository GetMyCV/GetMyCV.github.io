import Link from 'next/link';
import Section from '@/components/Section';
import CallToAction from '@/components/CallToAction';
import AtsTextChecker from '@/components/ats/AtsTextChecker';
import JsonLd, { Breadcrumbs } from '@/components/JsonLd';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Free ATS CV Checker — See What Recruiters’ Software Reads',
  description:
    'Paste your CV to see what an applicant tracking system extracts: contact details, sections, dates and keywords, plus a job-ad keyword match. Free and private.',
  path: '/ats-checker/',
  keywords: ['ATS checker', 'ATS CV check', 'ATS friendly CV', 'resume scanner', 'CV keyword match', 'applicant tracking system'],
});

const reads = [
  { title: 'Reads well', points: ['Plain text in one reading order', 'Standard headings: Experience, Education, Skills', 'Dates like “Jan 2022 – Present”', 'Email, phone and links written out in full', 'Keywords that match the job ad'] },
  { title: 'Trips it up', points: ['CVs saved as images or scans', 'Text inside pictures, icons or text boxes', 'Creative headings like “My journey”', 'Emoji and icon fonts', 'Links hidden behind words like “click here”'] },
];

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: `${site.name} ATS CV Checker`,
  url: `${site.url}/ats-checker/`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  provider: { '@id': `${site.url}/#business` },
};

export default function AtsCheckerPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'ATS checker', path: '/ats-checker/' }]} />
      <JsonLd data={appJsonLd} />
      <Section
        headingLevel="h1"
        eyebrow="Free ATS checker"
        title="See your CV the way recruiters’ software does"
        intro="Most companies run CVs through an applicant tracking system (ATS) before anyone reads them. Paste yours to see what it identifies, what it misses, and how well you match a job ad."
      >
        <AtsTextChecker />
      </Section>

      <Section tone="muted" eyebrow="What an ATS looks for" title="What gets read, and what gets lost">
        <div data-reveal-stagger className="grid gap-6 md:grid-cols-2">
          {reads.map((col, i) => (
            <div key={col.title} className="card card-hover h-full">
              <h3 className={`text-lg ${i === 0 ? 'text-teal-700 dark:text-teal' : 'text-red-700 dark:text-red-300'}`}>{col.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-navy-700/90 dark:text-slate-200">
                {col.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span aria-hidden="true" className={i === 0 ? 'text-teal-700 dark:text-teal' : 'text-red-600 dark:text-red-400'}>
                      {i === 0 ? '✓' : '✕'}
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-navy-700/80 dark:text-slate-300">
          Every template in our{' '}
          <Link href="/cv-builder/" className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal">
            CV builder
          </Link>{' '}
          is built this way, and each{' '}
          <Link href="/portfolio/" className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal">
            sample CV
          </Link>{' '}
          shows its own ATS report.
        </p>
      </Section>

      <CallToAction title="Want a CV that passes the ATS and impresses the recruiter?" />
    </>
  );
}
