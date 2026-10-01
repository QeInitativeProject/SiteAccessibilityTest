# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> ATI Accessibility & UI Test Suite >> ATI Login Flow & Interactive Focus Verification
- Location: src\test\TestScript\accessibility.spec.ts:17:7

# Error details

```
Error: Accessibility violations found on "ATI Login Page"

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 68

- Array []
+ Array [
+   Object {
+     "description": "Ensure the document has a main landmark",
+     "help": "Document should have one main landmark",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/landmark-one-main?application=playwright",
+     "id": "landmark-one-main",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [
+           Object {
+             "data": null,
+             "id": "page-has-main",
+             "impact": "moderate",
+             "message": "Document does not have a main landmark",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   Document does not have a main landmark",
+         "html": "<html lang=\"en\" class=\"hydrated\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "html",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure that the page, or at least one of its frames contains a level-one heading",
+     "help": "Page should contain a level-one heading",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/page-has-heading-one?application=playwright",
+     "id": "page-has-heading-one",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [
+           Object {
+             "data": null,
+             "id": "page-has-heading-one",
+             "impact": "moderate",
+             "message": "Page must have a level-one heading",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   Page must have a level-one heading",
+         "html": "<html lang=\"en\" class=\"hydrated\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "html",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+ ]
```

```
TimeoutError: locator.fill: Timeout 180000ms exceeded.
Call log:
  - waiting for locator('input[type="text"], input[name*="user"], #Username').first()
    - locator resolved to <input type="hidden" id="user_login_token" name="user_login_token"/>
    - fill("ashoksingh1995")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
      - waiting 100ms
    341 × waiting for element to be visible, enabled and editable
        - element is not visible
      - retrying fill action
        - waiting 500ms

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
            - textbox "Username" [ref=e27]
            - link "Forgot your username?" [ref=e29] [cursor=pointer]:
              - /url: https://student.atitesting.com/ResetPassword?action=ForgotUsername
          - generic [ref=e30]:
            - generic [ref=e32]: Password
            - generic [ref=e33]:
              - textbox "Password" [ref=e34]
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
  1  | import { test } from '@playwright/test';
  2  | import { AccessibilityUtility } from './accessibility.utility';
  3  | 
  4  | test.describe('ATI Accessibility & UI Test Suite', () => {
  5  | 
  6  |   test('ATI Homepage - Multi-Component Scope & Annotations', async ({ page }, testInfo) => {
  7  |     const accessibility = new AccessibilityUtility(page, testInfo);
  8  |     await page.goto('https://www.atitesting.com', { waitUntil: 'domcontentloaded' });
  9  | 
  10 |     // Include standard ATI page regions that exist (header and footer)
  11 |     await accessibility.runAxeScan('ATI Public Homepage', {
  12 |       includeSelectors: ['header', 'footer'],
  13 |       disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name'],
  14 |     });
  15 |   });
  16 | 
  17 |   test('ATI Login Flow & Interactive Focus Verification', async ({ page }, testInfo) => {
  18 |     const accessibility = new AccessibilityUtility(page, testInfo);
  19 |     
  20 |     // Navigate directly to ATI User Management Login URL
  21 |     await page.goto('https://user-management.atitesting.com/', { waitUntil: 'domcontentloaded' });
  22 | 
  23 |     // 1. Accessibility Scan on Login Area
  24 |     await accessibility.runAxeScan('ATI Login Page', {
  25 |       disabledRules: ['color-contrast'],
  26 |     });
  27 | 
  28 |     // 2. Target ATI Login Form Inputs
  29 |     const usernameInput = page.locator('input[type="text"], input[name*="user"], #Username').first();
  30 |     const passwordInput = page.locator('input[type="password"]').first();
  31 | 
> 32 |     await usernameInput.fill("ashoksingh1995");
     |                         ^ TimeoutError: locator.fill: Timeout 180000ms exceeded.
  33 |     await passwordInput.fill("sweetFor(e98");
  34 | 
  35 |     // 3. Verify Focus on interactive elements (Username, Password, and Submit Button)
  36 |     await accessibility.verifyKeyboardFocusableElements([
  37 |       'input[type="text"]',
  38 |       'input[type="password"]',
  39 |       'button.ua-submit',
  40 |     ]);
  41 | 
  42 |     // 4. Click Login cleanly avoiding strict mode conflicts
  43 |     await page.getByRole('button', { name: 'LOGIN', exact: true }).click();
  44 |   });
  45 | 
  46 | });
```