# Content guide

- **Company details** (phone, WhatsApp, email, address, map, social, GST/CIN, hours): edit `src/config/site.ts`. Replace every `TODO_CLIENT:...` value. Run `npm run check:placeholders` to see what is left. Items with TODO values are hidden from visitors automatically.
- **Page text**: Home `src/pages/index.astro`, About `src/pages/about.astro`, Quality `src/pages/quality-manufacturing.astro`, Solutions + FAQ `src/config/solutions.ts`, legal `src/pages/privacy-policy|terms|disclaimer.astro`.
- **SEO titles/descriptions** (under 60 / 160 characters): `src/config/pages.ts`.
- **Add or edit a product**: copy `src/content/products/cox-zen.json` to `<new-slug>.json`, edit the fields and `order`. The page, card, filter, catalogue table and sitemap update automatically. Set composition, dosage, withdrawalPeriod, packSizes, dosageForm, storage only with text approved on the label; leave `null` otherwise (the site then shows the label-reference text). Never list viral diseases as indications.
- **Product image**: save `public/images/products/<slug>.webp` (800x600). It is picked up automatically; otherwise a neutral placeholder shows.
- **Logo**: replace `public/brand/logo.svg` and `public/brand/mark.svg` (and `public/favicon.svg`).
- **Catalogue PDF**: regenerate with `npm run build:catalogue` from the product data, or drop your own at `public/downloads/override/catalogue.pdf` and it is served instead. Update version/date in `site.catalogue`.
- **Optional sections**: `site.about` (founder message, year, team), `site.certifications`, `site.stats` stay hidden until filled with real data.
- **Redeploy**: commit and push (Cloudflare Pages rebuilds), or `docker compose up --build` for the demo.