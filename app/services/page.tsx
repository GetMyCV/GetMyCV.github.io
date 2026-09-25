import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import Steps from '@/components/Steps';
import CallToAction from '@/components/CallToAction';
import { services } from '@/content/services';
import { Breadcrumbs } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'CV Writing, Cover Letter & LinkedIn Services',
  description:
    'Professional CV writing, ATS-friendly formatting, cover letters, LinkedIn makeovers and portfolio websites for Sri Lankan job seekers, and what you receive.',
  path: '/services/',
});

export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Services', path: '/services/' }]} />
      <Section
        headingLevel="h1"
        eyebrow="Services"
        title="What you actually get"
        intro="Every package is built from these five pieces. Nothing is a template swap — each one starts from your own experience and the roles you are targeting."
      >
        <div data-reveal-stagger className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Deliverables"
        title="Files you keep forever"
        intro="No subscriptions, no locked editors. Everything is handed over in formats you can edit yourself."
      >
        <div data-reveal-stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'PDF', body: 'Print-ready and pixel-identical everywhere you send it.' },
            { title: 'Word (.docx)', body: 'Fully editable, so you can tweak it for each application.' },
            { title: 'Portfolio source', body: 'The site repository in your own GitHub account.' },
            { title: 'Update guide', body: 'A short walkthrough for changing your site yourself.' },
          ].map((item) => (
            <div key={item.title} className="card card-hover h-full">
              <h3 className="text-base">{item.title}</h3>
              <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Process" title="How an order runs">
        <Steps />
      </Section>

      <CallToAction />
    </>
  );
}
