# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Axe_Core_Test.spec.ts >> ATI Testing Accessibility Scenario Suite >> Step 2: Login and store authenticated state
- Location: src\test\TestScript\Axe_Core_Test.spec.ts:49:7

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button[type="submit"], input[type="submit"]').first()
    - locator resolved to <button disabled type="submit" _ngcontent-ng-c3866371462="" class="btn btn-lg btn-primary btn-block text-uppercase ua-submit mb-3">Create an account</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import { createHtmlReport } from 'axe-html-reporter';
  4   | import * as path from 'path';
  5   | 
  6   | const authFilePath = path.join(__dirname, '.auth', 'userState.json');
  7   | 
  8   | test.describe('ATI Testing Accessibility Scenario Suite', () => {
  9   | 
  10  |   // =========================================================================
  11  |   // SCENARIO STEP 1: Check Pre-Login Accessibility on Public Page
  12  |   // =========================================================================
  13  |   test('Step 1: Check accessibility of public main page', async ({ page }, testInfo) => {
  14  |     testInfo.annotations.push(
  15  |       { type: 'Category', description: 'Pre-Login Accessibility' },
  16  |       { type: 'Page', description: 'ATI Main Page' }
  17  |     );
  18  | 
  19  |     await page.goto('https://www.atitesting.com/');
  20  |     await page.waitForLoadState('domcontentloaded');
  21  | 
  22  |     // Perform Axe Scan
  23  |     const publicPageResults = await new AxeBuilder({ page })
  24  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  25  |       .analyze();
  26  | 
  27  |     // Generate HTML Report
  28  |     createHtmlReport({
  29  |       results: publicPageResults,
  30  |       options: {
  31  |         projectKey: 'ATI - Public Main Page',
  32  |         outputDir: 'axe-reports',
  33  |         reportFileName: 'report-01-public-homepage.html',
  34  |       },
  35  |     });
  36  | 
  37  |     // Attach raw JSON results to Playwright HTML report
  38  |     await testInfo.attach('public-homepage-axe-results', {
  39  |       body: JSON.stringify(publicPageResults.violations, null, 2),
  40  |       contentType: 'application/json',
  41  |     });
  42  | 
  43  |     expect.soft(publicPageResults.violations, 'Violations found on Public Homepage').toEqual([]);
  44  |   });
  45  | 
  46  |   // =========================================================================
  47  |   // SCENARIO STEP 2: Authenticate and Save Session State
  48  |   // =========================================================================
  49  |   test('Step 2: Login and store authenticated state', async ({ page }, testInfo) => {
  50  |     testInfo.annotations.push(
  51  |       { type: 'Category', description: 'Authentication' },
  52  |       { type: 'User', description: 'ashoksingh1995' }
  53  |     );
  54  | 
  55  |     await page.goto('https://www.atitesting.com/login');
  56  |     await page.waitForLoadState('domcontentloaded');
  57  | 
  58  |     // Fill in credentials and submit
  59  |     await page.locator('#username, input[type="text"]').first().fill('ashoksingh1995');
  60  |     await page.locator('#password, input[type="password"]').first().fill('sweetFor(e98');
  61  |     
  62  |     // Click submit button
> 63  |     await page.locator('button[type="submit"], input[type="submit"]').first().click();
      |                                                                               ^ Error: locator.click: Target page, context or browser has been closed
  64  | 
  65  |     // Wait until logged in (Wait for URL redirection or post-login dashboard container)
  66  |     await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {
  67  |       console.log('Login redirection timed out or already on post-login screen.');
  68  |     });
  69  | 
  70  |     // Save browser storage state (cookies + localStorage) for subsequent authenticated scans
  71  |     await page.context().storageState({ path: authFilePath });
  72  |   });
  73  | 
  74  |   // =========================================================================
  75  |   // SCENARIO STEP 3: Check Accessibility of Home Page in Authenticated Session
  76  |   // =========================================================================
  77  |   test('Step 3: Check accessibility of home page as Logged-In User', async ({ browser }, testInfo) => {
  78  |     testInfo.annotations.push(
  79  |       { type: 'Category', description: 'Authenticated Accessibility' },
  80  |       { type: 'Session', description: 'Logged-In User Home Page' }
  81  |     );
  82  | 
  83  |     // Create a new browser context with the saved authentication state
  84  |     const authContext = await browser.newContext({ storageState: authFilePath });
  85  |     const authenticatedPage = await authContext.newPage();
  86  | 
  87  |     // Navigate to Home Page with full logged-in user permissions
  88  |     await authenticatedPage.goto('https://www.atitesting.com/');
  89  |     await authenticatedPage.waitForLoadState('domcontentloaded');
  90  | 
  91  |     // Perform Axe Scan on Authenticated Home Page
  92  |     const authenticatedPageResults = await new AxeBuilder({ page: authenticatedPage })
  93  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  94  |       .analyze();
  95  | 
  96  |     // Generate HTML Report
  97  |     createHtmlReport({
  98  |       results: authenticatedPageResults,
  99  |       options: {
  100 |         projectKey: 'ATI - Authenticated Home Page',
  101 |         outputDir: 'axe-reports',
  102 |         reportFileName: 'report-03-authenticated-homepage.html',
  103 |       },
  104 |     });
  105 | 
  106 |     // Attach raw JSON results
  107 |     await testInfo.attach('authenticated-homepage-axe-results', {
  108 |       body: JSON.stringify(authenticatedPageResults.violations, null, 2),
  109 |       contentType: 'application/json',
  110 |     });
  111 | 
  112 |     expect.soft(authenticatedPageResults.violations, 'Violations found on Authenticated Homepage').toEqual([]);
  113 | 
  114 |     await authContext.close();
  115 |   });
  116 | 
  117 | });
```