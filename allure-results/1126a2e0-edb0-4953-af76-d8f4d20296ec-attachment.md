# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> ATI Accessibility & UI Test Suite >> ATI Homepage - Multi-Component Scope & Annotations
- Location: src\test\TestScript\accessibility.spec.ts:6:7

# Error details

```
Error: Accessibility violations found on "ATI Public Homepage"

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 59

- Array []
+ Array [
+   Object {
+     "description": "Ensure landmarks are unique",
+     "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/landmark-unique?application=playwright",
+     "id": "landmark-unique",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "accessibleText": null,
+               "role": "navigation",
+             },
+             "id": "landmark-is-unique",
+             "impact": "moderate",
+             "message": "The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<nav data-nav=\"bottomheader\" class=\"display-none display-md-block absolute top-right m-t-10\">",
+                 "target": Array [
+                   ".m-t-10",
+                 ],
+               },
+               Object {
+                 "html": "<nav class=\"display-block text-center float-sm-right clearfix\">",
+                 "target": Array [
+                   "#Footer_T48A0E409006_Col00 > .float-sm-right",
+                 ],
+               },
+               Object {
+                 "html": "<nav class=\"wrapper ccopyright text-center text-sm-left line-height-2 display-block p-t-1\">
+ Copyright © <span class=\"frutiger-light copyright-year\">2026</span> Assessment Technologies Institute®, LLC. All rights reserved.
+ </nav>",
+                 "target": Array [
+                   ".ccopyright",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+         "html": "<nav id=\"Header_top_T48A0E409003_Col00\" class=\"sf_colsIn color-white float-md-right text-center text-uppercase\" data-sf-element=\"nav\" data-placeholder-label=\"nav\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "#Header_top_T48A0E409003_Col00",
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

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - link "Skip to Main Content" [ref=e3] [cursor=pointer]:
      - /url: "#carousel_1"
    - navigation [ref=e6]:
      - generic [ref=e7] [cursor=pointer]:
        - text: not a student? visit the educator site
        - generic [ref=e8]: 
    - generic [ref=e10]:
      - link "Logo" [ref=e11] [cursor=pointer]:
        - /url: /
      - navigation [ref=e12]:
        - link "contact" [ref=e13] [cursor=pointer]:
          - /url: /contact
        - link "Create Account" [ref=e14] [cursor=pointer]:
          - /url: https://user-management.atitesting.com/createaccount
        - link " Log In" [ref=e15] [cursor=pointer]:
          - /url: https://user-management.atitesting.com
      - button "Product search icon" [ref=e16] [cursor=pointer]: 
      - text: 
      - navigation "Navigation" [ref=e17]:
        - menubar [ref=e18]:
          - listitem [ref=e19]:
            - button "TEAS" [ref=e20] [cursor=pointer]
          - listitem [ref=e21]:
            - button "Nursing School Resources" [ref=e22] [cursor=pointer]
          - listitem [ref=e23]:
            - button "NCLEX Prep" [ref=e24] [cursor=pointer]
          - listitem [ref=e25]:
            - link "Events" [ref=e26] [cursor=pointer]:
              - /url: /events
          - listitem [ref=e27]:
            - link "About Us" [ref=e28] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e29]:
            - link "Blog" [ref=e30] [cursor=pointer]:
              - /url: /student-blog
          - text: 
      - list [ref=e31]:
        - listitem:
          - link [ref=e32] [cursor=pointer]:
            - /url: https://shop.atitesting.com/ascend-cart/cart/redirect
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "Your home base for NCLEX support" [level=1] [ref=e39]
            - link "Get Started" [ref=e40] [cursor=pointer]:
              - /url: /nclex-support-center
          - img "NCLEX Resources" [ref=e42]
        - generic [ref=e45]:
          - generic [ref=e46]:
            - heading "ATI TEAS Prep" [level=1] [ref=e47]
            - paragraph [ref=e48]: Built by the creators of the TEAS and trusted by more than 800,000 students
            - generic [ref=e49]:
              - link "TEAS Prep" [ref=e50] [cursor=pointer]:
                - /url: /teas
              - generic [ref=e51]: Exam Registration
          - img "SmartPrep Video" [ref=e53]
        - generic [ref=e56]:
          - generic [ref=e57]:
            - heading "Live Webinar Series" [level=5] [ref=e58]
            - 'heading "Lock In with ATI: NCLEX Prep for Graduating Students" [level=1] [ref=e59]'
            - heading "Multiple Dates Available" [level=3] [ref=e60]
            - link "Register now" [ref=e62] [cursor=pointer]:
              - /url: https://atitesting.zoom.us/webinar/register/WN_C3zDRhl0TmSHz-dhXQgW0g#/registration
          - img [ref=e64]
        - generic [ref=e68]:
          - heading "Live Webinar" [level=5] [ref=e69]
          - heading "NCLEX Readiness in 2026 How to Prepare" [level=1] [ref=e70]
          - heading "Multiple Dates Available" [level=3] [ref=e71]
          - link "Register now" [ref=e73] [cursor=pointer]:
            - /url: https://atitesting.zoom.us/webinar/register/WN_vI3l0BEVROGbGULUAIXgYQ#/registration
        - generic [ref=e77]:
          - generic [ref=e78]:
            - heading "Your home base for NCLEX support" [level=1] [ref=e79]
            - link "Get Started" [ref=e80] [cursor=pointer]:
              - /url: /nclex-support-center
          - img "NCLEX Resources" [ref=e82]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - heading "ATI TEAS Prep" [level=1] [ref=e87]
            - paragraph [ref=e88]: Built by the creators of the TEAS and trusted by more than 800,000 students
            - generic [ref=e89]:
              - link "TEAS Prep" [ref=e90] [cursor=pointer]:
                - /url: /teas
              - generic [ref=e91]: Exam Registration
          - img "SmartPrep Video" [ref=e93]
      - button "left" [ref=e94] [cursor=pointer]:
        - img "left" [ref=e95]
      - button "right" [ref=e96] [cursor=pointer]:
        - img "right" [ref=e97]
    - paragraph [ref=e100]: Many students know in their hearts they want to be nurses or allied health professionals. Our tools show what students know in their heads and what’s needed to help them follow their hearts.
    - generic [ref=e102]:
      - heading "Featured Products" [level=2] [ref=e103]
      - generic [ref=e104]:
        - figure "Prep & Register for the TEAS Learn how to register for the ATI TEAS and get the best score possible on your exam by using prep materials from ATI, the creator of the exam. Prep & Register for the TEAS" [ref=e106]:
          - generic [ref=e108]:
            - heading "Prep & Register for the TEAS" [level=2] [ref=e109]
            - generic [ref=e110]: Learn how to register for the ATI TEAS and get the best score possible on your exam by using prep materials from ATI, the creator of the exam.
            - link "Prep & Register for the TEAS" [ref=e111] [cursor=pointer]:
              - /url: https://www.atitesting.com/teas/teas-prep
              - text: learn more
        - figure "Pharmacology Made Easy This interactive, online tutorial was designed to break down and simplify one of the most difficult subjects in nursing school, Pharmacology. Pharmacology Made Easy" [ref=e113]:
          - generic [ref=e115]:
            - heading "Pharmacology Made Easy" [level=2] [ref=e116]
            - generic [ref=e117]: This interactive, online tutorial was designed to break down and simplify one of the most difficult subjects in nursing school, Pharmacology.
            - link "Pharmacology Made Easy" [ref=e118] [cursor=pointer]:
              - /url: https://www.atitesting.com/pharmacology/pharmacology-made-easy
              - text: learn more
        - figure "TEST YOUR A & P KNOWLEDGE This online practice exam for Anatomy and Physiology is designed to test your general knowledge. TEST YOUR A & P KNOWLEDGE" [ref=e120]:
          - generic [ref=e122]:
            - heading "TEST YOUR A & P KNOWLEDGE" [level=2] [ref=e123]
            - generic [ref=e124]: This online practice exam for Anatomy and Physiology is designed to test your general knowledge.
            - link "TEST YOUR A & P KNOWLEDGE" [ref=e125] [cursor=pointer]:
              - /url: https://www.atitesting.com/anatomy-and-physiology
              - text: learn more
        - figure "ATI Nursing Blog Check out our blog for articles and information all about nursing school, passing the NCLEX and finding the perfect job. ATI Nursing Blog" [ref=e127]:
          - generic [ref=e128]:
            - heading "ATI Nursing Blog" [level=2] [ref=e129]
            - generic [ref=e130]: Check out our blog for articles and information all about nursing school, passing the NCLEX and finding the perfect job.
            - link "ATI Nursing Blog" [ref=e131] [cursor=pointer]:
              - /url: https://atinursingblog.com/?__hstc=128800851.2e02f43910ca16ec282c7572035b2c9b.1790848749112.1790848749112.1790848749112.1&__hssc=128800851.1.1790848749113&__hsfp=6c970fcd0e4c917c6d4c3a545f61dbf9
              - text: learn more
      - generic [ref=e132]:
        - figure "Virtual-ATI A master’s-prepared Nurse Educator will serve as your personal tutor to guide you through online NCLEX preparation. Start with an evaluation, and a personalized study plan will be developed just for you. Virtual-ATI" [ref=e134]:
          - generic [ref=e136]:
            - heading "Virtual-ATI" [level=2] [ref=e137]
            - generic [ref=e138]: A master’s-prepared Nurse Educator will serve as your personal tutor to guide you through online NCLEX preparation. Start with an evaluation, and a personalized study plan will be developed just for you.
            - link "Virtual-ATI" [ref=e139] [cursor=pointer]:
              - /url: https://www.atitesting.com/nclex-prep/virtual-ati
              - text: learn more
        - figure "Live NCLEX Review Our in-person, nurse educator-led NCLEX Review will guarantee you pass the NCLEX. Our pass rates are more than 96%. Locations are available throughout the United States. Live NCLEX Review" [ref=e141]:
          - generic [ref=e143]:
            - heading "Live NCLEX Review" [level=2] [ref=e144]
            - generic [ref=e145]: Our in-person, nurse educator-led NCLEX Review will guarantee you pass the NCLEX. Our pass rates are more than 96%. Locations are available throughout the United States.
            - link "Live NCLEX Review" [ref=e146] [cursor=pointer]:
              - /url: https://www.atitesting.com/nclex-prep/live-review
              - text: learn more
        - figure "View All Product Solutions ATI has the product solution to help you become a successful nurse. Check out our tutorials and practice exams for topics like Pharmacology, Med-Surge, NCLEX Prep, and much more. View All Product Solutions" [ref=e148]:
          - generic [ref=e150]:
            - heading "View All Product Solutions" [level=2] [ref=e151]
            - generic [ref=e152]: ATI has the product solution to help you become a successful nurse. Check out our tutorials and practice exams for topics like Pharmacology, Med-Surge, NCLEX Prep, and much more.
            - link "View All Product Solutions" [ref=e153] [cursor=pointer]:
              - /url: https://www.atitesting.com/solutions
              - text: View All Products
        - figure "Facebook Question of the Week Follow our Facebook page for the NCLEX-Style \"Question of the week,\" as well as relevant posts and live events to help you on your road to becoming a successful nurse. Facebook Question of the Week" [ref=e155]:
          - generic [ref=e156]:
            - heading "Facebook Question of the Week" [level=2] [ref=e157]
            - generic [ref=e158]: Follow our Facebook page for the NCLEX-Style "Question of the week," as well as relevant posts and live events to help you on your road to becoming a successful nurse.
            - link "Facebook Question of the Week" [ref=e159] [cursor=pointer]:
              - /url: https://www.facebook.com/ATINursingEducation/?ref=aymt_homepage_panel
              - text: learn more
    - generic [ref=e161]:
      - generic [ref=e162]:
        - heading "Featured Webinars & Podcasts" [level=2] [ref=e164]
        - link "View All Events" [ref=e167] [cursor=pointer]:
          - /url: /events
      - generic [ref=e169] [cursor=pointer]:
        - generic [ref=e170]:
          - generic [ref=e172]: 24/7
          - strong [ref=e174]: "Five Tips to Improve Your TEAS Score: Episode 282"
          - generic [ref=e176]: On-Demand
        - generic:
          - paragraph [ref=e177]: When you don't meet your target school's criteria on this ATI TEAS entrance exam, it can lead to feelings of discouragement and even thoughts of giving up on your dream.
          - link "Listen Now" [ref=e178]:
            - /url: https://atitesting.com/teas/teas-prep-tips/five-tips-to-improve-your-teas-score/
      - button "View More" [ref=e181] [cursor=pointer]
    - dialog [ref=e182]:
      - generic [ref=e184]:
        - heading "Select a site below" [level=2] [ref=e186]
        - generic [ref=e188]:
          - figure [ref=e189]:
            - generic [ref=e190] [cursor=pointer]:
              - emphasis
              - img "TEAS Student" [ref=e191]
              - generic [ref=e192]: I am preparing for or taking the TEAS
          - figure [ref=e193]:
            - generic [ref=e194] [cursor=pointer]:
              - emphasis
              - img "Student" [ref=e195]
              - generic [ref=e196]: I’m a Nursing Student
          - figure [ref=e197]:
            - generic [ref=e198] [cursor=pointer]:
              - emphasis
              - img "Educator, Dean, or Director" [ref=e199]
              - generic [ref=e200]: I’m an Educator, Dean or Director
    - generic [ref=e202]:
      - paragraph [ref=e203]:
        - link "NURSING SCHOOL RESOURCES" [ref=e204] [cursor=pointer]:
          - /url: /solutions
        - link "PRIVACY" [ref=e205] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html
        - link "YOUR PRIVACY CHOICES" [ref=e206] [cursor=pointer]:
          - /url: "#"
        - link "CALIFORNIA RESIDENTS PRIVACY NOTICE" [ref=e207] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html#privacy_information_ca
        - link "DATA PRIVACY REQUEST" [ref=e208] [cursor=pointer]:
          - /url: /data-privacy-request
        - link "TERMS AND CONDITIONS" [ref=e209] [cursor=pointer]:
          - /url: https://auth.atitesting.com/terms.html
        - link "WEBSITE TERMS OF USE" [ref=e210] [cursor=pointer]:
          - /url: https://auth.atitesting.com/website_terms.html
        - link "TECHNICAL REQUIREMENTS" [ref=e211] [cursor=pointer]:
          - /url: /technical-requirements
        - link "SITEMAP" [ref=e212] [cursor=pointer]:
          - /url: /sitemap
        - link "STORE" [ref=e213] [cursor=pointer]:
          - /url: /solutions
        - link "BECOME AN ATI AFFILIATE" [ref=e214] [cursor=pointer]:
          - /url: /affiliate-program/
      - navigation [ref=e215]:
        - list [ref=e216]:
          - listitem [ref=e217]:
            - link "Facebook" [ref=e218] [cursor=pointer]:
              - /url: https://www.facebook.com/atinursingeducation
              - text: 
          - listitem [ref=e219]:
            - link "Twitter" [ref=e220] [cursor=pointer]:
              - /url: https://www.twitter.com/atinursing
              - text: 
          - listitem [ref=e221]:
            - link "Youtube" [ref=e222] [cursor=pointer]:
              - /url: https://www.youtube.com/user/ATINursingEducation
              - text: 
          - listitem [ref=e223]:
            - link "Linkedin" [ref=e224] [cursor=pointer]:
              - /url: https://www.linkedin.com/companies/362495
              - text: 
        - generic "ATI Logo" [ref=e225]
      - navigation [ref=e226]: Copyright © 2026 Assessment Technologies Institute®, LLC. All rights reserved.
  - dialog "Consent Banner" [ref=e227]:
    - generic [ref=e228]:
      - generic [ref=e230]:
        - text: We value your privacy and respect your preferences. We allow certain online advertising partners to collect information from our services (e.g., device identifiers and usage information) through technologies such as cookies and pixels to deliver ads that are more relevant to you and assist us with related analytics activities. This may be considered "selling" or "sharing/processing” for targeted online advertising under applicable law. To opt out of these activities, please click “MANAGE”. Please read our
        - link "Privacy Policy" [ref=e231] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html
        - text: to learn about all of our data processing activities and your choices.
      - generic [ref=e232]:
        - button "Manage" [ref=e233] [cursor=pointer]
        - button "Okay" [ref=e234] [cursor=pointer]
  - button "Open chat Need help?" [ref=e235] [cursor=pointer]:
    - img "Open chat" [ref=e236]
    - generic [ref=e237]: Need help?
```

# Test source

```ts
  1   | import { Page, TestInfo, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | 
  4   | export interface AccessibilityScanOptions {
  5   |   /** Array of CSS selectors to restrict the scan to (Component-level scanning) */
  6   |   includeSelectors?: string[];
  7   |   /** Array of CSS selectors to exclude from the scan */
  8   |   excludeSelectors?: string[];
  9   |   /** Axe rule IDs to disable (e.g., ['color-contrast']) */
  10  |   disabledRules?: string[];
  11  | }
  12  | 
  13  | export class AccessibilityUtility {
  14  |   private page: Page;
  15  |   private testInfo: TestInfo;
  16  | 
  17  |   constructor(page: Page, testInfo: TestInfo) {
  18  |     this.page = page;
  19  |     this.testInfo = testInfo;
  20  |   }
  21  | 
  22  |   /**
  23  |    * 1. Dynamic Scope & Component-Level Scanning with Report Annotations
  24  |    */
  25  |   async runAxeScan(scanName: string, options: AccessibilityScanOptions = {}) {
  26  |     let builder = new AxeBuilder({ page: this.page });
  27  | 
  28  |     if (options.includeSelectors?.length) {
  29  |       for (const selector of options.includeSelectors) {
  30  |         builder = builder.include(selector);
  31  |       }
  32  |     }
  33  | 
  34  |     if (options.excludeSelectors?.length) {
  35  |       for (const selector of options.excludeSelectors) {
  36  |         builder = builder.exclude(selector);
  37  |       }
  38  |     }
  39  | 
  40  |     if (options.disabledRules?.length) {
  41  |       builder = builder.disableRules(options.disabledRules);
  42  |     }
  43  | 
  44  |     const results = await builder.analyze();
  45  | 
  46  |     // 4. Attach Annotations & Metadata to Playwright HTML Report
  47  |     this.testInfo.annotations.push({
  48  |       type: 'Accessibility Scan',
  49  |       description: `Scan: "${scanName}" | Page URL: ${this.page.url()} | Total Violations: ${results.violations.length}`,
  50  |     });
  51  | 
  52  |     if (results.violations.length > 0) {
  53  |       const reportDetails = results.violations.map(v => ({
  54  |         ruleId: v.id,
  55  |         impact: v.impact,
  56  |         description: v.help,
  57  |         helpUrl: v.helpUrl,
  58  |         nodesAffected: v.nodes.length,
  59  |         targetElements: v.nodes.map(n => n.target.join(' > ')),
  60  |       }));
  61  | 
  62  |       // Attach detailed JSON breakdown to report
  63  |       await this.testInfo.attach(`Axe-Violations-${scanName}`, {
  64  |         body: JSON.stringify(reportDetails, null, 2),
  65  |         contentType: 'application/json',
  66  |       });
  67  |     }
  68  | 
  69  |     // Soft assertion so the test continues gathering insights
> 70  |     expect.soft(results.violations, `Accessibility violations found on "${scanName}"`).toEqual([]);
      |                                                                                        ^ Error: Accessibility violations found on "ATI Public Homepage"
  71  |     return results;
  72  |   }
  73  | 
  74  |   /**
  75  |    * 2. Multi-Page & Sitemap Dynamic Scanning / Crawling
  76  |    */
  77  |   async scanSitemapUrls(urls: string[], globalOptions: AccessibilityScanOptions = {}) {
  78  |     for (const url of urls) {
  79  |       await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  80  |       await this.runAxeScan(`Sitemap Scan - ${url}`, globalOptions);
  81  |     }
  82  |   }
  83  | 
  84  |   /**
  85  |    * 3. Keyboard Navigation & Screen Reader Focus Verification
  86  |    */
  87  |   async verifyKeyboardFocusableElements(interactiveSelectors: string[]) {
  88  |     const focusResults: { selector: string; isFocused: boolean }[] = [];
  89  | 
  90  |     for (const selector of interactiveSelectors) {
  91  |       await this.page.locator(selector).first().focus();
  92  |       const isFocused = await this.page.evaluate((sel) => {
  93  |         const active = document.activeElement;
  94  |         const target = document.querySelector(sel);
  95  |         return active === target || target?.contains(active);
  96  |       }, selector);
  97  | 
  98  |       focusResults.push({ selector, isFocused });
  99  | 
  100 |       expect.soft(isFocused, `Element "${selector}" failed keyboard focus check`).toBeTruthy();
  101 |     }
  102 | 
  103 |     this.testInfo.annotations.push({
  104 |       type: 'Keyboard Accessibility Check',
  105 |       description: `Verified focus for ${focusResults.length} interactive elements.`,
  106 |     });
  107 |   }
  108 | }
```