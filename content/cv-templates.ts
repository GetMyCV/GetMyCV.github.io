import type { CvLayout } from './cvs';

export type CvTemplate = {
  id: CvLayout;
  name: string;
  description: string;
  /** Whether the layout has a place for a photo. */
  photo: boolean;
  defaultAccent: string;
};

/** The templates offered in the CV builder, in the order they are shown. */
export const cvTemplates: CvTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Tinted sidebar for contact and skills, headline numbers up top.',
    photo: true,
    defaultAccent: '#0B7A70',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Centred serif name and ruled sections. The safest choice for any employer.',
    photo: false,
    defaultAccent: '#1D4ED8',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'A bold colour band that puts your three biggest results first.',
    photo: true,
    defaultAccent: '#B4235A',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Quiet and precise: section labels in a margin, lots of white space.',
    photo: false,
    defaultAccent: '#334155',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Dark sidebar with your photo, for a confident, polished first look.',
    photo: true,
    defaultAccent: '#0F2A4A',
  },
];

/**
 * Accent swatches. Each is dark enough for AA contrast as text on white and as
 * a background behind white text, which every layout relies on.
 */
export const accentSwatches = [
  '#0F2A4A',
  '#0B7A70',
  '#1D4ED8',
  '#6D28D9',
  '#B4235A',
  '#B45309',
  '#0E7490',
  '#334155',
];

export const getTemplate = (id: string) => cvTemplates.find((t) => t.id === id) ?? cvTemplates[0];
