import Link from 'next/link';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import Steps from '@/components/Steps';
import Faq from '@/components/Faq';
import PricingCard from '@/components/PricingCard';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import ServiceCard from '@/components/ServiceCard';
import SampleStrip from '@/components/SampleStrip';
import { services } from '@/content/services';
import { packages } from '@/content/pricing';
import { faqs } from '@/content/faq';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function HomePage() {
  const headlineServices = services.slice(0, 3);

  return (
    <>
      <Hero />

      <Section
        eyebrow="What we do"
        title="Three things that get you interviews"
        intro="Most applications fail before a human reads them. We fix the three places that decide whether you make the shortlist."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {headlineServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <Link
          href="/services/"
          className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline dark:text-teal"
        >
          See everything included
          <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section
        tone="muted"
        eyebrow="How it works"
        title="Four steps, about three minutes of your time"
        intro="No calls, no back-and-forth email chains unless you want them. You order, we write, you review."
      >
        <Steps />
      </Section>

      <Section
        eyebrow="Sample work"
        title="See what you are paying for"
        intro="Real portfolios we built and anonymised CV samples, filterable by profession."
      >
        <SampleStrip />
        <Link
          href="/portfolio/"
          className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline dark:text-teal"
        >
          Browse all samples
          <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section
        tone="muted"
        eyebrow="Pricing"
        title="Clear prices, no surprises"
        intro="Every package includes revisions and the editable files. Add-ons are priced on the pricing page."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <PricingCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <Link
          href="/pricing/"
          className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline dark:text-teal"
        >
          Compare packages and add-ons
          <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section eyebrow="Clients" title="What people say afterwards">
        <Testimonials />
      </Section>

      <Section
        id="faq"
        tone="muted"
        eyebrow="Questions"
        title="Everything people ask before ordering"
      >
        <Faq />
      </Section>

      <CallToAction />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
