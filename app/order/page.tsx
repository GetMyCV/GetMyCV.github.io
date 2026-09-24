import { Suspense } from 'react';
import OrderForm from '@/components/OrderForm';
import OrderFormSkeleton from '@/components/OrderFormSkeleton';
import { pageMetadata } from '@/lib/metadata';
import { site } from '@/content/site';

export const metadata = pageMetadata({
  title: 'Place an order',
  description:
    'Order your CV, cover letter, LinkedIn makeover or portfolio website in four short steps. No account needed and nothing is charged on the form.',
  path: '/order/',
});

export default function OrderPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <p className="eyebrow">Order</p>
        <h1 className="mt-2 text-2xl sm:text-3xl">Let’s get started</h1>
        <p className="mt-3 text-navy-700/80 dark:text-slate-300">
          Four short steps, about three minutes. At the end you get a reference number and can pay
          by card or bank transfer — {site.name} only starts work once payment is confirmed.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<OrderFormSkeleton />}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}
