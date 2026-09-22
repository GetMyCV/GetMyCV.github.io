export type Service = {
  id: string;
  title: string;
  blurb: string;
  details: string[];
  icon: 'document' | 'scan' | 'globe' | 'linkedin' | 'letter';
};

export const services: Service[] = [
  {
    id: 'cv-writing',
    title: 'CV writing',
    blurb:
      'A recruiter spends about seven seconds on your CV. We make those seconds count.',
    icon: 'document',
    details: [
      'Written from scratch around your target role, not a template fill-in.',
      'Achievements phrased with numbers, so your impact is obvious.',
      'Delivered as a polished PDF plus an editable Word file you keep forever.',
    ],
  },
  {
    id: 'ats-cv',
    title: 'ATS-friendly formatting',
    blurb:
      'Most large employers screen CVs with software before a human sees them.',
    icon: 'scan',
    details: [
      'Simple, parseable structure — no tables, text boxes or graphics that break parsers.',
      'Keywords matched to the job adverts you are actually applying to.',
      'Tested against a real applicant tracking system parser before delivery.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Personal portfolio website',
    blurb:
      'One link that shows your work, hosted free and loading fast on any phone.',
    icon: 'globe',
    details: [
      'Mobile-first single-page site with your projects, skills and contact details.',
      'Hosted on GitHub Pages under your own account, so it costs you nothing to run.',
      'Custom subdomain setup, plus a short guide on updating it yourself.',
    ],
  },
  {
    id: 'linkedin',
    title: 'LinkedIn profile makeover',
    blurb:
      'Recruiters search LinkedIn first. We make sure they find you and stay.',
    icon: 'linkedin',
    details: [
      'Headline and About section rewritten to read like a person, not a job advert.',
      'Experience entries aligned with your new CV so your story is consistent.',
      'Skills and keyword strategy so you surface in recruiter searches.',
    ],
  },
  {
    id: 'cover-letter',
    title: 'Cover letter',
    blurb: 'A short, specific letter that sounds like you on your best day.',
    icon: 'letter',
    details: [
      'Tailored to one target role, with a reusable structure for the rest.',
      'Answers the only question that matters: why you, why them, why now.',
      'Editable file so you can adapt it for each application in minutes.',
    ],
  },
];
