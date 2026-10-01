# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Suite - Advanced Testing >> Interactive Keyboard Focus Simulation
- Location: src\test\TestScript\accessibility.spec.ts:29:7

# Error details

```
Error: locator.focus: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[name="username"]').first()

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
  70  |     expect.soft(results.violations, `Accessibility violations found on "${scanName}"`).toEqual([]);
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
> 91  |       await this.page.locator(selector).first().focus();
      |                                                 ^ Error: locator.focus: Target page, context or browser has been closed
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