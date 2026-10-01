import { test } from '@playwright/test';
import { AccessibilityUtility } from './accessibility.utility';

test.describe('ATI Accessibility & UI Test Suite', () => {

  test('ATI Homepage - Multi-Component Scope, Includes, Excludes & Annotations', async ({ page }, testInfo) => {
    const accessibility = new AccessibilityUtility(page, testInfo);
    await page.goto('https://www.atitesting.com', { waitUntil: 'domcontentloaded' });

    // Component-level scan using include and exclude selectors
    await accessibility.runAxeScan('ATI Public Homepage Scope Test', {
      includeSelectors: ['header', 'footer'],
      excludeSelectors: ['.third-party-widget', '#ad-banner'],
      disabledRules: [
        'color-contrast', 
        'aria-prohibited-attr', 
        'image-alt', 
        'link-name', 
        'aria-required-children', 
        'listitem', 
        'region',
        'landmark-unique'
      ],
    });
  });

  test('ATI Multi-Page Sitemap Dynamic Crawling', async ({ page }, testInfo) => {
    const accessibility = new AccessibilityUtility(page, testInfo);
    const atiRoutes = [
      'https://www.atitesting.com',
      'https://www.atitesting.com/contact',
      'https://www.atitesting.com/about',
    ];

    // Iterates dynamically through multiple pages
    await accessibility.scanSitemapUrls(atiRoutes, {
      disabledRules: [
        'color-contrast', 
        'aria-prohibited-attr', 
        'image-alt', 
        'link-name', 
        'landmark-unique',
        'region'
      ],
    });
  });

  test('ATI Login Flow, Tab Navigation & Interactive Focus Verification', async ({ page }, testInfo) => {
    const accessibility = new AccessibilityUtility(page, testInfo);
    
    // 1. Navigate directly to ATI Login Page
    await page.goto('https://user-management.atitesting.com/', { waitUntil: 'domcontentloaded' });

    // 2. Scan Pre-Login Page
    await accessibility.runAxeScan('ATI Login Page', {
      disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name', 'landmark-unique'],
    });

    // 3. Fill Credentials
    const usernameInput = page.getByLabel('USERNAME', { exact: false }).or(page.locator('input[type="text"]')).first();
    const passwordInput = page.getByLabel('PASSWORD', { exact: false }).or(page.locator('input[type="password"]')).first();

    await usernameInput.click();
    await usernameInput.fill("ashoksingh1995");
    
    await passwordInput.click();
    await passwordInput.fill("sweetFor(e98");

    // 4. Verify Keyboard Focus on Login Elements
    await accessibility.verifyKeyboardFocusableElements([
      'input[type="text"]',
      'input[type="password"]',
      'button.ua-submit',
    ]);

    // 5. Simulate sequential Tab Key presses
    await accessibility.testTabNavigation(3);

    // 6. Click Login & Wait for Navigation to Dashboard
    await Promise.all([
      page.waitForURL('**/student.atitesting.com/**', { timeout: 15000 }),
      page.locator('button.ua-submit', { hasText: 'Login' }).click(),
    ]);

    // 7. Post-Login Dashboard Accessibility Scan
    await accessibility.runAxeScan('ATI Student Dashboard', {
      disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name', 'region', 'landmark-unique'],
    });
  });

});