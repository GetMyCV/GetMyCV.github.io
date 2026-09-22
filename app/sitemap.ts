import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

// Metadata routes must opt into static generation under `output: 'export'`.
export const dynamic = 'force-static';

/**
 * Static export writes this to /sitemap.xml at build time.
 * The success page is deliberately left out — it is noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'monthly' | 'yearly' }> = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/services/', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/pricing/', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/portfolio/', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/order/', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/privacy/', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms/', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
