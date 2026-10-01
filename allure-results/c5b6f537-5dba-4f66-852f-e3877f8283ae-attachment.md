# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> ATI Accessibility & UI Test Suite >> ATI Multi-Page / Sitemap Dynamic Scan
- Location: src\test\TestScript\accessibility.spec.ts:43:7

# Error details

```
Error: Accessibility violations found on "Sitemap Scan - https://www.atitesting.com"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 634

- Array []
+ Array [
+   Object {
+     "description": "Ensure ARIA attributes are not prohibited for an element's role",
+     "help": "Elements must only use permitted ARIA attributes",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-prohibited-attr?application=playwright",
+     "id": "aria-prohibited-attr",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   aria-label attribute cannot be used on a span with no valid role attribute.",
+         "html": "<span class=\"footer-logo display-block float-sm-right m-x-a m-t-2 m-b-1\" aria-label=\"ATI Logo\"></span>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": Object {
+               "messageKey": "noRoleSingular",
+               "nodeName": "span",
+               "prohibited": Array [
+                 "aria-label",
+               ],
+               "role": null,
+             },
+             "id": "aria-prohibited-attr",
+             "impact": "serious",
+             "message": "aria-label attribute cannot be used on a span with no valid role attribute.",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".footer-logo",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag412",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "RGAAv4",
+       "RGAA-7.1.1",
+     ],
+   },
+   Object {
+     "description": "Ensure elements with an ARIA role that require child roles contain them",
+     "help": "Certain ARIA roles must contain particular children",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-required-children?application=playwright",
+     "id": "aria-required-children",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "unallowed",
+               "values": "li",
+             },
+             "id": "aria-required-children",
+             "impact": "critical",
+             "message": "Element has children which are not allowed: li",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(1)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(2)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".sub-dropdown.dropdown:nth-child(3)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(4)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(5)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(6)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has children which are not allowed: li",
+         "html": "<ul class=\"nav nav-justified\" role=\"menubar\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".nav",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
+   Object {
+     "description": "Ensure the order of headings is semantically correct",
+     "help": "Heading levels should only increase by one",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/heading-order?application=playwright",
+     "id": "heading-order",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h5 class=\"color-2 h5\">Live Webinar Series</h5>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "div[data-date=\"2026-12-11\"] > .hero-content.container > .hero-grid > .hero-column:nth-child(1) > h5",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h3 class=\"color-2\">Multiple Dates Available</h3>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "div[data-date=\"2026-12-11\"] > .hero-content.container > .hero-grid > .hero-column:nth-child(1) > h3",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h5 class=\"color-white h5\">Live Webinar</h5>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".background-mobile-none > .hero-content.container > .hero-grid > .hero-column:nth-child(1) > h5",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h3 class=\"color-white\">Multiple Dates Available</h3>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".background-mobile-none > .hero-content.container > .hero-grid > .hero-column:nth-child(1) > h3",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure <img> elements have alternative text or a role of none or presentation",
+     "help": "Images must have alternative text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/image-alt?application=playwright",
+     "id": "image-alt",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-alt",
+             "impact": "critical",
+             "message": "Element does not have an alt attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an alt attribute
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<img src=\"/images/default-source/web/student/banners/student-webinar-banner.webp?sfvrsn=8e7e07c3_4\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           "div[data-date=\"2026-12-11\"] > .hero-content.container > .hero-grid > .center.hidden-xs.hero-column > img",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.text-alternatives",
+       "wcag2a",
+       "wcag111",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT7.a",
+       "TT7.b",
+       "EN-301-549",
+       "EN-9.1.1.1",
+       "ACT",
+       "RGAAv4",
+       "RGAA-1.1.1",
+     ],
+   },
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
+   Object {
+     "description": "Ensure links have discernible text",
+     "help": "Links must have discernible text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/link-name?application=playwright",
+     "id": "link-name",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-visible-text",
+             "impact": "serious",
+             "message": "Element does not have text that is visible to screen readers",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "serious",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "serious",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "serious",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix all of the following:
+   Element is in tab order and does not have accessible text
+
+ Fix any of the following:
+   Element does not have text that is visible to screen readers
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute",
+         "html": "<a class=\"icon-cartlink-ati\" href=\"https://shop.atitesting.com/ascend-cart/cart/redirect\">
+                 <span class=\"sr-only\">Cart</span>
+             </a>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": null,
+             "id": "focusable-no-name",
+             "impact": "serious",
+             "message": "Element is in tab order and does not have accessible text",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".icon-cartlink-ati",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.name-role-value",
+       "wcag2a",
+       "wcag244",
+       "wcag412",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT6.a",
+       "EN-301-549",
+       "EN-9.2.4.4",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-6.2.1",
+     ],
+   },
+   Object {
+     "description": "Ensure <li> elements are used semantically",
+     "help": "<li> elements must be contained in a <ul> or <ol>",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/listitem?application=playwright",
+     "id": "listitem",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".sub-dropdown.dropdown:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(6)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.structure",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
+   Object {
+     "description": "Ensure all skip links have a focusable target",
+     "help": "The skip-link target should exist and be focusable",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/skip-link?application=playwright",
+     "id": "skip-link",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "skip-link",
+             "impact": "moderate",
+             "message": "No skip link target",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   No skip link target",
+         "html": "<a class=\"skip-link skip-only skip-only-focusable\" href=\"#carousel_1\" aria-label=\"Skip to Main Content\">Skip to Main Content</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".skip-link",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-12.7.1",
+     ],
+   },
+ ]
```

```
Error: Accessibility violations found on "Sitemap Scan - https://www.atitesting.com/contact"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 428

- Array []
+ Array [
+   Object {
+     "description": "Ensure ARIA attributes are not prohibited for an element's role",
+     "help": "Elements must only use permitted ARIA attributes",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-prohibited-attr?application=playwright",
+     "id": "aria-prohibited-attr",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   aria-label attribute cannot be used on a span with no valid role attribute.",
+         "html": "<span class=\"footer-logo display-block float-sm-right m-x-a m-t-2 m-b-1\" aria-label=\"ATI Logo\"></span>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": Object {
+               "messageKey": "noRoleSingular",
+               "nodeName": "span",
+               "prohibited": Array [
+                 "aria-label",
+               ],
+               "role": null,
+             },
+             "id": "aria-prohibited-attr",
+             "impact": "serious",
+             "message": "aria-label attribute cannot be used on a span with no valid role attribute.",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".footer-logo",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag412",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "RGAAv4",
+       "RGAA-7.1.1",
+     ],
+   },
+   Object {
+     "description": "Ensure elements with an ARIA role that require child roles contain them",
+     "help": "Certain ARIA roles must contain particular children",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-required-children?application=playwright",
+     "id": "aria-required-children",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "unallowed",
+               "values": "li",
+             },
+             "id": "aria-required-children",
+             "impact": "critical",
+             "message": "Element has children which are not allowed: li",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(1)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(2)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".sub-dropdown.dropdown:nth-child(3)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(4)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(5)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(6)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has children which are not allowed: li",
+         "html": "<ul class=\"nav nav-justified\" role=\"menubar\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".nav",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
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
+                   ".float-sm-right.clearfix",
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
+   Object {
+     "description": "Ensure links have discernible text",
+     "help": "Links must have discernible text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/link-name?application=playwright",
+     "id": "link-name",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-visible-text",
+             "impact": "serious",
+             "message": "Element does not have text that is visible to screen readers",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "serious",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "serious",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "serious",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix all of the following:
+   Element is in tab order and does not have accessible text
+
+ Fix any of the following:
+   Element does not have text that is visible to screen readers
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute",
+         "html": "<a class=\"icon-cartlink-ati\" href=\"https://shop.atitesting.com/ascend-cart/cart/redirect\">
+                 <span class=\"sr-only\">Cart</span>
+             </a>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": null,
+             "id": "focusable-no-name",
+             "impact": "serious",
+             "message": "Element is in tab order and does not have accessible text",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".icon-cartlink-ati",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.name-role-value",
+       "wcag2a",
+       "wcag244",
+       "wcag412",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT6.a",
+       "EN-301-549",
+       "EN-9.2.4.4",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-6.2.1",
+     ],
+   },
+   Object {
+     "description": "Ensure <li> elements are used semantically",
+     "help": "<li> elements must be contained in a <ul> or <ol>",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/listitem?application=playwright",
+     "id": "listitem",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".sub-dropdown.dropdown:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(6)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.structure",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
+ ]
```

```
Error: Accessibility violations found on "Sitemap Scan - https://www.atitesting.com/about"

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 506

- Array []
+ Array [
+   Object {
+     "description": "Ensure ARIA attributes are not prohibited for an element's role",
+     "help": "Elements must only use permitted ARIA attributes",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-prohibited-attr?application=playwright",
+     "id": "aria-prohibited-attr",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   aria-label attribute cannot be used on a span with no valid role attribute.",
+         "html": "<span class=\"footer-logo display-block float-sm-right m-x-a m-t-2 m-b-1\" aria-label=\"ATI Logo\"></span>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": Object {
+               "messageKey": "noRoleSingular",
+               "nodeName": "span",
+               "prohibited": Array [
+                 "aria-label",
+               ],
+               "role": null,
+             },
+             "id": "aria-prohibited-attr",
+             "impact": "serious",
+             "message": "aria-label attribute cannot be used on a span with no valid role attribute.",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".footer-logo",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag412",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "RGAAv4",
+       "RGAA-7.1.1",
+     ],
+   },
+   Object {
+     "description": "Ensure elements with an ARIA role that require child roles contain them",
+     "help": "Certain ARIA roles must contain particular children",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/aria-required-children?application=playwright",
+     "id": "aria-required-children",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "unallowed",
+               "values": "li",
+             },
+             "id": "aria-required-children",
+             "impact": "critical",
+             "message": "Element has children which are not allowed: li",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(1)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".nav > .sub-dropdown.dropdown:nth-child(2)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"dropdown sub-dropdown \">",
+                 "target": Array [
+                   ".sub-dropdown.dropdown:nth-child(3)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(4)",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"active\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+                 "target": Array [
+                   ".active",
+                 ],
+               },
+               Object {
+                 "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+                 "target": Array [
+                   ".nav > li:nth-child(6)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has children which are not allowed: li",
+         "html": "<ul class=\"nav nav-justified\" role=\"menubar\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".nav",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
+   Object {
+     "description": "Ensure <img> elements have alternative text or a role of none or presentation",
+     "help": "Images must have alternative text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/image-alt?application=playwright",
+     "id": "image-alt",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-alt",
+             "impact": "critical",
+             "message": "Element does not have an alt attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an alt attribute
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<img src=\"/images/default-source/default-album/this-is-the-roomdd0b3e9d-8312-4c8b-8cf2-8726db426c3a.webp?sfvrsn=82592ed8_3?Status=Master&amp;sfvrsn=2&amp;size=350\" class=\"-wrapper\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".modal_click > picture > img",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.text-alternatives",
+       "wcag2a",
+       "wcag111",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT7.a",
+       "TT7.b",
+       "EN-301-549",
+       "EN-9.1.1.1",
+       "ACT",
+       "RGAAv4",
+       "RGAA-1.1.1",
+     ],
+   },
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
+                   ".clearfix",
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
+   Object {
+     "description": "Ensure links have discernible text",
+     "help": "Links must have discernible text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/link-name?application=playwright",
+     "id": "link-name",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-visible-text",
+             "impact": "serious",
+             "message": "Element does not have text that is visible to screen readers",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "serious",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "serious",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "serious",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix all of the following:
+   Element is in tab order and does not have accessible text
+
+ Fix any of the following:
+   Element does not have text that is visible to screen readers
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute",
+         "html": "<a class=\"icon-cartlink-ati\" href=\"https://shop.atitesting.com/ascend-cart/cart/redirect\">
+                 <span class=\"sr-only\">Cart</span>
+             </a>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": null,
+             "id": "focusable-no-name",
+             "impact": "serious",
+             "message": "Element is in tab order and does not have accessible text",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".icon-cartlink-ati",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.name-role-value",
+       "wcag2a",
+       "wcag244",
+       "wcag412",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT6.a",
+       "EN-301-549",
+       "EN-9.2.4.4",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-6.2.1",
+     ],
+   },
+   Object {
+     "description": "Ensure <li> elements are used semantically",
+     "help": "<li> elements must be contained in a <ul> or <ol>",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/listitem?application=playwright",
+     "id": "listitem",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > .sub-dropdown.dropdown:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"dropdown sub-dropdown \">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".sub-dropdown.dropdown:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/events\" target=\"_self\" role=\"link\" tabindex=\"0\">Events</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"active\">
+ 					<a href=\"/about\" target=\"_self\" role=\"link\" tabindex=\"0\">About Us</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".active",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "messageKey": "roleNotValid",
+             },
+             "id": "listitem",
+             "impact": "serious",
+             "message": "List item parent element has a role that is not role=\"list\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   List item parent element has a role that is not role=\"list\"",
+         "html": "<li class=\"\">
+ 					<a href=\"/student-blog\" target=\"_self\" role=\"link\" tabindex=\"0\">Blog</a>
+ 				</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".nav > li:nth-child(6)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.structure",
+       "wcag2a",
+       "wcag131",
+       "EN-301-549",
+       "EN-9.1.3.1",
+       "RGAAv4",
+       "RGAA-9.3.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - navigation [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - text: not a student? visit the educator site
        - generic [ref=e7]: 
    - generic [ref=e9]:
      - link "Logo" [ref=e10] [cursor=pointer]:
        - /url: /
      - navigation [ref=e11]:
        - link "contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
        - link "Create Account" [ref=e13] [cursor=pointer]:
          - /url: https://user-management.atitesting.com/createaccount
        - link " Log In" [ref=e14] [cursor=pointer]:
          - /url: https://user-management.atitesting.com
      - button "Product search icon" [ref=e15] [cursor=pointer]: 
      - text: 
      - navigation "Navigation" [ref=e16]:
        - menubar [ref=e17]:
          - listitem [ref=e18]:
            - button "TEAS" [ref=e19] [cursor=pointer]
          - listitem [ref=e20]:
            - button "Nursing School Resources" [ref=e21] [cursor=pointer]
          - listitem [ref=e22]:
            - button "NCLEX Prep" [ref=e23] [cursor=pointer]
          - listitem [ref=e24]:
            - link "Events" [ref=e25] [cursor=pointer]:
              - /url: /events
          - listitem [ref=e26]:
            - link "About Us" [ref=e27] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e28]:
            - link "Blog" [ref=e29] [cursor=pointer]:
              - /url: /student-blog
          - text: 
      - list [ref=e30]:
        - listitem:
          - link [ref=e31] [cursor=pointer]:
            - /url: https://shop.atitesting.com/ascend-cart/cart/redirect
    - figure "We're a company that's in good company Why ATI" [ref=e32]:
      - generic [ref=e36]:
        - heading "We're a company that's in good company" [level=2] [ref=e37]
        - heading "Why ATI" [level=1] [ref=e38]
    - generic [ref=e40]:
      - article [ref=e41]:
        - heading "We’re a company that’s in good company." [level=2] [ref=e42]
        - paragraph [ref=e43]: We have a real understanding of what it takes to become a nurse. ATI Nursing Education began with the help of a nurse and many nurses are a valued part of our company today. We also have a real understanding for what it takes to pass high-stakes tests. We boast a team of people (graduate-degreed psychometricians) who specialize in tests.
        - paragraph [ref=e44]: Every nursing student is unique. Some are young. Some are middle-aged. Some are moms. Some are dads. Some are morning people. Some are night owls. Some learn by the book. Others learn best online – which you should know, we are the leader in online learning. Intuitively, ATI Nursing Education's learning systems are designed to teach the way individuals learn. Whether it’s an RN or a PN program, we’re with your students from the beginning of school through the beginning of their nursing career and it’s done with the kind of personal, caring attention that’s synonymous with nursing.
        - paragraph [ref=e45]: With our help, students garner great results in high-stakes test preparation, with pass rates closer to 100% than any other education system in the market. It’s no surprise that we’re the first choice for more nurse educators, universities and colleges nationwide.
        - figure [ref=e46]:
          - generic [ref=e47] [cursor=pointer]:
            - img [ref=e49]
            - generic [ref=e51]:
              - button "Watch Video" [ref=e52]
              - img [ref=e53]
        - text: ╳
      - complementary
    - generic [ref=e58]:
      - figure "Blog Find many resources, tips, and information for taking the TEAS, excelling in nursing school and passing NCLEX Blog" [ref=e60]:
        - generic [ref=e61]:
          - heading "Blog" [level=2] [ref=e62]
          - paragraph [ref=e64]: Find many resources, tips, and information for taking the TEAS, excelling in nursing school and passing NCLEX
          - link "Blog" [ref=e65] [cursor=pointer]:
            - /url: https://atinursingblog.com/?__hstc=128800851.99f14f8489ed31af278cb7a04fd7d650.1790845685203.1790845685203.1790845685203.1&__hssc=128800851.2.1790845685203&__hsfp=6c970fcd0e4c917c6d4c3a545f61dbf9
            - text: learn more
      - figure "Contact Us We have a real understanding of what it takes to become a nurse and we are happy to answer your questions Contact Us" [ref=e67]:
        - generic [ref=e68]:
          - heading "Contact Us" [level=2] [ref=e69]
          - paragraph [ref=e71]: We have a real understanding of what it takes to become a nurse and we are happy to answer your questions
          - link "Contact Us" [ref=e72] [cursor=pointer]:
            - /url: /contact/
            - text: learn more
      - figure "Events Find upcoming events and webinars for prospective and current nursing students Events" [ref=e74]:
        - generic [ref=e75]:
          - heading "Events" [level=2] [ref=e76]
          - paragraph [ref=e78]: Find upcoming events and webinars for prospective and current nursing students
          - link "Events" [ref=e79] [cursor=pointer]:
            - /url: /events/
            - text: learn more
    - generic [ref=e82]:
      - paragraph [ref=e83]:
        - link "NURSING SCHOOL RESOURCES" [ref=e84] [cursor=pointer]:
          - /url: /solutions
        - link "PRIVACY" [ref=e85] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html
        - link "YOUR PRIVACY CHOICES" [ref=e86] [cursor=pointer]:
          - /url: "#"
        - link "CALIFORNIA RESIDENTS PRIVACY NOTICE" [ref=e87] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html#privacy_information_ca
        - link "DATA PRIVACY REQUEST" [ref=e88] [cursor=pointer]:
          - /url: /data-privacy-request
        - link "TERMS AND CONDITIONS" [ref=e89] [cursor=pointer]:
          - /url: https://auth.atitesting.com/terms.html
        - link "WEBSITE TERMS OF USE" [ref=e90] [cursor=pointer]:
          - /url: https://auth.atitesting.com/website_terms.html
        - link "TECHNICAL REQUIREMENTS" [ref=e91] [cursor=pointer]:
          - /url: /technical-requirements
        - link "SITEMAP" [ref=e92] [cursor=pointer]:
          - /url: /sitemap
        - link "STORE" [ref=e93] [cursor=pointer]:
          - /url: /solutions
        - link "BECOME AN ATI AFFILIATE" [ref=e94] [cursor=pointer]:
          - /url: /affiliate-program/
      - navigation [ref=e95]:
        - list [ref=e96]:
          - listitem [ref=e97]:
            - link "Facebook" [ref=e98] [cursor=pointer]:
              - /url: https://www.facebook.com/atinursingeducation
              - text: 
          - listitem [ref=e99]:
            - link "Twitter" [ref=e100] [cursor=pointer]:
              - /url: https://www.twitter.com/atinursing
              - text: 
          - listitem [ref=e101]:
            - link "Youtube" [ref=e102] [cursor=pointer]:
              - /url: https://www.youtube.com/user/ATINursingEducation
              - text: 
          - listitem [ref=e103]:
            - link "Linkedin" [ref=e104] [cursor=pointer]:
              - /url: https://www.linkedin.com/companies/362495
              - text: 
        - generic "ATI Logo" [ref=e105]
      - navigation [ref=e106]: Copyright © 2026 Assessment Technologies Institute®, LLC. All rights reserved.
  - dialog "Consent Banner" [ref=e107]:
    - generic [ref=e108]:
      - generic [ref=e110]:
        - text: We value your privacy and respect your preferences. We allow certain online advertising partners to collect information from our services (e.g., device identifiers and usage information) through technologies such as cookies and pixels to deliver ads that are more relevant to you and assist us with related analytics activities. This may be considered "selling" or "sharing/processing” for targeted online advertising under applicable law. To opt out of these activities, please click “MANAGE”. Please read our
        - link "Privacy Policy" [ref=e111] [cursor=pointer]:
          - /url: https://auth.atitesting.com/policy.html
        - text: to learn about all of our data processing activities and your choices.
      - generic [ref=e112]:
        - button "Manage" [ref=e113] [cursor=pointer]
        - button "Okay" [ref=e114] [cursor=pointer]
  - button "Open chat Need help?" [ref=e115] [cursor=pointer]:
    - img "Open chat" [ref=e116]
    - generic [ref=e117]: Need help?
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
      |                                                                                        ^ Error: Accessibility violations found on "Sitemap Scan - https://www.atitesting.com/about"
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