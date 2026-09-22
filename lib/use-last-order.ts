'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export type StoredOrder = {
  ref: string;
  packageId: string;
  addOnIds: string[];
  total: number;
  name: string;
  email: string;
  stored: boolean;
  whatsapp: string;
};

export const LAST_ORDER_KEY = 'getmycv:last-order';

/**
 * The order the visitor just placed. It lives in sessionStorage because the
 * site has no server to ask for the order back, and because the reference in
 * the URL alone carries no summary.
 *
 * `ready` stays false until the effect runs, so the first paint matches the
 * server-rendered markup instead of flashing a "not found" state.
 */
export function useLastOrder() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw) as StoredOrder);
    } catch {
      // Private browsing or storage disabled — the URL reference still works.
    }
    setReady(true);
  }, []);

  return { order, ready, reference: order?.ref ?? searchParams.get('ref') };
}
