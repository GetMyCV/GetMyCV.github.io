'use client';

import { useLastOrder } from '@/lib/use-last-order';
import { whatsappLink } from '@/content/site';

/** Prefills the WhatsApp message with the order details when we still have them. */
export default function WhatsAppSlipButton() {
  const { order } = useLastOrder();

  return (
    <a href={order?.whatsapp ?? whatsappLink()} className="btn-primary sm:px-8">
      Send the slip on WhatsApp
    </a>
  );
}
