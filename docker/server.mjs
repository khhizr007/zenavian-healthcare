// Demo server for client previews: serves the static build with clean URLs, security headers,
// and DEMO form endpoints (/api/*) that accept submissions without storing or emailing anything.
// Production uses Cloudflare Pages Functions instead (see functions/ and docs/DEPLOY.md).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const PORT = Number(process.env.PORT ?? 8080);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean.endsWith('/') ? [join(clean, 'index.html')] : [clean, clean + '.html', join(clean, 'index.html')];
  for (const c of candidates) {
    const file = join(ROOT, c);
    if (!file.startsWith(ROOT)) continue;
    try { if ((await stat(file)).isFile()) return file; } catch { /* next */ }
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (url.pathname.startsWith('/api/')) {
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }).end(); return; }
    let size = 0; for await (const chunk of req) { size += chunk.length; if (size > 20000) { res.writeHead(413).end(); return; } }
    // Demo mode: nothing is stored or emailed, and no personal data is logged.
    console.log(`[demo] ${url.pathname} submission received`);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ ok: true }));
    return;
  }

  // Redirect trailing slash and .html to the clean URL (matches Cloudflare Pages behaviour)
  if (url.pathname.length > 1 && (url.pathname.endsWith('/') || url.pathname.endsWith('.html'))) {
    res.writeHead(308, { Location: url.pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/' }).end(); return;
  }

  const file = await resolveFile(url.pathname === '/' ? '/index.html' : url.pathname);
  const target = file ?? (await resolveFile('/404.html'));
  if (!target) { res.writeHead(404).end('Not found'); return; }
  const ext = extname(target);
  const cache = ['.woff2', '.js', '.css'].includes(ext) && target.includes('_astro') ? 'public, max-age=31536000, immutable' : 'public, max-age=300';
  res.writeHead(file ? 200 : 404, { ...SECURITY, 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': cache });
  res.end(await readFile(target));
}).listen(PORT, () => console.log(`ZenAvian demo site on http://localhost:${PORT}`));