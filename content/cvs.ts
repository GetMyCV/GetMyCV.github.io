import type { Profession } from './samples';

/**
 * The CV layouts. All are single-column in reading order underneath, so
 * applicant tracking systems parse them top to bottom; side columns are placed
 * with CSS grid only, after the main column in the markup.
 */
export type CvLayout = 'classic' | 'modern' | 'executive' | 'minimal' | 'elegant';

export type CvRole = {
  role: string;
  org: string;
  location: string;
  period: string;
  points: string[];
};

/** What a CV says, independent of how it is laid out. The CV builder edits exactly this. */
export type CvContent = {
  name: string;
  title: string;
  contact: { email: string; phone: string; location: string; linkedin: string };
  summary: string;
  experience: CvRole[];
  skills: { group: string; items: string[] }[];
  education: { qualification: string; institution: string; year: string; detail?: string }[];
  certifications?: string[];
  languages?: string[];
  highlights?: { value: string; label: string }[];
  /** An optional extra section in the main column, e.g. selected projects. */
  extra?: { heading: string; items: { name: string; detail: string }[] };
  /** Optional photo as a data: URL (builder only; the samples have none). */
  photo?: string;
};

export type DemoCv = CvContent & {
  slug: string;
  profession: Profession;
  layout: CvLayout;
  /** Name shown on the sample card and the page title. */
  templateName: string;
  /** Accent colour. Checked for AA contrast on white at the sizes used. */
  accent: string;
};

/**
 * Sample CVs shown at /cv/<slug>/, with preview images and PDFs generated from
 * them by `npm run previews`.
 *
 * Every person is invented. The writing style is the real thing: outcomes over
 * duties, numbers where they exist, and nothing an ATS cannot read.
 */
export const cvs: DemoCv[] = [
  {
    slug: 'senior-accountant',
    profession: 'Accounting',
    layout: 'classic',
    templateName: 'Classic — Senior accountant',
    name: 'Nadeesha Fernando',
    title: 'Senior Accountant · CA (Sri Lanka)',
    contact: {
      email: 'nadeesha@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'Chartered Accountant with nine years across Big Four audit and industry. Currently leading a five-person team in a manufacturing group with LKR 4bn turnover, where I cut the month-end close from twelve working days to five and took the group through two clean audits under SLFRS.',
    accent: '#1D4ED8',
    experience: [
      {
        role: 'Senior Accountant',
        org: 'Manufacturing group',
        location: 'Colombo',
        period: 'Mar 2022 – Present',
        points: [
          'Reduced month-end close from 12 to 5 working days by redesigning the close calendar and automating 14 recurring journals.',
          'Led the LKAS 16 revaluation of a LKR 1.2bn asset base with no audit adjustments.',
          'Released LKR 140m of trapped working capital through a debtor-ageing review and revised credit terms.',
          'Manage and develop a team of five; two promoted within eighteen months.',
        ],
      },
      {
        role: 'Assistant Manager, Audit',
        org: 'Big Four audit firm',
        location: 'Colombo',
        period: 'Jan 2019 – Feb 2022',
        points: [
          'Ran fieldwork on eleven listed and private clients across manufacturing, retail and plantations.',
          'Identified a LKR 38m revenue-recognition error at a listed client before sign-off.',
          'Built the firm’s SLFRS 16 lease-calculation template, later adopted across the practice.',
        ],
      },
      {
        role: 'Audit Senior / Associate',
        org: 'Big Four audit firm',
        location: 'Colombo',
        period: 'Jan 2016 – Dec 2018',
        points: [
          'Audited revenue, inventory and fixed-asset cycles for clients with turnover up to LKR 20bn.',
          'Coached six trainee associates through their first busy season.',
        ],
      },
    ],
    skills: [
      { group: 'Reporting', items: ['SLFRS / IFRS', 'Consolidation', 'Management accounts', 'Board packs'] },
      { group: 'Controls', items: ['Month-end close', 'Internal controls', 'Audit liaison', 'Tax compliance'] },
      { group: 'Systems', items: ['SAP FI/CO', 'Oracle NetSuite', 'Advanced Excel', 'Power BI'] },
    ],
    education: [
      { qualification: 'Associate Member, CA Sri Lanka', institution: 'Institute of Chartered Accountants of Sri Lanka', year: '2019' },
      { qualification: 'BSc Accountancy (Special), Second Class Upper', institution: 'University of Sri Jayewardenepura', year: '2016' },
    ],
    certifications: ['CIMA Certificate in Business Accounting (2015)'],
    languages: ['English — professional', 'Sinhala — native', 'Tamil — conversational'],
  },
  {
    slug: 'software-engineer',
    profession: 'Software',
    layout: 'modern',
    templateName: 'Modern — Software engineer',
    name: 'Tharindu Jayasuriya',
    title: 'Senior Software Engineer',
    contact: {
      email: 'tharindu@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'Backend-leaning full-stack engineer with six years building payment and logistics systems where downtime costs money directly. I design for the 3am incident as much as the demo — observability, safe rollbacks and clear runbooks come as standard.',
    accent: '#0B7A70',
    highlights: [
      { value: '99.97%', label: 'uptime on payments' },
      { value: '18 min', label: 'reconciliation, from 4 h' },
      { value: '30k/day', label: 'dispatch assignments' },
    ],
    experience: [
      {
        role: 'Senior Software Engineer',
        org: 'Fintech scale-up',
        location: 'Colombo',
        period: '2023 – Present',
        points: [
          'Rebuilt the settlement pipeline in Go, cutting end-of-day reconciliation from 4 hours to 18 minutes.',
          'Rolled out structured logging and tracing across 12 services; median incident diagnosis fell from 45 to 8 minutes.',
          'Led the migration of 3 TB of ledger data to a partitioned PostgreSQL cluster with zero downtime.',
          'Mentored four junior engineers, two since promoted.',
        ],
      },
      {
        role: 'Software Engineer',
        org: 'Logistics platform (remote)',
        location: 'Singapore',
        period: '2021 – 2023',
        points: [
          'Built the real-time driver dispatch service handling 30,000 assignments a day.',
          'Moved the team from nightly releases to continuous deployment; lead time dropped from 6 days to under an hour.',
          'Owned on-call for dispatch with zero SLA breaches over two years.',
        ],
      },
      {
        role: 'Software Developer',
        org: 'Software house',
        location: 'Colombo',
        period: '2019 – 2021',
        points: [
          'Delivered eleven client projects across retail and education in React and Node.js.',
          'Wrote the internal component library the team still uses today.',
          'Cut average page load on the largest client’s storefront from 4.1 s to 1.3 s.',
        ],
      },
    ],
    extra: {
      heading: 'Selected projects',
      items: [
        { name: 'Settlement reconciliation engine', detail: 'Event-sourced Go service that matches bank statements to internal ledgers and surfaces only genuine mismatches.' },
        { name: 'Open-source retry library', detail: 'Idempotent retries with jittered backoff for TypeScript; 800+ weekly downloads.' },
        { name: 'Conference talk, 2025', detail: '“What our payment outages taught us”, at a Colombo engineering meetup of 200+ developers.' },
      ],
    },
    skills: [
      { group: 'Languages', items: ['TypeScript', 'Go', 'SQL', 'Python'] },
      { group: 'Platforms', items: ['AWS', 'Kubernetes', 'Terraform', 'Docker'] },
      { group: 'Data', items: ['PostgreSQL', 'Redis', 'Kafka'] },
      { group: 'Practice', items: ['System design', 'Observability', 'CI/CD', 'Code review'] },
    ],
    education: [
      { qualification: 'BSc (Hons) Computer Science', institution: 'University of Colombo', year: '2019' },
    ],
    certifications: ['AWS Certified Solutions Architect – Associate (2022)'],
    languages: ['English', 'Sinhala'],
  },
  {
    slug: 'digital-marketer',
    profession: 'Marketing',
    layout: 'executive',
    templateName: 'Executive — Digital marketer',
    name: 'Sanduni Rathnayake',
    title: 'Digital Marketing Lead',
    contact: {
      email: 'sanduni@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'Performance marketer with seven years in hospitality and consumer brands. I run paid, search and CRM as one funnel, and I report in revenue rather than reach — most recently growing direct bookings from 18% to 41% of revenue for a six-property hotel group.',
    accent: '#B4235A',
    highlights: [
      { value: '41%', label: 'direct bookings, from 18%' },
      { value: 'LKR 62m', label: 'OTA commission saved a year' },
      { value: '63%', label: 'lower acquisition cost' },
    ],
    experience: [
      {
        role: 'Digital Marketing Lead',
        org: 'Hotel group, six properties',
        location: 'Colombo',
        period: '2022 – Present',
        points: [
          'Grew direct bookings from 18% to 41% of revenue, cutting OTA commission by LKR 62m a year.',
          'Manage a LKR 40m annual budget across Google, Meta and metasearch, with weekly revenue reporting to the board.',
          'Built a CRM programme of 90,000 past guests that now drives 12% of room nights.',
          'Lead a team of four plus two agencies.',
        ],
      },
      {
        role: 'Performance Marketing Executive',
        org: 'Consumer electronics retailer',
        location: 'Colombo',
        period: '2019 – 2022',
        points: [
          'Reduced blended acquisition cost from LKR 2,400 to LKR 890 over eighteen months.',
          'Launched the first Google Shopping feed, reaching 22% of online sales within a year.',
          'Introduced incrementality testing, reallocating 30% of spend away from brand search.',
        ],
      },
      {
        role: 'Marketing Executive',
        org: 'Creative agency',
        location: 'Colombo',
        period: '2018 – 2019',
        points: [
          'Ran social and search campaigns for nine FMCG and banking clients.',
        ],
      },
    ],
    extra: {
      heading: 'Selected campaigns',
      items: [
        { name: '“Book direct, stay better”', detail: 'Always-on direct-booking campaign with member rates; 3.4× return on ad spend in year one.' },
        { name: 'Avurudu flash sale', detail: 'Three-day retail sale across search, social and email; LKR 48m in online revenue, a record for the brand.' },
      ],
    },
    skills: [
      { group: 'Channels', items: ['Google Ads', 'Meta Ads', 'SEO', 'Email & CRM', 'Metasearch'] },
      { group: 'Analytics', items: ['GA4', 'Looker Studio', 'Attribution', 'A/B testing', 'SQL basics'] },
      { group: 'Leadership', items: ['Budget ownership', 'Agency management', 'Board reporting'] },
    ],
    education: [
      { qualification: 'BBA (Hons) Marketing', institution: 'University of Kelaniya', year: '2018' },
      { qualification: 'Chartered Postgraduate Diploma in Marketing', institution: 'CIM (UK)', year: '2021' },
    ],
    certifications: ['Google Ads Search & Shopping', 'Meta Certified Media Buying Professional'],
    languages: ['English — professional', 'Sinhala — native'],
  },
  {
    slug: 'civil-engineer',
    profession: 'Engineering',
    layout: 'classic',
    templateName: 'Classic — Civil engineer',
    name: 'Dilan Wickramasinghe',
    title: 'Chartered Civil Engineer · C.Eng, MIESL',
    contact: {
      email: 'dilan@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'Chartered civil engineer with twelve years on commercial, residential and highway projects. Most recently site lead on a LKR 2.8bn mixed-use development delivered two months ahead of programme, with a safety record of 1.2 million hours without a lost-time injury.',
    accent: '#B45309',
    experience: [
      {
        role: 'Site Lead Engineer',
        org: 'Tier-one contractor',
        location: 'Colombo',
        period: '2021 – Present',
        points: [
          'Lead a 40-person site team on a LKR 2.8bn, 22-storey mixed-use development, two months ahead of programme.',
          'Redesigned the piling approach after ground surveys, saving LKR 94m against the tendered method.',
          'Achieved 1.2 million hours without a lost-time injury through daily risk briefings and permit discipline.',
        ],
      },
      {
        role: 'Project Engineer',
        org: 'Highway consultancy',
        location: 'Southern Province',
        period: '2017 – 2021',
        points: [
          'Supervised 18 km of expressway earthworks and drainage under FIDIC conditions.',
          'Managed variation claims worth LKR 310m, resolving all without dispute.',
          'Introduced drone surveys, cutting monthly progress-measurement time by 60%.',
        ],
      },
      {
        role: 'Graduate / Site Engineer',
        org: 'Building contractor',
        location: 'Kandy',
        period: '2013 – 2017',
        points: [
          'Setting out, quality control and subcontractor coordination on four residential and school projects.',
        ],
      },
    ],
    extra: {
      heading: 'Key projects',
      items: [
        { name: 'Mixed-use tower, Colombo 02 — LKR 2.8bn', detail: '22 storeys, two basements; site lead from piling to handover.' },
        { name: 'Southern Expressway extension — LKR 310m package', detail: 'Earthworks, culverts and drainage across 18 km of new carriageway.' },
      ],
    },
    skills: [
      { group: 'Engineering', items: ['Structural design review', 'Geotechnics', 'Temporary works', 'Quantity surveying'] },
      { group: 'Delivery', items: ['FIDIC contracts', 'Primavera P6', 'Cost control', 'HSE management'] },
      { group: 'Software', items: ['AutoCAD', 'Civil 3D', 'ETABS', 'MS Project'] },
    ],
    education: [
      { qualification: 'BSc Eng (Hons) Civil Engineering', institution: 'University of Peradeniya', year: '2013' },
      { qualification: 'MSc Construction Project Management', institution: 'University of Moratuwa', year: '2019' },
    ],
    certifications: ['Chartered Engineer, IESL (2018)', 'NEBOSH International General Certificate'],
    languages: ['English — professional', 'Sinhala — native'],
  },
  {
    slug: 'registered-nurse',
    profession: 'Healthcare',
    layout: 'executive',
    templateName: 'Executive — Registered nurse',
    name: 'Imalka Perera',
    title: 'Registered Nurse · Intensive Care',
    contact: {
      email: 'imalka@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo · Open to relocation (UK, Australia)',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'ICU registered nurse with eight years in adult critical care, including three as shift lead in a 20-bed unit. NMC-registered with IELTS 8.0, experienced in ventilated, post-cardiac and multi-organ-failure patients, and a trained preceptor for new ICU staff.',
    accent: '#0E7490',
    highlights: [
      { value: 'NMC', label: 'UK registration, 2025' },
      { value: '8.0', label: 'IELTS academic' },
      { value: '20 beds', label: 'unit, as shift lead' },
    ],
    experience: [
      {
        role: 'Shift Lead, Intensive Care Unit',
        org: 'Private tertiary hospital',
        location: 'Colombo',
        period: '2022 – Present',
        points: [
          'Lead a team of eight nurses per shift in a 20-bed adult ICU with a 1:1 ventilated-patient ratio.',
          'Introduced a sepsis-bundle checklist that raised one-hour antibiotic compliance from 64% to 93%.',
          'Preceptor for 14 newly qualified nurses; all completed ICU competencies on schedule.',
        ],
      },
      {
        role: 'Staff Nurse, Intensive Care',
        org: 'National teaching hospital',
        location: 'Colombo',
        period: '2018 – 2022',
        points: [
          'Cared for ventilated, post-cardiac-surgery and CRRT patients in a 32-bed unit.',
          'Member of the rapid response team, attending 300+ ward deteriorations.',
          'Co-authored the unit’s pressure-injury prevention protocol, halving incidence in a year.',
        ],
      },
      {
        role: 'Staff Nurse, Medical Ward',
        org: 'District general hospital',
        location: 'Gampaha',
        period: '2016 – 2018',
        points: [
          'Delivered general medical nursing on a 40-bed ward, including diabetes and cardiac care.',
        ],
      },
    ],
    extra: {
      heading: 'Quality improvement',
      items: [
        { name: 'Sepsis-bundle checklist', detail: 'Designed and rolled out across two ICUs; one-hour antibiotic compliance rose from 64% to 93%.' },
        { name: 'Pressure-injury prevention protocol', detail: 'Co-authored with the tissue-viability team; unit incidence halved within twelve months.' },
      ],
    },
    skills: [
      { group: 'Critical care', items: ['Mechanical ventilation', 'CRRT', 'Arterial lines', 'Inotrope titration', 'Sepsis management'] },
      { group: 'Leadership', items: ['Shift coordination', 'Preceptorship', 'Clinical audit', 'Incident reporting'] },
    ],
    education: [
      { qualification: 'BSc (Hons) Nursing', institution: 'Open University of Sri Lanka', year: '2019' },
      { qualification: 'Diploma in General Nursing', institution: 'School of Nursing, Colombo', year: '2016' },
    ],
    certifications: [
      'NMC (UK) registration — 2025',
      'Sri Lanka Nursing Council registration',
      'ACLS & BLS (AHA), renewed 2025',
      'IELTS Academic 8.0 — 2024',
    ],
    languages: ['English — IELTS 8.0', 'Sinhala — native'],
  },
  {
    slug: 'graduate',
    profession: 'Graduate',
    layout: 'modern',
    templateName: 'Modern — Fresh graduate',
    name: 'Kavindu Senanayake',
    title: 'Computer Science Graduate · First Class',
    contact: {
      email: 'kavindu@example.lk',
      phone: '+94 77 000 0000',
      location: 'Colombo, Sri Lanka',
      linkedin: 'linkedin.com/in/example',
    },
    summary:
      'First Class computer science graduate looking for a junior software or data role. Six months of internship on a production codebase, a final-year project in crop-disease detection at 91% accuracy, and a campus app used by 400+ students.',
    accent: '#6D28D9',
    highlights: [
      { value: '3.82', label: 'GPA, First Class' },
      { value: '91%', label: 'model accuracy, final project' },
      { value: '400+', label: 'users of campus app' },
    ],
    experience: [
      {
        role: 'Software Engineering Intern',
        org: 'Software house',
        location: 'Colombo',
        period: 'Jul – Dec 2025',
        points: [
          'Shipped six features to a production React and Node.js app used by 20,000 retail customers.',
          'Wrote the integration tests for the checkout flow, raising coverage from 41% to 78%.',
          'Presented a caching proposal to the tech lead that cut a key API’s response time by half.',
        ],
      },
      {
        role: 'Final-Year Project — Crop Disease Detection',
        org: 'University of Colombo',
        location: 'Colombo',
        period: '2025 – 2026',
        points: [
          'Trained an image classifier for four common paddy-leaf diseases on 6,000 locally collected photos, reaching 91% accuracy.',
          'Packaged the model as an offline Android app for field officers.',
          'Awarded best final-year project in the department.',
        ],
      },
      {
        role: 'Campus Timetable App (side project)',
        org: 'Self-initiated',
        location: 'Colombo',
        period: '2024',
        points: [
          'Built and maintained a timetable and room-finder app adopted by 400+ students in three months.',
          'Handled feature requests and bug reports from students through a public issue tracker.',
        ],
      },
    ],
    extra: {
      heading: 'Leadership & activities',
      items: [
        { name: 'Treasurer, IEEE Student Branch', detail: 'Managed a LKR 1.2m annual budget and organised a 300-person technical symposium.' },
        { name: 'Finalist, national university hackathon', detail: 'Top 5 of 60 teams with a flood-alert SMS service built in 24 hours.' },
        { name: 'Peer tutor, data structures', detail: 'Weekly sessions for 30 first-year students across two semesters.' },
      ],
    },
    skills: [
      { group: 'Languages', items: ['Python', 'TypeScript', 'Java', 'SQL'] },
      { group: 'Tools', items: ['React', 'Node.js', 'PyTorch', 'Git', 'Docker'] },
      { group: 'Strengths', items: ['Problem solving', 'Clear writing', 'Team projects'] },
    ],
    education: [
      {
        qualification: 'BSc (Hons) Computer Science — First Class',
        institution: 'University of Colombo',
        year: '2026',
        detail: 'GPA 3.82 / 4.00 · Dean’s List, four semesters',
      },
      { qualification: 'GCE Advanced Level — 3A, Physical Science', institution: 'Royal College, Colombo', year: '2021' },
    ],
    certifications: ['Google Data Analytics Certificate (2025)'],
    languages: ['English', 'Sinhala'],
  },
];

export const getCv = (slug: string) => cvs.find((cv) => cv.slug === slug);

/** Where `npm run previews` writes each CV's PDF. */
export const cvPdfPath = (slug: string) => `/samples/cv-${slug}.pdf`;
