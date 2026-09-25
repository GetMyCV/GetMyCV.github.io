'use client';

import { memo, useEffect, useRef } from 'react';
import CvDocument, { A4_HEIGHT, A4_WIDTH } from '@/components/CvDocument';
import ScaledSheet from '@/components/ScaledSheet';
import { withPlaceholders, type BuilderState } from '@/lib/cv-builder/model';

/**
 * The live A4 preview. It measures the CV's natural height, reports how many
 * pages that needs, and draws dashed page-break guides (screen only) so the
 * user can see where page 2 begins before downloading.
 */
function BuilderPreview({
  state,
  pages,
  onMeasure,
}: {
  state: BuilderState;
  pages: number;
  onMeasure: (contentHeight: number) => void;
}) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = sheet.current?.querySelector<HTMLElement>('[data-cv-content]');
    if (!content) return;
    // offsetHeight is layout height: unaffected by the on-screen scale transform.
    const report = () => onMeasure(content.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(content);
    return () => observer.disconnect();
  }, [onMeasure]);

  return (
    <ScaledSheet width={A4_WIDTH} height={A4_HEIGHT * pages}>
      <div ref={sheet} className="relative">
        <CvDocument
          cv={withPlaceholders(state.content)}
          layout={state.layout}
          accent={state.accent}
          font={state.font}
          scale={state.scale}
          pages={pages}
        />
        {Array.from({ length: pages - 1 }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-400/70 print:hidden"
            style={{ top: A4_HEIGHT * (i + 1) }}
          >
            <span className="absolute right-2 top-1 rounded bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              Page {i + 2}
            </span>
          </div>
        ))}
      </div>
    </ScaledSheet>
  );
}

export default memo(BuilderPreview);
