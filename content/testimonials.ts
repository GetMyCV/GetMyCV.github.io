export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

/** Replace with real, permission-granted client quotes before launch. */
export const testimonials: Testimonial[] = [
  {
    quote:
      'I had applied to about thirty jobs with no replies. Two weeks after the new CV I had three interviews. The difference was how they wrote up my results.',
    name: 'Nuwan P.',
    role: 'Accountant, Colombo',
    initials: 'NP',
  },
  {
    quote:
      'The portfolio site is the thing people mention in every interview. It took them a week and I still have not paid a cent for hosting.',
    name: 'Sanduni R.',
    role: 'UI designer, Kandy',
    initials: 'SR',
  },
  {
    quote:
      'Straightforward, fast, and they actually asked good questions about my work instead of just reformatting what I sent.',
    name: 'Dilan F.',
    role: 'Software engineer, Galle',
    initials: 'DF',
  },
];
