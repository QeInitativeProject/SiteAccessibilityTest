# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Axe_Core_Test.spec.ts >> example accessibility test
- Location: src\test\TestScript\Axe_Core_Test.spec.ts:4:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

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
              - /url: https://atinursingblog.com/?__hstc=128800851.08d4ba81db821432153bcda45f7dd1a1.1790661550264.1790661550264.1790661550264.1&__hssc=128800851.1.1790661550264&__hsfp=6c970fcd0e4c917c6d4c3a545f61dbf9
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
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test('example accessibility test', async ({ page }) => {
  5  |   await page.goto('https://www.atitesting.com/');
  6  | 
  7  |   const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  8  | 
  9  |   // Log violations to console
  10 |   if (accessibilityScanResults.violations.length > 0) {
  11 |     console.log(`Found ${accessibilityScanResults.violations.length} accessibility violations.`);
  12 |   }
  13 | 
  14 |   // Soft assertion allows test to continue/pass while recording issues
> 15 |   expect.soft(accessibilityScanResults.violations).toEqual([]);
     |                                                    ^ Error: expect(received).toEqual(expected) // deep equality
  16 | });
```