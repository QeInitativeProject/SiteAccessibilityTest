import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Get environment from ENV variable or default to 'prod'
const currentEnv = process.env.ENV || 'stage';

// Only load env if not already loaded
if (!process.env.baseUrl) {
  console.log(`🌍 Loading environment: ${currentEnv}`);
  const envPath = path.resolve(__dirname, `./src/ENV/.env.${currentEnv}`);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error(`❌ Failed to load environment file: ${envPath}`);
    throw result.error;
  }
  console.log(`✅ Environment loaded from: .env.${currentEnv}`);
} else {
  console.log(`✅ Using environment: ${currentEnv} (already loaded)`);
}

export default defineConfig({
  testDir: './src/test/TestScript',
  outputDir: './test-results',

  // ✅ Global setup: Cleanup old artifacts before test execution
  globalSetup: './global-setup.ts',

  // ✅ Enable parallel execution
  fullyParallel: false,

  forbidOnly: !!process.env.CI,
  // Retries only failed tests in CI (not the whole suite)
  retries: process.env.CI ? 1 : 0,

  // ✅ Workers for parallel execution
  workers: process.env.CI ? 4 : 1,


  preserveOutput: 'failures-only',

  // HTML report configuration - Only HTML report in playwright-report folder
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright'],
    ['./ci-reporter.ts'],
  ],

  timeout: 20 * 60000,

  expect: {
    timeout: 80000,
    toHaveScreenshot: { maxDiffPixels: 100 },
  },

  use: {
    navigationTimeout: 2 * 60000,
    actionTimeout: 3 * 60000,
    headless: process.env.CI ? true : false,
    ignoreHTTPSErrors: true,

    trace: 'retain-on-failure', // Only keeps trace for tests that ultimately fail (avoids allure ENOENT crash)
    screenshot: 'on', // Captures screenshots for all tests (pass and fail)
    video: 'off', // Disabled to reduce report size — use trace for debugging instead

    viewport: { width: 1680, height: 1050 },
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--window-size=1680,1050',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1680, height: 1050 },
        deviceScaleFactor: undefined,
      
      },
    },
  ],
});
