'use client';

import { memo, useEffect, useRef, useState } from 'react';
import CvDocument, { type CvDocumentProps } from '@/components/CvDocument';

/**
 * Renders the CV off-screen and reports its text in reading order — the same
 * DOM order the PDF's text layer follows, so it is what an ATS extracts. Done
 * off-screen because text inside a hidden element (a collapsed tab) cannot be
 * read with its line breaks.
 */
function CvPlainText({ onText, ...props }: CvDocumentProps & { onText: (text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Client-only, so the copy never appears in the static HTML crawlers read.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-cv-content]');
    if (!el) return;
    const text = el.innerText
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    onText(text);
  });

  if (!mounted) return null;
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0 print:hidden" style={{ width: 794 }}>
      <CvDocument {...props} links={false} />
    </div>
  );
}

export default memo(CvPlainText);
