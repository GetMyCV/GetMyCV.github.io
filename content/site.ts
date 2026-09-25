export const site = {
  name: 'GetMyCv',
  tagline: 'Get your CV and portfolio done right',
  description:
    'Professional ATS-friendly CV writing, cover letters, LinkedIn makeovers and portfolio websites for Sri Lankan job seekers. Delivered in days, not weeks.',
  url: 'https://getmycv.github.io',
  locale: 'en_LK',
  currency: 'USD',
  email: 'hello@getmycv.lk',
  // Digits only, international format, no leading + (wa.me format).
  whatsapp: '94784464128',
  whatsappMessage: 'Hi GetMyCv, I would like to order a CV.',
  areaServed: 'Sri Lanka',
  /**
   * Google Search Console ownership proof for the URL-prefix property
   * https://getmycv.github.io/. Rendered as <meta name="google-site-verification">.
   * The same property can also be verified by public/google6bd9d15b3ecc4bf4.html.
   */
  googleSiteVerification: '8yxUGaMetlVc24ha_G0xKeGCbbr0SRW7Rt4HdXPA4TE',
  social: {
    facebook: 'https://facebook.com/getmycv',
    linkedin: 'https://linkedin.com/company/getmycv',
  },
  /**
   * Web3Forms access key. Get one free at https://web3forms.com by entering the
   * address that should receive orders — the key arrives by email.
   *
   * It is public by design (it only allows submissions, never reads), so it is
   * safe to commit. Leave it empty and the order form falls back to WhatsApp.
   * NEXT_PUBLIC_WEB3FORMS_KEY overrides this at build time if you prefer.
   */
  web3formsKey: '',

  // Replace with your real account before launch; shown on the success page.
  bank: {
    accountName: 'WAAD WIJESINGHE',
    bank: 'Sampath Bank',
    accountNumber: '1001 5271 9600',
    branch: 'Colombo City Branch',
  },
} as const;

export const whatsappLink = (message: string = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
