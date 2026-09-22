import { testimonials } from '@/content/testimonials';

export default function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <figure key={t.name} className="card flex h-full flex-col">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-teal" fill="currentColor" aria-hidden="true">
            <path d="M9.5 6C6.5 7.4 5 9.9 5 13.5V18h6v-6H8.2c.1-1.7.9-2.9 2.6-3.7L9.5 6Zm9 0c-3 1.4-4.5 3.9-4.5 7.5V18h6v-6h-2.8c.1-1.7.9-2.9 2.6-3.7L18.5 6Z" />
          </svg>
          <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy-700/90 dark:text-slate-200">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 border-t border-navy/10 pt-4 dark:border-white/10">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white dark:bg-teal dark:text-navy-900">
              {t.initials}
            </span>
            <span>
              <span className="block text-sm font-semibold text-navy dark:text-white">{t.name}</span>
              <span className="block text-xs text-navy-700/70 dark:text-slate-400">{t.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
