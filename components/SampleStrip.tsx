import SampleCard from './SampleCard';
import { samples } from '@/content/samples';

/** Home-page preview: three samples, horizontally scrollable on small screens. */
export default function SampleStrip() {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {samples.slice(0, 3).map((sample) => (
        <div key={sample.id} className="w-[82vw] shrink-0 snap-center sm:w-auto">
          <SampleCard sample={sample} />
        </div>
      ))}
    </div>
  );
}
