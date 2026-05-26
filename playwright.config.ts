import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Load environment variables based on ENV
 */
const env = process.env.ENV || 'stage';
dotenv.config({ path: path.resolve(__dirname, `src/ENV/.env.${env}`) });

export default defineConfig({
  testDir: './src/test/TestScript',
  tsconfig: './tsconfig.json',
  globalSetup: './global-setup.ts',
  timeout: 300000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright'],
  ],
  use: {
    baseURL: process.env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : !(process.env.HEADED === 'true'),
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'smoke',
      testDir: './src/test/TestScript/Smoke-Stage',
      grep: /@smoke/,
    },
    {
      name: 'regression',
      testDir: './src/test/TestScript/Regression',
      grep: /@regression/,
    },
    {
      name: 'sanity',
      testDir: './src/test/TestScript/Sanity-Prod',
      grep: /@sanity/,
    },
  ],
});
