// Post-build: if a client-supplied catalogue exists, serve it at the canonical catalogue URL.
import { copyFileSync, existsSync, rmSync } from 'node:fs';
const override = 'public/downloads/override/catalogue.pdf';
if (existsSync(override)) {
  copyFileSync(override, 'dist/downloads/ZenAvian-Healthcare-Catalogue.pdf');
  console.log('Using client-supplied catalogue PDF override.');
}
rmSync('dist/downloads/override', { recursive: true, force: true });
