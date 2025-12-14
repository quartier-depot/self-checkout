import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  // Store snapshots next to the spec, but do NOT add -darwin/-linux suffixes
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  expect: {
    timeout: 5_000,
},
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1366, height: 768 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx dotenvx run -f .env.playwright -- npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
  reporter: [
    ['junit', { outputFile: 'playwright-results.xml' }],
    [process.env.CI ? 'github' : 'list'],
  ]
});
