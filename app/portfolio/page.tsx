import Section from '@/components/Section';
import SampleGallery from '@/components/SampleGallery';
import CallToAction from '@/components/CallToAction';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Portfolio and CV samples',
  description:
    'Live portfolio websites and one-page ATS-friendly CV templates, with previews and PDFs, across software, accounting, marketing, engineering, healthcare and graduate roles.',
  path: '/portfolio/',
});

export default function PortfolioPage() {
  return (
    <>
      <Section
        eyebrow="Sample work"
        title="Proof, not promises"
        intro="Live demo portfolios and one-page CV templates. Click any card for a full-size preview, or download a CV as a PDF. The people are invented; the structure and writing are exactly what you would receive."
      >
        <SampleGallery />
      </Section>

      <Section tone="muted" eyebrow="Your privacy" title="Your CV never ends up here">
        <p className="max-w-2xl text-navy-700/80 dark:text-slate-300">
          Every sample on this page is either a demo we built for display or a client sample we
          were given written permission to show, with identifying details removed. We never publish
          your CV, your portfolio or your name without asking you first.
        </p>
      </Section>

      <CallToAction title="Want one of these for yourself?" />
    </>
  );
}
