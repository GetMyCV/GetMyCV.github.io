'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Shrinks a fixed-size page (an A4 CV sheet) to fit narrow screens without
 * reflowing it, so a phone shows exactly what the PDF contains. Printing
 * ignores the scale — see `.sheet-scaler` in globals.css.
 */
export default function ScaledSheet({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="w-full">
      <div
        className="sheet-scaler mx-auto"
        style={{ width: width * scale, height: height * scale }}
      >
        <div
          className="sheet-scaler-inner origin-top-left shadow-[0_20px_50px_-12px_rgba(15,42,74,0.35)] ring-1 ring-navy/10"
          style={{ width, height, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
