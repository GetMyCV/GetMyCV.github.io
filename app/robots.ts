import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

// Metadata routes must opt into static generation under `output: 'export'`.
export const dynamic = 'force-static';

/**
 * Served as /robots.txt. Everything is crawlable except the order-received
 * page, which is personal to each buyer (it is also marked noindex).
 * Framework chunks under /_next/ stay crawlable so Google can render pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/order/success/'] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
