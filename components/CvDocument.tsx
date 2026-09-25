import type { CvContent, CvLayout } from '@/content/cvs';

/**
 * A CV on A4 (794 × 1123 CSS px, i.e. 210 × 297 mm at 96 dpi), rendered in one
 * of five layouts. The same component draws the sample CVs at /cv/<slug>/ (and
 * their PDFs and preview images) and the live preview in the CV builder.
 *
 * Reading order is linear in every layout: headings, then a single column of
 * text. Side columns are placed with CSS grid only, after the main column in
 * the markup, which is what keeps these CVs readable by applicant tracking
 * systems. Sidebar backgrounds are painted on the sheet itself, so they run
 * the full height of every page when a CV flows onto a second page.
 */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export type CvFont = 'template' | 'sans' | 'serif';

export type CvDocumentProps = {
  cv: CvContent;
  layout: CvLayout;
  accent: string;
  /** 'template' keeps each layout's own pairing (Classic has a serif name). */
  font?: CvFont;
  /** Text size multiplier, e.g. 0.9 to fit more on a page. */
  scale?: number;
  /** Number of A4 pages the sheet spans. */
  pages?: number;
  /** Small print at the foot of the first page, e.g. on the samples. */
  footer?: string;
};

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS_HEADING = 'var(--font-heading), system-ui, sans-serif';
const SANS_BODY = 'var(--font-body), system-ui, sans-serif';

/** Width of the sidebar column in the layouts that have one, before scaling. */
const SIDEBAR = { modern: 236, elegant: 250 } as const;

export default function CvDocument({
  cv,
  layout,
  accent,
  font = 'template',
  scale = 1,
  pages = 1,
  footer,
}: CvDocumentProps) {
  const Layout = { classic: Classic, modern: Modern, executive: Executive, minimal: Minimal, elegant: Elegant }[
    layout
  ];

  const nameFont = font === 'serif' || (font === 'template' && layout === 'classic') ? SERIF : SANS_HEADING;
  const headingFont = font === 'serif' ? SERIF : SANS_HEADING;
  const bodyFont = font === 'serif' ? SERIF : SANS_BODY;

  const sidebar = layout === 'modern' || layout === 'elegant' ? SIDEBAR[layout] * scale : 0;
  const sidebarColour = layout === 'elegant' ? 'var(--accent)' : 'var(--accent-soft)';

  return (
    <article
      data-cv-sheet
      data-pages={pages}
      aria-label={`CV: ${cv.name || 'Untitled'}${cv.title ? `, ${cv.title}` : ''}`}
      className="relative overflow-hidden bg-white text-[13px] leading-[1.55] text-slate-700 antialiased"
      style={
        {
          width: A4_WIDTH,
          height: A4_HEIGHT * pages,
          '--pages': pages,
          '--accent': accent,
          '--accent-soft': `color-mix(in srgb, ${accent} 8%, white)`,
          '--accent-line': `color-mix(in srgb, ${accent} 30%, white)`,
          '--cv-name-font': nameFont,
          '--cv-heading-font': headingFont,
          fontFamily: bodyFont,
          background: sidebar
            ? `linear-gradient(90deg, ${sidebarColour} 0 ${sidebar}px, #fff ${sidebar}px)`
            : '#fff',
        } as React.CSSProperties
      }
    >
      {/* Measured by the CV builder to work out how many pages the CV needs. */}
      <div data-cv-content>
        <div style={scale === 1 ? undefined : { zoom: scale }}>
          <Layout cv={cv} />
        </div>
      </div>
      {footer && (
        <p
          data-cv-footer
          className={`absolute inset-x-0 text-center text-[8px] tracking-wide text-slate-400 ${
            pages === 1 ? 'bottom-3' : ''
          }`}
          // On a longer CV it stays at the foot of the first page.
          style={pages === 1 ? undefined : { top: A4_HEIGHT, transform: 'translateY(calc(-100% - 12px))' }}
        >
          {footer}
        </p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ shared */

type LayoutProps = { cv: CvContent };
type HeadingComponent = (props: { children: React.ReactNode }) => React.ReactNode;

const has = (value: string | undefined) => Boolean(value && value.trim());
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'CV';

const contactItems = (cv: CvContent) =>
  [cv.contact.location, cv.contact.phone, cv.contact.email, cv.contact.linkedin].filter(has);

function Contact({ cv, className = '' }: { cv: CvContent; className?: string }) {
  const items = contactItems(cv);
  if (!items.length) return null;
  return (
    <p className={`flex flex-wrap gap-x-2 gap-y-0.5 ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="whitespace-nowrap">
          {i > 0 && <span aria-hidden="true" className="mr-2 opacity-50">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}

function ContactList({ cv, className = '' }: { cv: CvContent; className?: string }) {
  const items = contactItems(cv);
  if (!items.length) return null;
  return (
    <ul className={`space-y-1 leading-snug ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="break-words">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Photo({ cv, className, fallback }: { cv: CvContent; className: string; fallback?: React.ReactNode }) {
  if (!cv.photo) return <>{fallback ?? null}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a data: URL from the builder, never optimised
    <img src={cv.photo} alt="" className={`object-cover ${className}`} />
  );
}

const jobs = (cv: CvContent) =>
  cv.experience.filter((job) => has(job.role) || has(job.org) || job.points.some(has));

function Experience({ cv, compact = false }: { cv: CvContent; compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-4' : 'space-y-[18px]'}>
      {jobs(cv).map((job, index) => {
        const where = [job.org, job.location].filter(has).join(' · ');
        return (
          <div key={index} className="cv-block">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[13.5px] font-bold text-slate-900">{job.role}</h3>
              {has(job.period) && (
                <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-slate-500">
                  {job.period}
                </span>
              )}
            </div>
            {where && (
              <p className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>
                {where}
              </p>
            )}
            <Bullets points={job.points} />
          </div>
        );
      })}
    </div>
  );
}

function Bullets({ points }: { points: string[] }) {
  const items = points.filter(has);
  if (!items.length) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((point, i) => (
        <li key={i} className="cv-block relative pl-3.5">
          <span
            aria-hidden="true"
            className="absolute left-0 top-[0.62em] h-[4px] w-[4px] rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          {point}
        </li>
      ))}
    </ul>
  );
}

const extraItems = (cv: CvContent) => (cv.extra?.items ?? []).filter((i) => has(i.name) || has(i.detail));

/** The optional extra section, e.g. selected projects, in each layout's own heading style. */
function Extra({ cv, Heading }: { cv: CvContent; Heading: HeadingComponent }) {
  const items = extraItems(cv);
  if (!items.length) return null;
  return (
    <>
      <Heading>{cv.extra?.heading || 'Additional'}</Heading>
      <ExtraList cv={cv} />
    </>
  );
}

function ExtraList({ cv }: { cv: CvContent }) {
  return (
    <ul className="space-y-1.5">
      {extraItems(cv).map((item, i) => (
        <li key={i} className="cv-block">
          {has(item.name) && <span className="font-semibold text-slate-900">{item.name}</span>}
          {has(item.name) && has(item.detail) && (
            <span aria-hidden="true" className="mx-1.5 text-slate-400">
              —
            </span>
          )}
          {item.detail}
        </li>
      ))}
    </ul>
  );
}

const schools = (cv: CvContent) => cv.education.filter((ed) => has(ed.qualification) || has(ed.institution));

function Education({ cv, muted = 'text-slate-500', strong = 'text-slate-900' }: { cv: CvContent; muted?: string; strong?: string }) {
  return (
    <div className="space-y-2">
      {schools(cv).map((ed, i) => (
        <div key={i} className="cv-block">
          <p className={`font-semibold leading-snug ${strong}`}>{ed.qualification}</p>
          <p className={`text-[12px] ${muted}`}>{[ed.institution, ed.year].filter(has).join(' · ')}</p>
          {has(ed.detail) && <p className={`text-[12px] ${muted}`}>{ed.detail}</p>}
        </div>
      ))}
    </div>
  );
}

const skillGroups = (cv: CvContent) =>
  cv.skills
    .map((s) => ({ group: s.group, items: s.items.filter(has) }))
    .filter((s) => s.items.length > 0);

const highlightItems = (cv: CvContent) => (cv.highlights ?? []).filter((h) => has(h.value));
const certs = (cv: CvContent) => (cv.certifications ?? []).filter(has);
const langs = (cv: CvContent) => (cv.languages ?? []).filter(has);

function Highlights({ cv, onDark = false }: { cv: CvContent; onDark?: boolean }) {
  const items = highlightItems(cv);
  if (!items.length) return null;
  return (
    <dl className={`grid gap-3 ${items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {items.map((h, i) => (
        <div
          key={i}
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
function Classic({ cv }: LayoutProps) {
  const hasCerts = certs(cv).length > 0;
  const hasLangs = langs(cv).length > 0;
  return (
    <div className="cv-column px-[60px] pb-10 pt-12">
      <header className="text-center">
        <h2 className="cv-name text-[36px] font-normal leading-tight tracking-tight text-slate-900">{cv.name}</h2>
        {has(cv.title) && (
          <p
            className="mt-1 text-[12px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--accent)' }}
          >
            {cv.title}
          </p>
        )}
        <Contact cv={cv} className="mt-2 justify-center text-[12px] text-slate-500" />
        <div aria-hidden="true" className="mx-auto mt-4 h-[2px] w-16" style={{ backgroundColor: 'var(--accent)' }} />
      </header>

      {has(cv.summary) && (
        <>
          <ClassicHeading>Profile</ClassicHeading>
          <p className="text-[13.5px] leading-[1.6] text-slate-700">{cv.summary}</p>
        </>
      )}

      {highlightItems(cv).length > 0 && (
        <div className="mt-5">
          <Highlights cv={cv} />
        </div>
      )}

      {jobs(cv).length > 0 && (
        <>
          <ClassicHeading>Experience</ClassicHeading>
          <Experience cv={cv} />
        </>
      )}

      <Extra cv={cv} Heading={ClassicHeading} />

      {skillGroups(cv).length > 0 && (
        <>
          <ClassicHeading>Core skills</ClassicHeading>
          <dl className="space-y-1">
            {skillGroups(cv).map((s, i) => (
              <div key={i} className="flex gap-3">
                {has(s.group) && <dt className="w-24 shrink-0 font-semibold text-slate-900">{s.group}</dt>}
                <dd>{s.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {(schools(cv).length > 0 || hasCerts || hasLangs) && (
        <div className="grid grid-cols-2 gap-x-10">
          <section>
            {schools(cv).length > 0 && (
              <>
                <ClassicHeading>Education</ClassicHeading>
                <Education cv={cv} />
              </>
            )}
          </section>
          <section>
            {hasCerts && (
              <>
                <ClassicHeading>Certifications</ClassicHeading>
                <ul className="space-y-1">
                  {certs(cv).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            )}
            {hasLangs && (
              <>
                <ClassicHeading>Languages</ClassicHeading>
                <p>{langs(cv).join(' · ')}</p>
              </>
            )}
          </section>
        </div>
      )}
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

const ModernMainHeading: HeadingComponent = ({ children }) => <ModernHeading>{children}</ModernHeading>;

/**
 * Tinted sidebar on the left for contact, skills and education; the story on
 * the right. The main column comes first in the markup so parsers read it first.
 */
function Modern({ cv }: LayoutProps) {
  return (
    <div className="grid grid-cols-[236px_1fr]">
      <main className="cv-column col-start-2 row-start-1 px-10 pb-10 pt-12">
        <header>
          <h2 className="cv-name text-[34px] font-extrabold leading-none tracking-tight text-slate-900">{cv.name}</h2>
          {has(cv.title) && (
            <p className="mt-2 text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>
              {cv.title}
            </p>
          )}
        </header>

        {has(cv.summary) && <p className="mt-4 text-[13.5px] leading-[1.6]">{cv.summary}</p>}

        {highlightItems(cv).length > 0 && (
          <div className="mt-4">
            <Highlights cv={cv} />
          </div>
        )}

        {jobs(cv).length > 0 && (
          <>
            <ModernHeading>Experience</ModernHeading>
            <Experience cv={cv} />
          </>
        )}

        <Extra cv={cv} Heading={ModernMainHeading} />
      </main>

      <aside className="cv-column col-start-1 row-start-1 space-y-5 px-7 pb-10 pt-12">
        <Photo
          cv={cv}
          className="h-24 w-24 rounded-2xl"
          fallback={
            <div
              aria-hidden="true"
              className="cv-heading flex h-16 w-16 items-center justify-center rounded-2xl text-[22px] font-extrabold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {initialsOf(cv.name)}
            </div>
          }
        />

        {contactItems(cv).length > 0 && (
          <section>
            <ModernHeading light>Contact</ModernHeading>
            <ContactList cv={cv} className="text-[12px]" />
          </section>
        )}

        {skillGroups(cv).length > 0 && (
          <section>
            <ModernHeading light>Skills</ModernHeading>
            <div className="space-y-2.5">
              {skillGroups(cv).map((s, i) => (
                <div key={i}>
                  {has(s.group) && <p className="text-[11.5px] font-bold text-slate-900">{s.group}</p>}
                  <p className="mt-1 flex flex-wrap gap-1">
                    {s.items.map((item, j) => (
                      <span
                        key={j}
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
        )}

        {schools(cv).length > 0 && (
          <section>
            <ModernHeading light>Education</ModernHeading>
            <div className="text-[12px]">
              <Education cv={cv} />
            </div>
          </section>
        )}

        {certs(cv).length > 0 && (
          <section>
            <ModernHeading light>Certifications</ModernHeading>
            <ul className="space-y-1 text-[12px] leading-snug">
              {certs(cv).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {langs(cv).length > 0 && (
          <section>
            <ModernHeading light>Languages</ModernHeading>
            <p className="text-[12px]">{langs(cv).join(' · ')}</p>
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
function Executive({ cv }: LayoutProps) {
  const side = skillGroups(cv).length + schools(cv).length + certs(cv).length + langs(cv).length > 0;
  return (
    <div>
      <header className="px-[52px] pb-6 pt-10 text-white" style={{ backgroundColor: 'var(--accent)' }}>
        <div className="flex items-center gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="cv-name text-[34px] font-extrabold leading-none tracking-tight text-white">{cv.name}</h2>
            {has(cv.title) && <p className="mt-2 text-[14px] font-semibold text-white/90">{cv.title}</p>}
            <Contact cv={cv} className="mt-2 text-[12px] text-white/85" />
          </div>
          <Photo cv={cv} className="h-[92px] w-[92px] shrink-0 rounded-full ring-4 ring-white/25" />
        </div>
        {highlightItems(cv).length > 0 && (
          <div className="mt-5">
            <Highlights cv={cv} onDark />
          </div>
        )}
      </header>

      <div className={`grid gap-x-9 px-[52px] pb-10 ${side ? 'grid-cols-[1fr_210px]' : 'grid-cols-1'}`}>
        <main className="cv-column">
          {has(cv.summary) && (
            <>
              <ExecHeading>Profile</ExecHeading>
              <p className="text-[13.5px] leading-[1.6]">{cv.summary}</p>
            </>
          )}

          {jobs(cv).length > 0 && (
            <>
              <ExecHeading>Experience</ExecHeading>
              <Experience cv={cv} compact />
            </>
          )}

          <Extra cv={cv} Heading={ExecHeading} />
        </main>

        {side && (
          <aside className="cv-column text-[12px]">
            {skillGroups(cv).length > 0 && (
              <>
                <ExecHeading>Expertise</ExecHeading>
                <div className="space-y-2.5">
                  {skillGroups(cv).map((s, i) => (
                    <div key={i}>
                      {has(s.group) && (
                        <p className="font-bold" style={{ color: 'var(--accent)' }}>
                          {s.group}
                        </p>
                      )}
                      <ul className="mt-0.5 space-y-0.5">
                        {s.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}

            {schools(cv).length > 0 && (
              <>
                <ExecHeading>Education</ExecHeading>
                <Education cv={cv} />
              </>
            )}

            {certs(cv).length > 0 && (
              <>
                <ExecHeading>Credentials</ExecHeading>
                <ul className="space-y-1 leading-snug">
                  {certs(cv).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {langs(cv).length > 0 && (
              <>
                <ExecHeading>Languages</ExecHeading>
                <ul className="space-y-0.5">
                  {langs(cv).map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- minimal */

/** One labelled row: the section name sits in a narrow margin to the left. */
function MinimalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[132px_1fr] gap-x-8 border-t border-slate-200 py-5">
      <h2 className="pt-0.5 text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
        {label}
      </h2>
      <div>{children}</div>
    </section>
  );
}

/** Quiet, precise, lots of white space: section labels in a left margin. */
function Minimal({ cv }: LayoutProps) {
  return (
    <div className="cv-column px-[60px] pb-10 pt-14">
      <header className="pb-6">
        <h2 className="cv-name text-[38px] font-bold leading-none tracking-tight text-slate-900">{cv.name}</h2>
        {has(cv.title) && <p className="mt-2.5 text-[15px] text-slate-600">{cv.title}</p>}
        <Contact cv={cv} className="mt-3 text-[12px] text-slate-500" />
      </header>

      {has(cv.summary) && (
        <MinimalRow label="Profile">
          <p className="text-[13.5px] leading-[1.65]">{cv.summary}</p>
          {highlightItems(cv).length > 0 && (
            <div className="mt-4">
              <Highlights cv={cv} />
            </div>
          )}
        </MinimalRow>
      )}

      {jobs(cv).length > 0 && (
        <MinimalRow label="Experience">
          <Experience cv={cv} />
        </MinimalRow>
      )}

      {extraItems(cv).length > 0 && (
        <MinimalRow label={cv.extra?.heading || 'Additional'}>
          <ExtraList cv={cv} />
        </MinimalRow>
      )}

      {schools(cv).length > 0 && (
        <MinimalRow label="Education">
          <Education cv={cv} />
        </MinimalRow>
      )}

      {skillGroups(cv).length > 0 && (
        <MinimalRow label="Skills">
          <dl className="space-y-1">
            {skillGroups(cv).map((s, i) => (
              <div key={i} className="flex gap-3">
                {has(s.group) && <dt className="w-28 shrink-0 font-semibold text-slate-900">{s.group}</dt>}
                <dd>{s.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </MinimalRow>
      )}

      {(certs(cv).length > 0 || langs(cv).length > 0) && (
        <MinimalRow label={certs(cv).length ? 'Credentials' : 'Languages'}>
          {certs(cv).length > 0 && (
            <ul className="space-y-1">
              {certs(cv).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
          {langs(cv).length > 0 && (
            <p className={certs(cv).length ? 'mt-2' : ''}>
              {certs(cv).length > 0 && <span className="font-semibold text-slate-900">Languages: </span>}
              {langs(cv).join(' · ')}
            </p>
          )}
        </MinimalRow>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- elegant */

function ElegantSideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-white/20 pb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
      {children}
    </h2>
  );
}

function ElegantHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-3 mt-6 flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.16em]"
      style={{ color: 'var(--accent)' }}
    >
      <span aria-hidden="true" className="h-[3px] w-6 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
      {children}
    </h2>
  );
}

/** Dark accent sidebar with the photo and contact details; the story on the right. */
function Elegant({ cv }: LayoutProps) {
  return (
    <div className="grid grid-cols-[250px_1fr]">
      <main className="cv-column col-start-2 row-start-1 px-10 pb-10 pt-12">
        <header>
          <h2 className="cv-name text-[34px] font-extrabold leading-[1.05] tracking-tight text-slate-900">{cv.name}</h2>
          {has(cv.title) && (
            <p
              className="mt-2 text-[13px] font-bold uppercase tracking-[0.14em]"
              style={{ color: 'var(--accent)' }}
            >
              {cv.title}
            </p>
          )}
        </header>

        {has(cv.summary) && (
          <>
            <ElegantHeading>Profile</ElegantHeading>
            <p className="text-[13.5px] leading-[1.6]">{cv.summary}</p>
          </>
        )}

        {highlightItems(cv).length > 0 && (
          <div className="mt-4">
            <Highlights cv={cv} />
          </div>
        )}

        {jobs(cv).length > 0 && (
          <>
            <ElegantHeading>Experience</ElegantHeading>
            <Experience cv={cv} />
          </>
        )}

        <Extra cv={cv} Heading={ElegantHeading} />

        {schools(cv).length > 0 && (
          <>
            <ElegantHeading>Education</ElegantHeading>
            <Education cv={cv} />
          </>
        )}
      </main>

      <aside className="cv-column col-start-1 row-start-1 space-y-6 px-7 pb-10 pt-12 text-[12px] text-white/85">
        <Photo
          cv={cv}
          className="mx-auto h-[132px] w-[132px] rounded-full ring-4 ring-white/20"
          fallback={
            <div
              aria-hidden="true"
              className="cv-heading mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-[30px] font-extrabold text-white ring-4 ring-white/15"
            >
              {initialsOf(cv.name)}
            </div>
          }
        />

        {contactItems(cv).length > 0 && (
          <section>
            <ElegantSideHeading>Contact</ElegantSideHeading>
            <ContactList cv={cv} />
          </section>
        )}

        {skillGroups(cv).length > 0 && (
          <section>
            <ElegantSideHeading>Skills</ElegantSideHeading>
            <div className="space-y-3">
              {skillGroups(cv).map((s, i) => (
                <div key={i}>
                  {has(s.group) && <p className="font-bold text-white">{s.group}</p>}
                  <ul className="mt-1 space-y-0.5">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex gap-2">
                        <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-white/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {certs(cv).length > 0 && (
          <section>
            <ElegantSideHeading>Certifications</ElegantSideHeading>
            <ul className="space-y-1 leading-snug">
              {certs(cv).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {langs(cv).length > 0 && (
          <section>
            <ElegantSideHeading>Languages</ElegantSideHeading>
            <ul className="space-y-0.5">
              {langs(cv).map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
