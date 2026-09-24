'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';

const navLinks = [
  { href: '/services/', label: 'Services' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/order/', label: 'Order' },
  { href: '/#faq', label: 'FAQ' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // A soft shadow once the page scrolls, so the sticky bar separates from content.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-navy/10 bg-surface-light/90 backdrop-blur transition-shadow duration-300 dark:border-white/10 dark:bg-surface-dark/90 ${
        scrolled ? 'shadow-lg shadow-navy/5 dark:shadow-black/30' : ''
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label="GetMyCv home" className="flex items-center">
          <Logo className="h-8" priority />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-teal after:transition-transform after:duration-300 hover:bg-navy-50 hover:after:scale-x-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/order/" className="btn-primary ml-2 px-4 py-2 text-sm">
            Order now
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-navy hover:bg-navy-50 dark:text-white dark:hover:bg-white/10 md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="animate-menu-in border-t border-navy/10 bg-surface-light dark:border-white/10 dark:bg-surface-dark md:hidden">
          <div className="container-page flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-[44px] rounded-lg px-2 py-3 text-base font-medium text-navy-700 hover:bg-navy-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
