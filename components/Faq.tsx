import { faqs } from '@/content/faq';

export default function Faq() {
  return (
    <div data-reveal className="divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-5 py-4 sm:px-6">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-navy marker:hidden dark:text-white">
            {faq.question}
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5 shrink-0 text-teal-700 transition-transform duration-300 group-open:rotate-45 dark:text-teal"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9 4h2v12H9z" />
              <path d="M4 9h12v2H4z" />
            </svg>
          </summary>
          <p className="mt-3 animate-fade-in text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
