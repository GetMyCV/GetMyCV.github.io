import type { Metadata } from 'next';
import { site } from '@/content/site';

type PageMeta = {
  /** Shown in the tab and search results, before " | GetMyCv". Aim for 30–60 characters in total. */
  title: string;
  /** The search-result snippet. Aim for 120–160 characters. */
  description: string;
  /** Path with a trailing slash, e.g. '/pricing/'. */
  path: string;
  /** Social preview image; defaults to the site-wide Open Graph image. */
  image?: { url: string; width: number; height: number; alt: string };
  keywords?: string[];
};

const defaultImage = {
  url: `${site.url}/og-image.png`,
  width: 1200,
  height: 630,
  alt: `${site.name} — CV writing and portfolio websites`,
};

/**
 * Per-page metadata: canonical URL, Open Graph and Twitter cards, all from one
 * call so no page ships with a stale canonical or the home page's snippet.
 */
export const pageMetadata = ({ title, description, path, image, keywords }: PageMeta): Metadata => {
  const url = `${site.url}${path}`;
  const img = image ? { ...image, url: new URL(image.url, site.url).toString() } : defaultImage;
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: 'website',
      images: [img],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${site.name}`,
      description,
      images: [img.url],
    },
  };
};
