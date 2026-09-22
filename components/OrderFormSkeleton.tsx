/**
 * Reserves the form's layout while the client bundle loads. Without it the page
 * grows by ~1200px on hydration, which is a large cumulative layout shift.
 */
export default function OrderFormSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]" aria-hidden="true">
      <div>
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="h-1.5 rounded-full bg-navy/10 dark:bg-white/10" />
              <div className="h-3 w-16 rounded bg-navy/10 dark:bg-white/10" />
            </div>
          ))}
        </div>

        <div className="h-7 w-56 rounded bg-navy/10 dark:bg-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-navy/10 dark:bg-white/10" />

        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[116px] rounded-2xl border border-navy/10 bg-white dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>

        <div className="mt-8 h-6 w-40 rounded bg-navy/10 dark:bg-white/10" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[92px] rounded-2xl border border-navy/10 bg-white dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>

        <div className="mt-8 h-[52px] rounded-xl bg-navy/10 dark:bg-white/10 sm:ml-auto sm:w-48" />
      </div>

      <div className="h-[232px] rounded-2xl border border-navy/10 bg-white dark:border-white/10 dark:bg-white/5" />
    </div>
  );
}
