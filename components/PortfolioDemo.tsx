import Link from 'next/link';
import DemoBanner from './DemoBanner';
import type { DemoPortfolio } from '@/content/portfolios';

/**
 * The demo portfolio template — the thing a Premium client actually receives,
 * filled with invented content. Deliberately styled apart from the marketing
 * site: its own accent colour, its own header and footer, no GetMyCv chrome.
 *
 * The accent is a CSS variable so one data field restyles the whole page.
 */
export default function PortfolioDemo({ portfolio: p }: { portfolio: DemoPortfolio }) {
  return (
    <div
      className="bg-white text-slate-800"
      style={
        {
          '--accent': p.accent,
          '--accent-soft': p.accentSoft,
        } as React.CSSProperties
      }
    >
      <DemoBanner profession={p.profession} />

      {/* Hero */}
      <header className="border-b border-slate-200 bg-[var(--accent-soft)]">
        <div className="container-page py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span
              className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-heading text-2xl font-extrabold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
              aria-hidden="true"
            >
              {p.initials}
            </span>
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                {p.role}
              </p>
              <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {p.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">{p.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 2a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {p.location}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  {p.availability}
                </span>
              </div>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-300/60 pt-6">
            {p.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs uppercase tracking-wide text-slate-600">{stat.label}</dt>
                <dd
                  className="mt-1 font-heading text-xl font-extrabold sm:text-2xl"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="container-page py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-12">
            <section aria-labelledby="about">
              <h2 id="about" className="font-heading text-xl font-bold text-slate-900">
                About
              </h2>
              <div className="mt-4 space-y-4">
                {p.about.map((para) => (
                  <p key={para.slice(0, 32)} className="leading-relaxed text-slate-700">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            <section aria-labelledby="experience">
              <h2 id="experience" className="font-heading text-xl font-bold text-slate-900">
                Experience
              </h2>
              <ol className="mt-6 space-y-8">
                {p.experience.map((job) => (
                  <li key={`${job.org}-${job.period}`} className="relative border-l-2 border-slate-200 pl-6">
                    <span
                      className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                      aria-hidden="true"
                    />
                    <h3 className="font-heading text-base font-bold text-slate-900">{job.role}</h3>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {job.org} · {job.period}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {job.points.map((point) => (
                        <li key={point.slice(0, 32)} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                          <span
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="projects">
              <h2 id="projects" className="font-heading text-xl font-bold text-slate-900">
                Selected work
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {p.projects.map((project) => (
                  <article
                    key={project.title}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-heading text-base font-bold text-slate-900">{project.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">{project.summary}</p>
                    {project.result && (
                      <p
                        className="mt-3 text-sm font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {project.result}
                      </p>
                    )}
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            <section aria-labelledby="skills">
              <h2 id="skills" className="font-heading text-xl font-bold text-slate-900">
                Skills
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="education">
              <h2 id="education" className="font-heading text-xl font-bold text-slate-900">
                Education &amp; credentials
              </h2>
              <ul className="mt-4 space-y-4">
                {p.education.map((item) => (
                  <li key={item.qualification}>
                    <p className="text-sm font-semibold text-slate-900">{item.qualification}</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {item.institution} · {item.year}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="contact" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 id="contact" className="font-heading text-base font-bold text-slate-900">
                Get in touch
              </h2>
              {/* Rendered as plain text on purpose: these details are invented,
                  so live mailto: and tel: links would only lead nowhere. */}
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd className="text-slate-700">{p.contact.email}</dd>
                </div>
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd className="text-slate-700">{p.contact.phone}</dd>
                </div>
                <div>
                  <dt className="sr-only">LinkedIn</dt>
                  <dd className="text-slate-700">{p.contact.linkedin}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">
                Sample details — your own site carries your real contact information.
              </p>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-10 text-center">
          <p className="font-heading text-lg font-bold text-slate-900">
            Want a portfolio like this one?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            This is a sample of the personal site included with the Premium package. Yours is built
            around your own work, hosted free on GitHub Pages, and handed over in your own account.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/order/?package=premium"
              className="btn inline-flex justify-center rounded-xl px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Order the Premium package
            </Link>
            <Link
              href="/portfolio/"
              className="btn inline-flex justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-white"
            >
              See other samples
            </Link>
          </div>
          <p className="mt-8 text-xs text-slate-500">
            Sample portfolio · {p.name} is not a real person · Built by GetMyCv
          </p>
        </div>
      </footer>
    </div>
  );
}
