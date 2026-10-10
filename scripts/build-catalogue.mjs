// Generates public/downloads/ZenAvian-Healthcare-Catalogue.pdf from /catalogue-print (A4) using Playwright.
// Usage: npm run build:catalogue   (needs: npx playwright install chromium). Commit the resulting PDF.
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from '@playwright/test';

const run = (c) => execSync(c, { stdio: 'inherit', shell: true });
run('npx astro build');

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index';
  let file = join('dist', p);
  if (!extname(file)) file += '.html';
  if (!existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res
    .writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    .end(readFileSync(file));
});
await new Promise((r) => server.listen(4399, r));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4399/catalogue-print', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
mkdirSync('public/downloads', { recursive: true });
await page.pdf({
  path: 'public/downloads/ZenAvian-Healthcare-Catalogue.pdf',
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
server.close();
console.log('Catalogue PDF written. Rebuilding so the size/version shows on the catalogue page...');
run('npx astro build');
