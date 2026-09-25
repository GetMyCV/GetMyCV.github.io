import type { CvContent, CvLayout, CvRole, DemoCv } from '@/content/cvs';
import { cvTemplates, getTemplate } from '@/content/cv-templates';
import type { CvFont } from '@/components/CvDocument';

/** Everything the builder keeps: the CV itself plus how it is styled. */
export type BuilderState = {
  version: 1;
  layout: CvLayout;
  accent: string;
  font: CvFont;
  /** Text size multiplier, 0.8–1.1. */
  scale: number;
  content: CvContent;
};

export const STORAGE_KEY = 'getmycv:cv-builder:v1';
export const MIN_SCALE = 0.8;
export const MAX_SCALE = 1.1;

export const emptyRole = (): CvRole => ({ role: '', org: '', location: '', period: '', points: [''] });
export const emptyEducation = () => ({ qualification: '', institution: '', year: '', detail: '' });
export const emptyProject = () => ({ name: '', link: '', description: '', tech: '' });

export const emptyContent = (): CvContent => ({
  name: '',
  title: '',
  contact: { email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [emptyRole()],
  skills: [{ group: '', items: [] }],
  education: [emptyEducation()],
  certifications: [],
  languages: [],
  highlights: [],
  projects: [],
  extra: { heading: 'Volunteering', items: [] },
});

export const blankState = (): BuilderState => ({
  version: 1,
  layout: cvTemplates[0].id,
  accent: cvTemplates[0].defaultAccent,
  font: 'template',
  scale: 1,
  content: emptyContent(),
});

/** Starts the builder from one of the sample CVs, keeping the user's current style choices optional. */
export const fromSample = (cv: DemoCv): BuilderState => ({
  version: 1,
  layout: cv.layout,
  accent: cv.accent,
  font: 'template',
  scale: 1,
  content: structuredClone({
    name: cv.name,
    title: cv.title,
    contact: cv.contact,
    summary: cv.summary,
    experience: cv.experience,
    skills: cv.skills,
    education: cv.education,
    certifications: cv.certifications ?? [],
    languages: cv.languages ?? [],
    highlights: cv.highlights ?? [],
    projects: cv.projects ?? [],
    extra: cv.extra ?? { heading: 'Volunteering', items: [] },
  }),
});

/* ---------------------------------------------------------------- loading */

const str = (value: unknown, max = 2000) => (typeof value === 'string' ? value.slice(0, max) : '');
const arr = (value: unknown, max = 50): unknown[] => (Array.isArray(value) ? value.slice(0, max) : []);
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const HEX = /^#[0-9a-f]{6}$/i;
const PHOTO = /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i;

/**
 * Rebuilds a BuilderState from anything — localStorage or an uploaded backup
 * file — keeping only known fields of the right type and size. Returns null
 * when the input is not a CV at all.
 */
export function sanitize(raw: unknown): BuilderState | null {
  const input = obj(raw);
  const c = obj(input.content);
  if (!Object.keys(c).length) return null;

  const contact = obj(c.contact);
  const extra = obj(c.extra);
  const template = getTemplate(str(input.layout));
  const scale = typeof input.scale === 'number' ? input.scale : 1;
  const photo = str(c.photo, 400_000);

  return {
    version: 1,
    layout: template.id,
    accent: HEX.test(str(input.accent)) ? str(input.accent) : template.defaultAccent,
    font: input.font === 'sans' || input.font === 'serif' ? input.font : 'template',
    scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number.isFinite(scale) ? scale : 1)),
    content: {
      name: str(c.name, 120),
      title: str(c.title, 160),
      contact: {
        email: str(contact.email, 200),
        phone: str(contact.phone, 60),
        location: str(contact.location, 160),
        linkedin: str(contact.linkedin, 200),
        website: str(contact.website, 200),
      },
      summary: str(c.summary, 1500),
      experience: arr(c.experience, 20).map((j) => {
        const job = obj(j);
        return {
          role: str(job.role, 160),
          org: str(job.org, 160),
          location: str(job.location, 120),
          period: str(job.period, 60),
          points: arr(job.points, 15).map((p) => str(p, 400)),
        };
      }),
      skills: arr(c.skills, 12).map((g) => {
        const group = obj(g);
        return { group: str(group.group, 60), items: arr(group.items, 40).map((i) => str(i, 80)) };
      }),
      education: arr(c.education, 10).map((e) => {
        const ed = obj(e);
        return {
          qualification: str(ed.qualification, 200),
          institution: str(ed.institution, 200),
          year: str(ed.year, 40),
          detail: str(ed.detail, 200),
        };
      }),
      certifications: arr(c.certifications, 20).map((x) => str(x, 200)),
      languages: arr(c.languages, 12).map((x) => str(x, 80)),
      highlights: arr(c.highlights, 3).map((h) => {
        const item = obj(h);
        return { value: str(item.value, 20), label: str(item.label, 60) };
      }),
      projects: arr(c.projects, 12).map((p) => {
        const project = obj(p);
        return {
          name: str(project.name, 120),
          link: str(project.link, 300),
          description: str(project.description, 240),
          tech: str(project.tech, 120),
        };
      }),
      extra: {
        heading: str(extra.heading, 60) || 'Volunteering',
        items: arr(extra.items, 12).map((i) => {
          const item = obj(i);
          return { name: str(item.name, 160), detail: str(item.detail, 400) };
        }),
      },
      ...(PHOTO.test(photo) && { photo }),
    },
  };
}

/** True when the user has typed anything worth protecting from an overwrite. */
export const hasContent = (content: CvContent) =>
  Boolean(
    content.name.trim() ||
      content.summary.trim() ||
      content.experience.some((j) => j.role.trim() || j.points.some((p) => p.trim())),
  );

/** What the preview shows: placeholders for the two fields a CV cannot be without. */
export const withPlaceholders = (content: CvContent): CvContent => ({
  ...content,
  name: content.name.trim() || 'Your Name',
  title: content.title.trim() || (content.name.trim() ? content.title : 'Your target job title'),
});

export const fileNameFor = (content: CvContent, ext: string) =>
  `${(content.name.trim() || 'My').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}-CV.${ext}`;
