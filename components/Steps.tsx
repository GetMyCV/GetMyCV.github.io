import { steps } from '@/content/steps';

export default function Steps() {
  return (
    <ol data-reveal-stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="step card card-hover relative h-full">
          <span className="step-number inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal/15 font-heading text-lg font-bold text-teal-700 dark:bg-teal/20 dark:text-teal">
            {index + 1}
          </span>
          {/* Joins this card to the next across the gap on wide screens; draws in on reveal. */}
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="step-connector absolute left-full top-11 hidden h-0.5 w-6 bg-gradient-to-r from-teal to-teal/40 lg:block"
            />
          )}
          <h3 className="mt-4 text-lg">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
