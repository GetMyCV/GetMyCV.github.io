/**
 * Human-readable order reference, e.g. GMC-2026-0042.
 * The random block keeps references unguessable without a server sequence.
 */
export const createReference = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `GMC-${year}-${random}`;
};
