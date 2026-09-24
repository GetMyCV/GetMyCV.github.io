'use client';

import { useMemo, useState } from 'react';
import SampleCard from './SampleCard';
import { professions, samples, type Profession, type Sample } from '@/content/samples';

type Filter = 'All' | Profession;
type Kind = 'All' | Sample['type'];

const kinds: { value: Kind; label: string }[] = [
  { value: 'All', label: 'Everything' },
  { value: 'CV', label: 'CVs' },
  { value: 'Portfolio', label: 'Portfolios' },
];

export default function SampleGallery() {
  const [filter, setFilter] = useState<Filter>('All');
  const [kind, setKind] = useState<Kind>('All');

  const filters: Filter[] = useMemo(
    () => ['All', ...professions.filter((p) => samples.some((s) => s.profession === p))],
    [],
  );

  const visible = samples.filter(
    (s) => (filter === 'All' || s.profession === filter) && (kind === 'All' || s.type === kind),
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Show CVs, portfolios or both"
        className="mb-4 inline-flex rounded-xl border border-navy/15 bg-white p-1 dark:border-white/15 dark:bg-white/5"
      >
        {kinds.map((option) => {
          const active = option.value === kind;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setKind(option.value)}
              aria-pressed={active}
              className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-teal text-navy-900'
                  : 'text-navy-700 hover:bg-navy-50 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Filter samples by profession"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {filters.map((option) => {
          const active = option === filter;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={active}
              className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-navy text-white dark:bg-teal dark:text-navy-900'
                  : 'border border-navy/15 bg-white text-navy-700 hover:bg-navy-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((sample) => (
          <SampleCard key={sample.id} sample={sample} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 text-sm text-navy-700/70 dark:text-slate-400">
          No samples in this category yet — ask us and we will show you something similar.
        </p>
      )}
    </div>
  );
}
