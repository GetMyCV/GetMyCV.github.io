import Prose from '@/components/Prose';
import { pageMetadata } from '@/lib/metadata';
import { packages } from '@/content/pricing';
import { site } from '@/content/site';

export const metadata = pageMetadata({
  title: 'Terms, refunds and revisions',
  description:
    'How GetMyCv orders work: payment, turnaround, revision rounds, the refund policy, ownership of your files and the limits of what we promise.',
  path: '/terms/',
});

const updated = 'September 2026';

export default function TermsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">Terms, refunds and revisions</h1>
      <p className="mt-2 text-sm text-navy-700/70 dark:text-slate-400">Last updated {updated}</p>

      <div className="mt-8">
        <Prose>
          <p>
            These terms apply when you order from {site.name}. Placing an order means you accept
            them. They are written plainly on purpose — if anything is unclear, ask before you pay.
          </p>

          <h2>Placing an order</h2>
          <p>
            An order is confirmed when we receive your payment and match it to your reference
            number. Until then, nothing is reserved and no turnaround clock is running.
          </p>

          <h2>Payment</h2>
          <p>
            We take card payments through Stripe, and bank transfer or online banking. Prices are
            in Sri Lankan rupees and include everything listed on the pricing page. Card payments
            are confirmed automatically; for a transfer, send your payment slip on WhatsApp with
            your reference so we can match it quickly.
          </p>

          <h2>Turnaround</h2>
          <ul>
            {packages.map((pkg) => (
              <li key={pkg.id}>
                <strong>{pkg.name}</strong> — {pkg.turnaround} from confirmed payment.
              </li>
            ))}
            <li>Express delivery, if you add it, shortens this to 48 hours.</li>
          </ul>
          <p>
            Turnaround is counted in working days. If we are waiting on information from you, the
            clock pauses until you reply.
          </p>

          <h2>Revisions</h2>
          <p>
            Each package includes a set number of revision rounds — one for Starter, two for
            Professional and three for Premium. A round means you send us your consolidated comments
            and we apply them. Revision requests are accepted for 14 days after delivery. After
            that, or once your rounds are used, extra rounds can be bought as an add-on.
          </p>

          <h2>Refunds</h2>
          <ul>
            <li>
              <strong>Before we start</strong> — full refund, no questions asked.
            </li>
            <li>
              <strong>After the first draft</strong> — 50% refund if you are not happy and your
              first revision round has not fixed it.
            </li>
            <li>
              <strong>After final delivery</strong> — no refund, because the files are yours and
              cannot be returned.
            </li>
            <li>
              <strong>If we miss the turnaround</strong> without asking you for more information,
              any express fee is refunded in full.
            </li>
          </ul>

          <h2>What you own</h2>
          <p>
            Once your order is paid and delivered, the CV, cover letter, LinkedIn text and portfolio
            site are yours. Portfolio sites are handed over inside your own GitHub account. We keep
            no rights over the content and charge nothing to run it.
          </p>

          <h2>What we ask of you</h2>
          <p>
            Everything you tell us about your experience must be true. We write persuasively, but we
            will not invent qualifications, employers or dates. If we find out that information you
            gave us is false, we may stop work without a refund.
          </p>

          <h2>What we do not promise</h2>
          <p>
            We cannot promise interviews or a job offer. Hiring decisions belong to employers. What
            we promise is a professionally written, correctly formatted CV that passes applicant
            tracking software, delivered on time.
          </p>

          <h2>Portfolio websites</h2>
          <p>
            Portfolio sites are hosted on GitHub Pages under your account, which is free at the time
            of writing. Custom domain registration fees are yours to pay. We are not responsible for
            outages of GitHub or your domain registrar. Maintenance beyond the delivery is covered
            only if you buy the maintenance add-on.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </Prose>
      </div>
    </div>
  );
}
