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

export default globalSetup;
