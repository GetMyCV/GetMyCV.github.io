import { notFound } from 'next/navigation';
import PortfolioDemo from '@/components/PortfolioDemo';
import { getPortfolio, portfolios } from '@/content/portfolios';
import { Breadcrumbs } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';

type Params = { params: Promise<{ slug: string }> };

/** Static export needs every slug up front. */
export function generateStaticParams() {
  return portfolios.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const portfolio = getPortfolio(slug);
  if (!portfolio) return {};

  return pageMetadata({
    title: `${portfolio.role} Portfolio Website Example`,
    description: `A sample personal portfolio website GetMyCv builds for ${portfolio.profession.toLowerCase()} professionals: ${portfolio.tagline}`,
    path: `/portfolio/${portfolio.slug}/`,
    image: {
      url: `/samples/portfolio-${portfolio.slug}.jpg`,
      width: 1280,
      height: 800,
      alt: `Preview of a sample ${portfolio.role.toLowerCase()} portfolio website`,
    },
  });
}

export default async function PortfolioDemoPage({ params }: Params) {
  const { slug } = await params;
  const portfolio = getPortfolio(slug);
  if (!portfolio) notFound();

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Samples', path: '/portfolio/' },
          { name: `${portfolio.role} portfolio`, path: `/portfolio/${portfolio.slug}/` },
        ]}
      />
      <PortfolioDemo portfolio={portfolio} />
    </>
  );
}
