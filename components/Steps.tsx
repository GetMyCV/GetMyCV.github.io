import { steps } from '@/content/steps';

export default function Steps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="card h-full">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal/15 font-heading text-lg font-bold text-teal-700 dark:bg-teal/20 dark:text-teal">
            {index + 1}
          </span>
          <h3 className="mt-4 text-lg">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
