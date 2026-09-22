import { z } from 'zod';
import { addOns, packages } from '@/content/pricing';

const packageIds = packages.map((p) => p.id) as [string, ...string[]];
const addOnIds = addOns.map((a) => a.id) as [string, ...string[]];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const stepOneSchema = z.object({
  packageId: z.enum(packageIds, { required_error: 'Choose a package' }),
  addOnIds: z.array(z.enum(addOnIds)).default([]),
});

export const stepTwoSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(9, 'Enter a phone or WhatsApp number')
    .regex(/^[0-9+\-\s()]+$/, 'Numbers, spaces, + and - only'),
  location: z.string().trim().min(2, 'City or country helps us with timing'),
});

export const stepThreeSchema = z.object({
  role: z.string().trim().min(2, 'What role are you targeting?'),
  experience: z.string().min(1, 'Pick your experience level'),
  industry: z.string().trim().min(2, 'Which industry?'),
  notes: z.string().trim().max(2000, 'Keep notes under 2000 characters').optional().default(''),
});

export const stepFourSchema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the privacy notice to continue' }),
  }),
  // Honeypot: real people never see or fill this field.
  company: z.string().max(0).optional().default(''),
});

export const orderSchema = stepOneSchema
  .merge(stepTwoSchema)
  .merge(stepThreeSchema)
  .merge(stepFourSchema);

export type OrderValues = z.infer<typeof orderSchema>;

export const experienceLevels = [
  'Student or fresh graduate',
  '1–3 years',
  '4–7 years',
  '8–15 years',
  '15+ years',
];

export const validateUpload = (file: File): string | null => {
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name} is larger than 5 MB`;
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) return `${file.name} must be a PDF, Word file or image`;
  return null;
};
