# ZenAvian Healthcare website

Astro 5 (static) + TypeScript + Tailwind 4. Deploys to Cloudflare Pages (forms via Pages Functions, Turnstile, Resend, D1).

## Show it to the client (Docker demo)

```bash
docker compose up --build
```

Open http://localhost:8080. Forms work in **demo mode** (they show the success message but nothing is stored or emailed). Real form delivery runs on Cloudflare Pages (docs/DEPLOY.md).

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check:placeholders   # lists every TODO_CLIENT value, writes docs/CLIENT-TODO.md
npm run build:catalogue      # regenerates the catalogue PDF (needs: npx playwright install chromium)
```

Where things live: `src/config/site.ts` (company facts), `src/config/pages.ts` (titles/descriptions), `src/config/solutions.ts` (Solutions page copy),
`src/content/products/*.json` (products), `src/pages/*` (page copy), `functions/` (form endpoints), `docs/` (guides).

Tests (optional, not required to run the demo): `npm test` (Playwright e2e + axe). Lighthouse config is in `lighthouserc.json`.
Windows note: if builds produce unstyled pages, the project folder is on a virtualised path; build from a normal path such as `C:\dev\zenavian`.