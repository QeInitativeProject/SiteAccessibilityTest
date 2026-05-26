import type { FullConfig } from '@playwright/test';
import { ArtifactCleanup, CleanupPresets } from './src/main/Utils/ArtifactCleanup';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Setup - Runs once before all tests
 * Handles artifact cleanup and environment preparation
 */
async function globalSetup(_config: FullConfig) {
  console.log('\n🚀 Global Setup: Preparing test environment...\n');

  // Clean unnecessary folders from test-results (keep only logs and success-screenshots)
  cleanTestResultsFolder();

  // Clean playwright-report folder to ensure only HTML report files
  cleanPlaywrightReportFolder();

  // Determine environment
  const isCI = !!process.env.CI;
  const cleanupConfig = isCI ? CleanupPresets.CI : CleanupPresets.LOCAL;

  // Initialize cleanup utility
  const cleanup = new ArtifactCleanup(cleanupConfig);

  // Show retention policy
  console.log(cleanup.getRetentionInfo());
  console.log('');

  // Execute cleanup
  try {
    await cleanup.cleanup();
  } catch (error) {
    console.error('⚠️  Cleanup failed:', error);
    // Don't fail tests if cleanup fails
  }

  // Write Allure environment properties for rich reporting
  writeAllureEnvironment();

  console.log('✅ Global Setup Complete\n');
}

/**
 * Clean test-results folder to keep only logs and success-screenshots
 */
function cleanTestResultsFolder(): void {
  const testResultsDir = path.join(process.cwd(), 'test-results');
  
  if (!fs.existsSync(testResultsDir)) {
    return;
  }

  const allowedFolders = ['logs', 'success-screenshots'];
  const entries = fs.readdirSync(testResultsDir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip allowed folders
    if (allowedFolders.includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(testResultsDir, entry.name);
    
    try {
      if (entry.isDirectory()) {
        // Delete unwanted directory
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  🗑️  Removed: test-results/${entry.name}/`);
      } else {
        // Delete unwanted file
        fs.unlinkSync(fullPath);
        console.log(`  🗑️  Removed: test-results/${entry.name}`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Could not remove ${entry.name}: ${err}`);
    }
  }
}

/**
 * Clean playwright-report folder to ensure only HTML report files (no subfolders except data)
 */
function cleanPlaywrightReportFolder(): void {
  const reportDir = path.join(process.cwd(), 'playwright-report');
  
  if (!fs.existsSync(reportDir)) {
    return;
  }

  const entries = fs.readdirSync(reportDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(reportDir, entry.name);
    
    // Remove any subdirectories except 'data' folder (data folder stores failure videos)
    if (entry.isDirectory() && entry.name !== 'data') {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  🗑️  Removed: playwright-report/${entry.name}/`);
      } catch (err) {
        console.warn(`  ⚠️  Could not remove playwright-report/${entry.name}: ${err}`);
      }
    }
  }
}

/**
 * Write environment properties and categories for Allure reporting
 * This enables environment info display, graphs, and failure categorization
 */
function writeAllureEnvironment(): void {
  const allureResultsDir = path.join(process.cwd(), 'allure-results');

  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  // Environment properties - shown in Allure report overview
  const env = process.env.ENV || 'stage';
  const playwrightVersion = require('@playwright/test/package.json').version;
  const envProperties = [
    `Environment=${env.toUpperCase()}`,
    `Base.URL=${process.env.baseUrl || 'N/A'}`,
    `Browser=Chromium`,
    `Node.Version=${process.version}`,
    `OS=${process.platform}`,
    `Playwright.Version=${playwrightVersion}`,
  ].join('\n');

  fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), envProperties);
  console.log('  📊 Allure environment.properties written');

  // Executor info - shown in Allure report executor widget
  const executor = {
    name: process.env.CI ? 'CI Pipeline' : 'Local Machine',
    type: process.env.CI ? 'ci' : 'local',
    buildName: `${env.toUpperCase()} - Playwright ${playwrightVersion}`,
    buildOrder: Date.now(),
    reportName: `ATI UI Automation Report - ${env.toUpperCase()}`,
  };

  fs.writeFileSync(path.join(allureResultsDir, 'executor.json'), JSON.stringify(executor, null, 2));
  console.log('  📊 Allure executor.json written');

  // Categories - enables failure categorization in Allure graphs
  const categories = [
    {
      name: 'Product Defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*AssertionError.*|.*expect\\(.*',
    },
    {
      name: 'Timeout Issues',
      matchedStatuses: ['broken'],
      messageRegex: '.*Timeout.*|.*timeout.*|.*exceeded.*',
    },
    {
      name: 'Element Not Found',
      matchedStatuses: ['broken'],
      messageRegex: '.*not visible.*|.*not found.*|.*No element.*',
    },
    {
      name: 'Environment Issues',
      matchedStatuses: ['broken'],
      messageRegex: '.*ECONNREFUSED.*|.*net::ERR.*|.*Navigation.*',
    },
    {
      name: 'Skipped / Known Issues',
      matchedStatuses: ['skipped'],
    },
  ];

  fs.writeFileSync(path.join(allureResultsDir, 'categories.json'), JSON.stringify(categories, null, 2));
  console.log('  📊 Allure categories.json written');
}

export default globalSetup;
