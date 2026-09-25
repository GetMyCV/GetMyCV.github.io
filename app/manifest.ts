import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

// Metadata routes must opt into static generation under `output: 'export'`.
export const dynamic = 'force-static';

/** Served as /manifest.webmanifest: install name, icons and colours for mobile. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — CV writing & portfolio websites`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0F2A4A',
    lang: 'en',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
