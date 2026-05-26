const fs = require('fs');
const path = require('path');

/**
 * Script to delete old Playwright test artifacts
 * Cleans up test-results, playwright-report, and other artifact directories
 */

const artifactDirs = [
  'test-results',
  'playwright-report',
  'test-results/Failed_screenshots',
  'test-results/logs',
  'allure-report',
  'allure-results'
];

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✓ Deleted: ${dirPath}`);
    } catch (error) {
      console.error(`✗ Error deleting ${dirPath}:`, error.message);
    }
  } else {
    console.log(`⊘ Directory not found (skipping): ${dirPath}`);
  }
}

console.log('\n🧹 Cleaning up old Playwright artifacts...\n');

artifactDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  deleteDirectory(fullPath);
});

console.log('\n✓ Cleanup complete!\n');
