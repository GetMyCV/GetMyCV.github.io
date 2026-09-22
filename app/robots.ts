import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

// Metadata routes must opt into static generation under `output: 'export'`.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/order/success/' }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
