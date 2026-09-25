'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import type { CvContent } from '@/content/cvs';
import { analyzeAts, type AtsStatus } from '@/lib/ats';

const verdict = (score: number) =>
  score >= 85
    ? { label: 'ATS-friendly', tone: 'text-teal-700 dark:text-teal', ring: '#0E9488' }
    : score >= 65
      ? { label: 'Mostly ATS-friendly', tone: 'text-amber-700 dark:text-amber', ring: '#D97706' }
      : { label: 'Needs work for ATS', tone: 'text-red-700 dark:text-red-300', ring: '#DC2626' };

const statusStyle: Record<AtsStatus, { icon: string; badge: string; sr: string }> = {
  pass: { icon: '✓', badge: 'bg-teal text-navy-900', sr: 'Passed' },
  warn: { icon: '!', badge: 'bg-amber text-navy-900', sr: 'Warning' },
  fail: { icon: '✕', badge: 'bg-red-600 text-white', sr: 'Problem' },
  info: { icon: 'i', badge: 'bg-navy/10 text-navy-700 dark:bg-white/15 dark:text-slate-200', sr: 'Note' },
};

function ScoreRing({ score }: { score: number }) {
  const v = verdict(score);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`ATS score ${score} out of 100`}>
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-navy/10 dark:stroke-white/10" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke={v.ring}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-extrabold text-navy dark:text-white">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-700/60 dark:text-slate-400">/ 100</span>
      </span>
    </div>
  );
}

/**
 * Explains, in plain language, what an applicant tracking system reads from a
 * CV and how ATS-friendly it is. Used in the CV builder, on the sample CV
 * pages and on the standalone ATS checker.
 */
export default function AtsReportView({
  text,
  content,
  pages,
  initialJobAd = '',
  showJobAd = true,
  textLabel = 'Plain text an ATS reads',
}: {
  text: string;
  content?: CvContent;
  pages?: number;
  initialJobAd?: string;
  showJobAd?: boolean;
  textLabel?: string;
}) {
  const [jobAd, setJobAd] = useState(initialJobAd);
  const [copied, setCopied] = useState(false);
  const deferredJobAd = useDeferredValue(jobAd);
  const report = useMemo(
    () => analyzeAts({ text, content, pages, jobDescription: deferredJobAd }),
    [text, content, pages, deferredJobAd],
  );
  const v = verdict(report.score);
  const jobAdId = useId();
  const counts = {
    pass: report.checks.filter((c) => c.status === 'pass').length,
    fix: report.checks.filter((c) => c.status === 'warn' || c.status === 'fail').length,
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex items-center gap-5">
        <ScoreRing score={report.score} />
        <div>
          <p className={`font-heading text-lg font-extrabold ${v.tone}`}>{v.label}</p>
          <p className="mt-0.5 text-sm text-navy-700/80 dark:text-slate-300">
            {counts.pass} check{counts.pass === 1 ? '' : 's'} passed
            {counts.fix ? ` · ${counts.fix} to improve` : ''}
            {report.keywords ? ` · ${report.keywords.percent}% keyword match` : ''}
          </p>
          <p className="mt-1 text-xs text-navy-700/60 dark:text-slate-400">
            An estimate based on how common ATS systems (Workday, Taleo, Greenhouse, Lever) parse CVs.
          </p>
        </div>
      </div>

      {/* Job ad */}
      {showJobAd && (
        <div className="rounded-xl border border-navy/10 p-4 dark:border-white/10">
          <label htmlFor={jobAdId} className="label">
            Compare with a job ad <span className="font-normal text-navy-700/60 dark:text-slate-400">(optional)</span>
          </label>
          <textarea
            id={jobAdId}
            rows={3}
            value={jobAd}
            onChange={(e) => setJobAd(e.target.value)}
            maxLength={12000}
            placeholder="Paste the job description here to see which of its keywords your CV already uses, and which are missing."
            className="input min-h-0 resize-y py-2.5 text-sm leading-relaxed"
          />
          {report.keywords ? (
            <div className="mt-3 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-navy dark:text-white">Keyword match</span>
                <span className="font-heading font-extrabold text-navy dark:text-white">{report.keywords.percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${report.keywords.percent >= 70 ? 'bg-teal' : report.keywords.percent >= 45 ? 'bg-amber' : 'bg-red-500'}`}
                  style={{ width: `${report.keywords.percent}%` }}
                />
              </div>
              {report.keywords.matched.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">In your CV</p>
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    {report.keywords.matched.map((k) => (
                      <span key={k} className="rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal">
                        ✓ {k}
                      </span>
                    ))}
                  </p>
                </>
              )}
              {report.keywords.missing.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">Missing: add them if they are true for you</p>
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    {report.keywords.missing.map((k) => (
                      <span key={k} className="rounded-full border border-amber/60 bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-navy-800 dark:text-amber">
                        {k}
                      </span>
                    ))}
                  </p>
                </>
              )}
            </div>
          ) : (
            jobAd.trim().length > 0 && (
              <p className="mt-2 text-xs text-navy-700/60 dark:text-slate-400">Paste a little more of the ad to see a keyword match.</p>
            )
          )}
        </div>
      )}

      {/* What gets extracted */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-navy-700/80 dark:text-slate-300">What an ATS identifies</h3>
        <dl className="mt-2 divide-y divide-navy/10 overflow-hidden rounded-xl border border-navy/10 text-sm dark:divide-white/10 dark:border-white/10">
          {report.fields.map((f) => (
            <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2">
              <dt className="flex items-center gap-1.5 font-semibold text-navy dark:text-white">
                <span aria-hidden="true" className={f.found ? 'text-teal-700 dark:text-teal' : 'text-red-600 dark:text-red-400'}>
                  {f.found ? '✓' : '✕'}
                </span>
                {f.label}
              </dt>
              <dd className={`min-w-0 break-words ${f.found ? 'text-navy-700 dark:text-slate-200' : 'text-red-700 dark:text-red-300'}`}>
                <span className="sr-only">{f.found ? 'Found: ' : 'Not identified: '}</span>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        {report.jobs.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-navy/10 text-sm dark:border-white/10">
            <p className="bg-navy/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/80 dark:bg-white/5 dark:text-slate-300">
              Work history as parsed
            </p>
            <ul className="divide-y divide-navy/10 dark:divide-white/10">
              {report.jobs.map((job, i) => (
                <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 px-3 py-2">
                  <span className="text-navy-800 dark:text-slate-100">
                    <strong>{job.title || 'Untitled role'}</strong>
                    {job.employer && <span className="text-navy-700/70 dark:text-slate-400"> at {job.employer}</span>}
                  </span>
                  <span className={`text-xs font-semibold ${job.parsed ? 'text-teal-700 dark:text-teal' : 'text-amber-700 dark:text-amber'}`}>
                    {job.parsed ?? (job.dates ? `Unreadable: “${job.dates}”` : 'No dates')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 flex flex-wrap gap-1.5" aria-label="Sections detected">
          {report.sections.map((s) => (
            <span
              key={s.name}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.found ? 'bg-navy text-white dark:bg-white dark:text-navy-900' : 'border border-dashed border-navy/25 text-navy-700/60 dark:border-white/25 dark:text-slate-400'}`}
            >
              {s.found ? '✓ ' : ''}
              {s.name}
              <span className="sr-only">{s.found ? ' section detected' : ' section not found'}</span>
            </span>
          ))}
        </p>
      </div>

      {/* Checks */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-navy-700/80 dark:text-slate-300">ATS-friendliness checks</h3>
        <ul className="mt-2 space-y-2.5">
          {report.checks.map((check) => {
            const st = statusStyle[check.status];
            return (
              <li key={check.id} className="flex gap-3 text-sm">
                <span aria-hidden="true" className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${st.badge}`}>
                  {st.icon}
                </span>
                <span>
                  <span className="font-semibold text-navy dark:text-white">
                    <span className="sr-only">{st.sr}: </span>
                    {check.label}
                  </span>
                  <span className="block text-xs leading-relaxed text-navy-700/75 dark:text-slate-400">{check.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Raw text */}
      <details className="group rounded-xl border border-navy/10 dark:border-white/10">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-navy dark:text-white [&::-webkit-details-marker]:hidden">
          <span>
            {textLabel}
            <span className="ml-2 font-normal text-navy-700/60 dark:text-slate-400">{report.wordCount} words</span>
          </span>
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="border-t border-navy/10 p-3 dark:border-white/10">
          <p className="mb-2 text-xs text-navy-700/70 dark:text-slate-400">
            This is the text an ATS pulls out of your PDF, top to bottom. If something reads oddly here, it reads oddly to the ATS too.
          </p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-navy/5 p-3 font-mono text-[12px] leading-relaxed text-navy-800 dark:bg-white/5 dark:text-slate-200">
            {text.trim() || '(empty)'}
          </pre>
          <button type="button" onClick={copy} className="btn-ghost mt-2 px-3 py-1.5 text-xs">
            {copied ? 'Copied ✓' : 'Copy text'}
          </button>
        </div>
      </details>
    </div>
  );
}
