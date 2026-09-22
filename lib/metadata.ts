import type { Metadata } from 'next';
import { site } from '@/content/site';

type PageMeta = {
  title: string;
  description: string;
  path: string;
};

export const pageMetadata = ({ title, description, path }: PageMeta): Metadata => ({
  title,
  description,
  alternates: { canonical: `${site.url}${path}` },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}${path}`,
    siteName: site.name,
    locale: site.locale,
    type: 'website',
    images: [{ url: `${site.url}/og-image.png`, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | ${site.name}`,
    description,
    images: [`${site.url}/og-image.png`],
  },
});
