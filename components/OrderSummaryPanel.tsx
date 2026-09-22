'use client';

import OrderSummary from './OrderSummary';
import { useLastOrder } from '@/lib/use-last-order';

/** Sidebar recap of the order just placed; renders nothing if we have no copy. */
export default function OrderSummaryPanel() {
  const { order, ready } = useLastOrder();

  if (!ready || !order) return null;

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="card">
        <h2 className="text-base">Order summary</h2>
        <div className="mt-4">
          <OrderSummary packageId={order.packageId} addOnIds={order.addOnIds} total={order.total} />
        </div>
      </div>
    </aside>
  );
}
