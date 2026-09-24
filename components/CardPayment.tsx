'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addOns, formatLkr } from '@/content/pricing';
import { canPayByCard, cardPaymentUrl } from '@/lib/payments';
import { useLastOrder } from '@/lib/use-last-order';

/**
 * "Pay by card" on the success page. Sends the visitor to Stripe's hosted
 * checkout, which returns here with `?paid=1` once the payment goes through.
 *
 * `paid=1` only changes what this page says. The payment itself is confirmed
 * by Stripe — in the dashboard, or by the Worker's webhook on that path.
 */
export default function CardPayment() {
  const searchParams = useSearchParams();
  const { order, ready } = useLastOrder();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (searchParams.get('paid') === '1') {
    return (
      <div role="status" className="rounded-xl border border-teal/40 bg-teal/5 p-4 text-sm text-navy-800 dark:text-slate-100">
        <strong className="font-semibold">Card payment received.</strong> Stripe will email your
        receipt, and there is no slip to send. We will be in touch shortly.
      </div>
    );
  }

  if (!ready) return <CardPaymentSkeleton />;
  if (!order || !canPayByCard(order)) return null;

  // The Payment Link cannot preselect add-ons, so tell the visitor which to tick.
  const extrasToTick =
    order.via === 'worker'
      ? []
      : order.addOnIds.map((id) => addOns.find((a) => a.id === id)?.name).filter(Boolean);

  const pay = async () => {
    setRedirecting(true);
    setError(null);
    try {
      window.location.assign(await cardPaymentUrl(order));
    } catch (err) {
      console.error(err);
      setError('We could not open the card payment page. Please try again, or pay by bank transfer below.');
      setRedirecting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={redirecting}
        className="btn-primary w-full disabled:opacity-70 sm:w-auto sm:px-8"
      >
        {redirecting ? 'Opening secure checkout…' : `Pay ${formatLkr(order.total)} by card`}
      </button>
      <p className="mt-2 text-xs text-navy-700/70 dark:text-slate-400">
        Secure checkout by Stripe. Visa, Mastercard and Amex; your card details never touch our site.
      </p>
      {extrasToTick.length > 0 && (
        <p className="mt-2 text-sm text-navy-700/80 dark:text-slate-300">
          On the payment page, also tick <strong>{extrasToTick.join(', ')}</strong> so the total
          comes to {formatLkr(order.total)}.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function CardPaymentSkeleton() {
  return <div aria-hidden="true" className="h-12 w-56 rounded-xl bg-navy/10 dark:bg-white/10" />;
}
