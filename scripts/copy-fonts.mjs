import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('public/fonts', { recursive: true });
copyFileSync(
  'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  'public/fonts/inter-latin.woff2',
);
copyFileSync(
  'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  'public/fonts/plus-jakarta-sans-latin.woff2',
);
console.log('Fonts copied (latin subset, WOFF2).');
