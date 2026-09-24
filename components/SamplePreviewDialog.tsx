'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Sample } from '@/content/samples';

/**
 * Full-size preview of a sample, opened from its card. A native <dialog>, so
 * focus trapping, Escape and the inert background come from the browser.
 * The image only loads once the dialog opens.
 */
export default function SamplePreviewDialog({
  sample,
  open,
  onClose,
}: {
  sample: Sample;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    }
    if (!open && dialog.open) dialog.close();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const isCv = sample.type === 'CV';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(event) => event.target === event.currentTarget && onClose()}
      aria-labelledby={`${sample.id}-preview-title`}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:animate-fade-in backdrop:bg-navy-900/80 backdrop:backdrop-blur-sm sm:m-auto sm:h-[92vh] sm:w-[min(96vw,64rem)] sm:rounded-2xl"
    >
      {open && (
        <div className="flex h-full animate-dialog-in flex-col overflow-hidden bg-white shadow-2xl dark:bg-navy-800 sm:rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-navy/10 px-4 py-3 dark:border-white/10 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal">
                {sample.profession} · {sample.type}
              </p>
              <h2 id={`${sample.id}-preview-title`} className="truncate text-base sm:text-lg">
                {sample.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {sample.pdf && (
                <a href={sample.pdf} download className="btn-secondary hidden px-4 py-2 text-sm sm:inline-flex">
                  Download PDF
                </a>
              )}
              <Link href={sample.href} className="btn-primary px-4 py-2 text-sm">
                {isCv ? 'Open CV' : 'Open live demo'}
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-navy hover:bg-navy-50 dark:text-white dark:hover:bg-white/10"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-3 dark:bg-navy-900 sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, no optimizer */}
            <img
              src={sample.preview}
              alt={`Full preview of the ${sample.title.toLowerCase()}`}
              className={`mx-auto h-auto w-full bg-white shadow-xl ring-1 ring-navy/10 ${
                isCv ? 'max-w-[794px]' : 'max-w-[1280px] rounded-lg'
              }`}
            />
            <p className="mx-auto mt-4 max-w-xl text-center text-xs text-navy-700/70 dark:text-slate-400">
              Sample made by GetMyCv. The person shown is fictional; yours is written around your
              own experience.
            </p>
          </div>
        </div>
      )}
    </dialog>
  );
}
