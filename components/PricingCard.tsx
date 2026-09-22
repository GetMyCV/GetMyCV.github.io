import Link from 'next/link';
import { formatLkr, type Package } from '@/content/pricing';

export default function PricingCard({ pkg }: { pkg: Package }) {
  return (
    <div
      className={`card relative flex h-full flex-col ${
        pkg.popular ? 'border-teal ring-2 ring-teal/40' : ''
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-900">
          Most popular
        </span>
      )}

      <h3 className="text-xl">{pkg.name}</h3>
      <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">{pkg.summary}</p>

      <p className="mt-5 font-heading text-3xl font-extrabold text-navy dark:text-white">
        {formatLkr(pkg.price)}
      </p>
      <p className="mt-1 text-sm text-navy-700/70 dark:text-slate-400">
        Delivered in {pkg.turnaround}
      </p>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2.5">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 h-5 w-5 shrink-0 text-teal-700 dark:text-teal"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-navy-700/90 dark:text-slate-200">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/order/?package=${pkg.id}`}
        className={`mt-7 w-full ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
      >
        Order {pkg.name}
      </Link>
    </div>
  );
}
