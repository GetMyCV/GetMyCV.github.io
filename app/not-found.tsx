import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-start py-20 sm:py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">That page does not exist</h1>
      <p className="mt-3 max-w-md text-navy-700/80 dark:text-slate-300">
        The link may be old or mistyped. The pages below cover everything on the site.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Go to the home page
        </Link>
        <Link href="/order/" className="btn-secondary">
          Place an order
        </Link>
      </div>
    </div>
  );
}
