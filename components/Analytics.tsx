import Script from 'next/script';

/**
 * Cookieless analytics. Renders nothing unless a domain is configured, so local
 * builds and forks stay clean — and because it sets no cookies and stores no
 * personal data, the site needs no cookie banner.
 *
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. getmycv.github.io) as a repository
 * secret to switch it on. NEXT_PUBLIC_PLAUSIBLE_SRC lets you point at a
 * self-hosted Plausible or Umami instance instead.
 */
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? 'https://plausible.io/js/script.js';

  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}
