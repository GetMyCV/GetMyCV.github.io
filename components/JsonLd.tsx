import { site } from '@/content/site';

/** Renders one schema.org JSON-LD block. `<` is escaped so data can never close the script tag. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * BreadcrumbList for an inner page. Google shows this trail in place of the raw
 * URL in results. Home is always the first crumb.
 */
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${site.url}${item.path}`,
        })),
      }}
    />
  );
}
