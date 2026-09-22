export const site = {
  name: 'GetMyCv',
  tagline: 'Get your CV and portfolio done right',
  description:
    'Professional ATS-friendly CV writing, cover letters, LinkedIn makeovers and personal portfolio websites for Sri Lankan job seekers. Delivered in days, not weeks.',
  url: 'https://getmycv.github.io',
  locale: 'en_LK',
  currency: 'LKR',
  email: 'hello@getmycv.lk',
  // Digits only, international format, no leading + (wa.me format).
  whatsapp: '94770000000',
  whatsappMessage: 'Hi GetMyCv, I would like to order a CV.',
  areaServed: 'Sri Lanka',
  social: {
    facebook: 'https://facebook.com/getmycv',
    linkedin: 'https://linkedin.com/company/getmycv',
  },
  // Replace with your real account before launch; shown on the success page.
  bank: {
    accountName: 'GetMyCv',
    bank: 'Commercial Bank of Ceylon',
    accountNumber: '0000 0000 0000',
    branch: 'Colombo',
  },
} as const;

export const whatsappLink = (message: string = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
