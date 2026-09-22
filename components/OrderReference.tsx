'use client';

import { useState } from 'react';
import { useLastOrder } from '@/lib/use-last-order';

export default function OrderReference() {
  const { order, ready, reference } = useLastOrder();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!ready) return <ReferenceSkeleton />;

  if (!reference) {
    return (
      <div className="min-h-[104px] rounded-2xl border border-navy/15 bg-white p-5 text-sm text-navy-700/90 dark:border-white/15 dark:bg-white/5 dark:text-slate-200">
        We could not find your reference in this browser. Message us on WhatsApp with your name and
        we will look it up.
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[104px] flex-wrap items-center gap-3 rounded-2xl border border-teal/40 bg-teal/5 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal">
            Your reference
          </p>
          <p className="font-heading text-2xl font-extrabold text-navy dark:text-white">
            {reference}
          </p>
        </div>
        <button type="button" onClick={copy} className="btn-secondary ml-auto px-4 py-2 text-sm">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {order && !order.stored && (
        <div className="mt-5 rounded-xl border border-amber/50 bg-amber/10 p-4 text-sm text-navy-800 dark:text-slate-100">
          This build is not connected to our order database yet, so please send the details on
          WhatsApp to make sure we receive them.
        </div>
      )}
    </>
  );
}

export function ReferenceSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[104px] rounded-2xl border border-teal/40 bg-teal/5 p-5"
    >
      <div className="h-3 w-28 rounded bg-navy/10 dark:bg-white/10" />
      <div className="mt-2 h-7 w-48 rounded bg-navy/10 dark:bg-white/10" />
    </div>
  );
}
