import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx';
import type { BuilderState } from './model';

/**
 * Builds an editable Word document from the builder's content.
 *
 * Deliberately a single column with real Word headings and bullet lists, and
 * no text boxes, tables or images: the most reliable shape for applicant
 * tracking systems and for the recruiter who opens it in Word. The accent
 * colour and font choice carry over; the photo does not (most ATS guidance
 * advises against photos in the Word version).
 *
 * This module is loaded on demand, so the docx library never weighs on the
 * builder's first load.
 */
export async function buildDocx(state: BuilderState): Promise<Blob> {
  const { content: cv } = state;
  const accent = state.accent.replace('#', '').toUpperCase();
  const font = state.font === 'serif' || (state.font === 'template' && state.layout === 'classic') ? 'Georgia' : 'Calibri';
  const filled = (s?: string) => Boolean(s && s.trim());

  const children: Paragraph[] = [];

  const heading = (text: string) =>
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 100 },
        border: { bottom: { color: accent, space: 2, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, color: accent, size: 22, characterSpacing: 30 })],
      }),
    );

  const bullet = (text: string) =>
    children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun(text)] }));

  // Name, title, contact line
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 60 },
      children: [new TextRun({ text: cv.name || 'Your Name', bold: true, size: 48, color: '0F172A' })],
    }),
  );
  if (filled(cv.title)) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: cv.title, bold: true, color: accent, size: 24 })],
      }),
    );
  }
  const contact = [cv.contact.location, cv.contact.phone, cv.contact.email, cv.contact.linkedin].filter(filled);
  if (contact.length) {
    children.push(
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: contact.join('  |  '), color: '475569', size: 19 })] }),
    );
  }

  if (filled(cv.summary)) {
    heading('Profile');
    children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun(cv.summary.trim())] }));
  }

  const highlights = (cv.highlights ?? []).filter((h) => filled(h.value));
  if (highlights.length) {
    heading('Key achievements');
    highlights.forEach((h) => bullet(`${h.value}${filled(h.label) ? ` — ${h.label}` : ''}`));
  }

  const jobs = cv.experience.filter((j) => filled(j.role) || filled(j.org) || j.points.some(filled));
  if (jobs.length) {
    heading('Experience');
    jobs.forEach((job) => {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: job.role, bold: true, size: 23 }),
            ...(filled(job.period) ? [new TextRun({ text: `\t${job.period}`, color: '64748B', size: 20 })] : []),
          ],
        }),
      );
      const where = [job.org, job.location].filter(filled).join(', ');
      if (where) {
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: where, color: accent, size: 20 })] }));
      }
      job.points.filter(filled).forEach((p) => bullet(p.trim()));
    });
  }

  const extraItems = (cv.extra?.items ?? []).filter((i) => filled(i.name) || filled(i.detail));
  if (extraItems.length) {
    heading(cv.extra?.heading || 'Additional');
    extraItems.forEach((item) =>
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({ text: item.name, bold: true }),
            ...(filled(item.name) && filled(item.detail) ? [new TextRun(' — ')] : []),
            new TextRun(item.detail),
          ],
        }),
      ),
    );
  }

  const skills = cv.skills.map((s) => ({ ...s, items: s.items.filter(filled) })).filter((s) => s.items.length);
  if (skills.length) {
    heading('Skills');
    skills.forEach((s) =>
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            ...(filled(s.group) ? [new TextRun({ text: `${s.group}: `, bold: true })] : []),
            new TextRun(s.items.join(', ')),
          ],
        }),
      ),
    );
  }

  const schools = cv.education.filter((e) => filled(e.qualification) || filled(e.institution));
  if (schools.length) {
    heading('Education');
    schools.forEach((ed) => {
      children.push(
        new Paragraph({
          spacing: { before: 80 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: ed.qualification, bold: true }),
            ...(filled(ed.year) ? [new TextRun({ text: `\t${ed.year}`, color: '64748B', size: 20 })] : []),
          ],
        }),
      );
      const sub = [ed.institution, ed.detail].filter(filled).join(' · ');
      if (sub) children.push(new Paragraph({ children: [new TextRun({ text: sub, color: '475569' })] }));
    });
  }

  const certs = (cv.certifications ?? []).filter(filled);
  if (certs.length) {
    heading('Certifications');
    certs.forEach((c) => bullet(c));
  }

  const langs = (cv.languages ?? []).filter(filled);
  if (langs.length) {
    heading('Languages');
    children.push(new Paragraph({ children: [new TextRun(langs.join('  ·  '))] }));
  }

  const doc = new Document({
    creator: cv.name || 'GetMyCv CV builder',
    title: `${cv.name || 'My'} CV`,
    description: 'Created with the GetMyCv CV builder',
    styles: {
      default: {
        document: { run: { font, size: 21, color: '334155' }, paragraph: { spacing: { line: 276 } } },
        title: { run: { font } },
        heading2: { run: { font } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twentieths of a point
            margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
