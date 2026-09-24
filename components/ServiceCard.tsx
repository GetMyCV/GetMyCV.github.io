import type { Service } from '@/content/services';

const icons: Record<Service['icon'], React.ReactNode> = {
  document: <path d="M6 3h8l4 4v14H6V3Zm8 0v4h4M9 12h6M9 16h6" />,
  scan: <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4M4 12h16" />,
  globe: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.4-3.8-9s1.3-6.6 3.8-9ZM3.5 12h17" />,
  linkedin: <path d="M5 9v10M5 5.5v.01M10 19v-6a3 3 0 0 1 6 0v6" />,
  letter: <path d="M3 6h18v12H3V6Zm0 0 9 7 9-7" />,
};

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card card-hover group h-full">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:bg-teal dark:text-navy-900">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icons[service.icon]}
        </svg>
      </span>
      <h3 className="mt-4 text-lg">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
        {service.blurb}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-navy-700/90 dark:text-slate-200">
        {service.details.map((detail) => (
          <li key={detail} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
            {detail}
          </li>
        ))}
      </ul>
    </article>
  );
}
