/**
 * Renders the real sample pages into the images and PDFs the gallery uses, so
 * a preview is always a picture of the actual template rather than a mock-up.
 *
 *   npm run build
 *   npm install --no-save playwright
 *   npm run previews
 *
 * For every CV in content/cvs.ts it writes, to public/samples/:
 *   cv-<slug>.jpg          card thumbnail (the A4 sheet at 1x)
 *   cv-<slug>-full.jpg     full-size preview for the lightbox (2x, crisp text)
 *   cv-<slug>.pdf          the downloadable one-page PDF
 * and for every portfolio in content/portfolios.ts:
 *   portfolio-<slug>.jpg       the first screen, 1280 × 800 (card thumbnail)
 *   portfolio-<slug>-full.jpg  the whole page (lightbox)
 *
 * It also fails if any CV spills past its A4 page, so an over-long edit to
 * content/cvs.ts is caught here rather than by a client.
 *
 * Playwright is deliberately not a project dependency, for the same reason
 * `sharp` is not (see README). Set CHROMIUM_PATH to use an existing browser.
 */
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out');
const samplesDir = path.join(root, 'public', 'samples');

/** Slugs are read from the exported site, so this script never drifts from content/. */
async function slugsUnder(route) {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(path.join(outDir, route), { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

/** Minimal static server over ./out, resolving /route/ to /route/index.html. */
function serve() {
  const server = createServer(async (req, res) => {
    let file = path.join(outDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Samples are shown as the client receives them, without our banner on top.
  await page.addStyleTag({ content: '[data-demo-banner]{display:none!important}' });
}

try {
  await stat(outDir);
} catch {
  console.error('No ./out folder — run `npm run build` first.');
  process.exit(1);
}

await mkdir(samplesDir, { recursive: true });
const server = await serve();
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

const cvSlugs = await slugsUnder('cv');
const portfolioSlugs = await slugsUnder('portfolio');
const overflowing = [];

for (const scale of [1, 2]) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
    deviceScaleFactor: scale,
    colorScheme: 'light',
  });
  const page = await context.newPage();

  for (const slug of cvSlugs) {
    await page.goto(`${base}/cv/${slug}/`);
    await settle(page);
    // .first(): the page also holds an off-screen copy used for the ATS panel.
    const sheet = page.locator('[data-cv-sheet]').first();

    if (scale === 1) {
      // Any text below the footer line means the CV no longer fits one page.
      const spill = await sheet.evaluate((el) => {
        const limit = el.getBoundingClientRect().top + el.clientHeight - 30;
        let worst = 0;
        for (const node of el.querySelectorAll('p, li, h1, h2, h3, dd, dt')) {
          if (node.closest('[data-cv-footer]')) continue;
          worst = Math.max(worst, node.getBoundingClientRect().bottom - limit);
        }
        return Math.round(worst);
      });
      if (spill > 0) overflowing.push(`${slug} (+${spill}px)`);

      await page.pdf({
        path: path.join(samplesDir, `cv-${slug}.pdf`),
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
    }

    await sheet.screenshot({
      path: path.join(samplesDir, scale === 1 ? `cv-${slug}.jpg` : `cv-${slug}-full.jpg`),
      type: 'jpeg',
      quality: scale === 1 ? 82 : 80,
    });
  }

  if (scale === 1) {
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const slug of portfolioSlugs) {
      await page.goto(`${base}/portfolio/${slug}/`);
      await settle(page);
      await page.screenshot({ path: path.join(samplesDir, `portfolio-${slug}.jpg`), type: 'jpeg', quality: 82 });
      await page.screenshot({
        path: path.join(samplesDir, `portfolio-${slug}-full.jpg`),
        type: 'jpeg',
        quality: 72,
        fullPage: true,
      });
    }
  }

  await context.close();
}

await browser.close();
server.close();

console.log(`Wrote previews for ${cvSlugs.length} CVs and ${portfolioSlugs.length} portfolios`);
if (overflowing.length) {
  console.error(`These CVs run past one A4 page: ${overflowing.join(', ')}`);
  process.exit(1);
}
