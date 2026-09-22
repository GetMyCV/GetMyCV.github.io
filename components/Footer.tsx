import Link from 'next/link';
import Logo from './Logo';
import { site, whatsappLink } from '@/content/site';

export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white dark:border-white/10 dark:bg-navy-900">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo className="h-8" />
          <p className="mt-4 max-w-xs text-sm text-navy-700/80 dark:text-slate-300">
            CVs, cover letters and portfolio websites for people who are done being
            ignored by the application pile.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy dark:text-white">Services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: '/services/', label: 'What you get' },
              { href: '/pricing/', label: 'Packages and prices' },
              { href: '/portfolio/', label: 'Sample work' },
              { href: '/order/', label: 'Place an order' },
            ].map((l) => (
              <li key={l.href}>
                <Link className="text-navy-700/80 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy dark:text-white">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="text-navy-700/80 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal" href={whatsappLink()}>
                WhatsApp us
              </a>
            </li>
            <li>
              <a className="text-navy-700/80 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            <li className="text-navy-700/80 dark:text-slate-300">{site.areaServed}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy dark:text-white">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="text-navy-700/80 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal" href="/privacy/">
                Privacy notice
              </Link>
            </li>
            <li>
              <Link className="text-navy-700/80 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal" href="/terms/">
                Terms, refunds and revisions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy/10 py-6 dark:border-white/10">
        <p className="container-page text-center text-xs text-navy-700/70 dark:text-slate-400">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
