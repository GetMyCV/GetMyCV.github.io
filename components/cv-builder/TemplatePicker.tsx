'use client';

import { memo } from 'react';
import CvDocument, { A4_HEIGHT, A4_WIDTH } from '@/components/CvDocument';
import { cvTemplates } from '@/content/cv-templates';
import type { CvContent, CvLayout } from '@/content/cvs';

const THUMB_WIDTH = 132;
const THUMB_SCALE = THUMB_WIDTH / A4_WIDTH;

/**
 * Template choices, each drawn as a live miniature of the user's own CV —
 * so they pick the layout that suits their content, not a stock image.
 */
function TemplatePicker({
  content,
  layout,
  accent,
  onSelect,
}: {
  content: CvContent;
  layout: CvLayout;
  accent: string;
  onSelect: (layout: CvLayout) => void;
}) {
  return (
    <div role="radiogroup" aria-label="CV template" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cvTemplates.map((t) => {
        const selected = t.id === layout;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(t.id)}
            className={`group rounded-xl border-2 p-2 text-left transition-all duration-200 ${
              selected
                ? 'border-teal bg-teal/5 shadow-md shadow-teal/10'
                : 'border-navy/10 hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-md dark:border-white/10'
            }`}
          >
            <span
              className="relative mx-auto block overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-navy/10"
              style={{ width: THUMB_WIDTH, height: A4_HEIGHT * THUMB_SCALE }}
              aria-hidden="true"
            >
              <span
                className="absolute left-0 top-0 block origin-top-left"
                style={{ transform: `scale(${THUMB_SCALE})`, width: A4_WIDTH, height: A4_HEIGHT }}
              >
                <CvDocument cv={content} layout={t.id} accent={selected ? accent : t.defaultAccent} />
              </span>
              {selected && (
                <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal text-xs font-bold text-navy-900 shadow">
                  ✓
                </span>
              )}
            </span>
            <span className="mt-2 flex items-center justify-between gap-2 px-1">
              <span className="font-heading text-sm font-bold text-navy dark:text-white">{t.name}</span>
              {t.photo && (
                <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold text-navy-700 dark:bg-white/10 dark:text-slate-300">
                  Photo
                </span>
              )}
            </span>
            <span className="mt-0.5 block px-1 text-xs leading-snug text-navy-700/70 dark:text-slate-400">
              {t.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(TemplatePicker);
