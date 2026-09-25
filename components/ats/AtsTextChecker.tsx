'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import AtsReportView from './AtsReportView';

/**
 * The standalone checker: paste the text of any CV. Copying all text out of a
 * PDF (Ctrl+A, Ctrl+C) gives roughly what an ATS extracts, so a CV that pastes
 * as a jumble is one an ATS will misread too.
 */
export default function AtsTextChecker() {
  const [text, setText] = useState('');
  const id = useId();
  const ready = text.trim().split(/\s+/).length >= 15;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <label htmlFor={id} className="label text-base">
          Paste your CV text
        </label>
        <p className="mb-2 text-sm text-navy-700/80 dark:text-slate-300">
          Open your CV PDF or Word file, press <kbd className="rounded border border-navy/20 px-1 text-xs">Ctrl</kbd>+
          <kbd className="rounded border border-navy/20 px-1 text-xs">A</kbd> then{' '}
          <kbd className="rounded border border-navy/20 px-1 text-xs">Ctrl</kbd>+<kbd className="rounded border border-navy/20 px-1 text-xs">C</kbd>, and
          paste here. That is close to what an ATS extracts. Nothing leaves your browser.
        </p>
        <textarea
          id={id}
          rows={18}
          value={text}
          maxLength={40000}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Nimali Perera\nnimali@example.com | +94 77 123 4567 | linkedin.com/in/nimali\n\nEXPERIENCE\nMarketing Executive, ABC Holdings — Jan 2022 – Present\n• Grew Instagram leads by 40% in six months\n…'}
          className="input min-h-0 resize-y py-3 font-mono text-[13px] leading-relaxed"
        />
        <p className="mt-3 text-sm text-navy-700/80 dark:text-slate-300">
          Building a new CV? The{' '}
          <Link href="/cv-builder/" className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal">
            free CV builder
          </Link>{' '}
          runs this check live as you type.
        </p>
      </div>
      <div className="lg:sticky lg:top-24 lg:h-fit">
        {ready ? (
          <div className="card animate-fade-in">
            <AtsReportView text={text} textLabel="Text as pasted" />
          </div>
        ) : (
          <div className="card flex min-h-[18rem] flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="text-4xl">
              🔍
            </span>
            <p className="mt-3 font-heading font-bold text-navy dark:text-white">Your ATS report appears here</p>
            <p className="mt-1 max-w-xs text-sm text-navy-700/70 dark:text-slate-400">
              Paste at least a few lines of your CV to see what an applicant tracking system identifies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
