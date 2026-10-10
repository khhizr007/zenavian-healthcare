# Deploying to Cloudflare Pages

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git. Framework preset: Astro. Build command `npm run build`, output `dist`. Node 22.
3. Environment variables (Settings > Environment variables, Production): `SITE_URL` (https://www.yourdomain), `PUBLIC_TURNSTILE_SITE_KEY`, and secrets `RESEND_API_KEY`, `TURNSTILE_SECRET`, `NOTIFY_EMAIL`, `FROM_EMAIL`, `RATE_LIMIT_SALT`. Never set `ALLOW_NO_TURNSTILE` in production. See `.env.example`.
4. Turnstile: Cloudflare > Turnstile > Add widget for your domain; copy site key + secret.
5. D1: `npx wrangler d1 create zenavian-enquiries`, paste the id into `wrangler.toml`, then `npx wrangler d1 migrations apply zenavian-enquiries --remote`. In the Pages project: Settings > Bindings > D1 database, variable name `DB`.
6. Custom domain: Pages project > Custom domains > add `www.yourdomain` (SSL is automatic). Add a Redirect Rule (Rules > Redirect Rules) from the apex to www (or the reverse) with a 301. Enable "Always Use HTTPS".
7. Analytics: Cloudflare Web Analytics (cookieless). Put the token in `site.analytics.cloudflareToken`.
8. Update `site.domain` in `src/config/site.ts`, redeploy, then follow docs/SEO-LAUNCH.md.