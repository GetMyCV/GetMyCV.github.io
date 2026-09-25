import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { portfolios } from '@/content/portfolios';
import { cvs } from '@/content/cvs';

// Metadata routes must opt into static generation under `output: 'export'`.
export const dynamic = 'force-static';

/**
 * Static export writes this to /sitemap.xml at build time.
 * The success page is deliberately left out — it is noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: 'monthly' | 'yearly';
    /** Image-sitemap entries, so sample previews can appear in Google Images. */
    images?: string[];
  }> = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/services/', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/pricing/', priority: 0.9, changeFrequency: 'monthly' },
    {
      path: '/portfolio/',
      priority: 0.8,
      changeFrequency: 'monthly',
      images: cvs.map((cv) => `${site.url}/samples/cv-${cv.slug}.jpg`),
    },
    ...portfolios.map((p) => ({
      path: `/portfolio/${p.slug}/`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      images: [`${site.url}/samples/portfolio-${p.slug}.jpg`],
    })),
    ...cvs.map((cv) => ({
      path: `/cv/${cv.slug}/`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      images: [`${site.url}/samples/cv-${cv.slug}.jpg`],
    })),
    { path: '/cv-builder/', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/ats-checker/', priority: 0.8, changeFrequency: 'monthly' },
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
    ...(route.images && { images: route.images }),
  }));
}
