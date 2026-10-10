import type { APIRoute } from 'astro';
import { origin } from '@/config/site';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /catalogue-print\nDisallow: /api/\n\nSitemap: ${origin()}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
