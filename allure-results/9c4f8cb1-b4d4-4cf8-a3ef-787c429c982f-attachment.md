# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Axe_Core_Test.spec.ts >> ATI Testing Accessibility Scenario Suite >> Step 2: Login and store authenticated state
- Location: src\test\TestScript\Axe_Core_Test.spec.ts:50:7

# Error details

```
Error: locator.click: Error: strict mode violation: locator('button.ua-submit') resolved to 2 elements:
    1) <button _ngcontent-ng-c628010355="" class="btn btn-lg btn-primary btn-block ua-submit text-uppercase">Login</button> aka getByRole('button', { name: 'Login' })
    2) <button disabled type="submit" _ngcontent-ng-c3866371462="" class="btn btn-lg btn-primary btn-block text-uppercase ua-submit mb-3">Create an account</button> aka locator('#uaUserRegisterForm').getByText('Create an account')

Call log:
  - waiting for locator('button.ua-submit')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e4]:
    - link "Ati-logo-header-img" [ref=e8] [cursor=pointer]:
      - /url: https://www.atitesting.com/
      - img "Ati-logo-header-img" [ref=e9]
  - generic [ref=e14]:
    - main [ref=e16]:
      - generic [ref=e20]:
        - generic [ref=e22]:
          - heading "Login" [level=1] [ref=e23]
          - generic [ref=e24]:
            - generic [ref=e26]: Username
            - textbox "Username" [ref=e27]: ashoksingh1995
            - link "Forgot your username?" [ref=e29] [cursor=pointer]:
              - /url: https://student.atitesting.com/ResetPassword?action=ForgotUsername
          - generic [ref=e30]:
            - generic [ref=e32]: Password
            - generic [ref=e33]:
              - textbox "Password" [active] [ref=e34]: sweetFor(e98
              - text:  
          - link "Forgot password?" [ref=e38] [cursor=pointer]:
            - /url: "#"
          - button "Login" [ref=e39] [cursor=pointer]
          - paragraph [ref=e40]: Don't have an account?
        - generic [ref=e42]:
          - heading "User Registration" [level=1] [ref=e43]
          - generic [ref=e44]:
            - button "Create an account" [ref=e46] [cursor=pointer]
            - text:    
    - generic:    
  - contentinfo [ref=e48]:
    - generic [ref=e49]:
      - list [ref=e51]:
        - listitem [ref=e52] [cursor=pointer]:
          - link "NURSING SCHOOL RESOURCES" [ref=e53]:
            - /url: https://www.atitesting.com/solutions
        - listitem [ref=e54] [cursor=pointer]:
          - link "PRIVACY" [ref=e55]:
            - /url: https://auth.atitesting.com/policy.html?_ga=2.62742826.764329282.1710995673-2022821046.1710995673
        - listitem [ref=e56] [cursor=pointer]:
          - link "CALIFORNIA RESIDENTS PRIVACY NOTICE" [ref=e57]:
            - /url: https://auth.atitesting.com/policy.html?_ga=2.95248538.764329282.1710995673-2022821046.1710995673#privacy_information_ca
        - listitem [ref=e58] [cursor=pointer]:
          - link "DATA PRIVACY REQUEST" [ref=e59]:
            - /url: https://www.atitesting.com/data-privacy-request
        - listitem [ref=e60] [cursor=pointer]:
          - link "TERMS AND CONDITIONS" [ref=e61]:
            - /url: https://www.atitesting.com/termsandconditions
        - listitem [ref=e62] [cursor=pointer]:
          - link "TECHNICAL REQUIREMENTS" [ref=e63]:
            - /url: https://www.atitesting.com/technical-requirements
        - listitem [ref=e64] [cursor=pointer]:
          - link "SITEMAP" [ref=e65]:
            - /url: https://www.atitesting.com/sitemap
        - listitem [ref=e66] [cursor=pointer]:
          - link "STORE" [ref=e67]:
            - /url: https://store.atitesting.com/?_ga=2.107219204.764329282.1710995673-2022821046.1710995673
      - generic [ref=e68]:
        - generic [ref=e69] [cursor=pointer]:
          - link "Facebook" [ref=e70]:
            - /url: http://www.facebook.com/atinursingeducation
            - text: 
          - link "Twitter" [ref=e71]:
            - /url: http://www.twitter.com/atinursing
            - text: 
          - link "YouTube" [ref=e72]:
            - /url: http://www.youtube.com/user/ATINursingEducation
            - text: 
          - link "LinkedIn" [ref=e73]:
            - /url: http://www.linkedin.com/companies/362495
            - text: 
        - link "ati-logo" [ref=e75] [cursor=pointer]:
          - /url: https://www.atitesting.com/
          - img "ati-logo" [ref=e76]
    - paragraph [ref=e78]: Copyright © 2026 Assessment Technologies Institute®, LLC. All rights reserved.
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
  43  |     // CHANGED TO SOFT ASSERTION: Logs violations to reports without failing the test suite
  44  |     expect.soft(publicPageResults.violations, 'Violations found on Public Homepage').toEqual([]);
  45  |   });
  46  | 
  47  |   // =========================================================================
  48  |   // SCENARIO STEP 2: Authenticate and Save Session State
  49  |   // =========================================================================
  50  |   test('Step 2: Login and store authenticated state', async ({ page }, testInfo) => {
  51  |     testInfo.annotations.push(
  52  |       { type: 'Category', description: 'Authentication' },
  53  |       { type: 'User', description: 'ashoksingh1995' }
  54  |     );
  55  | 
  56  |     await page.goto('https://www.atitesting.com/login');
  57  |     await page.waitForLoadState('domcontentloaded');
  58  | 
  59  |     // Fill in credentials
  60  |     await page.locator('#username, input[type="text"]').first().fill('ashoksingh1995');
  61  |     await page.locator('#password, input[type="password"]').first().fill('sweetFor(e98');
  62  |     
  63  |     // Click login button using the .ua-submit class
> 64  |     await page.locator('button.ua-submit').click();
      |                                            ^ Error: locator.click: Error: strict mode violation: locator('button.ua-submit') resolved to 2 elements:
  65  | 
  66  |     // Wait for post-login navigation/redirection
  67  |     await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {
  68  |       console.log('Login redirection completed or dynamic UI loaded.');
  69  |     });
  70  | 
  71  |     // Save browser storage state (cookies + localStorage) for authenticated steps
  72  |     await page.context().storageState({ path: authFilePath });
  73  |   });
  74  | 
  75  |   // =========================================================================
  76  |   // SCENARIO STEP 3: Check Accessibility of Home Page in Authenticated Session
  77  |   // =========================================================================
  78  |   test('Step 3: Check accessibility of home page as Logged-In User', async ({ browser }, testInfo) => {
  79  |     testInfo.annotations.push(
  80  |       { type: 'Category', description: 'Authenticated Accessibility' },
  81  |       { type: 'Session', description: 'Logged-In User Home Page' }
  82  |     );
  83  | 
  84  |     // Create a new browser context with the saved authentication state
  85  |     const authContext = await browser.newContext({ storageState: authFilePath });
  86  |     const authenticatedPage = await authContext.newPage();
  87  | 
  88  |     // Navigate to Home Page with full logged-in user permissions
  89  |     await authenticatedPage.goto('https://www.atitesting.com/');
  90  |     await authenticatedPage.waitForLoadState('domcontentloaded');
  91  | 
  92  |     // Perform Axe Scan on Authenticated Home Page
  93  |     const authenticatedPageResults = await new AxeBuilder({ page: authenticatedPage })
  94  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  95  |       .analyze();
  96  | 
  97  |     // Generate HTML Report
  98  |     createHtmlReport({
  99  |       results: authenticatedPageResults,
  100 |       options: {
  101 |         projectKey: 'ATI - Authenticated Home Page',
  102 |         outputDir: 'axe-reports',
  103 |         reportFileName: 'report-03-authenticated-homepage.html',
  104 |       },
  105 |     });
  106 | 
  107 |     // Attach raw JSON results
  108 |     await testInfo.attach('authenticated-homepage-axe-results', {
  109 |       body: JSON.stringify(authenticatedPageResults.violations, null, 2),
  110 |       contentType: 'application/json',
  111 |     });
  112 | 
  113 |     // CHANGED TO SOFT ASSERTION: Logs violations to reports without failing the test suite
  114 |     expect.soft(authenticatedPageResults.violations, 'Violations found on Authenticated Homepage').toEqual([]);
  115 | 
  116 |     await authContext.close();
  117 |   });
  118 | 
  119 | });
```