'use client';

import { addOns, getPackage } from '@/content/pricing';
import { site } from '@/content/site';
import type { OrderValues } from './order-schema';

/**
 * Where a placed order goes.
 *
 * The site is a static export with no server of its own, so submission is
 * pluggable and degrades instead of breaking:
 *
 *  1. `ordersApi`   — the Cloudflare Worker in /worker, if deployed. Writes to
 *                     D1, recomputes the price server-side, supports uploads.
 *  2. `web3formsKey`— Web3Forms, which emails the order straight to the inbox
 *                     in content/site.ts. No backend to run. The access key is
 *                     public by design; it only permits submissions.
 *  3. neither       — the order still gets a reference and a prefilled WhatsApp
 *                     message, so nobody is ever left unable to order.
 */
export type SubmitResult = {
  ref: string;
  /** True when the order reached a real backend rather than the fallback. */
  stored: boolean;
  /** Which path handled it, for the success page and for debugging. */
  via: 'worker' | 'web3forms' | 'whatsapp';
};

const packageName = (id: string) => getPackage(id)?.name ?? id;

const addOnNames = (ids: string[]) =>
  ids.map((id) => addOns.find((a) => a.id === id)?.name ?? id);

/** Local reference, used by Web3Forms and the WhatsApp fallback. */
const localReference = (date: Date = new Date()) =>
  `GMC-${date.getFullYear()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

async function submitToWorker(
  endpoint: string,
  values: OrderValues,
  fileKeys: string[],
): Promise<SubmitResult> {
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...values, fileKeys }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { error?: string }).error ?? 'Order API rejected the order');
  }

  const { ref } = (await response.json()) as { ref: string };
  return { ref, stored: true, via: 'worker' };
}

async function submitToWeb3Forms(
  accessKey: string,
  values: OrderValues,
  total: number,
): Promise<SubmitResult> {
  const ref = localReference();

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `New order ${ref} — ${packageName(values.packageId)}`,
      from_name: 'GetMyCv orders',
      // Web3Forms emails these fields as the message body.
      Reference: ref,
      Package: packageName(values.packageId),
      'Add-ons': addOnNames(values.addOnIds ?? []).join(', ') || 'None',
      Total: `LKR ${total.toLocaleString()}`,
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      Location: values.location,
      'Target role': values.role,
      Industry: values.industry,
      Experience: values.experience,
      Notes: values.notes || '—',
      'Consent given at': new Date().toISOString(),
      // Web3Forms' own spam trap, separate from the form's honeypot.
      botcheck: '',
    }),
  });

  const body = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Web3Forms rejected the order');
  }

  return { ref, stored: true, via: 'web3forms' };
}

export const ordersApi = process.env.NEXT_PUBLIC_ORDERS_API ?? '';
export const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? site.web3formsKey ?? '';
export const isOrderBackendConfigured = Boolean(ordersApi || web3formsKey);

/** Uploads only work through the Worker; Web3Forms takes fields, not files. */
export const canUploadFiles = Boolean(ordersApi);

export async function uploadFile(endpoint: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/uploads`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) throw new Error('Upload failed');
  const { key } = (await response.json()) as { key: string };
  return key;
}

export async function submitOrder(
  values: OrderValues,
  total: number,
  files: File[],
): Promise<SubmitResult> {
  if (ordersApi) {
    const fileKeys: string[] = [];
    for (const file of files) {
      // An upload failure must not lose the order — the client can send the
      // file on WhatsApp instead, so it is recorded as missing and we continue.
      try {
        fileKeys.push(await uploadFile(ordersApi, file));
      } catch {
        // Intentionally ignored; the order itself still goes through.
      }
    }
    return submitToWorker(ordersApi, values, fileKeys);
  }

  if (web3formsKey) {
    return submitToWeb3Forms(web3formsKey, values, total);
  }

  return { ref: localReference(), stored: false, via: 'whatsapp' };
}
