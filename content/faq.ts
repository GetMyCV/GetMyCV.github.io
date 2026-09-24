export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: 'How long does it take?',
    answer:
      'Starter is ready in 3 days, Professional in 5 days, and Premium (which includes your portfolio website) in 7 to 10 days. Express delivery brings any package down to 48 hours.',
  },
  {
    question: 'What do you need from me?',
    answer:
      'Your current CV if you have one, the kind of role you are targeting, and a few notes about your experience. If you have no CV at all, we send you a short questionnaire instead.',
  },
  {
    question: 'What does "ATS-friendly" actually mean?',
    answer:
      'Many employers run CVs through applicant tracking software before a human reads them. Fancy layouts with columns, tables and images often come out as gibberish. We use a clean structure that parses correctly while still looking professional.',
  },
  {
    question: 'How do I pay?',
    answer:
      'By card or by bank transfer. After you place an order you get a reference number and a “Pay by card” button, which opens a secure Stripe checkout — Visa, Mastercard and Amex all work. If you would rather transfer, our account details are on the same page; send the slip over WhatsApp with your reference.',
  },
  {
    question: 'What if I do not like the draft?',
    answer:
      'Every package includes revision rounds — one, two or three depending on the package. Tell us what is off and we rework it. Extra rounds can be added any time.',
  },
  {
    question: 'Who owns the portfolio website?',
    answer:
      'You do. It lives in your own GitHub account and we hand over everything, including a short guide for updating it yourself. There is no lock-in and no monthly fee.',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'We only collect what we need to write your CV, we never sell it, and we delete uploaded files 90 days after delivery. You can ask us to delete your data sooner at any time.',
  },
];
