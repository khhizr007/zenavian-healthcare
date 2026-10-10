/// <reference types="@cloudflare/workers-types" />
import type { ZodTypeAny } from 'zod';
import { site } from '../../src/config/site';
import type { FormKind } from '../../src/lib/schemas';

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  NOTIFY_EMAIL: string;
  /** e.g. "ZenAvian Healthcare <noreply@yourdomain.in>" (domain must be verified in Resend) */
  FROM_EMAIL: string;
  /** Local dev only: "1" skips Turnstile. Never set in production. */
  ALLOW_NO_TURNSTILE?: string;
  RATE_LIMIT_SALT?: string;
}

const MAX_BODY = 20_000;
const RATE_MAX = 5; // submissions
const RATE_WINDOW_SEC = 600; // per 10 minutes, per IP

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const escapeHtml = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Single-line value safe for email subjects/headers */
const oneLine = (s: unknown) =>
  String(s ?? '')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 120);

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function rateLimited(env: Env, ip: string): Promise<boolean> {
  const key = await sha256(`${env.RATE_LIMIT_SALT ?? 'zenavian'}:${ip}`); // raw IPs are never stored
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_WINDOW_SEC;
  await env.DB.prepare('DELETE FROM rate_limit WHERE ts < ?').bind(windowStart).run();
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM rate_limit WHERE ip_hash = ? AND ts >= ?',
  )
    .bind(key, windowStart)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= RATE_MAX) return true;
  await env.DB.prepare('INSERT INTO rate_limit (ip_hash, ts) VALUES (?, ?)').bind(key, now).run();
  return false;
}

async function verifyTurnstile(env: Env, token: string, ip: string): Promise<boolean> {
  if (env.ALLOW_NO_TURNSTILE === '1') return true;
  if (!env.TURNSTILE_SECRET || !token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean };
  return out.success === true;
}

async function sendEmail(
  env: Env,
  msg: { to: string; subject: string; html?: string; text: string; replyTo?: string },
): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      reply_to: msg.replyTo,
    }),
  });
  return res.ok;
}

const LABELS: Record<string, string> = {
  fullName: 'Name',
  company: 'Company / firm',
  businessType: 'Business type',
  state: 'State',
  city: 'District / City',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  email: 'Email',
  existingBusiness: 'Existing business',
  products: 'Products of interest',
  message: 'Message',
  subject: 'Subject',
  product: 'Product',
  batch: 'Batch number',
};
const TITLES: Record<FormKind, string> = {
  enquiry: 'Distributor / business enquiry',
  contact: 'Website contact message',
  adverse: 'ADVERSE EVENT / feedback report',
};

function notificationEmail(kind: FormKind, data: Record<string, unknown>) {
  const rows = Object.keys(LABELS).filter(
    (k) =>
      data[k] !== undefined &&
      data[k] !== '' &&
      !(Array.isArray(data[k]) && (data[k] as unknown[]).length === 0),
  );
  const val = (k: string) =>
    Array.isArray(data[k]) ? (data[k] as string[]).join(', ') : String(data[k]);
  const html = `<h2 style="font-family:Arial">${escapeHtml(TITLES[kind])}</h2><table cellpadding="8" style="border-collapse:collapse;font-family:Arial;font-size:14px">${rows
    .map(
      (k) =>
        `<tr><td style="border:1px solid #BAE6FD;background:#F0F9FF"><b>${escapeHtml(LABELS[k])}</b></td><td style="border:1px solid #BAE6FD;white-space:pre-wrap">${escapeHtml(val(k))}</td></tr>`,
    )
    .join('')}</table>`;
  const text = `${TITLES[kind]}\n\n${rows.map((k) => `${LABELS[k]}: ${val(k)}`).join('\n')}`;
  return { html, text };
}

export function makeHandler(kind: FormKind, schema: ZodTypeAny) {
  return async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
    // Same-origin only
    const origin = request.headers.get('Origin');
    if (origin && new URL(origin).host !== new URL(request.url).host)
      return json({ ok: false, error: 'Forbidden' }, 403);
    if (!(request.headers.get('Content-Type') ?? '').includes('application/json'))
      return json({ ok: false, error: 'Unsupported request' }, 415);

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, error: 'Request too large' }, 413);
    let input: unknown;
    try {
      input = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: 'Invalid request' }, 400);
    }

    // Honeypot: pretend success so bots learn nothing
    if (
      typeof (input as { website?: unknown })?.website === 'string' &&
      (input as { website: string }).website !== ''
    )
      return json({ ok: true });

    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
      return json({ ok: false, error: 'Please check the highlighted fields.', fields }, 422);
    }
    const data = parsed.data as Record<string, unknown> & {
      turnstileToken?: string;
      email: string;
      fullName: string;
    };

    const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
    if (!env.DB)
      return json(
        { ok: false, error: 'Service is not configured. Please contact us directly.' },
        500,
      );
    if (await rateLimited(env, ip))
      return json({ ok: false, error: 'Too many submissions. Please try again later.' }, 429);
    if (!(await verifyTurnstile(env, data.turnstileToken ?? '', ip)))
      return json({ ok: false, error: 'Spam check failed. Please reload and try again.' }, 400);

    const {
      turnstileToken: _t,
      website: _w,
      consent: _c,
      ...clean
    } = data as Record<string, unknown>;
    void _t;
    void _w;
    void _c;

    // 1) Store a backup copy first
    let id: number | null = null;
    try {
      const r = await env.DB.prepare(
        'INSERT INTO submissions (kind, payload, created_at) VALUES (?, ?, ?)',
      )
        .bind(kind, JSON.stringify(clean), new Date().toISOString())
        .run();
      id = (r.meta?.last_row_id as number) ?? null;
    } catch {
      return json({ ok: false, error: 'Could not save your submission. Please try again.' }, 500);
    }

    // 2) Notify the company, then confirm to the submitter
    const n = notificationEmail(kind, clean);
    const subjectTail =
      kind === 'enquiry'
        ? `${oneLine(clean.company)} (${oneLine(clean.city)})`
        : kind === 'contact'
          ? oneLine(clean.subject)
          : oneLine(clean.product);
    const notified = await sendEmail(env, {
      to: env.NOTIFY_EMAIL,
      subject: `[Website] ${TITLES[kind]}: ${subjectTail}`,
      html: n.html,
      text: n.text,
      replyTo: String(clean.email),
    });
    let confirmed = false;
    if (notified) {
      confirmed = await sendEmail(env, {
        to: String(clean.email),
        subject: `We received your message - ${site.name}`,
        text: `Dear ${oneLine(clean.fullName)},\n\nThank you for contacting ${site.name}. We have received your message and will get back to you ${site.enquiryReplyTime}.\n\n${site.tagline}\n${site.name}`,
      });
    }
    if (id !== null) {
      try {
        await env.DB.prepare('UPDATE submissions SET email_status = ? WHERE id = ?')
          .bind(notified ? (confirmed ? 'sent' : 'notified') : 'failed', id)
          .run();
      } catch {
        /* non-fatal */
      }
    }
    // The submission is safely stored even if email failed; do not expose provider errors to the visitor.
    return json({ ok: true });
  };
}
