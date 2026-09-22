export type Profession =
  | 'Software'
  | 'Accounting'
  | 'Marketing'
  | 'Engineering'
  | 'Healthcare'
  | 'Graduate';

export type Sample = {
  id: string;
  title: string;
  profession: Profession;
  type: 'Portfolio' | 'CV';
  summary: string;
  /** External demo link, or a PDF/PNG under /samples for CV samples. */
  href: string;
  /** Preview image in /public/samples. */
  image: string;
  result?: string;
};

export const professions: Profession[] = [
  'Software',
  'Accounting',
  'Marketing',
  'Engineering',
  'Healthcare',
  'Graduate',
];

/**
 * Replace these with your real demos as they are built. `href` can point at a
 * live GitHub Pages demo for portfolios, or an anonymised PDF for CV samples.
 */
export const samples: Sample[] = [
  {
    id: 'portfolio-software',
    title: 'Full-stack developer portfolio',
    profession: 'Software',
    type: 'Portfolio',
    summary:
      'Single-page portfolio with project case studies, a skills matrix and a contact form. Loads in under a second on 4G.',
    href: '#',
    image: '/samples/portfolio-software.svg',
    result: 'Built in 6 days',
  },
  {
    id: 'portfolio-marketing',
    title: 'Digital marketer portfolio',
    profession: 'Marketing',
    type: 'Portfolio',
    summary:
      'Campaign results front and centre, with before-and-after metrics and downloadable case studies.',
    href: '#',
    image: '/samples/portfolio-marketing.svg',
    result: 'Built in 7 days',
  },
  {
    id: 'portfolio-engineering',
    title: 'Civil engineer portfolio',
    profession: 'Engineering',
    type: 'Portfolio',
    summary:
      'Project gallery with site photographs, drawings and a clear certification timeline.',
    href: '#',
    image: '/samples/portfolio-engineering.svg',
    result: 'Built in 8 days',
  },
  {
    id: 'cv-accounting',
    title: 'Senior accountant CV',
    profession: 'Accounting',
    type: 'CV',
    summary:
      'Two-page ATS-friendly CV, rewritten around audit and reporting outcomes rather than duties.',
    href: '#',
    image: '/samples/cv-accounting.svg',
    result: '3 interviews in 4 weeks',
  },
  {
    id: 'cv-healthcare',
    title: 'Registered nurse CV',
    profession: 'Healthcare',
    type: 'CV',
    summary:
      'Clinical skills and registrations placed above the fold, formatted for overseas applications.',
    href: '#',
    image: '/samples/cv-healthcare.svg',
  },
  {
    id: 'cv-graduate',
    title: 'Fresh graduate CV',
    profession: 'Graduate',
    type: 'CV',
    summary:
      'No work experience yet — so projects, internships and coursework do the talking.',
    href: '#',
    image: '/samples/cv-graduate.svg',
    result: 'First job offer in 5 weeks',
  },
];
