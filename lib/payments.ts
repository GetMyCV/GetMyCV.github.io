'use client';

import { getPackage } from '@/content/pricing';
import { ordersApi } from './order-api';
import type { StoredOrder } from './use-last-order';

/**
 * Card payments through Stripe.
 *
 * Two paths, mirroring how orders are submitted:
 *
 *  1. Worker     — the order is in D1, so the Worker creates a Checkout Session
 *                  for exactly that order (package plus add-ons, priced
 *                  server-side) and a Stripe webhook marks it Paid.
 *  2. Payment Link — no backend. Each package has a Stripe Payment Link that
 *                  offers the add-ons as optional extras. The order reference
 *                  travels as `client_reference_id`, so the payment can be
 *                  matched to the order in the Stripe dashboard.
 *
 * Nothing secret lives here: Price ids and Payment Links are public by design.
 */

/** True when this order can be paid by card at all. */
export const canPayByCard = (order: Pick<StoredOrder, 'packageId' | 'via'>) =>
  order.via === 'worker' ? Boolean(ordersApi) : Boolean(getPackage(order.packageId)?.paymentLink);

/** Payment Link with the reference and email prefilled. */
export const paymentLinkUrl = (order: Pick<StoredOrder, 'packageId' | 'ref' | 'email'>) => {
  const link = getPackage(order.packageId)?.paymentLink;
  if (!link) return null;
  const url = new URL(link);
  // Stripe allows letters, digits, dashes and underscores here — our references fit.
  url.searchParams.set('client_reference_id', order.ref);
  if (order.email) url.searchParams.set('prefilled_email', order.email);
  return url.toString();
};

/** Returns the Stripe-hosted page to send the visitor to. */
export async function cardPaymentUrl(order: StoredOrder): Promise<string> {
  if (order.via === 'worker' && ordersApi) {
    const response = await fetch(`${ordersApi.replace(/\/$/, '')}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: order.ref }),
    });
    const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !body.url) throw new Error(body.error ?? 'Could not start the card payment');
    return body.url;
  }

  const url = paymentLinkUrl(order);
  if (!url) throw new Error('Card payments are not set up for this package');
  return url;
}
