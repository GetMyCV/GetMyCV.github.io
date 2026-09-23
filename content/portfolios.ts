import type { Profession } from './samples';

export type DemoPortfolio = {
  slug: string;
  profession: Profession;
  /** Fictional person. Every demo says so on the page itself. */
  name: string;
  initials: string;
  role: string;
  location: string;
  availability: string;
  tagline: string;
  about: string[];
  /** Accent colour for this demo. All pass WCAG AA on white. */
  accent: string;
  accentSoft: string;
  stats: { value: string; label: string }[];
  skills: string[];
  experience: { role: string; org: string; period: string; points: string[] }[];
  projects: { title: string; summary: string; tags: string[]; result?: string }[];
  education: { qualification: string; institution: string; year: string }[];
  contact: { email: string; phone: string; linkedin: string };
};

/**
 * Demo portfolios shown at /portfolio/<slug>/.
 *
 * Every person here is invented. They exist to show the structure, writing and
 * layout a client receives — nothing on these pages describes a real person,
 * and each page says so in a banner.
 */
export const portfolios: DemoPortfolio[] = [
  {
    slug: 'software-developer',
    profession: 'Software',
    name: 'Tharindu Jayasuriya',
    initials: 'TJ',
    role: 'Full-stack developer',
    location: 'Colombo, Sri Lanka',
    availability: 'Open to senior roles',
    tagline: 'I build payment systems that stay up when it matters.',
    accent: '#0B7A70',
    accentSoft: '#E6F4F2',
    about: [
      'Six years building and running payment and logistics systems for Sri Lankan and Singaporean companies. I work mostly in TypeScript and Go, and I care more about what happens at 3am than what happens in the demo.',
      'Most of my work has been on systems where downtime costs money directly, so I have spent as much time on observability, rollbacks and on-call runbooks as on features.',
    ],
    stats: [
      { value: '6 yrs', label: 'Experience' },
      { value: '99.97%', label: 'Uptime on payments' },
      { value: '40+', label: 'Services shipped' },
    ],
    skills: [
      'TypeScript', 'Go', 'React', 'Next.js', 'PostgreSQL', 'Redis',
      'AWS', 'Docker', 'Kubernetes', 'Terraform', 'GraphQL', 'CI/CD',
    ],
    experience: [
      {
        role: 'Senior software engineer',
        org: 'Fintech scale-up, Colombo',
        period: '2023 — present',
        points: [
          'Rebuilt the settlement pipeline, cutting end-of-day reconciliation from 4 hours to 18 minutes.',
          'Introduced structured logging and tracing across 12 services, reducing median incident diagnosis from 45 to 8 minutes.',
          'Mentored four junior engineers; two have since been promoted.',
        ],
      },
      {
        role: 'Software engineer',
        org: 'Logistics platform, Singapore (remote)',
        period: '2021 — 2023',
        points: [
          'Built the driver dispatch service handling 30,000 assignments a day.',
          'Moved the team from nightly releases to continuous deploys, dropping lead time from 6 days to under an hour.',
        ],
      },
      {
        role: 'Junior developer',
        org: 'Software house, Colombo',
        period: '2019 — 2021',
        points: [
          'Delivered eleven client projects across retail and education.',
          'Wrote the internal component library still used by the team today.',
        ],
      },
    ],
    projects: [
      {
        title: 'Settlement reconciliation engine',
        summary:
          'Event-sourced service that matches bank statements against internal ledgers and flags only genuine mismatches.',
        tags: ['Go', 'PostgreSQL', 'Kafka'],
        result: '4 hours → 18 minutes',
      },
      {
        title: 'Driver dispatch service',
        summary:
          'Real-time assignment engine balancing distance, driver rating and delivery deadline across a live fleet.',
        tags: ['TypeScript', 'Redis', 'WebSockets'],
        result: '30k assignments/day',
      },
      {
        title: 'Open-source retry library',
        summary:
          'Small library for idempotent retries with jittered backoff, written after one too many duplicate charges.',
        tags: ['TypeScript', 'Open source'],
        result: '800+ weekly downloads',
      },
    ],
    education: [
      { qualification: 'BSc (Hons) Computer Science', institution: 'University of Colombo', year: '2019' },
      { qualification: 'AWS Certified Solutions Architect', institution: 'Amazon Web Services', year: '2022' },
    ],
    contact: {
      email: 'tharindu@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
  {
    slug: 'senior-accountant',
    profession: 'Accounting',
    name: 'Nadeesha Fernando',
    initials: 'NF',
    role: 'Senior accountant, CA (SL)',
    location: 'Colombo, Sri Lanka',
    availability: 'Open to finance manager roles',
    tagline: 'Closing the books faster, and being able to prove every number.',
    accent: '#1D4ED8',
    accentSoft: '#E8EEFD',
    about: [
      'Chartered Accountant with nine years across audit and industry, currently leading a team of five in a manufacturing group with LKR 4bn turnover.',
      'My work tends to be about making the month-end close boring: clean controls, documented reconciliations, and reporting that finance and operations both trust.',
    ],
    stats: [
      { value: '9 yrs', label: 'Experience' },
      { value: 'LKR 4bn', label: 'Turnover managed' },
      { value: '5', label: 'Team members' },
    ],
    skills: [
      'IFRS / LKAS', 'Statutory reporting', 'Month-end close', 'Internal controls',
      'Budgeting & forecasting', 'Cash flow management', 'SAP FICO', 'QuickBooks',
      'Transfer pricing', 'Tax compliance', 'Audit liaison', 'Advanced Excel',
    ],
    experience: [
      {
        role: 'Senior accountant',
        org: 'Manufacturing group, Colombo',
        period: '2022 — present',
        points: [
          'Cut the month-end close from 12 working days to 5 by restructuring the reconciliation calendar.',
          'Led the LKAS 16 revaluation of a LKR 1.2bn asset base with no audit adjustments.',
          'Built the rolling 13-week cash flow forecast the board now uses for facility decisions.',
        ],
      },
      {
        role: 'Assistant manager, audit',
        org: 'Big four firm, Colombo',
        period: '2018 — 2022',
        points: [
          'Managed audits for fourteen clients across manufacturing, retail and hospitality.',
          'Identified a LKR 38m revenue recognition error at a listed client before sign-off.',
        ],
      },
    ],
    projects: [
      {
        title: 'ERP migration — finance workstream',
        summary:
          'Owned the chart of accounts redesign and opening balance migration for a move to SAP across four entities.',
        tags: ['SAP FICO', 'Change management'],
        result: 'Zero post-go-live restatements',
      },
      {
        title: 'Working capital programme',
        summary:
          'Renegotiated supplier terms and tightened receivables follow-up alongside the commercial team.',
        tags: ['Cash flow', 'Stakeholder management'],
        result: 'LKR 140m released',
      },
      {
        title: 'Internal controls review',
        summary:
          'Documented and tested controls across procure-to-pay, closing eleven findings raised by external audit.',
        tags: ['Internal controls', 'Risk'],
      },
    ],
    education: [
      { qualification: 'Chartered Accountant (CA Sri Lanka)', institution: 'CA Sri Lanka', year: '2018' },
      { qualification: 'BSc Accounting (Special)', institution: 'University of Sri Jayewardenepura', year: '2015' },
    ],
    contact: {
      email: 'nadeesha@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
  {
    slug: 'digital-marketer',
    profession: 'Marketing',
    name: 'Sanduni Rathnayake',
    initials: 'SR',
    role: 'Digital marketing lead',
    location: 'Kandy, Sri Lanka',
    availability: 'Open to head of growth roles',
    tagline: 'Campaigns judged on revenue, not impressions.',
    accent: '#BE185D',
    accentSoft: '#FCE8F0',
    about: [
      'Seven years running paid and organic acquisition for e-commerce and hospitality brands across Sri Lanka and the Maldives.',
      'I report on cost per acquisition and contribution margin rather than reach, which has occasionally made planning meetings awkward and budgets much more effective.',
    ],
    stats: [
      { value: '7 yrs', label: 'Experience' },
      { value: 'LKR 120m', label: 'Ad spend managed' },
      { value: '4.2×', label: 'Best campaign ROAS' },
    ],
    skills: [
      'Paid search', 'Meta ads', 'SEO', 'Content strategy', 'Email lifecycle',
      'GA4', 'Looker Studio', 'Conversion rate optimisation', 'Marketing automation',
      'Copywriting', 'A/B testing', 'Budget planning',
    ],
    experience: [
      {
        role: 'Digital marketing lead',
        org: 'Hospitality group, Kandy',
        period: '2022 — present',
        points: [
          'Took direct bookings from 18% to 41% of total revenue, cutting OTA commission by LKR 62m a year.',
          'Rebuilt the email programme around booking intent, lifting repeat stays by 27%.',
          'Manage a LKR 40m annual budget across six properties.',
        ],
      },
      {
        role: 'Performance marketing executive',
        org: 'E-commerce retailer, Colombo',
        period: '2018 — 2022',
        points: [
          'Reduced blended customer acquisition cost from LKR 2,400 to LKR 890 over eighteen months.',
          'Ran the SEO rebuild that took organic from 12% to 34% of sessions.',
        ],
      },
    ],
    projects: [
      {
        title: 'Direct booking programme',
        summary:
          'Rate parity, landing page rebuild and a retargeting funnel aimed squarely at OTA commission.',
        tags: ['Paid search', 'CRO', 'Email'],
        result: 'LKR 62m commission saved',
      },
      {
        title: 'Seasonal demand model',
        summary:
          'Simple forecasting sheet pairing historical occupancy with search trends to time budget releases.',
        tags: ['Analytics', 'Planning'],
        result: '31% lower off-peak CPA',
      },
      {
        title: 'Content engine rebuild',
        summary:
          'Replaced a blog nobody read with destination guides mapped to the questions people actually search.',
        tags: ['SEO', 'Content'],
        result: '3.1× organic sessions',
      },
    ],
    education: [
      { qualification: 'CIM Professional Diploma in Marketing', institution: 'Chartered Institute of Marketing', year: '2020' },
      { qualification: 'BBA Marketing', institution: 'University of Peradeniya', year: '2017' },
    ],
    contact: {
      email: 'sanduni@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
  {
    slug: 'civil-engineer',
    profession: 'Engineering',
    name: 'Dilan Wickramasinghe',
    initials: 'DW',
    role: 'Civil engineer, C.Eng',
    location: 'Galle, Sri Lanka',
    availability: 'Open to project manager roles',
    tagline: 'Twelve years of structures that came in on time and stayed standing.',
    accent: '#B45309',
    accentSoft: '#FDF1E3',
    about: [
      'Chartered civil engineer with twelve years on commercial, residential and highway projects, most recently as site lead on a LKR 2.8bn mixed-use development.',
      'I have spent enough time on sites to know that the drawings and the ground rarely agree, and that the difference is managed by people, not software.',
    ],
    stats: [
      { value: '12 yrs', label: 'Experience' },
      { value: 'LKR 2.8bn', label: 'Largest project' },
      { value: '18', label: 'Projects delivered' },
    ],
    skills: [
      'Structural design', 'Project planning', 'AutoCAD', 'Revit', 'ETABS',
      'Primavera P6', 'Quantity surveying', 'Site supervision', 'Contract administration',
      'FIDIC', 'Quality assurance', 'Health & safety',
    ],
    experience: [
      {
        role: 'Site lead engineer',
        org: 'Mixed-use development, Galle',
        period: '2021 — present',
        points: [
          'Leading a 40-person site team on a LKR 2.8bn development, delivered two months ahead of programme.',
          'Redesigned the piling approach after ground surveys, saving LKR 94m against the tendered method.',
          'Zero lost-time incidents across 900,000 site hours.',
        ],
      },
      {
        role: 'Project engineer',
        org: 'Highway contractor, Southern Province',
        period: '2016 — 2021',
        points: [
          'Managed drainage and culvert works across 22km of expressway.',
          'Introduced weekly earned-value reporting that caught a 6-week slippage early enough to recover.',
        ],
      },
    ],
    projects: [
      {
        title: 'Mixed-use development, Galle',
        summary:
          '14 floors of retail, office and residential on a constrained coastal site with a high water table.',
        tags: ['Structural', 'Site management'],
        result: '2 months ahead of programme',
      },
      {
        title: 'Expressway drainage package',
        summary:
          '22km of drainage, culverts and embankment protection delivered through two monsoon seasons.',
        tags: ['Highways', 'Planning'],
        result: 'LKR 310m package',
      },
      {
        title: 'Piling redesign',
        summary:
          'Value engineering exercise replacing bored piles with driven piles after revised ground investigation.',
        tags: ['Value engineering'],
        result: 'LKR 94m saved',
      },
    ],
    education: [
      { qualification: 'Chartered Engineer (IESL)', institution: 'Institution of Engineers Sri Lanka', year: '2018' },
      { qualification: 'BSc Eng (Hons) Civil', institution: 'University of Moratuwa', year: '2013' },
    ],
    contact: {
      email: 'dilan@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
  {
    slug: 'registered-nurse',
    profession: 'Healthcare',
    name: 'Imalka Perera',
    initials: 'IP',
    role: 'Registered nurse, ICU',
    location: 'Colombo, Sri Lanka',
    availability: 'Seeking overseas placement',
    tagline: 'Eight years of critical care, and a licence ready to travel.',
    accent: '#0E7490',
    accentSoft: '#E3F2F6',
    about: [
      'Registered nurse with eight years in intensive care, currently a shift lead in a 16-bed adult ICU in a private hospital in Colombo.',
      'I am preparing for an overseas move, so this portfolio is organised the way international recruiters ask for it: registrations and clinical competencies first, narrative second.',
    ],
    stats: [
      { value: '8 yrs', label: 'Experience' },
      { value: '16-bed', label: 'Adult ICU' },
      { value: 'IELTS 7.5', label: 'English' },
    ],
    skills: [
      'Critical care', 'Ventilator management', 'Haemodynamic monitoring',
      'ACLS', 'BLS', 'Infection control', 'Wound care', 'Triage',
      'Patient & family education', 'Medication administration',
      'Electronic records', 'Shift leadership',
    ],
    experience: [
      {
        role: 'Shift lead, intensive care',
        org: 'Private hospital, Colombo',
        period: '2021 — present',
        points: [
          'Lead nurse for a 16-bed adult ICU across night shifts, coordinating a team of seven.',
          'Reduced central line infection rate to zero across four consecutive quarters through a revised bundle checklist.',
          'Precept new ICU nurses through their first three months.',
        ],
      },
      {
        role: 'Staff nurse, ICU',
        org: 'Teaching hospital, Colombo',
        period: '2017 — 2021',
        points: [
          'Managed ventilated and post-operative cardiac patients on rotating shifts.',
          'Member of the hospital rapid response team.',
        ],
      },
    ],
    projects: [
      {
        title: 'Central line infection bundle',
        summary:
          'Rewrote the insertion and maintenance checklist and ran the ward training that went with it.',
        tags: ['Infection control', 'Quality improvement'],
        result: 'Zero CLABSI, 4 quarters',
      },
      {
        title: 'Night-shift handover redesign',
        summary:
          'Structured ISBAR handover replacing informal verbal rounds, cutting handover time and missed information.',
        tags: ['Patient safety', 'Process'],
        result: '22 min → 9 min',
      },
      {
        title: 'New nurse preceptorship',
        summary:
          'Three-month structured onboarding for ICU starters, covering competencies week by week.',
        tags: ['Teaching', 'Mentoring'],
      },
    ],
    education: [
      { qualification: 'BSc Nursing', institution: 'University of Colombo', year: '2017' },
      { qualification: 'Sri Lanka Nursing Council registration', institution: 'SLNC', year: 'Current' },
      { qualification: 'ACLS provider', institution: 'American Heart Association', year: '2024' },
    ],
    contact: {
      email: 'imalka@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
  {
    slug: 'graduate',
    profession: 'Graduate',
    name: 'Kavindu Silva',
    initials: 'KS',
    role: 'Computer science graduate',
    location: 'Colombo, Sri Lanka',
    availability: 'Looking for a first role',
    tagline: 'No job history yet — so here is the work instead.',
    accent: '#6D28D9',
    accentSoft: '#F0EAFD',
    about: [
      'Final-year computer science graduate with a first class, one internship and three projects I built because I wanted them to exist.',
      'This portfolio leads with projects and coursework rather than employment, which is the honest way round when you are starting out — and it gives an interviewer something concrete to ask about.',
    ],
    stats: [
      { value: 'First class', label: 'Degree' },
      { value: '3', label: 'Shipped projects' },
      { value: '6 mo', label: 'Internship' },
    ],
    skills: [
      'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git',
      'Data structures', 'REST APIs', 'Testing', 'Linux', 'Figma', 'Technical writing',
    ],
    experience: [
      {
        role: 'Software engineering intern',
        org: 'Software house, Colombo',
        period: '2025 (6 months)',
        points: [
          'Built the admin dashboard for a client logistics product, used daily by 30 staff.',
          'Wrote the first integration test suite for the team, catching four regressions before release.',
          'Took part in code review from week three.',
        ],
      },
      {
        role: 'Committee member, computer society',
        org: 'University of Colombo',
        period: '2023 — 2025',
        points: [
          'Organised a 120-person student hackathon, from sponsorship to judging.',
          'Ran weekly beginner programming sessions for first-year students.',
        ],
      },
    ],
    projects: [
      {
        title: 'Bus arrival tracker',
        summary:
          'Crowd-sourced arrival times for Colombo routes, because the timetable and the bus rarely agree.',
        tags: ['React Native', 'Node.js', 'PostgreSQL'],
        result: '400+ users in 3 months',
      },
      {
        title: 'Past paper search',
        summary:
          'Full-text search across a decade of departmental past papers, with filtering by module and year.',
        tags: ['Python', 'Elasticsearch'],
        result: 'Used across 2 departments',
      },
      {
        title: 'Final year project — crop disease detection',
        summary:
          'Image classifier for common paddy leaf diseases, trained on a locally collected dataset.',
        tags: ['Python', 'PyTorch', 'Research'],
        result: '91% accuracy',
      },
    ],
    education: [
      { qualification: 'BSc (Hons) Computer Science — First Class', institution: 'University of Colombo', year: '2026' },
      { qualification: 'GCE A/L — 3A (Physical Science)', institution: 'Royal College, Colombo', year: '2021' },
    ],
    contact: {
      email: 'kavindu@example.lk',
      phone: '+94 77 000 0000',
      linkedin: 'linkedin.com/in/example',
    },
  },
];

export const getPortfolio = (slug: string) => portfolios.find((p) => p.slug === slug);
