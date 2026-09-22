import Prose from '@/components/Prose';
import { pageMetadata } from '@/lib/metadata';
import { site, whatsappLink } from '@/content/site';

export const metadata = pageMetadata({
  title: 'Privacy notice',
  description:
    'What personal data GetMyCv collects when you place an order, why we collect it, how long we keep it, and how to ask for deletion under Sri Lanka’s Personal Data Protection Act.',
  path: '/privacy/',
});

const updated = 'September 2026';

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">Privacy notice</h1>
      <p className="mt-2 text-sm text-navy-700/70 dark:text-slate-400">Last updated {updated}</p>

      <div className="mt-8">
        <Prose>
          <p>
            {site.name} (“we”) writes CVs and builds portfolio websites. To do that we need some
            personal information about you. This notice explains exactly what we collect, why, how
            long we keep it and what you can ask us to do with it. It is written to meet Sri Lanka’s
            Personal Data Protection Act No. 9 of 2022.
          </p>

          <h2>Who is responsible</h2>
          <p>
            {site.name} is the controller of the data described here. You can reach us at{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a> or on{' '}
            <a href={whatsappLink('Hi GetMyCv, I have a question about my personal data.')}>
              WhatsApp
            </a>
            .
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Order details</strong> — the package and add-ons you choose and the total
              price.
            </li>
            <li>
              <strong>Contact details</strong> — your name, email address, phone or WhatsApp number
              and your city or country.
            </li>
            <li>
              <strong>Career information</strong> — your target role, industry, years of experience
              and any notes you write.
            </li>
            <li>
              <strong>Files you upload</strong> — your current CV, certificates or a photograph, if
              you choose to send them.
            </li>
            <li>
              <strong>Consent record</strong> — the fact that you ticked the consent box and the
              time you did it.
            </li>
          </ul>
          <p>
            We use a cookieless, privacy-friendly analytics tool that counts page views without
            tracking you across sites. It sets no cookies and does not build a profile of you.
          </p>

          <h2>Why we collect it</h2>
          <ul>
            <li>To write your CV, cover letter, LinkedIn profile or portfolio website.</li>
            <li>To contact you about your order, drafts and revisions.</li>
            <li>To confirm your payment against your order reference.</li>
            <li>To keep basic business records, as the law requires.</li>
          </ul>
          <p>
            Our legal basis is your consent, given when you place an order, together with the
            performance of the contract between us. You can withdraw consent at any time; we will
            then stop processing and delete what we no longer need to keep.
          </p>

          <h2>How long we keep it</h2>
          <ul>
            <li>
              <strong>Uploaded files</strong> are deleted 90 days after your order is delivered.
            </li>
            <li>
              <strong>The finished documents we produce for you</strong> are kept for 12 months so
              we can resend them if you lose them, then deleted.
            </li>
            <li>
              <strong>Order and payment records</strong> are kept for as long as accounting rules
              require, then deleted.
            </li>
          </ul>

          <h2>Who else sees it</h2>
          <p>
            We do not sell your data and we never publish your CV, your name or your portfolio
            without asking you first. We use a small number of service providers to run the
            business: a form and email service that delivers your order to our inbox, our email
            provider, and WhatsApp if you choose to message us there. They process data on our
            instructions only.
          </p>

          <h2>Your rights</h2>
          <ul>
            <li>Ask for a copy of the data we hold about you.</li>
            <li>Ask us to correct anything that is wrong.</li>
            <li>Ask us to delete your data, including uploaded files, at any time.</li>
            <li>Withdraw your consent, which stops any further processing.</li>
            <li>Complain to Sri Lanka’s Data Protection Authority if you think we got it wrong.</li>
          </ul>
          <p>
            Email <a href={`mailto:${site.email}`}>{site.email}</a> with your order reference and we
            will act within 30 days.
          </p>

          <h2>Security</h2>
          <p>
            Your order is sent over an encrypted connection and delivered to an inbox only we can
            read. This website stores nothing about you itself: it has no database of its own and
            no way to read back an order once it has been sent. Files you send us by WhatsApp are
            stored on our own devices and deleted on the schedule above.
          </p>

          <h2>Changes</h2>
          <p>
            If we change this notice we will update the date at the top. Material changes that
            affect orders already placed will be emailed to you.
          </p>
        </Prose>
      </div>
    </div>
  );
}
