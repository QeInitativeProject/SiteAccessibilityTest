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
Error: locator.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[type="text"], input[name*="user"], #Username').first()
    - locator resolved to <input type="hidden" id="user_login_token" name="user_login_token"/>
    - fill("YOUR_ACTUAL_ATI_USERNAME")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
      - waiting 100ms
    98 × waiting for element to be visible, enabled and editable
       - element is not visible
     - retrying fill action
       - waiting 500ms

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
     |                         ^ Error: locator.fill: Target page, context or browser has been closed
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