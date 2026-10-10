// Demo-only form endpoint for client previews on Netlify. Nothing is stored or emailed.
// For production use the Cloudflare Pages Functions in /functions (see docs/DEPLOY.md).
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  const body = await req.text();
  if (body.length > 20000) return new Response(JSON.stringify({ ok: false, error: 'Request too large' }), { status: 413 });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};