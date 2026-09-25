import type { CvContent } from '@/content/cvs';

export type StrengthCheck = { id: string; label: string; tip: string; passed: boolean };

const filled = (s: string | undefined) => Boolean(s && s.trim());

/**
 * The checks behind the "CV strength" meter. Each is something recruiters and
 * applicant tracking systems genuinely look for, with a one-line fix.
 */
export function strengthChecks(cv: CvContent, pages: number): StrengthCheck[] {
  const bullets = cv.experience.flatMap((j) => j.points).filter(filled);
  const withNumbers = bullets.filter((b) => /\d/.test(b));
  const skills = cv.skills.flatMap((s) => s.items).filter(filled);
  const summaryLength = cv.summary.trim().length;

  return [
    {
      id: 'contact',
      label: 'Name, job title, email and phone',
      tip: 'Recruiters need to know who you are and how to reach you in one glance.',
      passed: filled(cv.name) && filled(cv.title) && filled(cv.contact.email) && filled(cv.contact.phone),
    },
    {
      id: 'summary',
      label: 'A 2–4 line profile',
      tip: 'Aim for 200–600 characters: who you are, your strongest result, the role you want.',
      passed: summaryLength >= 200 && summaryLength <= 600,
    },
    {
      id: 'experience',
      label: 'Experience with at least 3 bullet points',
      tip: 'Add your roles, internships or projects, each with what you achieved.',
      passed: bullets.length >= 3,
    },
    {
      id: 'numbers',
      label: 'Results with numbers',
      tip: 'Put a number in at least 3 bullets: money saved, time cut, people led, customers served.',
      passed: withNumbers.length >= 3,
    },
    {
      id: 'bullet-length',
      label: 'Short, scannable bullets',
      tip: 'Keep every bullet under about two lines (220 characters).',
      passed: bullets.length > 0 && bullets.every((b) => b.trim().length <= 220),
    },
    {
      id: 'skills',
      label: 'At least 6 skills',
      tip: 'List the tools and skills from the job ads you are applying for, so ATS keyword filters match.',
      passed: skills.length >= 6,
    },
    {
      id: 'education',
      label: 'Education',
      tip: 'Add your highest qualification, institution and year.',
      passed: cv.education.some((e) => filled(e.qualification)),
    },
    {
      id: 'length',
      label: 'One or two pages',
      tip: 'Trim older roles or lower the text size. Most recruiters read one to two pages.',
      passed: pages <= 2,
    },
  ];
}
