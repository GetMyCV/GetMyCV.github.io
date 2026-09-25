import type { DemoCv } from '@/content/cvs';

/**
 * One A4 page (794 × 1123 CSS px, i.e. 210 × 297 mm at 96 dpi), rendered in
 * one of three layouts. The same markup is shown on /cv/<slug>/, printed to the
 * sample PDF and screenshotted for the preview image, so all three always match.
 *
 * Reading order is linear in every layout: headings, then a single column of
 * text. Side columns are placed with CSS grid only, which is what keeps these
 * CVs readable by applicant tracking systems.
 */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' };

export default function CvDocument({ cv }: { cv: DemoCv }) {
  const Layout = { classic: Classic, modern: Modern, executive: Executive }[cv.layout];
  return (
    <article
      data-cv-sheet
      aria-label={`Sample CV: ${cv.name}, ${cv.title}`}
      className="relative overflow-hidden bg-white text-[13px] leading-[1.55] text-slate-700 antialiased"
      style={
        {
          width: A4_WIDTH,
          height: A4_HEIGHT,
          '--accent': cv.accent,
          '--accent-soft': `color-mix(in srgb, ${cv.accent} 8%, white)`,
          '--accent-line': `color-mix(in srgb, ${cv.accent} 30%, white)`,
        } as React.CSSProperties
      }
    >
      <Layout cv={cv} />
      <p data-cv-footer className="absolute inset-x-0 bottom-3 text-center text-[8px] tracking-wide text-slate-400">
        Sample CV by GetMyCv · The person shown is fictional
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ shared */

function Contact({ cv, className = '' }: { cv: DemoCv; className?: string }) {
  const items = [cv.contact.location, cv.contact.phone, cv.contact.email, cv.contact.linkedin];
  return (
    <p className={`flex flex-wrap gap-x-2 gap-y-0.5 ${className}`}>
      {items.map((item, i) => (
        <span key={item} className="whitespace-nowrap">
          {i > 0 && <span aria-hidden="true" className="mr-2 opacity-50">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}

function Experience({ cv, compact = false }: { cv: DemoCv; compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-4' : 'space-y-[18px]'}>
      {cv.experience.map((job) => (
        <div key={`${job.role}-${job.period}`} className="break-inside-avoid">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[13.5px] font-bold text-slate-900">{job.role}</h3>
            <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-slate-500">
              {job.period}
            </span>
          </div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>
            {job.org} · {job.location}
          </p>
          <ul className="mt-1.5 space-y-1">
            {job.points.map((point) => (
              <li key={point} className="relative pl-3.5">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.62em] h-[4px] w-[4px] rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The optional extra section, e.g. selected projects, in each layout's own heading style. */
function Extra({ cv, Heading }: { cv: DemoCv; Heading: (props: { children: React.ReactNode }) => React.ReactNode }) {
  if (!cv.extra) return null;
  return (
    <>
      <Heading>{cv.extra.heading}</Heading>
      <ul className="space-y-1.5">
        {cv.extra.items.map((item) => (
          <li key={item.name}>
            <span className="font-semibold text-slate-900">{item.name}</span>
            <span aria-hidden="true" className="mx-1.5 text-slate-400">—</span>
            {item.detail}
          </li>
        ))}
      </ul>
    </>
  );
}

function Education({ cv }: { cv: DemoCv }) {
  return (
    <div className="space-y-2">
      {cv.education.map((ed) => (
        <div key={ed.qualification}>
          <p className="font-semibold leading-snug text-slate-900">{ed.qualification}</p>
          <p className="text-[12px] text-slate-500">
            {ed.institution} · {ed.year}
          </p>
          {ed.detail && <p className="text-[12px] text-slate-600">{ed.detail}</p>}
        </div>
      ))}
    </div>
  );
}

function Highlights({ cv, onDark = false }: { cv: DemoCv; onDark?: boolean }) {
  if (!cv.highlights) return null;
  return (
    <dl className="grid grid-cols-3 gap-3">
      {cv.highlights.map((h) => (
        <div
          key={h.label}
          className={`rounded-lg px-3 py-2 ${onDark ? 'bg-white/10' : ''}`}
          style={onDark ? undefined : { backgroundColor: 'var(--accent-soft)' }}
        >
          <dt className="sr-only">{h.label}</dt>
          <dd
            className="text-[20px] font-extrabold leading-tight"
            style={{ color: onDark ? '#fff' : 'var(--accent)' }}
          >
            {h.value}
          </dd>
          <dd className={`text-[11px] leading-snug ${onDark ? 'text-white/80' : 'text-slate-600'}`}>
            {h.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ----------------------------------------------------------------- classic */

function ClassicHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-2.5 mt-6 flex items-center gap-3 text-[11.5px] font-bold uppercase tracking-[0.18em]"
      style={{ color: 'var(--accent)' }}
    >
      {children}
      <span aria-hidden="true" className="h-px flex-1" style={{ backgroundColor: 'var(--accent-line)' }} />
    </h2>
  );
}

/** Centred serif name, ruled section headings, one column. The safest ATS layout. */
function Classic({ cv }: { cv: DemoCv }) {
  return (
    <div className="px-[60px] pb-10 pt-12">
      <header className="text-center">
        <h2 className="text-[36px] font-normal leading-tight tracking-tight text-slate-900" style={serif}>
          {cv.name}
        </h2>
        <p
          className="mt-1 text-[12px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'var(--accent)' }}
        >
          {cv.title}
        </p>
        <Contact cv={cv} className="mt-2 justify-center text-[12px] text-slate-500" />
        <div aria-hidden="true" className="mx-auto mt-4 h-[2px] w-16" style={{ backgroundColor: 'var(--accent)' }} />
      </header>

      <ClassicHeading>Profile</ClassicHeading>
      <p className="text-[13.5px] leading-[1.6] text-slate-700">{cv.summary}</p>

      <ClassicHeading>Experience</ClassicHeading>
      <Experience cv={cv} />

      <Extra cv={cv} Heading={ClassicHeading} />

      <ClassicHeading>Core skills</ClassicHeading>
      <dl className="space-y-1">
        {cv.skills.map((s) => (
          <div key={s.group} className="flex gap-3">
            <dt className="w-24 shrink-0 font-semibold text-slate-900">{s.group}</dt>
            <dd>{s.items.join(' · ')}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-2 gap-x-10">
        <section>
          <ClassicHeading>Education</ClassicHeading>
          <Education cv={cv} />
        </section>
        <section>
          {cv.certifications && (
            <>
              <ClassicHeading>Certifications</ClassicHeading>
              <ul className="space-y-1">
                {cv.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
          {cv.languages && (
            <>
              <ClassicHeading>Languages</ClassicHeading>
              <p>{cv.languages.join(' · ')}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ modern */

function ModernHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2
      className={`mb-2 text-[11.5px] font-extrabold uppercase tracking-[0.16em] ${light ? '' : 'mt-6'}`}
      style={{ color: 'var(--accent)' }}
    >
      {children}
    </h2>
  );
}

/**
 * Tinted sidebar on the left for contact, skills and education; the story on
 * the right. The main column comes first in the markup so parsers read it first.
 */
function Modern({ cv }: { cv: DemoCv }) {
  return (
    <div className="grid h-full grid-cols-[236px_1fr]">
      <main className="col-start-2 row-start-1 px-10 pb-10 pt-12">
        <header>
          <h2 className="font-heading text-[34px] font-extrabold leading-none tracking-tight text-slate-900">
            {cv.name}
          </h2>
          <p className="mt-2 text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>
            {cv.title}
          </p>
        </header>

        <p className="mt-4 text-[13.5px] leading-[1.6]">{cv.summary}</p>

        <div className="mt-4">
          <Highlights cv={cv} />
        </div>

        <ModernHeading>Experience</ModernHeading>
        <Experience cv={cv} />

        <Extra cv={cv} Heading={ModernHeading} />
      </main>

      <aside
        className="col-start-1 row-start-1 space-y-5 px-7 pb-10 pt-12"
        style={{ backgroundColor: 'var(--accent-soft)' }}
      >
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-2xl font-heading text-[22px] font-extrabold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {cv.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>

        <section>
          <ModernHeading light>Contact</ModernHeading>
          <ul className="space-y-1 text-[12px] leading-snug">
            <li>{cv.contact.location}</li>
            <li>{cv.contact.phone}</li>
            <li className="break-all">{cv.contact.email}</li>
            <li className="break-all">{cv.contact.linkedin}</li>
          </ul>
        </section>

        <section>
          <ModernHeading light>Skills</ModernHeading>
          <div className="space-y-2.5">
            {cv.skills.map((s) => (
              <div key={s.group}>
                <p className="text-[11.5px] font-bold text-slate-900">{s.group}</p>
                <p className="mt-1 flex flex-wrap gap-1">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="rounded bg-white px-1.5 py-0.5 text-[11.5px] leading-tight text-slate-700 ring-1 ring-inset"
                      style={{ '--tw-ring-color': 'var(--accent-line)' } as React.CSSProperties}
                    >
                      {item}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <ModernHeading light>Education</ModernHeading>
          <div className="text-[12px]">
            <Education cv={cv} />
          </div>
        </section>

        {cv.certifications && (
          <section>
            <ModernHeading light>Certifications</ModernHeading>
            <ul className="space-y-1 text-[12px] leading-snug">
              {cv.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {cv.languages && (
          <section>
            <ModernHeading light>Languages</ModernHeading>
            <p className="text-[12px]">{cv.languages.join(' · ')}</p>
          </section>
        )}
      </aside>
    </div>
  );
}

/* --------------------------------------------------------------- executive */

function ExecHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-3 mt-6 border-b pb-1 text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-900"
      style={{ borderColor: 'var(--accent-line)' }}
    >
      {children}
    </h2>
  );
}

/** Solid accent band with the headline numbers, then a wide main column. */
function Executive({ cv }: { cv: DemoCv }) {
  return (
    <div>
      <header className="px-[52px] pb-6 pt-10 text-white" style={{ backgroundColor: 'var(--accent)' }}>
        <h2 className="font-heading text-[34px] font-extrabold leading-none tracking-tight text-white">{cv.name}</h2>
        <p className="mt-2 text-[14px] font-semibold text-white/90">{cv.title}</p>
        <Contact cv={cv} className="mt-2 text-[12px] text-white/85" />
        <div className="mt-5">
          <Highlights cv={cv} onDark />
        </div>
      </header>

      <div className="grid grid-cols-[1fr_210px] gap-x-9 px-[52px] pb-10">
        <main>
          <ExecHeading>Profile</ExecHeading>
          <p className="text-[13.5px] leading-[1.6]">{cv.summary}</p>

          <ExecHeading>Experience</ExecHeading>
          <Experience cv={cv} compact />

          <Extra cv={cv} Heading={ExecHeading} />
        </main>

        <aside className="text-[12px]">
          <ExecHeading>Expertise</ExecHeading>
          <div className="space-y-2.5">
            {cv.skills.map((s) => (
              <div key={s.group}>
                <p className="font-bold" style={{ color: 'var(--accent)' }}>
                  {s.group}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ExecHeading>Education</ExecHeading>
          <Education cv={cv} />

          {cv.certifications && (
            <>
              <ExecHeading>Credentials</ExecHeading>
              <ul className="space-y-1 leading-snug">
                {cv.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}

          {cv.languages && (
            <>
              <ExecHeading>Languages</ExecHeading>
              <ul className="space-y-0.5">
                {cv.languages.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
