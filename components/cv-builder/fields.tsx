'use client';

import { useEffect, useId, useState } from 'react';

/* A collapsible step in the editor. */
export function StepCard({
  step,
  title,
  hint,
  done,
  open,
  onToggle,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section className="card overflow-hidden p-0">
      <h2 className="text-base">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-navy-50/60 dark:hover:bg-white/5"
        >
          <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              done
                ? 'bg-teal text-navy-900'
                : open
                  ? 'bg-navy text-white dark:bg-white dark:text-navy-900'
                  : 'bg-navy/10 text-navy dark:bg-white/10 dark:text-white'
            }`}
            aria-hidden="true"
          >
            {done ? '✓' : step}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-base font-bold text-navy dark:text-white">{title}</span>
            {hint && !open && (
              <span className="block truncate text-xs font-normal text-navy-700/70 dark:text-slate-400">{hint}</span>
            )}
          </span>
          <svg
            viewBox="0 0 20 20"
            className={`h-5 w-5 shrink-0 text-navy-700/60 transition-transform duration-300 dark:text-slate-400 ${open ? 'rotate-180' : ''}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.2 7.2a1 1 0 0 1 1.4 0L10 10.6l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 8.6a1 1 0 0 1 0-1.4Z" clipRule="evenodd" />
          </svg>
        </button>
      </h2>
      {open && (
        <div id={id} className="animate-fade-in border-t border-navy/10 px-5 pb-5 pt-4 dark:border-white/10">
          {children}
        </div>
      )}
    </section>
  );
}

type BaseProps = {
  label: string;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  hint,
  className = '',
  value,
  onChange,
  ...rest
}: BaseProps & { value: string; onChange: (value: string) => void } & Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  >) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className="input py-2.5" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <p className="mt-1 text-xs text-navy-700/70 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  className = '',
  value,
  onChange,
  rows = 4,
  maxLength,
  showCount,
  ...rest
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'rows'>) {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {showCount && (
          <span className="text-xs tabular-nums text-navy-700/60 dark:text-slate-400">
            {value.trim().length}
            {maxLength ? ` / ${maxLength}` : ''}
          </span>
        )}
      </div>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        className="input min-h-0 resize-y py-2.5 leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-navy-700/70 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

/**
 * A list edited as text — one item per line, or comma-separated. The raw text
 * is kept locally so the cursor never jumps while typing; the parsed list is
 * sent up on every change, and the text resets only when the list is replaced
 * from outside (loading an example, say).
 */
export function ListText({
  label,
  hint,
  className = '',
  items,
  onItems,
  separator,
  rows = 4,
  placeholder,
}: BaseProps & {
  items: string[];
  onItems: (items: string[]) => void;
  separator: 'line' | 'comma';
  rows?: number;
  placeholder?: string;
}) {
  const join = (list: string[]) => list.join(separator === 'line' ? '\n' : ', ');
  const split = (text: string) =>
    text
      .split(separator === 'line' ? /\n/ : /[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const [text, setText] = useState(() => join(items));

  useEffect(() => {
    if (JSON.stringify(split(text)) !== JSON.stringify(items.filter((i) => i.trim()))) setText(join(items));
    // Only react to the list changing from outside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <TextArea
      label={label}
      hint={hint}
      className={className}
      rows={rows}
      placeholder={placeholder}
      value={text}
      onChange={(value) => {
        setText(value);
        onItems(split(value));
      }}
    />
  );
}

/** Move up / move down / remove controls for one entry in a repeatable list. */
export function ItemControls({
  index,
  count,
  onMove,
  onRemove,
  noun,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  noun: string;
}) {
  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-30 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-white/10';
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${noun} ${index + 1} up`}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 5l5 6H5l5-6Z" />
        </svg>
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${noun} ${index + 1} down`}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M10 15l-5-6h10l-5 6Z" />
        </svg>
      </button>
      <button
        type="button"
        className={`${btn} hover:!bg-red-50 hover:text-red-700 dark:hover:!bg-red-500/10 dark:hover:text-red-300`}
        onClick={() => onRemove(index)}
        aria-label={`Remove ${noun} ${index + 1}`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 6h12M8 6V4h4v2m-6 0 1 10h6l1-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy/15 px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:border-teal hover:bg-teal/5 dark:border-white/15 dark:text-teal"
    >
      <span aria-hidden="true" className="text-lg leading-none">+</span>
      {children}
    </button>
  );
}

/** Moves one item in an array, returning a new array. */
export const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
