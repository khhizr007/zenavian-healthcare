import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Test-only embed URL so the click-to-load map button renders (real URL comes from src/config/site.ts).
    env: { PUBLIC_MAP_EMBED_URL: 'https://www.google.com/maps/embed?pb=test' },
  },
});
