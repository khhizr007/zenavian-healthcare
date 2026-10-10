import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { pages } from '@/config/pages';
import { site } from '@/config/site';
import { getProducts } from '@/lib/products';

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await getProducts();
  return [
    ...Object.entries(pages).map(([key, p]) => ({
      params: { slug: key },
      props: { title: p.og, sub: site.tagline },
    })),
    ...products.map((p) => ({
      params: { slug: `products/${p.id}` },
      props: { title: p.data.name, sub: p.data.tagline },
    })),
  ];
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Wrap a title across at most 2 lines of ~22 chars */
function wrap(text: string, max = 24): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

export const GET: APIRoute = async ({ props }) => {
  const { title, sub } = props as { title: string; sub: string };
  const lines = wrap(title);
  const font = "font-family=\"'Plus Jakarta Sans', 'DejaVu Sans', Arial, Helvetica, sans-serif\"";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0F9FF"/><stop offset="1" stop-color="#E0F2FE"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>
<rect x="0" y="0" width="16" height="630" fill="#0284C7"/>
<g transform="translate(80 70) scale(1.5)"><path d="M24 4C13 4 6 13 6 24c0 10 8 18 18 18s18-8 18-18C42 13 35 4 24 4z" fill="#fff"/><path d="M24 8c-7 8-11 14-11 20a11 11 0 0 0 22 0c0-6-4-12-11-20z" fill="#0284C7"/><circle cx="31" cy="15" r="2.6" fill="#0A2A66"/></g>
<text x="160" y="118" ${font} font-size="38" font-weight="800" fill="#0A2A66">ZenAvian <tspan fill="#0369A1" font-weight="600">Healthcare</tspan></text>
${lines.map((l, i) => `<text x="80" y="${290 + i * 84}" ${font} font-size="72" font-weight="800" fill="#0A2A66">${esc(l)}</text>`).join('\n')}
<text x="80" y="570" ${font} font-size="30" fill="#475569">${esc(sub)}</text>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
