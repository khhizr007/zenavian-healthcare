import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
export default [
  { ignores: ['dist', '.astro', 'node_modules', '.wrangler', 'public', 'scripts'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
