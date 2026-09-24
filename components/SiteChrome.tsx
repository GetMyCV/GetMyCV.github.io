'use client';

import { usePathname } from 'next/navigation';
import { isSampleDemo } from '@/lib/routes';

/**
 * Hides the GetMyCv header and footer on demo portfolio pages, so a visitor
 * sees what the client's own site looks like rather than ours wrapped around
 * it. The demo's own banner provides the way back.
 *
 * `children` stay server components — this only decides whether to render them.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isSampleDemo(pathname)) return null;
  return <>{children}</>;
}
