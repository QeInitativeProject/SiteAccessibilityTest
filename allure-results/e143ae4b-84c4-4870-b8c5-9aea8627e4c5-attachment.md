# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> ATI Accessibility & UI Test Suite >> ATI Login Flow & Interactive Focus Verification
- Location: src\test\TestScript\accessibility.spec.ts:25:7

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
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/student.atitesting.com/**" until "load"
  navigated to "https://student.atitesting.com/Home?IsAccountManagement=true"
  "domcontentloaded" event fired
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - navigation "Utility" [ref=e4]:
        - list [ref=e5]:
          - listitem [ref=e6]:
            - link "Select this link to navigate to the Online Store" [ref=e7] [cursor=pointer]:
              - /url: "#"
              - text: Online Store
          - listitem [ref=e8]:
            - link "Select this link to navigate to the Contact Us" [ref=e9] [cursor=pointer]:
              - /url: https://www.atitesting.com/Contact
              - text: Contact Us
          - listitem [ref=e10]:
            - link "Select this link to Sign Out" [ref=e11] [cursor=pointer]:
              - /url: "#"
              - text: Sign Out
      - generic [ref=e13]:
        - navigation "Main" [ref=e15]:
          - list [ref=e16]:
            - listitem [ref=e17]:
              - link "Home" [ref=e18] [cursor=pointer]:
                - /url: Home
                - generic [ref=e19]: home
                - generic [ref=e20]: Home
            - listitem [ref=e21]:
              - link "My ATI" [ref=e22] [cursor=pointer]:
                - /url: Products
                - generic [ref=e23]: person
                - generic [ref=e24]: My ATI
            - listitem [ref=e25]:
              - link "Results" [ref=e26] [cursor=pointer]:
                - /url: MyResults
                - generic [ref=e28]: 
                - generic [ref=e29]: Results
        - navigation "Secondary" [ref=e31]:
          - list [ref=e32]:
            - listitem [ref=e33]:
              - link "Profile" [ref=e34] [cursor=pointer]:
                - /url: MyAccount
                - generic [ref=e36]: 
                - generic [ref=e37]: Profile
            - listitem [ref=e38]:
              - link "Help" [ref=e39] [cursor=pointer]:
                - /url: MyHelp
                - generic [ref=e40]: support
                - generic [ref=e41]: Help
        - search [ref=e50]:
          - textbox
          - textbox
          - textbox "Search lesson content" [ref=e51]
          - button "Search"
  - generic: "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !"
  - generic: "! !"
  - region "Area containing information about news stories and your recent activity" [ref=e53]:
    - complementary [ref=e55]:
      - generic [ref=e56] [cursor=pointer]:
        - generic [ref=e57]: add
        - generic [ref=e58]: Add a Product
    - generic [ref=e59]:
      - text: +
      - generic [ref=e60]:
        - generic [ref=e61]:
          - heading "ATI Assignments Calendar" [level=1] [ref=e62]
          - button "more info" [ref=e63] [cursor=pointer]: 
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic "Prev" [ref=e66] [cursor=pointer]:
              - generic [ref=e67]: Prev
            - generic "Next" [ref=e68] [cursor=pointer]:
              - generic [ref=e69]: Next
            - generic [ref=e70]: October 2026
          - table [ref=e71]:
            - rowgroup [ref=e72]:
              - row "Sun Mon Tue Wed Thu Fri Sat" [ref=e73]:
                - columnheader "Sun" [ref=e74]
                - columnheader "Mon" [ref=e75]
                - columnheader "Tue" [ref=e76]
                - columnheader "Wed" [ref=e77]
                - columnheader "Thu" [ref=e78]
                - columnheader "Fri" [ref=e79]
                - columnheader "Sat" [ref=e80]
            - rowgroup [ref=e81]:
              - row "1 2 3" [ref=e82]:
                - cell [ref=e83]
                - cell [ref=e84]
                - cell [ref=e85]
                - cell [ref=e86]
                - cell "1" [ref=e87]:
                  - generic [ref=e88]: "1"
                - cell "2" [ref=e89]:
                  - generic [ref=e90]: "2"
                - cell "3" [ref=e91]:
                  - generic [ref=e92]: "3"
              - row "4 5 6 7 8 9 10" [ref=e93]:
                - cell "4" [ref=e94]:
                  - generic [ref=e95]: "4"
                - cell "5" [ref=e96]:
                  - generic [ref=e97]: "5"
                - cell "6" [ref=e98]:
                  - generic [ref=e99]: "6"
                - cell "7" [ref=e100]:
                  - generic [ref=e101]: "7"
                - cell "8" [ref=e102]:
                  - generic [ref=e103]: "8"
                - cell "9" [ref=e104]:
                  - generic [ref=e105]: "9"
                - cell "10" [ref=e106]:
                  - generic [ref=e107]: "10"
              - row "11 12 13 14 15 16 17" [ref=e108]:
                - cell "11" [ref=e109]:
                  - generic [ref=e110]: "11"
                - cell "12" [ref=e111]:
                  - generic [ref=e112]: "12"
                - cell "13" [ref=e113]:
                  - generic [ref=e114]: "13"
                - cell "14" [ref=e115]:
                  - generic [ref=e116]: "14"
                - cell "15" [ref=e117]:
                  - generic [ref=e118]: "15"
                - cell "16" [ref=e119]:
                  - generic [ref=e120]: "16"
                - cell "17" [ref=e121]:
                  - generic [ref=e122]: "17"
              - row "18 19 20 21 22 23 24" [ref=e123]:
                - cell "18" [ref=e124]:
                  - generic [ref=e125]: "18"
                - cell "19" [ref=e126]:
                  - generic [ref=e127]: "19"
                - cell "20" [ref=e128]:
                  - generic [ref=e129]: "20"
                - cell "21" [ref=e130]:
                  - generic [ref=e131]: "21"
                - cell "22" [ref=e132]:
                  - generic [ref=e133]: "22"
                - cell "23" [ref=e134]:
                  - generic [ref=e135]: "23"
                - cell "24" [ref=e136]:
                  - generic [ref=e137]: "24"
              - row "25 26 27 28 29 30 31" [ref=e138]:
                - cell "25" [ref=e139]:
                  - generic [ref=e140]: "25"
                - cell "26" [ref=e141]:
                  - generic [ref=e142]: "26"
                - cell "27" [ref=e143]:
                  - generic [ref=e144]: "27"
                - cell "28" [ref=e145]:
                  - generic [ref=e146]: "28"
                - cell "29" [ref=e147]:
                  - generic [ref=e148]: "29"
                - cell "30" [ref=e149]:
                  - generic [ref=e150]: "30"
                - cell "31" [ref=e151]:
                  - generic [ref=e152]: "31"
        - generic [ref=e153]:
          - text: Weekly Calendar
          - generic [ref=e154] [cursor=pointer]: Full Page Calendar
    - generic [ref=e155]:
      - generic [ref=e156]:
        - generic [ref=e157]:
          - heading "Recent Activity" [level=1] [ref=e158]
          - generic "Last 30 days" [ref=e159]: (Last 30 days)
        - generic [ref=e160]:
          - generic [ref=e161]:
            - generic [ref=e163] [cursor=pointer]:
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - generic "COMPLETED" [ref=e167]: COMPLETED SCORE
                  - generic [ref=e168]:
                    - text: "%"
                    - generic [ref=e169]: 100.0%
                - generic [ref=e170]:
                  - text: ": : : : : : : : : : : :"
                  - generic [ref=e172]:
                    - generic "Practice Assessment" [ref=e173]: "Practice Assessment:"
                    - text: Prod Assessment Jan 7th
              - generic "Assessments" [ref=e174]
            - text: ":"
          - navigation [ref=e175]: +
      - complementary [ref=e177]:
        - generic [ref=e179]:
          - heading "Program Manager" [level=5] [ref=e180]
          - button "Go To PROGRAM MANAGER" [ref=e181] [cursor=pointer]
          - heading "Evaluation Management" [level=5] [ref=e182]
          - generic "No actions required" [ref=e184]
        - generic [ref=e185]:
          - generic [ref=e186]: Quick Links
          - generic [ref=e188] [cursor=pointer]: Active Learning Templates
          - generic [ref=e189]:
            - button "Learning System RN 3.0" [ref=e191] [cursor=pointer]
            - button "Learning System PN 3.0" [ref=e193] [cursor=pointer]
            - generic [ref=e194]:
              - button "BoardVitals NCLEX Prep PN" [disabled] [ref=e195] [cursor=pointer]
              - generic [ref=e196] [cursor=pointer]: i
            - generic [ref=e197]:
              - button "BoardVitals NCLEX Prep RN" [disabled] [ref=e198] [cursor=pointer]
              - generic [ref=e199] [cursor=pointer]: i
            - button "EHR Tutor" [ref=e201] [cursor=pointer]
    - text: 
  - contentinfo [ref=e202]:
    - generic [ref=e203]:
      - generic "Copyright Â© 2026 Assessment Technologies Institute, L.L.C. All rights reserved." [ref=e204]: Copyright © 2026 Assessment Technologies Institute, L.L.C. All rights reserved.
      - navigation "Footer" [ref=e205]:
        - list [ref=e206]:
          - listitem [ref=e207]:
            - link "Select this link to navigate to the Privacy Policy" [ref=e208] [cursor=pointer]:
              - /url: https://auth.atitesting.com/policy.html
              - text: Privacy Policy
          - listitem [ref=e209]:
            - link "Select this link to navigate to the Terms and Conditions" [ref=e210] [cursor=pointer]:
              - /url: https://auth.atitesting.com/terms.html
              - text: Terms and Conditions
          - listitem [ref=e211]:
            - link "Select this link to navigate to the California Residents Privacy Notice" [ref=e212] [cursor=pointer]:
              - /url: https://www.atitesting.com/ca-privacy-notice
              - text: California Residents Privacy Notice
          - listitem [ref=e213]:
            - link "Select this link to navigate to Data Privacy Request" [ref=e214] [cursor=pointer]:
              - /url: https://www.atitesting.com/data-privacy-request
              - text: Data Privacy Request
          - listitem [ref=e215]:
            - link "Select this link to navigate to the ATI Product Solutions" [ref=e216] [cursor=pointer]:
              - /url: https://www.atitesting.com/solutions
              - text: ATI Product Solutions
  - button [ref=e217] [cursor=pointer]
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
  10 |     // Include header/footer and disable standard layout rule violations
  11 |     await accessibility.runAxeScan('ATI Public Homepage', {
  12 |       includeSelectors: ['header', 'footer'],
  13 |       disabledRules: [
  14 |         'color-contrast', 
  15 |         'aria-prohibited-attr', 
  16 |         'image-alt', 
  17 |         'link-name', 
  18 |         'aria-required-children', 
  19 |         'listitem', 
  20 |         'region'
  21 |       ],
  22 |     });
  23 |   });
  24 | 
  25 |   test('ATI Login Flow & Interactive Focus Verification', async ({ page }, testInfo) => {
  26 |     const accessibility = new AccessibilityUtility(page, testInfo);
  27 |     
  28 |     // 1. Navigate directly to ATI Login Page
  29 |     await page.goto('https://user-management.atitesting.com/', { waitUntil: 'domcontentloaded' });
  30 | 
  31 |     // 2. Scan Pre-Login Page
  32 |     await accessibility.runAxeScan('ATI Login Page', {
  33 |       disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name'],
  34 |     });
  35 | 
  36 |     // 3. Fill Credentials
  37 |     const usernameInput = page.getByLabel('USERNAME', { exact: false }).or(page.locator('input[type="text"]')).first();
  38 |     const passwordInput = page.getByLabel('PASSWORD', { exact: false }).or(page.locator('input[type="password"]')).first();
  39 | 
  40 |     await usernameInput.click();
  41 |     await usernameInput.fill("ashoksingh1995");
  42 |     
  43 |     await passwordInput.click();
  44 |     await passwordInput.fill("sweetFor(e98");
  45 | 
  46 |     // 4. Verify Focus on Login Elements
  47 |     await accessibility.verifyKeyboardFocusableElements([
  48 |       'input[type="text"]',
  49 |       'input[type="password"]',
  50 |       'button.ua-submit',
  51 |     ]);
  52 | 
  53 |     // 5. Click Login & Wait for Navigation to Dashboard
  54 |     await Promise.all([
> 55 |       page.waitForURL('**/student.atitesting.com/**', { timeout: 15000 }),
     |            ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  56 |       page.locator('button.ua-submit', { hasText: 'Login' }).click(),
  57 |     ]);
  58 | 
  59 |     // 6. Post-Login Dashboard Accessibility Scan
  60 |     await accessibility.runAxeScan('ATI Student Dashboard', {
  61 |       disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name', 'region'],
  62 |     });
  63 |   });
  64 | 
  65 | });
```