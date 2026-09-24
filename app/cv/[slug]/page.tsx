import { notFound } from 'next/navigation';
import Link from 'next/link';
import CvDocument, { A4_HEIGHT, A4_WIDTH } from '@/components/CvDocument';
import DemoBanner from '@/components/DemoBanner';
import ScaledSheet from '@/components/ScaledSheet';
import { cvPdfPath, cvs, getCv } from '@/content/cvs';
import { pageMetadata } from '@/lib/metadata';

type Params = { params: Promise<{ slug: string }> };

/** Static export needs every slug up front. */
export function generateStaticParams() {
  return cvs.map((cv) => ({ slug: cv.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const cv = getCv(slug);
  if (!cv) return {};

  return pageMetadata({
    title: `${cv.templateName} CV template — sample`,
    description: `A sample one-page, ATS-friendly CV GetMyCv writes for ${cv.profession.toLowerCase()} professionals, in the ${cv.layout} layout. Preview it or download the PDF.`,
    path: `/cv/${cv.slug}/`,
  });
}

export default async function CvSamplePage({ params }: Params) {
  const { slug } = await params;
  const cv = getCv(slug);
  if (!cv) notFound();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-900 print:min-h-0 print:bg-white">
      <div className="print:hidden">
        <DemoBanner profession={cv.profession} kind="CV" />
      </div>

      <div className="container-page flex flex-wrap items-end justify-between gap-4 pb-6 pt-8 print:hidden">
        <div>
          <p className="eyebrow">{cv.profession} · {cv.layout} layout</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">{cv.templateName}</h1>
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
          <Link href="/order/?package=starter" className="btn-primary">
            Get a CV like this
          </Link>
        </div>
      </div>

      <div className="container-page pb-16 print:p-0">
        <ScaledSheet width={A4_WIDTH} height={A4_HEIGHT}>
          <CvDocument cv={cv} />
        </ScaledSheet>
      </div>
    </div>
  );
}
