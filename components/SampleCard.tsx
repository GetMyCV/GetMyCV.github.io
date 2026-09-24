'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SamplePreviewDialog from './SamplePreviewDialog';
import type { Sample } from '@/content/samples';

/**
 * A gallery card. The thumbnail is a real screenshot of the sample, framed as
 * what it is — a browser window for portfolios, a sheet of paper for CVs — and
 * clicking it opens the full-size preview without leaving the gallery.
 */
export default function SampleCard({ sample }: { sample: Sample }) {
  const [previewing, setPreviewing] = useState(false);
  const isCv = sample.type === 'CV';

  return (
    <article className="card group flex h-full flex-col overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setPreviewing(true)}
        aria-label={`Preview the ${sample.title.toLowerCase()}`}
        className="relative block aspect-[8/5] w-full overflow-hidden bg-gradient-to-br from-navy-50 to-slate-200 text-left dark:from-white/10 dark:to-white/5"
      >
        {isCv ? (
          <span className="absolute inset-x-[14%] top-[9%] block h-[125%] rounded-sm bg-white shadow-[0_18px_40px_-12px_rgba(15,42,74,0.45)] ring-1 ring-navy/10 transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none">
            <Image
              src={sample.image}
              alt=""
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 25vw"
              className="object-cover object-top"
            />
          </span>
        ) : (
          <span className="absolute inset-x-[6%] top-[9%] block h-[110%] overflow-hidden rounded-t-lg bg-white shadow-[0_18px_40px_-12px_rgba(15,42,74,0.45)] ring-1 ring-navy/10 transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none">
            <span aria-hidden="true" className="flex h-5 items-center gap-1 border-b border-slate-200 bg-slate-100 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </span>
            <span className="relative block h-[calc(100%-1.25rem)]">
              <Image
                src={sample.image}
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover object-top"
              />
            </span>
          </span>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-xs font-semibold text-white">
          {sample.type}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-navy-900/0 opacity-0 transition-opacity duration-200 group-hover:bg-navy-900/35 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-lg">
            Quick preview
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal">
          {sample.profession}
        </p>
        <h3 className="mt-1.5 text-lg">{sample.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
          {sample.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {sample.result ? (
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal/20 dark:text-teal">
              {sample.result}
            </span>
          ) : (
            <span />
          )}
          <span className="ml-auto flex items-center gap-4">
            {sample.pdf && (
              <a
                href={sample.pdf}
                download
                className="text-sm font-semibold text-navy-700 hover:underline dark:text-slate-200"
              >
                Download PDF
              </a>
            )}
            <Link
              href={sample.href}
              className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal"
            >
              View sample →
            </Link>
          </span>
        </div>
      </div>

      <SamplePreviewDialog sample={sample} open={previewing} onClose={() => setPreviewing(false)} />
    </article>
  );
}
