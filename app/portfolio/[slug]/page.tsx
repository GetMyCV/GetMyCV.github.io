import { notFound } from 'next/navigation';
import PortfolioDemo from '@/components/PortfolioDemo';
import { getPortfolio, portfolios } from '@/content/portfolios';
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
    title: `${portfolio.role} portfolio — sample`,
    description: `A sample personal portfolio website GetMyCv builds for ${portfolio.profession.toLowerCase()} professionals: ${portfolio.tagline}`,
    path: `/portfolio/${portfolio.slug}/`,
  });
}

export default async function PortfolioDemoPage({ params }: Params) {
  const { slug } = await params;
  const portfolio = getPortfolio(slug);
  if (!portfolio) notFound();

  return <PortfolioDemo portfolio={portfolio} />;
}
