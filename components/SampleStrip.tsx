import SampleCard from './SampleCard';
import { samples } from '@/content/samples';

/** One of each kind leads, so the home page shows both CVs and portfolios. */
const featured = ['portfolio-software', 'cv-senior-accountant', 'portfolio-marketing'];

/** Home-page preview: three samples, horizontally scrollable on small screens. */
export default function SampleStrip() {
  return (
    <div data-reveal-stagger className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {featured
        .map((id) => samples.find((s) => s.id === id))
        .filter((sample) => sample !== undefined)
        .map((sample) => (
        <div key={sample.id} className="w-[82vw] shrink-0 snap-center sm:w-auto">
          <SampleCard sample={sample} />
        </div>
      ))}
    </div>
  );
}
