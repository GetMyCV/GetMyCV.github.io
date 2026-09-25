import CvBuilder from '@/components/cv-builder/CvBuilder';
import JsonLd, { Breadcrumbs } from '@/components/JsonLd';
import { cvTemplates } from '@/content/cv-templates';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Free CV Builder — Make a Professional CV Online',
  description:
    'Build an ATS-friendly CV in minutes: pick a template, fill in guided steps, see a live A4 preview, then download PDF or Word. Free, no sign-up, private.',
  path: '/cv-builder/',
  keywords: ['free CV builder', 'CV maker Sri Lanka', 'online CV maker', 'CV template', 'resume builder', 'ATS CV'],
});

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: `${site.name} CV Builder`,
  url: `${site.url}/cv-builder/`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  featureList: [
    `${cvTemplates.length} professional templates`,
    'Live A4 preview',
    'PDF and Word (.docx) download',
    'CV strength checklist',
    'Works offline in your browser; nothing is uploaded',
  ],
  provider: { '@id': `${site.url}/#business` },
};

export default function CvBuilderPage() {
  return (
    <div className="container-page pb-28 pt-8 sm:pt-10 lg:pb-16 print:m-0 print:max-w-none print:p-0">
      <Breadcrumbs trail={[{ name: 'CV builder', path: '/cv-builder/' }]} />
      <JsonLd data={appJsonLd} />

      <div className="max-w-3xl print:hidden">
        <p className="eyebrow">Free CV builder</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl">Build a professional CV in minutes</h1>
        <p className="mt-3 text-navy-700/80 dark:text-slate-300">
          Pick one of {cvTemplates.length} templates, fill in a few short steps and watch your CV take shape on
          a real A4 page. Download it as a PDF or Word file when you are happy. Free, no account, and
          everything stays in your browser.
        </p>
      </div>

      <div className="mt-6 print:mt-0">
        <CvBuilder />
      </div>
    </div>
  );
}
