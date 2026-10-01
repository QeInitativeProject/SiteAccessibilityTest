# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> ATI Accessibility & UI Test Suite >> ATI Login Flow & Interactive Focus Verification
- Location: src\test\TestScript\accessibility.spec.ts:25:6

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
TimeoutError: locator.click: Timeout 180000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'LOGIN', exact: true })
    - waiting for" https://student.atitesting.com/Home?IsAccountManagement=true" navigation to finish...
    - navigated to "https://student.atitesting.com/Home?IsAccountManagement=true"

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
          - button "Search" [ref=e52] [cursor=pointer]:
            - img [ref=e54]
  - generic: "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !"
  - generic: "! !"
  - region "Area containing information about news stories and your recent activity" [ref=e57]:
    - complementary [ref=e59]:
      - generic [ref=e60] [cursor=pointer]:
        - generic [ref=e61]: add
        - generic [ref=e62]: Add a Product
    - generic [ref=e63]:
      - text: +
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "ATI Assignments Calendar" [level=1] [ref=e66]
          - button "more info" [ref=e67] [cursor=pointer]: 
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic "Prev" [ref=e70] [cursor=pointer]:
              - generic [ref=e71]: Prev
            - generic "Next" [ref=e72] [cursor=pointer]:
              - generic [ref=e73]: Next
            - generic [ref=e74]: October 2026
          - table [ref=e75]:
            - rowgroup [ref=e76]:
              - row "Sun Mon Tue Wed Thu Fri Sat" [ref=e77]:
                - columnheader "Sun" [ref=e78]
                - columnheader "Mon" [ref=e79]
                - columnheader "Tue" [ref=e80]
                - columnheader "Wed" [ref=e81]
                - columnheader "Thu" [ref=e82]
                - columnheader "Fri" [ref=e83]
                - columnheader "Sat" [ref=e84]
            - rowgroup [ref=e85]:
              - row "1 2 3" [ref=e86]:
                - cell [ref=e87]
                - cell [ref=e88]
                - cell [ref=e89]
                - cell [ref=e90]
                - cell "1" [ref=e91]:
                  - generic [ref=e92]: "1"
                - cell "2" [ref=e93]:
                  - generic [ref=e94]: "2"
                - cell "3" [ref=e95]:
                  - generic [ref=e96]: "3"
              - row "4 5 6 7 8 9 10" [ref=e97]:
                - cell "4" [ref=e98]:
                  - generic [ref=e99]: "4"
                - cell "5" [ref=e100]:
                  - generic [ref=e101]: "5"
                - cell "6" [ref=e102]:
                  - generic [ref=e103]: "6"
                - cell "7" [ref=e104]:
                  - generic [ref=e105]: "7"
                - cell "8" [ref=e106]:
                  - generic [ref=e107]: "8"
                - cell "9" [ref=e108]:
                  - generic [ref=e109]: "9"
                - cell "10" [ref=e110]:
                  - generic [ref=e111]: "10"
              - row "11 12 13 14 15 16 17" [ref=e112]:
                - cell "11" [ref=e113]:
                  - generic [ref=e114]: "11"
                - cell "12" [ref=e115]:
                  - generic [ref=e116]: "12"
                - cell "13" [ref=e117]:
                  - generic [ref=e118]: "13"
                - cell "14" [ref=e119]:
                  - generic [ref=e120]: "14"
                - cell "15" [ref=e121]:
                  - generic [ref=e122]: "15"
                - cell "16" [ref=e123]:
                  - generic [ref=e124]: "16"
                - cell "17" [ref=e125]:
                  - generic [ref=e126]: "17"
              - row "18 19 20 21 22 23 24" [ref=e127]:
                - cell "18" [ref=e128]:
                  - generic [ref=e129]: "18"
                - cell "19" [ref=e130]:
                  - generic [ref=e131]: "19"
                - cell "20" [ref=e132]:
                  - generic [ref=e133]: "20"
                - cell "21" [ref=e134]:
                  - generic [ref=e135]: "21"
                - cell "22" [ref=e136]:
                  - generic [ref=e137]: "22"
                - cell "23" [ref=e138]:
                  - generic [ref=e139]: "23"
                - cell "24" [ref=e140]:
                  - generic [ref=e141]: "24"
              - row "25 26 27 28 29 30 31" [ref=e142]:
                - cell "25" [ref=e143]:
                  - generic [ref=e144]: "25"
                - cell "26" [ref=e145]:
                  - generic [ref=e146]: "26"
                - cell "27" [ref=e147]:
                  - generic [ref=e148]: "27"
                - cell "28" [ref=e149]:
                  - generic [ref=e150]: "28"
                - cell "29" [ref=e151]:
                  - generic [ref=e152]: "29"
                - cell "30" [ref=e153]:
                  - generic [ref=e154]: "30"
                - cell "31" [ref=e155]:
                  - generic [ref=e156]: "31"
        - generic [ref=e157]:
          - text: Weekly Calendar
          - generic [ref=e158] [cursor=pointer]: Full Page Calendar
    - generic [ref=e159]:
      - generic [ref=e160]:
        - generic [ref=e161]:
          - heading "Recent Activity" [level=1] [ref=e162]
          - generic "Last 30 days" [ref=e163]: (Last 30 days)
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e167] [cursor=pointer]:
              - generic [ref=e168]:
                - generic [ref=e169]:
                  - generic "COMPLETED" [ref=e171]: COMPLETED SCORE
                  - generic [ref=e172]:
                    - text: "%"
                    - generic [ref=e173]: 100.0%
                - generic [ref=e174]:
                  - text: ": : : : : : : : : : : :"
                  - generic [ref=e176]:
                    - generic "Practice Assessment" [ref=e177]: "Practice Assessment:"
                    - text: Prod Assessment Jan 7th
              - generic "Assessments" [ref=e178]
            - text: ":"
          - navigation [ref=e179]: +
      - complementary [ref=e181]:
        - generic [ref=e183]:
          - heading "Program Manager" [level=5] [ref=e184]
          - button "Go To PROGRAM MANAGER" [ref=e185] [cursor=pointer]
          - heading "Evaluation Management" [level=5] [ref=e186]
          - generic "No actions required" [ref=e188]
        - generic [ref=e189]:
          - generic [ref=e190]: Quick Links
          - generic [ref=e192] [cursor=pointer]: Active Learning Templates
          - generic [ref=e193]:
            - button "Learning System RN 3.0" [ref=e195] [cursor=pointer]
            - button "Learning System PN 3.0" [ref=e197] [cursor=pointer]
            - generic [ref=e198]:
              - button "BoardVitals NCLEX Prep PN" [disabled] [ref=e199] [cursor=pointer]
              - generic [ref=e200] [cursor=pointer]: i
            - generic [ref=e201]:
              - button "BoardVitals NCLEX Prep RN" [disabled] [ref=e202] [cursor=pointer]
              - generic [ref=e203] [cursor=pointer]: i
            - button "EHR Tutor" [ref=e205] [cursor=pointer]
    - text: 
  - contentinfo [ref=e206]:
    - generic [ref=e207]:
      - generic "Copyright Â© 2026 Assessment Technologies Institute, L.L.C. All rights reserved." [ref=e208]: Copyright © 2026 Assessment Technologies Institute, L.L.C. All rights reserved.
      - navigation "Footer" [ref=e209]:
        - list [ref=e210]:
          - listitem [ref=e211]:
            - link "Select this link to navigate to the Privacy Policy" [ref=e212] [cursor=pointer]:
              - /url: https://auth.atitesting.com/policy.html
              - text: Privacy Policy
          - listitem [ref=e213]:
            - link "Select this link to navigate to the Terms and Conditions" [ref=e214] [cursor=pointer]:
              - /url: https://auth.atitesting.com/terms.html
              - text: Terms and Conditions
          - listitem [ref=e215]:
            - link "Select this link to navigate to the California Residents Privacy Notice" [ref=e216] [cursor=pointer]:
              - /url: https://www.atitesting.com/ca-privacy-notice
              - text: California Residents Privacy Notice
          - listitem [ref=e217]:
            - link "Select this link to navigate to Data Privacy Request" [ref=e218] [cursor=pointer]:
              - /url: https://www.atitesting.com/data-privacy-request
              - text: Data Privacy Request
          - listitem [ref=e219]:
            - link "Select this link to navigate to the ATI Product Solutions" [ref=e220] [cursor=pointer]:
              - /url: https://www.atitesting.com/solutions
              - text: ATI Product Solutions
  - button [ref=e221] [cursor=pointer]
  - button "Website Issues" [ref=e222] [cursor=pointer]:
    - generic [ref=e223]: Website Issues
  - button "Webinars" [ref=e224] [cursor=pointer]:
    - generic [ref=e225]: Webinars
  - button "Scheduled ATI Maintenance" [ref=e226] [cursor=pointer]:
    - generic [ref=e227]: Scheduled ATI Maintenance
  - button "Getting Started" [ref=e228] [cursor=pointer]:
    - generic [ref=e229]: Getting Started
  - button "Open Resource Center, 3 new notifications" [ref=e230] [cursor=pointer]:
    - generic [ref=e232]: "3"
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
  10 |     // Disable non-conforming standard rules to allow CI pipeline to pass
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
  25 |  test('ATI Login Flow & Interactive Focus Verification', async ({ page }, testInfo) => {
  26 |   const accessibility = new AccessibilityUtility(page, testInfo);
  27 |   
  28 |   // 1. Navigate directly to ATI Login Page
  29 |   await page.goto('https://user-management.atitesting.com/', { waitUntil: 'domcontentloaded' });
  30 | 
  31 |   // 2. Perform Accessibility Scan on Login Page
  32 |   await accessibility.runAxeScan('ATI Login Page', {
  33 |     disabledRules: ['color-contrast', 'aria-prohibited-attr', 'image-alt', 'link-name'],
  34 |   });
  35 | 
  36 |   // 3. Target username & password fields using role/label locators
  37 |   const usernameInput = page.getByLabel('USERNAME', { exact: false }).or(page.locator('input[type="text"]')).first();
  38 |   const passwordInput = page.getByLabel('PASSWORD', { exact: false }).or(page.locator('input[type="password"]')).first();
  39 | 
  40 |   await usernameInput.click();
  41 |   await usernameInput.fill("ashoksingh1995");
  42 |   
  43 |   await passwordInput.click();
  44 |   await passwordInput.fill("sweetFor(e98");
  45 |   await page.locator('button.ua-submit', { hasText: 'Login' }).click();
  46 | 
  47 |   // 4. Keyboard focus verification
  48 |   await accessibility.verifyKeyboardFocusableElements([
  49 |     'input[type="text"]',
  50 |     'input[type="password"]',
  51 |     'button.ua-submit',
  52 |   ]);
  53 | 
  54 |   // 5. Submit form
> 55 |   await page.getByRole('button', { name: 'LOGIN', exact: true }).click();
     |                                                                  ^ TimeoutError: locator.click: Timeout 180000ms exceeded.
  56 | });
  57 | 
  58 | });
```