import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyOrderBar from '@/components/StickyOrderBar';
import SiteChrome from '@/components/SiteChrome';
import Analytics from '@/components/Analytics';
import ScrollReveal from '@/components/ScrollReveal';
import { site } from '@/content/site';
import { packages } from '@/content/pricing';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `CV Writing & Portfolio Websites in Sri Lanka | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: 'Career services',
  keywords: [
    'CV writing Sri Lanka',
    'CV writing service',
    'professional CV writer',
    'ATS friendly CV',
    'resume writing Colombo',
    'cover letter writing',
    'LinkedIn profile makeover',
    'portfolio website',
    'CV template',
    'job application Sri Lanka',
  ],
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: `${site.url}/`,
    siteName: site.name,
    locale: site.locale,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${site.name} — CV writing and portfolio websites`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/og-image.png'],
  },
  // Search Console ownership. Renders <meta name="google-site-verification">.
  verification: { google: site.googleSiteVerification },
  // Phone-number auto-linking on iOS mangles prices and references.
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    // Let Google show large image previews and full-length snippets.
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
  ],
};

/**
 * One linked graph for the whole site: the business and the website, joined by
 * @id so Google reads them as the same entity. The WebSite node is what gives
 * results the "GetMyCv" site name instead of the bare domain.
 */
const packagePrices = packages.flatMap((p) => (p.price === null ? [] : [p.price]));
const priceRange = `$${Math.min(...packagePrices)}–$${Math.max(...packagePrices)}`;

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${site.url}/#business`,
      name: site.name,
      description: site.description,
      url: `${site.url}/`,
      logo: { '@type': 'ImageObject', url: `${site.url}/icon.png`, width: 512, height: 512 },
      image: `${site.url}/og-image.png`,
      email: site.email,
      telephone: `+${site.whatsapp}`,
      priceRange,
      currenciesAccepted: 'USD',
      paymentAccepted: 'Credit card, Bank transfer',
      areaServed: { '@type': 'Country', name: site.areaServed },
      address: { '@type': 'PostalAddress', addressCountry: 'LK' },
      sameAs: Object.values(site.social),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: site.email,
        telephone: `+${site.whatsapp}`,
        availableLanguage: ['English', 'Sinhala'],
      },
      serviceType: [
        'CV writing',
        'Resume writing',
        'Cover letter writing',
        'LinkedIn profile optimisation',
        'Portfolio website development',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'CV and portfolio packages',
        itemListElement: packages.map((pkg) => ({
          '@type': 'Offer',
          name: `${pkg.name} package`,
          description: pkg.summary,
          price: pkg.price ?? undefined,
          priceCurrency: 'USD',
          url: `${site.url}/order/?package=${pkg.id}`,
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      name: site.name,
      alternateName: 'GetMyCv CV writing',
      url: `${site.url}/`,
      inLanguage: 'en',
      publisher: { '@id': `${site.url}/#business` },
    },
  ],
};

/**
 * Runs before first paint so revealed content never flashes visible-then-hidden.
 * Skipped for reduced-motion visitors and for crawlers and audit tools
 * (Googlebot, Search Console's inspection tool, Lighthouse and the like): they
 * may render without running every script, and must always see the page fully
 * visible. It is the same content either way, only without the animation.
 * Also undone if the observer has not started a few seconds after load, so a
 * script failure never hides content from people either.
 */
const revealScript = `(function(){try{
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(/bot|crawl|spider|slurp|Google-InspectionTool|Chrome-Lighthouse|PageSpeed|Headless/i.test(navigator.userAgent))return;
var r=document.documentElement;r.classList.add('reveal-ready');
window.addEventListener('load',function(){setTimeout(function(){if(!window.__revealStarted)r.classList.remove('reveal-ready')},3000)});
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The reveal script adds a class to <html> before hydration.
    <html lang="en" className={`${body.variable} ${heading.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-teal focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-900"
        >
          Skip to content
        </a>
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main id="main" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
        <StickyOrderBar />
        <Analytics />
        <ScrollReveal />
        <JsonLd data={siteJsonLd} />
      </body>
    </html>
  );
}
