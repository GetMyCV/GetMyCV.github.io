/** Shared typography wrapper for the legal pages. */
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl space-y-6 text-navy-700/90 dark:text-slate-300 [&_a]:font-semibold [&_a]:text-teal-700 [&_a]:underline dark:[&_a]:text-teal [&_h2]:pt-2 [&_h2]:text-xl [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
