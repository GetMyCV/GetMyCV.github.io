export type Step = { title: string; description: string };

export const steps: Step[] = [
  {
    title: 'Place your order',
    description:
      'Pick a package, tell us about your target role, and upload your old CV if you have one. Takes about three minutes.',
  },
  {
    title: 'Confirm and pay',
    description:
      'You get a reference number straight away. Pay by card through Stripe, or transfer and send us the slip on WhatsApp.',
  },
  {
    title: 'We build your draft',
    description:
      'We write, format and test your CV — and build your portfolio site if your package includes one.',
  },
  {
    title: 'Review and receive',
    description:
      'You review the draft and we revise it. Final files land in your inbox, ready to send to employers.',
  },
];
