import { Suspense } from 'react';
import Link from 'next/link';
import OrderReference, { ReferenceSkeleton } from '@/components/OrderReference';
import OrderSummaryPanel from '@/components/OrderSummaryPanel';
import WhatsAppSlipButton from '@/components/WhatsAppSlipButton';
import { pageMetadata } from '@/lib/metadata';
import { site } from '@/content/site';

export const metadata = {
  ...pageMetadata({
    title: 'Order received',
    description: 'Your order reference and payment instructions.',
    path: '/order/success/',
  }),
  // The reference belongs to one person; it has no business in search results.
  robots: { index: false, follow: false },
};

/**
 * Everything except the reference, the summary and the prefilled WhatsApp link
 * is static, so the page paints immediately and only the order-specific bits
 * wait for the client.
 */
export default function OrderSuccessPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal-700 dark:bg-teal/20 dark:text-teal">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <h1 className="mt-5 text-2xl sm:text-3xl">Order received</h1>
          <p className="mt-3 max-w-xl text-navy-700/80 dark:text-slate-300">
            Thank you. Keep the reference below — you will need it when you send your payment slip.
          </p>

          <div className="mt-6">
            <Suspense fallback={<ReferenceSkeleton />}>
              <OrderReference />
            </Suspense>
          </div>

          <h2 className="mt-10 text-xl">Next steps</h2>
          <ol className="mt-4 space-y-4">
            <li className="card flex gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-heading font-bold text-white dark:bg-teal dark:text-navy-900">
                1
              </span>
              <div>
                <h3 className="text-base">Transfer the payment</h3>
                <div className="mt-1.5 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
                  <span className="block">{site.bank.bank}</span>
                  <span className="block">Account name: {site.bank.accountName}</span>
                  <span className="block">Account number: {site.bank.accountNumber}</span>
                  <span className="block">Branch: {site.bank.branch}</span>
                  <span className="mt-2 block text-navy-700/70 dark:text-slate-400">
                    Use the reference above as the payment reference.
                  </span>
                </div>
              </div>
            </li>

            <li className="card flex gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-heading font-bold text-white dark:bg-teal dark:text-navy-900">
                2
              </span>
              <div>
                <h3 className="text-base">Send us the slip</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
                  WhatsApp a photo of the slip with your reference. We confirm within a few hours
                  during working days.
                </p>
              </div>
            </li>

            <li className="card flex gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-heading font-bold text-white dark:bg-teal dark:text-navy-900">
                3
              </span>
              <div>
                <h3 className="text-base">We start writing</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
                  Your turnaround clock starts when payment is confirmed, and the first draft lands
                  in your inbox.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Suspense
              fallback={
                <span className="btn-primary pointer-events-none opacity-70 sm:px-8">
                  Send the slip on WhatsApp
                </span>
              }
            >
              <WhatsAppSlipButton />
            </Suspense>
            <Link href="/" className="btn-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <Suspense fallback={null}>
          <OrderSummaryPanel />
        </Suspense>
      </div>
    </div>
  );
}
