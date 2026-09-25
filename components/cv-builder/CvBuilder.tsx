'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { A4_HEIGHT, type CvFont } from '@/components/CvDocument';
import { accentSwatches, getTemplate } from '@/content/cv-templates';
import { cvs } from '@/content/cvs';
import type { CvContent, CvLayout } from '@/content/cvs';
import { packages, formatPrice } from '@/content/pricing';
import {
  MAX_SCALE,
  MIN_SCALE,
  STORAGE_KEY,
  blankState,
  emptyEducation,
  emptyProject,
  emptyRole,
  fileNameFor,
  fromSample,
  hasContent,
  sanitize,
  withPlaceholders,
  type BuilderState,
} from '@/lib/cv-builder/model';
import { photoToDataUrl } from '@/lib/cv-builder/photo';
import { strengthChecks } from '@/lib/cv-builder/strength';
import AtsReportView from '@/components/ats/AtsReportView';
import CvPlainText from '@/components/ats/CvPlainText';
import { toWebUrl } from '@/lib/links';
import BuilderPreview from './BuilderPreview';
import TemplatePicker from './TemplatePicker';
import { AddButton, ItemControls, ListText, StepCard, TextArea, TextField, move } from './fields';

type Step = 'design' | 'personal' | 'profile' | 'experience' | 'projects' | 'education' | 'skills' | 'more' | 'finish';

const fonts: { id: CvFont; label: string; sample: string }[] = [
  { id: 'template', label: 'Template default', sample: 'font-heading' },
  { id: 'sans', label: 'Clean sans', sample: 'font-sans' },
  { id: 'serif', label: 'Classic serif', sample: 'font-serif' },
];

/** A gentle warning when something typed into a link field is not a web address. */
const linkHint = (value: string | undefined) =>
  value && value.trim() && !toWebUrl(value) ? 'This does not look like a web address, so it will not be clickable.' : undefined;

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function CvBuilder() {
  const [state, setState] = useState<BuilderState>(blankState);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saved' | 'error'>('idle');
  const [open, setOpen] = useState<Step | null>('design');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT);
  const [fitting, setFitting] = useState(false);
  const [busy, setBusy] = useState<null | 'docx'>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const printDialog = useRef<HTMLDialogElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const backupMenu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => backupMenu.current?.removeAttribute('open');

  // The backup menu closes on any click outside it.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (backupMenu.current?.open && !backupMenu.current.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Every layout ends with 40px of bottom padding (scaled with the text); a CV
  // whose last line fits on the page should not spill onto page 2 for padding.
  const pages = Math.max(1, Math.ceil((contentHeight - 40 * state.scale - 2) / A4_HEIGHT));
  // The preview and thumbnails lag a keystroke behind, so typing stays instant.
  const deferred = useDeferredValue(state);
  const [atsText, setAtsText] = useState('');
  const thumbContent = useMemo(() => withPlaceholders(deferred.content), [deferred.content]);

  /* ---------------------------------------------------------- persistence */

  useEffect(() => {
    let restored: BuilderState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      restored = raw ? sanitize(JSON.parse(raw)) : null;
    } catch {
      // Private mode or a corrupt entry: start blank.
    }

    // /cv-builder/?example=<slug> (from a sample CV page) preloads that example,
    // unless the visitor already has a CV of their own in progress.
    const example = cvs.find((cv) => cv.slug === new URLSearchParams(window.location.search).get('example'));
    if (example && !(restored && hasContent(restored.content))) {
      setState(fromSample(example));
      setOpen('personal');
      setNotice('Example loaded. Replace the details with your own.');
    } else if (restored) {
      setState(restored);
      setOpen(hasContent(restored.content) ? null : 'design');
      if (example) setNotice('You already have a CV in progress, so we kept it. Use “Start from an example” to switch.');
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaved('saved');
      } catch {
        setSaved('error');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [state, ready]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  /* --------------------------------------------------------------- update */

  const set = useCallback(<K extends keyof BuilderState>(key: K, value: BuilderState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const edit = useCallback((fn: (c: CvContent) => CvContent) => {
    setState((s) => ({ ...s, content: fn(s.content) }));
  }, []);

  const c = state.content;

  /* ------------------------------------------------------------ fit to page */

  // Shrinks the text step by step until the CV fits on one page (or hits the floor).
  useEffect(() => {
    if (!fitting || deferred.scale !== state.scale) return;
    if (pages === 1) {
      setFitting(false);
      setNotice('Done: your CV now fits on one page.');
      return;
    }
    if (state.scale <= MIN_SCALE + 0.001) {
      setFitting(false);
      setNotice('Still more than one page at the smallest text size. Try trimming older roles or bullets.');
      return;
    }
    // Wait a beat so the preview has re-measured at the current size.
    const timer = setTimeout(() => set('scale', Math.max(MIN_SCALE, Math.round((state.scale - 0.02) * 100) / 100)), 120);
    return () => clearTimeout(timer);
  }, [fitting, pages, state.scale, deferred.scale, set]);

  /* ------------------------------------------------------------- actions */

  const loadExample = (slug: string) => {
    const sample = cvs.find((cv) => cv.slug === slug);
    if (!sample) return;
    if (hasContent(state.content) && !window.confirm('Replace what you have written with this example?')) return;
    setState(fromSample(sample));
    setOpen('personal');
    setNotice(`Loaded the ${sample.templateName.split(' — ').pop()?.toLowerCase()} example. Edit anything you like.`);
  };

  const clearAll = () => {
    if (!window.confirm('Clear the whole CV and start again? This cannot be undone.')) return;
    setState(blankState());
    setOpen('design');
  };

  const exportJson = () =>
    download(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), fileNameFor(c, 'json'));

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const restored = sanitize(JSON.parse(await file.text()));
      if (!restored) throw new Error('not a CV');
      setState(restored);
      setNotice('Backup loaded.');
    } catch {
      setNotice('That file is not a GetMyCv backup.');
    }
  };

  const downloadWord = async () => {
    setBusy('docx');
    try {
      const { buildDocx } = await import('@/lib/cv-builder/docx');
      download(await buildDocx(state), fileNameFor(c, 'docx'));
    } catch (error) {
      console.error(error);
      setNotice('Could not create the Word file. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const printPdf = () => {
    printDialog.current?.close();
    const previous = document.title;
    document.title = fileNameFor(c, 'pdf').replace(/\.pdf$/, '');
    const restore = () => {
      document.title = previous;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    // Let the dialog close before the print snapshot is taken.
    setTimeout(() => window.print(), 50);
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const photo = await photoToDataUrl(file);
      edit((x) => ({ ...x, photo }));
      if (!getTemplate(state.layout).photo) setNotice('Photo added. Pick Modern, Executive or Elegant to show it.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not read that image.');
    }
  };

  const checks = useMemo(() => strengthChecks(c, pages), [c, pages]);
  const score = Math.round((checks.filter((x) => x.passed).length / checks.length) * 100);

  const toggle = (step: Step) => setOpen((current) => (current === step ? null : step));
  const next = (step: Step) => {
    setOpen(step);
    requestAnimationFrame(() =>
      document.getElementById(`step-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  if (!ready) return <BuilderSkeleton />;

  const template = getTemplate(state.layout);
  const nextButton = (step: Step, label: string) => (
    <div className="mt-5 flex justify-end">
      <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => next(step)}>
        {label} →
      </button>
    </div>
  );

  return (
    <div className="print:block">
      {/* Toolbar */}
      <div className="relative z-30 -mx-5 border-b lg:sticky lg:top-16 border-navy/10 bg-surface-light/95 px-5 py-3 backdrop-blur print:hidden dark:border-white/10 dark:bg-surface-dark/95 sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="example-select">
            Start from an example
          </label>
          <select
            id="example-select"
            className="input w-auto min-w-0 max-w-[13rem] py-2 text-sm"
            value=""
            onChange={(e) => loadExample(e.target.value)}
          >
            <option value="" disabled>
              Start from an example…
            </option>
            {cvs.map((cv) => (
              <option key={cv.slug} value={cv.slug}>
                {cv.templateName.split(' — ').pop()}
              </option>
            ))}
          </select>

          <details ref={backupMenu} className="relative">
            <summary className="btn-ghost cursor-pointer list-none px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
              Backup ▾
            </summary>
            <div className="absolute left-0 z-40 mt-1 w-56 animate-fade-in max-sm:fixed max-sm:inset-x-5 max-sm:w-auto rounded-xl border border-navy/10 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-navy-800">
              <button type="button" onClick={() => { closeMenu(); exportJson(); }} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-navy-50 dark:hover:bg-white/10">
                Save a backup file (.json)
              </button>
              <button type="button" onClick={() => { closeMenu(); importInput.current?.click(); }} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-navy-50 dark:hover:bg-white/10">
                Load a backup file…
              </button>
              <button type="button" onClick={() => { closeMenu(); clearAll(); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">
                Clear and start again
              </button>
            </div>
          </details>
          <input
            ref={importInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              importJson(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <span className="hidden text-xs text-navy-700/60 dark:text-slate-400 md:inline" aria-live="polite">
            {saved === 'saved' ? '✓ Saved in this browser' : saved === 'error' ? 'Could not save — storage is full or blocked' : ''}
          </span>

          <span className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => { setTab('edit'); next('finish'); }} className="btn-ghost px-3 py-2 text-sm">
              ATS check
            </button>
            <button type="button" onClick={downloadWord} disabled={busy === 'docx'} className="btn-secondary px-3 py-2 text-sm sm:px-4">
              {busy === 'docx' ? 'Preparing…' : 'Word'}
            </button>
            <button type="button" onClick={() => printDialog.current?.showModal()} className="btn-primary px-3 py-2 text-sm sm:px-4">
              Download PDF
            </button>
          </span>
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-3 animate-fade-in rounded-xl border border-teal/40 bg-teal/5 px-4 py-2.5 text-sm text-navy-800 print:hidden dark:text-slate-100">
          {notice}
        </p>
      )}

      {/* Mobile tabs */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-navy/10 bg-white p-1 print:hidden dark:border-white/10 dark:bg-white/5 lg:hidden" role="tablist">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-navy text-white dark:bg-teal dark:text-navy-900' : 'text-navy-700 dark:text-slate-300'}`}
          >
            {t === 'edit' ? 'Edit' : `Preview · ${pages} page${pages > 1 ? 's' : ''}`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] print:mt-0 print:block">
        {/* ------------------------------------------------------ editor */}
        <div className={`space-y-4 print:hidden ${tab === 'edit' ? '' : 'hidden lg:block'}`}>
          {!hasContent(c) && (
            <div className="rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-transparent p-5">
              <p className="font-heading font-bold text-navy dark:text-white">New here? Start from an example.</p>
              <p className="mt-1 text-sm text-navy-700/80 dark:text-slate-300">
                Load a finished CV for your field, then replace the details with your own. It is the fastest way to a strong CV.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cvs.map((cv) => (
                  <button
                    key={cv.slug}
                    type="button"
                    onClick={() => loadExample(cv.slug)}
                    className="rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:border-teal hover:text-teal-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200"
                  >
                    {cv.templateName.split(' — ').pop()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div id="step-design" className="scroll-mt-40">
            <StepCard step={1} title="Template & style" hint={`${template.name} · ${fonts.find((f) => f.id === state.font)?.label} · ${Math.round(state.scale * 100)}%`} open={open === 'design'} onToggle={() => toggle('design')} done={open !== 'design'}>
              <TemplatePicker content={thumbContent} layout={state.layout} accent={state.accent} onSelect={(layout: CvLayout) => set('layout', layout)} />

              <p className="label mt-6">Accent colour</p>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Accent colour">
                {accentSwatches.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    role="radio"
                    aria-checked={state.accent === colour}
                    aria-label={`Accent ${colour}`}
                    onClick={() => set('accent', colour)}
                    className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${state.accent === colour ? 'ring-2 ring-teal ring-offset-2 ring-offset-white dark:ring-offset-navy-900' : ''}`}
                    style={{ backgroundColor: colour }}
                  />
                ))}
                <label className="relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-navy/15 px-3 text-xs font-semibold text-navy-700 dark:border-white/15 dark:text-slate-300">
                  Custom
                  <input type="color" value={state.accent} onChange={(e) => set('accent', e.target.value)} className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0" />
                </label>
              </div>

              <p className="label mt-6">Font</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Font">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={state.font === f.id}
                    onClick={() => set('font', f.id)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm transition-colors ${state.font === f.id ? 'border-teal bg-teal/5' : 'border-navy/10 hover:border-teal/50 dark:border-white/10'}`}
                  >
                    <span className={`block text-lg font-bold text-navy dark:text-white ${f.sample}`}>Aa</span>
                    <span className="text-xs text-navy-700/80 dark:text-slate-300">{f.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor="text-size" className="label">
                    Text size: {Math.round(state.scale * 100)}%
                  </label>
                  <input
                    id="text-size"
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={0.01}
                    value={state.scale}
                    onChange={(e) => set('scale', Number(e.target.value))}
                    className="w-full accent-teal"
                  />
                </div>
                <button type="button" className="btn-secondary px-4 py-2 text-sm" disabled={pages === 1 || fitting} onClick={() => setFitting(true)}>
                  {fitting ? 'Fitting…' : pages === 1 ? 'Fits on one page' : 'Fit to one page'}
                </button>
              </div>
              {nextButton('personal', 'Personal details')}
            </StepCard>
          </div>

          <div id="step-personal" className="scroll-mt-40">
            <StepCard step={2} title="Personal details" hint={[c.name, c.contact.email].filter(Boolean).join(' · ') || 'Name, title and contact details'} open={open === 'personal'} onToggle={() => toggle('personal')} done={Boolean(c.name && c.contact.email)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Full name" value={c.name} onChange={(v) => edit((x) => ({ ...x, name: v }))} autoComplete="name" placeholder="e.g. Nimali Perera" />
                <TextField label="Job title" value={c.title} onChange={(v) => edit((x) => ({ ...x, title: v }))} placeholder="e.g. Senior Accountant" hint="The role you are applying for." />
                <TextField label="Email" type="email" value={c.contact.email} onChange={(v) => edit((x) => ({ ...x, contact: { ...x.contact, email: v } }))} autoComplete="email" placeholder="you@example.com" />
                <TextField label="Phone" type="tel" value={c.contact.phone} onChange={(v) => edit((x) => ({ ...x, contact: { ...x.contact, phone: v } }))} autoComplete="tel" placeholder="+94 77 123 4567" />
                <TextField label="Location" value={c.contact.location} onChange={(v) => edit((x) => ({ ...x, contact: { ...x.contact, location: v } }))} placeholder="Colombo, Sri Lanka" />
                <TextField label="LinkedIn" value={c.contact.linkedin} onChange={(v) => edit((x) => ({ ...x, contact: { ...x.contact, linkedin: v } }))} placeholder="linkedin.com/in/yourname" inputMode="url" hint={linkHint(c.contact.linkedin)} />
                <TextField className="sm:col-span-2" label="Portfolio, GitHub or website (optional)" value={c.contact.website ?? ''} onChange={(v) => edit((x) => ({ ...x, contact: { ...x.contact, website: v } }))} placeholder="github.com/yourname" inputMode="url" hint={linkHint(c.contact.website) ?? 'Shown as a clickable link on your CV.'} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-navy/10 p-4 dark:border-white/10">
                {c.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data: URL
                  <img src={c.photo} alt="Your photo" className="h-16 w-16 rounded-full object-cover ring-2 ring-teal/40" />
                ) : (
                  <span aria-hidden="true" className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-2xl dark:bg-white/10">
                    👤
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy dark:text-white">Photo (optional)</p>
                  <p className="text-xs text-navy-700/70 dark:text-slate-400">
                    {template.photo ? 'Shown on this template.' : 'This template has no photo; Modern, Executive and Elegant do.'} Stays on your device.
                  </p>
                </div>
                <label className="btn-secondary cursor-pointer px-4 py-2 text-sm">
                  {c.photo ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {c.photo && (
                  <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => edit((x) => ({ ...x, photo: undefined }))}>
                    Remove
                  </button>
                )}
              </div>
              {nextButton('profile', 'Profile')}
            </StepCard>
          </div>

          <div id="step-profile" className="scroll-mt-40">
            <StepCard step={3} title="Profile & key results" hint={c.summary ? `${c.summary.slice(0, 70)}…` : 'A short pitch and your three best numbers'} open={open === 'profile'} onToggle={() => toggle('profile')} done={c.summary.trim().length >= 200}>
              <TextArea
                label="Professional profile"
                value={c.summary}
                onChange={(v) => edit((x) => ({ ...x, summary: v }))}
                rows={5}
                maxLength={900}
                showCount
                placeholder="Who you are, your strongest result, and the role you want next. Two to four lines."
                hint="Tip: lead with your years of experience and one result with a number in it."
              />
              <p className="label mt-5">Key results (optional)</p>
              <p className="-mt-1 mb-2 text-xs text-navy-700/70 dark:text-slate-400">Up to three headline numbers. Shown as tiles on most templates.</p>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => {
                  const h = c.highlights?.[i] ?? { value: '', label: '' };
                  const update = (patch: Partial<typeof h>) =>
                    edit((x) => {
                      const list = [...(x.highlights ?? [])];
                      while (list.length <= i) list.push({ value: '', label: '' });
                      list[i] = { ...list[i], ...patch };
                      return { ...x, highlights: list };
                    });
                  return (
                    <div key={i} className="grid grid-cols-[7rem_1fr] gap-2">
                      <input aria-label={`Result ${i + 1} number`} className="input py-2" placeholder={['40%', 'LKR 12m', '25+'][i]} value={h.value} maxLength={20} onChange={(e) => update({ value: e.target.value })} />
                      <input aria-label={`Result ${i + 1} description`} className="input py-2" placeholder={['faster month-end close', 'new revenue won', 'staff trained'][i]} value={h.label} maxLength={60} onChange={(e) => update({ label: e.target.value })} />
                    </div>
                  );
                })}
              </div>
              {nextButton('experience', 'Experience')}
            </StepCard>
          </div>

          <div id="step-experience" className="scroll-mt-40">
            <StepCard step={4} title="Experience" hint={`${c.experience.filter((j) => j.role).length} role(s)`} open={open === 'experience'} onToggle={() => toggle('experience')} done={c.experience.some((j) => j.role && j.points.filter(Boolean).length >= 2)}>
              <p className="-mt-1 mb-4 text-sm text-navy-700/80 dark:text-slate-300">
                Most recent first. Internships, volunteering and big projects count too.
              </p>
              <div className="space-y-4">
                {c.experience.map((job, i) => {
                  const update = (patch: Partial<typeof job>) =>
                    edit((x) => ({ ...x, experience: x.experience.map((j, k) => (k === i ? { ...j, ...patch } : j)) }));
                  return (
                    <fieldset key={i} className="rounded-xl border border-navy/10 p-4 dark:border-white/10">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <legend className="text-sm font-bold text-navy dark:text-white">{job.role || `Role ${i + 1}`}</legend>
                        <ItemControls
                          index={i}
                          count={c.experience.length}
                          noun="role"
                          onMove={(from, to) => edit((x) => ({ ...x, experience: move(x.experience, from, to) }))}
                          onRemove={(k) => edit((x) => ({ ...x, experience: x.experience.filter((_, n) => n !== k) }))}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField label="Job title" value={job.role} onChange={(v) => update({ role: v })} placeholder="e.g. Marketing Executive" />
                        <TextField label="Employer" value={job.org} onChange={(v) => update({ org: v })} placeholder="e.g. ABC Holdings" />
                        <TextField label="Location" value={job.location} onChange={(v) => update({ location: v })} placeholder="Colombo" />
                        <TextField label="Dates" value={job.period} onChange={(v) => update({ period: v })} placeholder="Jan 2022 – Present" />
                      </div>
                      <ListText
                        className="mt-3"
                        label="Achievements (one per line)"
                        separator="line"
                        rows={4}
                        items={job.points}
                        onItems={(points) => update({ points })}
                        placeholder={'Cut invoice processing time from 5 days to 2 by …\nLed a team of 4 to …'}
                        hint="Start with a verb, include a number, keep each under two lines."
                      />
                    </fieldset>
                  );
                })}
                <AddButton onClick={() => edit((x) => ({ ...x, experience: [...x.experience, emptyRole()] }))}>Add a role</AddButton>
              </div>
              {nextButton('projects', 'Projects')}
            </StepCard>
          </div>

          <div id="step-projects" className="scroll-mt-40">
            <StepCard step={5} title="Projects" hint={`${(c.projects ?? []).filter((x) => x.name).length} project(s) · optional`} open={open === 'projects'} onToggle={() => toggle('projects')} done={(c.projects ?? []).some((x) => x.name && x.description)}>
              <p className="-mt-1 mb-4 text-sm text-navy-700/80 dark:text-slate-300">
                Side projects, university work or portfolio pieces. Each shows as one compact line, with its link clickable in the PDF.
              </p>
              <div className="space-y-3">
                {(c.projects ?? []).map((project, i) => {
                  const update = (patch: Partial<typeof project>) =>
                    edit((x) => ({ ...x, projects: (x.projects ?? []).map((pr, k) => (k === i ? { ...pr, ...patch } : pr)) }));
                  return (
                    <fieldset key={i} className="rounded-xl border border-navy/10 p-3 dark:border-white/10">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <legend className="text-sm font-bold text-navy dark:text-white">{project.name || `Project ${i + 1}`}</legend>
                        <ItemControls
                          index={i}
                          count={c.projects?.length ?? 0}
                          noun="project"
                          onMove={(from, to) => edit((x) => ({ ...x, projects: move(x.projects ?? [], from, to) }))}
                          onRemove={(k) => edit((x) => ({ ...x, projects: (x.projects ?? []).filter((_, n) => n !== k) }))}
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input aria-label={`Project ${i + 1} name`} className="input py-2" placeholder="Name, e.g. Campus timetable app" value={project.name} maxLength={120} onChange={(e) => update({ name: e.target.value })} />
                        <div>
                          <input aria-label={`Project ${i + 1} link (optional)`} className="input py-2" placeholder="Link (optional), e.g. github.com/you/app" inputMode="url" value={project.link} maxLength={300} onChange={(e) => update({ link: e.target.value })} />
                          {linkHint(project.link) && <p className="mt-1 text-xs text-amber-700 dark:text-amber">{linkHint(project.link)}</p>}
                        </div>
                        <input aria-label={`Project ${i + 1} description`} className="input py-2 sm:col-span-2" placeholder="One line: what it does and the result, e.g. Used by 400+ students" value={project.description} maxLength={240} onChange={(e) => update({ description: e.target.value })} />
                        <input aria-label={`Project ${i + 1} tools (optional)`} className="input py-2 sm:col-span-2" placeholder="Tools (optional), e.g. React, Firebase" value={project.tech} maxLength={120} onChange={(e) => update({ tech: e.target.value })} />
                      </div>
                    </fieldset>
                  );
                })}
                <AddButton onClick={() => edit((x) => ({ ...x, projects: [...(x.projects ?? []), emptyProject()] }))}>Add a project</AddButton>
              </div>
              {nextButton('education', 'Education')}
            </StepCard>
          </div>

          <div id="step-education" className="scroll-mt-40">
            <StepCard step={6} title="Education" hint={c.education.find((e) => e.qualification)?.qualification || 'Degrees, diplomas, A/Ls'} open={open === 'education'} onToggle={() => toggle('education')} done={c.education.some((e) => e.qualification)}>
              <div className="space-y-4">
                {c.education.map((ed, i) => {
                  const update = (patch: Partial<typeof ed>) =>
                    edit((x) => ({ ...x, education: x.education.map((e, k) => (k === i ? { ...e, ...patch } : e)) }));
                  return (
                    <fieldset key={i} className="rounded-xl border border-navy/10 p-4 dark:border-white/10">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <legend className="text-sm font-bold text-navy dark:text-white">{ed.qualification || `Qualification ${i + 1}`}</legend>
                        <ItemControls
                          index={i}
                          count={c.education.length}
                          noun="qualification"
                          onMove={(from, to) => edit((x) => ({ ...x, education: move(x.education, from, to) }))}
                          onRemove={(k) => edit((x) => ({ ...x, education: x.education.filter((_, n) => n !== k) }))}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField className="sm:col-span-2" label="Qualification" value={ed.qualification} onChange={(v) => update({ qualification: v })} placeholder="BSc (Hons) Computer Science" />
                        <TextField label="Institution" value={ed.institution} onChange={(v) => update({ institution: v })} placeholder="University of Colombo" />
                        <TextField label="Year" value={ed.year} onChange={(v) => update({ year: v })} placeholder="2024" />
                        <TextField className="sm:col-span-2" label="Details (optional)" value={ed.detail ?? ''} onChange={(v) => update({ detail: v })} placeholder="GPA 3.7 · Dean's List" />
                      </div>
                    </fieldset>
                  );
                })}
                <AddButton onClick={() => edit((x) => ({ ...x, education: [...x.education, emptyEducation()] }))}>Add a qualification</AddButton>
              </div>
              {nextButton('skills', 'Skills')}
            </StepCard>
          </div>

          <div id="step-skills" className="scroll-mt-40">
            <StepCard step={7} title="Skills" hint={`${c.skills.flatMap((s) => s.items).length} skill(s)`} open={open === 'skills'} onToggle={() => toggle('skills')} done={c.skills.flatMap((s) => s.items).length >= 6}>
              <p className="-mt-1 mb-4 text-sm text-navy-700/80 dark:text-slate-300">
                Group them (e.g. Tools, Languages, Leadership). Use the words from the job advert so ATS filters match.
              </p>
              <div className="space-y-4">
                {c.skills.map((group, i) => (
                  <fieldset key={i} className="rounded-xl border border-navy/10 p-4 dark:border-white/10">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <legend className="text-sm font-bold text-navy dark:text-white">{group.group || `Group ${i + 1}`}</legend>
                      <ItemControls
                        index={i}
                        count={c.skills.length}
                        noun="skill group"
                        onMove={(from, to) => edit((x) => ({ ...x, skills: move(x.skills, from, to) }))}
                        onRemove={(k) => edit((x) => ({ ...x, skills: x.skills.filter((_, n) => n !== k) }))}
                      />
                    </div>
                    <TextField label="Group name" value={group.group} onChange={(v) => edit((x) => ({ ...x, skills: x.skills.map((s, k) => (k === i ? { ...s, group: v } : s)) }))} placeholder="e.g. Tools" />
                    <ListText
                      className="mt-3"
                      label="Skills (separate with commas)"
                      separator="comma"
                      rows={2}
                      items={group.items}
                      onItems={(items) => edit((x) => ({ ...x, skills: x.skills.map((s, k) => (k === i ? { ...s, items } : s)) }))}
                      placeholder="Excel, Power BI, SAP"
                    />
                  </fieldset>
                ))}
                <AddButton onClick={() => edit((x) => ({ ...x, skills: [...x.skills, { group: '', items: [] }] }))}>Add a skill group</AddButton>
              </div>
              {nextButton('more', 'More sections')}
            </StepCard>
          </div>

          <div id="step-more" className="scroll-mt-40">
            <StepCard step={8} title="More sections" hint="Certifications, languages, volunteering, awards" open={open === 'more'} onToggle={() => toggle('more')} done={(c.certifications?.length ?? 0) + (c.languages?.length ?? 0) > 0}>
              <TextField
                label="Custom section title"
                value={c.extra?.heading ?? ''}
                onChange={(v) => edit((x) => ({ ...x, extra: { heading: v, items: x.extra?.items ?? [] } }))}
                placeholder="Volunteering, Awards, Publications…"
              />
              <div className="mt-3 space-y-3">
                {(c.extra?.items ?? []).map((item, i) => {
                  const update = (patch: Partial<typeof item>) =>
                    edit((x) => ({ ...x, extra: { heading: x.extra?.heading ?? '', items: (x.extra?.items ?? []).map((it, k) => (k === i ? { ...it, ...patch } : it)) } }));
                  return (
                    <div key={i} className="rounded-xl border border-navy/10 p-3 dark:border-white/10">
                      <div className="flex items-start gap-2">
                        <div className="grid flex-1 gap-2">
                          <input aria-label={`Item ${i + 1} name`} className="input py-2" placeholder="Name, e.g. Red Cross volunteer" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                          <input aria-label={`Item ${i + 1} detail`} className="input py-2" placeholder="One line on what it was and the result" value={item.detail} onChange={(e) => update({ detail: e.target.value })} />
                        </div>
                        <ItemControls
                          index={i}
                          count={c.extra?.items.length ?? 0}
                          noun="item"
                          onMove={(from, to) => edit((x) => ({ ...x, extra: { heading: x.extra?.heading ?? '', items: move(x.extra?.items ?? [], from, to) } }))}
                          onRemove={(k) => edit((x) => ({ ...x, extra: { heading: x.extra?.heading ?? '', items: (x.extra?.items ?? []).filter((_, n) => n !== k) } }))}
                        />
                      </div>
                    </div>
                  );
                })}
                <AddButton onClick={() => edit((x) => ({ ...x, extra: { heading: x.extra?.heading || 'Projects', items: [...(x.extra?.items ?? []), { name: '', detail: '' }] } }))}>
                  Add an item
                </AddButton>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ListText label="Certifications (one per line)" separator="line" rows={4} items={c.certifications ?? []} onItems={(certifications) => edit((x) => ({ ...x, certifications }))} placeholder={'CIMA Certificate (2023)\nGoogle Ads Search'} />
                <ListText label="Languages (one per line)" separator="line" rows={4} items={c.languages ?? []} onItems={(languages) => edit((x) => ({ ...x, languages }))} placeholder={'English — fluent\nSinhala — native\nTamil — conversational'} />
              </div>
              {nextButton('finish', 'Finish')}
            </StepCard>
          </div>

          <div id="step-finish" className="scroll-mt-40">
            <StepCard step={9} title="ATS check & download" hint={`See what an ATS reads · writing score ${score}%`} open={open === 'finish'} onToggle={() => toggle('finish')} done={score === 100}>
              <p className="-mt-1 mb-4 text-sm text-navy-700/80 dark:text-slate-300">
                Most employers screen CVs with an applicant tracking system (ATS) before a person reads them. This is what one extracts from your CV, and how to make it score higher.
              </p>
              <AtsReportView text={atsText} content={deferred.content} pages={pages} />
              <details className="group mt-5 rounded-xl border border-navy/10 dark:border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-navy dark:text-white [&::-webkit-details-marker]:hidden">
                  <span>Writing checklist <span className="ml-1 font-normal text-navy-700/60 dark:text-slate-400">{score}%</span></span>
                  <span aria-hidden="true" className="transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="border-t border-navy/10 p-4 dark:border-white/10">
                  <Strength score={score} checks={checks} />
                </div>
              </details>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="btn-primary" onClick={() => printDialog.current?.showModal()}>
                  Download PDF
                </button>
                <button type="button" className="btn-secondary" onClick={downloadWord} disabled={busy === 'docx'}>
                  {busy === 'docx' ? 'Preparing…' : 'Download Word (.docx)'}
                </button>
              </div>
            </StepCard>
          </div>

          <aside className="rounded-2xl bg-navy p-5 text-white">
            <p className="font-heading text-lg font-bold">Rather have an expert write it?</p>
            <p className="mt-1 text-sm text-slate-200">
              A professional, ATS-tested CV written around your experience, from {formatPrice(packages[0].price)}. Delivered in days.
            </p>
            <Link href="/order/?package=starter" className="btn-primary mt-4 px-5 py-2 text-sm">
              Get it written for me
            </Link>
          </aside>
        </div>

        {/* ----------------------------------------------------- preview */}
        <div className={`print:block ${tab === 'preview' ? '' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-36 print:static">
            <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
              <p className="text-sm font-semibold text-navy dark:text-white">
                Live preview
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${pages === 1 ? 'bg-teal/15 text-teal-700 dark:text-teal' : pages === 2 ? 'bg-amber/20 text-navy-800 dark:text-amber' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                  {pages} page{pages > 1 ? 's' : ''}
                </span>
              </p>
              <p className="text-xs text-navy-700/60 dark:text-slate-400">A4 · exactly what downloads</p>
            </div>
            <div className="rounded-2xl bg-slate-200/70 p-3 dark:bg-white/5 sm:p-5 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto print:max-h-none print:overflow-visible print:rounded-none print:bg-transparent print:p-0">
              <BuilderPreview state={deferred} pages={pages} onMeasure={setContentHeight} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-navy/10 bg-white/95 p-3 backdrop-blur print:hidden dark:border-white/10 dark:bg-navy-900/95 lg:hidden">
        <button type="button" className="btn-secondary flex-1 px-3 py-2 text-sm" onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}>
          {tab === 'edit' ? 'Preview' : 'Edit'}
        </button>
        <button type="button" className="btn-primary flex-1 px-3 py-2 text-sm" onClick={() => printDialog.current?.showModal()}>
          Download PDF
        </button>
      </div>

      <PrintDialog dialogRef={printDialog} onPrint={printPdf} pages={pages} />

      {open === 'finish' && (
        <CvPlainText
          cv={withPlaceholders(deferred.content)}
          layout={deferred.layout}
          accent={deferred.accent}
          font={deferred.font}
          scale={deferred.scale}
          onText={setAtsText}
        />
      )}
    </div>
  );
}

function Strength({ score, checks }: { score: number; checks: ReturnType<typeof strengthChecks> }) {
  const tone = score >= 85 ? 'bg-teal' : score >= 60 ? 'bg-amber' : 'bg-red-500';
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-navy dark:text-white">CV strength</p>
        <p className="font-heading text-xl font-extrabold text-navy dark:text-white">{score}%</p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="CV strength">
        <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${score}%` }} />
      </div>
      <ul className="mt-4 space-y-2.5">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${check.passed ? 'bg-teal text-navy-900' : 'bg-navy/10 text-navy-700 dark:bg-white/10 dark:text-slate-300'}`}
            >
              {check.passed ? '✓' : '!'}
            </span>
            <span>
              <span className={`font-semibold ${check.passed ? 'text-navy-700/70 line-through decoration-teal/60 dark:text-slate-400' : 'text-navy dark:text-white'}`}>
                {check.label}
              </span>
              <span className="sr-only">{check.passed ? ' — done' : ' — to do'}</span>
              {!check.passed && <span className="block text-xs text-navy-700/70 dark:text-slate-400">{check.tip}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrintDialog({
  dialogRef,
  onPrint,
  pages,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onPrint: () => void;
  pages: number;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="print-title"
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      className="w-[min(92vw,30rem)] rounded-2xl p-0 shadow-2xl backdrop:animate-fade-in backdrop:bg-navy-900/70 backdrop:backdrop-blur-sm"
    >
      <div className="animate-dialog-in bg-white p-6 dark:bg-navy-800">
        <h2 id="print-title" className="text-xl">
          Save your CV as a PDF
        </h2>
        <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">
          Your browser&apos;s print window will open with just your CV ({pages} A4 page{pages > 1 ? 's' : ''}). The text stays real text, so applicant tracking systems can read it.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-navy-800 dark:text-slate-200">
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs font-bold text-teal-700 dark:text-teal">1</span>
            Set <strong>Destination</strong> to <strong>Save as PDF</strong>.
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs font-bold text-teal-700 dark:text-teal">2</span>
            If you see <strong>More settings</strong>, keep Paper size <strong>A4</strong> and turn on <strong>Background graphics</strong>.
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs font-bold text-teal-700 dark:text-teal">3</span>
            Click <strong>Save</strong>.
          </li>
        </ol>
        <p className="mt-4 text-xs text-navy-700/70 dark:text-slate-400">
          On a phone, choose <strong>Share → Print → Save to Files</strong> (iPhone) or <strong>Print → Save as PDF</strong> (Android).
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost px-4 py-2 text-sm" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="button" className="btn-primary px-5 py-2 text-sm" onClick={onPrint}>
            Open print window
          </button>
        </div>
      </div>
    </dialog>
  );
}

function BuilderSkeleton() {
  return (
    <div aria-hidden="true" className="mt-2 grid animate-pulse gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-navy/5 dark:bg-white/5" />
        ))}
      </div>
      <div className="hidden aspect-[210/297] rounded-2xl bg-navy/5 dark:bg-white/5 lg:block" />
    </div>
  );
}
