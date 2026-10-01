# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Suite - Advanced Testing >> Multi-Page Dynamic Crawl Scan
- Location: src\test\TestScript\accessibility.spec.ts:17:7

# Error details

```
Error: Accessibility violations found on "Sitemap Scan - https://example.com"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 237

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
+         "html": "<html lang=\"en\">",
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
+         "html": "<html lang=\"en\">",
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
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ar\" dir=\"rtl\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ar\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"zh\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"zh\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"fr\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"fr\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ru\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ru\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"es\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"es\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<a href=\"https://iana.org/help/example-domains\">Learn more</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "a",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-9.2.1",
+     ],
+   },
+ ]
```

```
Error: Accessibility violations found on "Sitemap Scan - https://example.com/about"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 237

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
+         "html": "<html lang=\"en\">",
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
+         "html": "<html lang=\"en\">",
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
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ar\" dir=\"rtl\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ar\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"zh\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"zh\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"fr\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"fr\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ru\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ru\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"es\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"es\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<a href=\"https://iana.org/help/example-domains\">Learn more</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "a",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-9.2.1",
+     ],
+   },
+ ]
```

```
Error: Accessibility violations found on "Sitemap Scan - https://example.com/contact"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 237

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
+         "html": "<html lang=\"en\">",
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
+         "html": "<html lang=\"en\">",
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
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ar\" dir=\"rtl\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ar\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"zh\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"zh\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"fr\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"fr\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"ru\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"ru\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p lang=\"es\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p[lang=\"es\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<a href=\"https://iana.org/help/example-domains\">Learn more</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "a",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-9.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - img [ref=e2]
  - paragraph [ref=e7]: This domain is for use in documentation examples without needing permission. This is not a service, avoid relying on it for testing and monitoring purposes.
  - paragraph [ref=e8]: هذا النطاق مُخصص للاستخدام في أمثلة التوثيق دون الحاجة إلى إذن. هذه ليست خدمة، يُرجى تجنب الاعتماد عليها لأغراض الاختبار والمراقبة.
  - paragraph [ref=e9]: 该域名仅用于文档示例，无需获得许可。这并非一项服务，请勿将其用于测试和监控目的。
  - paragraph [ref=e10]: L’usage de ce domaine est réservé à des exemples de documentation, sans autorisation préalable. Il ne s’agit pas d’un service ; son utilisation à des fins de test ou de surveillance est à éviter.
  - paragraph [ref=e11]: Данный домен предназначен для использования в примерах документации без необходимости получения предварительного разрешения. Это не сервис; не рекомендуется его использование для тестирования и мониторинга.
  - paragraph [ref=e12]: Este dominio está destinado al uso en ejemplos de documentación sin necesidad de permiso. Esto no es un servicio, evitar utilizarlo para realizar pruebas o monitoreos.
  - link "Learn more" [ref=e13] [cursor=pointer]:
    - /url: https://iana.org/help/example-domains
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
      |                                                                                        ^ Error: Accessibility violations found on "Sitemap Scan - https://example.com/contact"
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