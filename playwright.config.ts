import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Get environment from ENV variable or default to 'prod'
const currentEnv = process.env.ENV || 'stage';
const viewportWidth = 1920;
const viewportHeight = 1200;

// Only load env if not already loaded
if (!process.env.baseUrl) {
  console.log(`🌍 Loading environment: ${currentEnv}`);
  const envPath = path.resolve(__dirname, `./src/ENV/.env.${currentEnv}`);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(
      `⚠️  Could not load environment file: ${envPath}\n` +
        `   Copy src/ENV/.env.example to src/ENV/.env.${currentEnv} and set your values, ` +
        `or pass variables via the shell/CI. Continuing with existing process.env.`
    );
  } else {
    console.log(`✅ Environment loaded from: .env.${currentEnv}`);
  }
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
 // retries: process.env.CI ? 1 : 0,
  retries: 0,

  // ✅ Workers for parallel execution
  workers: process.env.CI ? 4 : 1,


  preserveOutput: 'failures-only',

  // HTML report configuration - Only HTML report in playwright-report folder
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    
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
    viewport: { width: viewportWidth, height: viewportHeight },
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        `--window-size=${viewportWidth},${viewportHeight}`,
        '--force-device-scale-factor=1',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: viewportWidth, height: viewportHeight },
        deviceScaleFactor: undefined,
      
      },
    },
  ],
});
