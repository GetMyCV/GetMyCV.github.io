import { notFound } from 'next/navigation';
import Link from 'next/link';
import CvDocument, { A4_HEIGHT, A4_WIDTH } from '@/components/CvDocument';
import DemoBanner from '@/components/DemoBanner';
import ScaledSheet from '@/components/ScaledSheet';
import { cvPdfPath, cvs, getCv } from '@/content/cvs';
import JsonLd, { Breadcrumbs } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';
import { site } from '@/content/site';

type Params = { params: Promise<{ slug: string }> };

/** "Classic — Senior accountant" → "Senior accountant". */
const roleOf = (templateName: string) => templateName.split(' — ').pop() ?? templateName;
const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** Static export needs every slug up front. */
export function generateStaticParams() {
  return cvs.map((cv) => ({ slug: cv.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const cv = getCv(slug);
  if (!cv) return {};

  return pageMetadata({
    title: `${roleOf(cv.templateName)} CV Template — ${capitalise(cv.layout)} Layout`,
    description: `A one-page, ATS-friendly ${roleOf(cv.templateName).toLowerCase()} CV example in the ${cv.layout} layout, written around results. Preview it or download the PDF.`,
    path: `/cv/${cv.slug}/`,
    image: {
      url: `/samples/cv-${cv.slug}.jpg`,
      width: 794,
      height: 1123,
      alt: `Sample ${roleOf(cv.templateName).toLowerCase()} CV in the ${cv.layout} layout`,
    },
  });
}

export default async function CvSamplePage({ params }: Params) {
  const { slug } = await params;
  const cv = getCv(slug);
  if (!cv) notFound();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-900 print:min-h-0 print:bg-white">
      <Breadcrumbs
        trail={[
          { name: 'Samples', path: '/portfolio/' },
          { name: `${roleOf(cv.templateName)} CV`, path: `/cv/${cv.slug}/` },
        ]}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DigitalDocument',
          name: `${roleOf(cv.templateName)} CV template (${cv.layout} layout)`,
          description: `Sample one-page ATS-friendly CV for ${cv.profession.toLowerCase()} professionals.`,
          url: `${site.url}/cv/${cv.slug}/`,
          image: `${site.url}/samples/cv-${cv.slug}.jpg`,
          inLanguage: 'en',
          isAccessibleForFree: true,
          author: { '@id': `${site.url}/#business` },
          encoding: {
            '@type': 'MediaObject',
            contentUrl: `${site.url}${cvPdfPath(cv.slug)}`,
            encodingFormat: 'application/pdf',
          },
        }}
      />
      <div className="print:hidden">
        <DemoBanner profession={cv.profession} kind="CV" />
      </div>

      <div className="container-page flex flex-wrap items-end justify-between gap-4 pb-6 pt-8 print:hidden">
        <div>
          <p className="eyebrow">{cv.profession} · {cv.layout} layout</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">{roleOf(cv.templateName)} CV template</h1>
          <p className="mt-2 max-w-xl text-sm text-navy-700/80 dark:text-slate-300">
            One A4 page, written around outcomes and laid out so applicant tracking systems read it
            top to bottom. Yours is written from scratch around your own experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={cvPdfPath(cv.slug)} download className="btn-secondary">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M10 2a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 11.6V3a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
            </svg>
            Download PDF
          </a>
          <Link href={`/cv-builder/?example=${cv.slug}`} className="btn-secondary">
            Use this template
          </Link>
          <Link href="/order/?package=starter" className="btn-primary">
            Get a CV like this
          </Link>
        </div>
      </div>

      <div className="container-page pb-16 print:p-0">
        <ScaledSheet width={A4_WIDTH} height={A4_HEIGHT}>
          <CvDocument
            cv={cv}
            layout={cv.layout}
            accent={cv.accent}
            footer="Sample CV by GetMyCv · The person shown is fictional"
          />
        </ScaledSheet>
      </div>
    </div>
  );
}
