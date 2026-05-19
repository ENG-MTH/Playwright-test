import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Shared snapshot directory — both baseline and regression spec files reference the same images
  snapshotDir: './tests/visual/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{arg}-{projectName}-{platform}{ext}',

  // Run tests sequentially to avoid flakiness on a shared demo site
  fullyParallel: false,

  // Fail the build on CI if test.only is accidentally left in
  forbidOnly: !!process.env.CI,

  // Retry failing tests twice on CI, no retries locally
  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    // Primary HTML report with screenshots and traces
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Console output for immediate feedback
    ['list'],
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',

    // Capture evidence only when a test fails
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    // Set SLOWMO=800 (ms) to slow down actions for demo / debugging
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Store test artifacts here
  outputDir: 'test-results/',
});
