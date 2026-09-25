/**
 * Turning what people type into safe, clickable links for a CV.
 *
 * Only mailto:, tel:, http: and https: are ever produced, so pasted text can
 * never become a javascript: or data: link. The visible text stays the
 * readable address itself (e.g. "linkedin.com/in/nimali"), because applicant
 * tracking systems read the words on the page, not a hidden hyperlink.
 */

const EMAIL = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

/** "linkedin.com/in/x", "www.x.lk" or "https://x.dev/" → "https://…", or null if it is not a web address. */
export function toWebUrl(value: string | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw || /\s/.test(raw)) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : /^[a-z][a-z0-9+.-]*:/i.test(raw) ? null : `https://${raw}`;
  if (!withScheme) return null;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    // Needs a real-looking host: at least one dot and a 2+ letter ending.
    if (!/\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Short display form of a URL: no scheme, no "www.", no trailing slash. */
export const displayUrl = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');

export const isEmail = (value: string | undefined) => EMAIL.test((value ?? '').trim());

export function toMailto(value: string | undefined): string | null {
  const email = (value ?? '').trim();
  return EMAIL.test(email) ? `mailto:${email}` : null;
}

/** A phone number with 7–15 digits, as a tel: link keeping a leading +. */
export function toTel(value: string | undefined): string | null {
  const raw = (value ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return `tel:${raw.startsWith('+') ? '+' : ''}${digits}`;
}

export type CvLink = { text: string; href: string | null; kind: 'location' | 'phone' | 'email' | 'web' };
