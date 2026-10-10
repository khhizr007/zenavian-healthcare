import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL is set in Cloudflare Pages env; falls back to the pages.dev origin until the domain is known.
const site = process.env.SITE_URL || process.env.URL || 'https://zenavian-healthcare.pages.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (p) => !p.includes('/catalogue-print') })],
  // assetsInlineLimit 0 keeps every script as an external file so the CSP needs no 'unsafe-inline' for scripts.
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: (file) => (file.endsWith('.css') ? undefined : false) },
  },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
