/**
 * Placeholder preview cards for the portfolio page, so the layout is real before
 * the first client demos exist. Delete a file here once you drop in a real
 * screenshot with the same name.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve(import.meta.dirname, '..', 'public', 'samples');

const NAVY = '#0F2A4A';
const TEAL = '#14B8A6';

const portfolio = (label) => `
  <rect x="40" y="40" width="560" height="60" rx="12" fill="${NAVY}" opacity="0.08"/>
  <circle cx="72" cy="70" r="12" fill="${TEAL}"/>
  <rect x="96" y="62" width="120" height="16" rx="8" fill="${NAVY}" opacity="0.35"/>
  <rect x="440" y="60" width="140" height="20" rx="10" fill="${TEAL}" opacity="0.8"/>
  <rect x="40" y="124" width="300" height="26" rx="8" fill="${NAVY}" opacity="0.75"/>
  <rect x="40" y="164" width="380" height="14" rx="7" fill="${NAVY}" opacity="0.25"/>
  <rect x="40" y="188" width="320" height="14" rx="7" fill="${NAVY}" opacity="0.25"/>
  <rect x="40" y="232" width="170" height="120" rx="12" fill="${NAVY}" opacity="0.12"/>
  <rect x="235" y="232" width="170" height="120" rx="12" fill="${TEAL}" opacity="0.18"/>
  <rect x="430" y="232" width="170" height="120" rx="12" fill="${NAVY}" opacity="0.12"/>
  <text x="40" y="392" font-family="sans-serif" font-size="20" font-weight="700" fill="${NAVY}">${label}</text>`;

const cv = (label) => `
  <rect x="150" y="30" width="340" height="340" rx="10" fill="#FFFFFF" stroke="${NAVY}" stroke-opacity="0.15"/>
  <rect x="180" y="62" width="180" height="22" rx="6" fill="${NAVY}" opacity="0.8"/>
  <rect x="180" y="94" width="120" height="12" rx="6" fill="${TEAL}"/>
  <rect x="180" y="130" width="280" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="148" width="250" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="182" width="90" height="11" rx="5" fill="${NAVY}" opacity="0.55"/>
  <rect x="180" y="204" width="280" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="222" width="265" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="240" width="200" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="276" width="90" height="11" rx="5" fill="${NAVY}" opacity="0.55"/>
  <rect x="180" y="298" width="280" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <rect x="180" y="316" width="230" height="9" rx="4.5" fill="${NAVY}" opacity="0.2"/>
  <text x="150" y="392" font-family="sans-serif" font-size="20" font-weight="700" fill="${NAVY}">${label}</text>`;

const files = [
  ['portfolio-software', 'Software portfolio', portfolio],
  ['portfolio-marketing', 'Marketing portfolio', portfolio],
  ['portfolio-engineering', 'Engineering portfolio', portfolio],
  ['cv-accounting', 'Accounting CV', cv],
  ['cv-healthcare', 'Healthcare CV', cv],
  ['cv-graduate', 'Graduate CV', cv],
];

await mkdir(outDir, { recursive: true });

for (const [name, label, render] of files) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400" role="img" aria-label="${label} preview">
  <rect width="640" height="400" fill="#F8FAFC"/>
  ${render(label)}
</svg>`;
  await writeFile(path.join(outDir, `${name}.svg`), svg);
}

console.log(`Wrote ${files.length} sample placeholders`);
