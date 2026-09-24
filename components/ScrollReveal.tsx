'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STAGGER_MS = 90;
const MAX_STAGGER_MS = 450;

declare global {
  interface Window {
    __revealStarted?: boolean;
  }
}

/**
 * Reveals [data-reveal] elements, and the children of [data-reveal-stagger]
 * containers, as they scroll into view. Styles live in globals.css; this only
 * adds `is-revealed` (and `reveal-done` once the transition has finished, so
 * hover effects stay snappy).
 *
 * Renders nothing. A MutationObserver picks up elements added later, such as
 * gallery cards appearing after a filter change.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('reveal-ready')) return;
    window.__revealStarted = true;

    const finish = (el: Element) => {
      el.addEventListener('transitionend', () => el.classList.add('reveal-done'), { once: true });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          finish(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)').forEach((el) => {
        observer.observe(el);
      });
      document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
          const el = child as HTMLElement;
          if (el.classList.contains('is-revealed')) return;
          el.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`);
          observer.observe(el);
        });
      });
    };

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
