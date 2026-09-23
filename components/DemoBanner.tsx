import Link from 'next/link';

/**
 * Sits above every demo portfolio. It has to be unmissable: these pages
 * describe invented people, and nobody should mistake one for a real person's
 * site. It doubles as the route back into the shop.
 */
export default function DemoBanner({ profession }: { profession: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-navy-800 bg-navy text-white">
      <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-teal" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-2 3a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0V9Z"
              clipRule="evenodd"
            />
          </svg>
          Sample {profession.toLowerCase()} portfolio
        </span>
        <span className="text-slate-300">
          Built by GetMyCv. The person shown here is invented.
        </span>
        <span className="ml-auto flex items-center gap-3">
          <Link href="/portfolio/" className="font-semibold text-slate-200 underline hover:text-white">
            All samples
          </Link>
          <Link
            href="/order/"
            className="rounded-lg bg-teal px-3 py-1.5 font-semibold text-navy-900 hover:bg-teal-600 hover:text-white"
          >
            Order yours
          </Link>
        </span>
      </div>
    </div>
  );
}
