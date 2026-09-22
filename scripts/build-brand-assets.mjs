/**
 * Derives every brand asset the site serves from the master files in /brand.
 * Run with `npm run brand` after replacing a source file.
 *
 * Needs sharp, which is a dev-only dependency of this script rather than of the
 * site build: `npm install --no-save sharp && npm run brand`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const src = (f) => path.join(root, 'brand', f);
const out = (f) => path.join(root, 'public', f);

const NAVY = [15, 42, 74];
const TEAL = [20, 184, 166];
const LIGHT_TEAL = [94, 234, 212];
const WHITE = [255, 255, 255];

const distance = (p, c) =>
  (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;

/**
 * The master wordmark is navy type with a teal "Cv". For dark backgrounds the
 * navy has to become white while the teal stays exactly as it is, so each
 * visible pixel is snapped to its nearest brand colour and navy is swapped out.
 */
async function whiteWordmark() {
  const { data, info } = await sharp(src('logo-source.png'))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const px = [data[i], data[i + 1], data[i + 2]];
    const nearest = [NAVY, TEAL, LIGHT_TEAL].reduce((best, c) =>
      distance(px, c) < distance(px, best) ? c : best,
    );
    const replacement = nearest === NAVY ? WHITE : nearest;
    data[i] = replacement[0];
    data[i + 1] = replacement[1];
    data[i + 2] = replacement[2];
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

/** Minimal ICO container holding a single PNG frame (supported since IE/Vista). */
function icoFromPng(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width (0 means 256)
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // palette colours
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

async function ogImage(whiteLogo) {
  const width = 1200;
  const height = 630;

  const logo = await sharp(whiteLogo)
    .trim({ threshold: 1 })
    .resize({ width: 680 })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const text = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>
        .tagline { font-family: 'DejaVu Sans', sans-serif; font-size: 46px; font-weight: 700; fill: #FFFFFF; }
        .sub { font-family: 'DejaVu Sans', sans-serif; font-size: 27px; fill: #93B4D6; }
      </style>
      <text x="50%" y="430" text-anchor="middle" class="tagline">Get your CV and portfolio done right</text>
      <text x="50%" y="487" text-anchor="middle" class="sub">ATS-friendly CVs · Cover letters · LinkedIn · Portfolio sites</text>
      <rect x="470" y="536" width="260" height="6" rx="3" fill="#14B8A6" />
    </svg>`);

  return sharp({
    create: { width, height, channels: 4, background: '#0F2A4A' },
  })
    .composite([
      { input: logo, top: Math.round(230 - (logoMeta.height ?? 0) / 2), left: Math.round((width - 680) / 2) },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(out('brand'), { recursive: true });

  // Full-colour wordmark for light backgrounds.
  await sharp(src('logo-source.png'))
    .trim({ threshold: 1 })
    .resize({ height: 96 })
    .png({ compressionLevel: 9 })
    .toFile(out('brand/logo.png'));

  const white = await whiteWordmark();
  await sharp(white)
    .trim({ threshold: 1 })
    .resize({ height: 96 })
    .png({ compressionLevel: 9 })
    .toFile(out('brand/logo-white.png'));

  // App icon: the document mark on a navy rounded square.
  for (const size of [512, 192, 180]) {
    await sharp(src('icon-source.png'))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out(size === 512 ? 'icon.png' : size === 192 ? 'icon-192.png' : 'apple-icon.png'));
  }

  const favicon = await sharp(src('icon-source.png')).resize(48, 48).png().toBuffer();
  await writeFile(out('favicon.ico'), icoFromPng(favicon, 48));

  // Alternative "gm" monogram, kept for social avatars.
  await sharp(src('icon-monogram-source.png'))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(out('brand/icon-monogram.png'));

  await writeFile(out('og-image.png'), await ogImage(white));

  console.log('Brand assets written to /public');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
