import type { CvContent } from '@/content/cvs';
import { isEmail, toWebUrl } from './links';

/**
 * A plain-language approximation of what an applicant tracking system (ATS)
 * does with a CV: turn it into text, find the contact details, split it into
 * sections, pick out jobs and dates, and compare its words with the job ad.
 *
 * Real systems (Workday, Taleo, Greenhouse, Lever…) differ in detail, but they
 * all start from the same text layer, so the same things trip them up: text
 * in images, odd section names, unreadable dates, and missing keywords. Every
 * check here names one of those and how to fix it.
 */

export type AtsStatus = 'pass' | 'warn' | 'fail' | 'info';

export type AtsCheck = {
  id: string;
  label: string;
  status: AtsStatus;
  detail: string;
  /** Contribution to the score; info checks weigh nothing. */
  weight: number;
};

export type AtsField = { label: string; value: string; found: boolean };

export type AtsJob = { title: string; employer: string; dates: string; parsed: string | null };

export type KeywordMatch = { matched: string[]; missing: string[]; percent: number };

export type AtsReport = {
  score: number;
  fields: AtsField[];
  jobs: AtsJob[];
  sections: { name: string; found: boolean }[];
  checks: AtsCheck[];
  keywords: KeywordMatch | null;
  wordCount: number;
};

export type AtsInput = {
  /** The CV as plain text, in reading order — what the ATS actually receives. */
  text: string;
  /** Structured content, when the CV came from the builder or a sample. */
  content?: CvContent;
  pages?: number;
  jobDescription?: string;
};

/* ------------------------------------------------------------------ text */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s,;)]*)?/gi;

const MONTHS =
  'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const DATE_PART = new RegExp(`^(?:(${MONTHS})\\.?\\s*)?((?:19|20)\\d{2})?$`, 'i');
const PRESENT = /^(present|current|now|to date|ongoing|today)$/i;

/** The section names ATS parsers look for, with the common variations each accepts. */
const SECTIONS: { name: string; required: boolean; aliases: RegExp }[] = [
  { name: 'Profile / Summary', required: false, aliases: /\b(profile|summary|about me|professional summary|objective|career objective)\b/i },
  { name: 'Experience', required: true, aliases: /\b(experience|work history|employment|professional experience|career history)\b/i },
  { name: 'Education', required: true, aliases: /\b(education|qualifications|academic)\b/i },
  { name: 'Skills', required: true, aliases: /\b(skills|expertise|competencies|core skills|technical skills)\b/i },
  { name: 'Projects', required: false, aliases: /\bprojects?\b/i },
  { name: 'Certifications', required: false, aliases: /\b(certifications?|credentials|licen[cs]es)\b/i },
  { name: 'Languages', required: false, aliases: /\blanguages\b/i },
];

/** Headings an ATS will not recognise as a standard section. */
const STANDARD_EXTRA = /^(projects?|volunteering|volunteer experience|awards?|honou?rs|publications|certifications?|languages|interests|leadership|activities|leadership & activities|achievements|key projects|selected projects|training|courses|references|quality improvement|selected campaigns)$/i;

/**
 * Parses a job's dates ("Jan 2022 – Present", "2019 – 2021", "Jul – Dec 2025").
 * Returns a normalised "Mon YYYY – Mon YYYY" string, or null if an ATS would
 * struggle with it.
 */
export function parsePeriod(period: string): { label: string; startYear: number } | null {
  const raw = period.trim();
  if (!raw) return null;
  const parts = raw.split(/\s*(?:–|—|-|to|until)\s*/i).filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;

  const parse = (p: string) => {
    if (PRESENT.test(p.trim())) return { month: null as string | null, year: null as number | null, present: true };
    const m = p.trim().match(DATE_PART);
    if (!m || (!m[1] && !m[2])) return null;
    return { month: m[1] ? m[1].slice(0, 3) : null, year: m[2] ? Number(m[2]) : null, present: false };
  };

  const start = parse(parts[0]);
  const end = parts[1] ? parse(parts[1]) : null;
  if (!start || (parts[1] && !end)) return null;
  const startYear = start.year ?? end?.year ?? null;
  if (!startYear) return null;

  const fmt = (d: { month: string | null; year: number | null; present: boolean }, fallbackYear: number | null) =>
    d.present ? 'Present' : `${d.month ? `${d.month[0].toUpperCase()}${d.month.slice(1).toLowerCase()} ` : ''}${d.year ?? fallbackYear ?? ''}`.trim();

  return {
    label: end ? `${fmt(start, end.year)} – ${fmt(end, null)}` : fmt(start, null),
    startYear,
  };
}

/* -------------------------------------------------------------- keywords */

const STOP = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each etc few for from further had has have having he her here hers him his how i if in into is it its itself just let may me more most must my no nor not of off on once only or other our ours out over own per please same she should so some such than that the their theirs them then there these they this those through to too under until up upon us very via was we were what when where which while who whom why will with within without would you your yours
  write writing writes feature features welcome welcomed plus bonus nice looking seeking want wanted essential essentials desirable qualified qualification qualifications hiring hire prepare preparing process processes manage managing build building own owning group deliver delivering drive driving help helping handle handling various multiple ideal ideally successful proven hands-on hands demonstrated solid fast-paced environment environments dynamic motivated self-motivated passionate detail attention oriented player communication written verbal
  able ability abilities across additional apply applicant applicants candidate candidates company role roles position positions job jobs work working works team teams including include includes required requirement requirements require requires preferred plus strong good excellent great new using use used within year years day days month months looking seeking join opportunity opportunities responsible responsibilities duties duty ensure ensuring provide providing support supporting related relevant knowledge understanding experience experienced skills skill minimum least well based level high highly key etc e.g ie like make making need needs one two three four five full time part based sri lanka colombo salary benefits apply today`.split(
    /\s+/,
  ),
);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9+#./-]+/)
    .map((t) => t.replace(/^[./-]+|[./-]+$/g, ''))
    .filter((t) => t.length > 1 && !/^\d+$/.test(t));

/**
 * The words and two-word phrases a job ad leans on most, minus filler. This is
 * roughly how ATS keyword ranking works: frequent, specific terms from the ad,
 * searched for in the CV.
 */
export function extractKeywords(jobDescription: string, limit = 24): string[] {
  const tokens = tokenize(jobDescription);

  // Named skills and tools: capitalised mid-sentence or written as an acronym
  // (IFRS, SAP, Excel, Power BI). ATS keyword lists are mostly made of these.
  const named = new Set<string>();
  for (const m of jobDescription.matchAll(/(?<![.!?]\s)(?<!^)\b([A-Z][A-Za-z0-9+#./-]*|[A-Z]{2,}[A-Za-z0-9+#./-]*)\b/gm)) {
    named.add(m[1].toLowerCase().replace(/[./-]+$/, ''));
  }

  const counts = new Map<string, number>();
  const bump = (term: string) => counts.set(term, (counts.get(term) ?? 0) + 1);
  // Phrases never cross punctuation: "Git, Docker" is two skills, not one.
  for (const segment of jobDescription.split(/[,;:()|\n•·]|\.(?=\s)|\s[-–—]\s/)) {
    const words = tokenize(segment);
    words.forEach((t, i) => {
      if (STOP.has(t)) return;
      bump(t);
      const next = words[i + 1];
      if (next && !STOP.has(next)) bump(`${t} ${next}`);
    });
  }

  const isKeyword = (term: string, n: number) => {
    if (term.includes(' ')) {
      const [a, b] = term.split(' ');
      return n >= 2 || (named.has(a) && named.has(b));
    }
    return n >= 2 || named.has(term);
  };

  const ranked = [...counts.entries()]
    .filter(([term, n]) => isKeyword(term, n))
    .map(([term, n]) => [term, n * (term.includes(' ') ? 1.5 : 1) + (named.has(term) ? 0.5 : 0)] as const)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);

  const picked: string[] = [];
  for (const [term] of ranked) {
    // Skip a word already covered by a chosen phrase, and vice versa.
    if (picked.some((p) => p.split(' ').includes(term) || term.split(' ').includes(p))) continue;
    picked.push(term);
    if (picked.length >= limit) break;
  }

  // Short ads mention most requirements once. Top the list up with their
  // longer content words, in the order the ad uses them.
  const floor = Math.min(limit, 14);
  for (const t of tokens) {
    if (picked.length >= floor) break;
    if (STOP.has(t) || t.length < 5 || picked.some((p) => p.split(' ').includes(t))) continue;
    picked.push(t);
  }
  return picked;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function matchKeywords(cvText: string, jobDescription: string): KeywordMatch | null {
  const keywords = extractKeywords(jobDescription);
  if (keywords.length < 3) return null;
  const haystack = ` ${cvText.toLowerCase().replace(/\s+/g, ' ')} `;
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of keywords) {
    const re = new RegExp(`(^|[^a-z0-9+#])${escapeRe(k).replace(/ /g, '\\s+')}s?($|[^a-z0-9+#])`, 'i');
    (re.test(haystack) ? matched : missing).push(k);
  }
  return { matched, missing, percent: Math.round((matched.length / keywords.length) * 100) };
}

/* -------------------------------------------------------------- analysis */

const firstLine = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean) ?? '';

export function analyzeAts({ text, content, pages, jobDescription }: AtsInput): AtsReport {
  const clean = text.replace(/ /g, ' ');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  /* ---- fields an ATS pulls out */
  const email = content?.contact.email.trim() || clean.match(EMAIL_RE)?.[0] || '';
  const phone = content?.contact.phone.trim() || clean.replace(EMAIL_RE, ' ').match(PHONE_RE)?.[0]?.trim() || '';
  const urls = content
    ? [content.contact.linkedin, content.contact.website ?? '', ...(content.projects ?? []).map((p) => p.link)].filter((u) => u?.trim())
    : [
        ...new Set(
          (clean.replace(new RegExp(EMAIL_RE.source, 'gi'), ' ').match(URL_RE) ?? []).filter(
            (u) =>
              !/^\d/.test(u) &&
              (/^(https?:\/\/|www\.)/i.test(u) || u.includes('/') || /\.(com|lk|org|net|io|dev|me|co|ai|app|info|edu|uk|au|in|site|page|tech)$/i.test(u)),
          ),
        ),
      ];
  const validUrls = urls.filter((u) => toWebUrl(u));
  const name = content?.name.trim() || firstLine(clean);
  const location = content?.contact.location.trim() ?? '';

  const phoneDigits = phone.replace(/\D/g, '');
  const fields: AtsField[] = [
    { label: 'Name', value: name || '—', found: Boolean(name) && name.split(/\s+/).length <= 5 },
    { label: 'Email', value: email || 'Not found', found: isEmail(email) },
    { label: 'Phone', value: phone || 'Not found', found: phoneDigits.length >= 9 && phoneDigits.length <= 15 },
    ...(content ? [{ label: 'Location', value: location || 'Not found', found: Boolean(location) }] : []),
    { label: 'Links', value: validUrls.length ? validUrls.join(' · ') : 'None', found: validUrls.length > 0 },
  ];
  if (content) {
    fields.push({ label: 'Job title', value: content.title.trim() || 'Not found', found: Boolean(content.title.trim()) });
    const skills = content.skills.flatMap((s) => s.items).filter((s) => s.trim());
    fields.push({ label: 'Skills', value: skills.length ? `${skills.length}: ${skills.slice(0, 8).join(', ')}${skills.length > 8 ? '…' : ''}` : 'None', found: skills.length > 0 });
    const edu = content.education.filter((e) => e.qualification.trim());
    fields.push({ label: 'Education', value: edu.length ? edu.map((e) => `${e.qualification}${e.year ? ` (${e.year})` : ''}`).join(' · ') : 'Not found', found: edu.length > 0 });
  }

  /* ---- jobs and dates */
  const jobs: AtsJob[] = content
    ? content.experience
        .filter((j) => j.role.trim() || j.org.trim())
        .map((j) => ({ title: j.role.trim(), employer: j.org.trim(), dates: j.period.trim(), parsed: parsePeriod(j.period)?.label ?? null }))
    : [];

  /* ---- sections */
  const headingLines = content ? clean.split('\n').map((l) => l.trim()).filter((l) => l.length <= 40) : lines.filter((l) => l.length <= 40);
  const sections = SECTIONS.map((s) => ({
    name: s.name,
    required: s.required,
    found: headingLines.some((l) => s.aliases.test(l)),
  }));

  /* ---- checks */
  const checks: AtsCheck[] = [];
  const add = (id: string, label: string, status: AtsStatus, detail: string, weight: number) =>
    checks.push({ id, label, status, detail, weight });

  const contactOk = isEmail(email) && phoneDigits.length >= 9;
  add(
    'contact',
    'Contact details can be read',
    contactOk ? 'pass' : 'fail',
    contactOk
      ? 'Email and phone are plain text in a recognisable format.'
      : !isEmail(email)
        ? 'No valid email address found. Write it out in full, e.g. name@example.com.'
        : 'No phone number with 9–15 digits found. Include your country code, e.g. +94 77 123 4567.',
    15,
  );

  const missingRequired = sections.filter((s) => SECTIONS.find((x) => x.name === s.name)?.required && !s.found);
  add(
    'sections',
    'Standard section headings',
    missingRequired.length === 0 ? 'pass' : missingRequired.length === 1 ? 'warn' : 'fail',
    missingRequired.length === 0
      ? 'Experience, Education and Skills are all labelled with names ATS parsers look for.'
      : `Missing or unrecognised: ${missingRequired.map((s) => s.name).join(', ')}. Use these exact words as headings.`,
    10,
  );

  if (content?.extra?.items.some((i) => i.name.trim() || i.detail.trim())) {
    const heading = content.extra.heading.trim();
    const standard = STANDARD_EXTRA.test(heading);
    add(
      'custom-heading',
      'Custom section name',
      standard ? 'pass' : 'warn',
      standard
        ? `“${heading}” is a heading ATS parsers understand.`
        : `“${heading || 'Untitled'}” may not be recognised. Prefer Projects, Volunteering, Awards or Achievements.`,
      3,
    );
  }

  if (content) {
    const unreadable = jobs.filter((j) => j.dates && !j.parsed);
    const undated = jobs.filter((j) => !j.dates);
    add(
      'dates',
      'Dates an ATS can parse',
      jobs.length === 0 ? 'warn' : unreadable.length || undated.length ? 'warn' : 'pass',
      jobs.length === 0
        ? 'Add at least one role, internship or project with dates.'
        : unreadable.length
          ? `Could not read: “${unreadable[0].dates}”. Use “Jan 2022 – Present” or “2019 – 2021”.`
          : undated.length
            ? `${undated.length} role(s) have no dates. ATS systems calculate your years of experience from them.`
            : 'Every role has dates in a standard format, so your years of experience can be calculated.',
      10,
    );

    const years = content.experience.map((j) => parsePeriod(j.period)?.startYear).filter((y): y is number => Boolean(y));
    const ordered = years.every((y, i) => i === 0 || y <= years[i - 1]);
    add(
      'order',
      'Most recent role first',
      ordered ? 'pass' : 'warn',
      ordered ? 'Roles are in reverse-chronological order, the order ATS systems and recruiters expect.' : 'Move your most recent role to the top.',
      5,
    );

    const bullets = content.experience.flatMap((j) => j.points).filter((p) => p.trim());
    const longBullets = bullets.filter((b) => b.length > 250);
    add(
      'bullets',
      'Achievements as bullet points',
      bullets.length >= 3 && !longBullets.length ? 'pass' : 'warn',
      bullets.length < 3
        ? 'Add at least three bullet points under your roles. ATS systems rank short, specific statements.'
        : longBullets.length
          ? `${longBullets.length} bullet(s) are very long. Keep each under two lines.`
          : `${bullets.length} bullet points, each short enough to scan.`,
      10,
    );
  } else {
    const bulletLines = lines.filter((l) => /^[•●▪◦\-*–]\s/.test(l));
    add(
      'bullets',
      'Achievements as bullet points',
      bulletLines.length >= 3 ? 'pass' : 'warn',
      bulletLines.length >= 3 ? `${bulletLines.length} bullet points found.` : 'Few or no bullet points found. List achievements as short bullets.',
      10,
    );
    const hasDates = new RegExp(`((${MONTHS})\\.?\\s*)?(19|20)\\d{2}`, 'i').test(clean);
    add('dates', 'Dates an ATS can parse', hasDates ? 'pass' : 'warn', hasDates ? 'Found dates with four-digit years.' : 'No dates found. Add them to every role, e.g. “Jan 2022 – Present”.', 10);
  }

  const odd = clean.match(/[☀-➿\u{1F300}-\u{1FAFF}\u{E000}-\u{F8FF}]/gu) ?? [];
  add(
    'characters',
    'Plain characters only',
    odd.length ? 'warn' : 'pass',
    odd.length ? `Found ${odd.length} emoji or icon character(s) (${[...new Set(odd)].slice(0, 5).join(' ')}). ATS systems often turn these into gibberish.` : 'No emoji, icon fonts or special symbols that could turn into gibberish.',
    5,
  );

  const garbled = /(\w)\s(\w)\s(\w)\s(\w)\s(\w)\b/.test(clean.replace(/\n/g, ' ')) && !content;
  if (!content) {
    add(
      'text-layer',
      'Text comes out cleanly',
      garbled || wordCount < 80 ? 'warn' : 'pass',
      wordCount < 80
        ? 'Very little text came through. If your CV is a scanned image or designed in Canva/Photoshop as a picture, an ATS sees almost nothing.'
        : garbled
          ? 'Some words came out letter-by-letter. That usually means text boxes or unusual fonts; ATS systems will misread them.'
          : 'Words come out whole and in a sensible order.',
      10,
    );
  } else {
    add(
      'layout',
      'Reading order',
      'pass',
      'The template is a single column underneath. Sidebars are read after the main column, never mixed into it.',
      10,
    );
  }

  const badLinks = urls.filter((u) => !toWebUrl(u));
  if (urls.length) {
    add(
      'links',
      'Links written out in full',
      badLinks.length ? 'warn' : 'pass',
      badLinks.length
        ? `“${badLinks[0]}” is not a complete web address. Use the address itself, e.g. linkedin.com/in/yourname.`
        : 'Links are shown as readable addresses (so ATS systems read them) and are clickable in the PDF.',
      5,
    );
  } else {
    add('links', 'Links written out in full', 'info', 'Adding your LinkedIn profile (and a portfolio or GitHub, if you have one) helps recruiters check you out quickly.', 0);
  }

  if (pages !== undefined) {
    add(
      'length',
      'Length',
      pages <= 2 ? 'pass' : 'warn',
      pages <= 2 ? `${pages} page${pages > 1 ? 's' : ''}, within the one-to-two pages most recruiters expect.` : `${pages} pages. Trim older roles so it fits on two.`,
      10,
    );
  }

  if (content?.photo) {
    add('photo', 'Photo', 'info', 'ATS systems ignore photos, so nothing is lost for parsing. Many employers abroad (UK, US, Australia) prefer CVs without one.', 0);
  }

  add(
    'format',
    'File format',
    'info',
    content
      ? 'Both downloads are ATS-readable: the PDF keeps real, selectable text, and the Word file uses real headings and bullet lists.'
      : 'Send a text-based PDF or a Word file. Never a scanned image or a photo of your CV.',
    0,
  );

  /* ---- keywords */
  const keywords = jobDescription && jobDescription.trim().length > 40 ? matchKeywords(clean, jobDescription) : null;
  if (keywords) {
    add(
      'keywords',
      'Keywords from the job ad',
      keywords.percent >= 70 ? 'pass' : keywords.percent >= 45 ? 'warn' : 'fail',
      keywords.percent >= 70
        ? `${keywords.percent}% of the ad's key terms appear in your CV.`
        : `${keywords.percent}% of the ad's key terms appear. Work the missing ones into your skills and bullets where they are true for you.`,
      20,
    );
  }

  /* ---- score */
  const weights = { pass: 1, warn: 0.5, fail: 0, info: 0 } as const;
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + c.weight * weights[c.status], 0);
  const score = total ? Math.round((earned / total) * 100) : 0;

  return {
    score,
    fields,
    jobs,
    sections: sections.map(({ name, found }) => ({ name, found })),
    checks,
    keywords,
    wordCount,
  };
}
