# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Axe_Core_Test.spec.ts >> ATI Testing Accessibility Scenario Suite >> Step 1: Check accessibility of public main page
- Location: src\test\TestScript\Axe_Core_Test.spec.ts:13:7

# Error details

```
Error: Violations found on Public Homepage

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 505

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
+                 "html": "<li class=\"dropdown sub-dropdown\" data-hover=\"false\" data-expanded=\"false\" data-expandstatuschanged=\"false\">",
+                 "target": Array [
+                   "li[data-hover=\"false\"]",
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
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#dd5850",
+               "contrastRatio": 3.75,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.75 (foreground color: #ffffff, background color: #dd5850, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button id=\"five9OpenChatButton\" style=\"position: fixed; bor...\">",
+                 "target": Array [
+                   "#five9OpenChatButton",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.75 (foreground color: #ffffff, background color: #dd5850, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span id=\"five9OpenChatText\" style=\"color: var(--f9-chat-button-text-color); font-size: 14px; margin-left: 10px; font-family: Alverta-ExtraBold; display: block;\">Need help?</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "#five9OpenChatText",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
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
+         "html": "<li class=\"dropdown sub-dropdown\" data-hover=\"false\" data-expanded=\"false\" data-expandstatuschanged=\"false\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li[data-hover=\"false\"]",
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
              - /url: https://atinursingblog.com/?__hstc=128800851.c9d3130a03c53d7be83ccf896a1e398c.1790844816346.1790844816346.1790844816346.1&__hssc=128800851.1.1790844816346&__hsfp=6c970fcd0e4c917c6d4c3a545f61dbf9
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
> 43  |     expect.soft(publicPageResults.violations, 'Violations found on Public Homepage').toEqual([]);
      |                                                                                      ^ Error: Violations found on Public Homepage
  44  |   });
  45  | 
  46  |   // =========================================================================
  47  |   // SCENARIO STEP 2: Authenticate and Save Session State
  48  |   // =========================================================================
  49  |   test('Step 2: Login and store authenticated state', async ({ page }, testInfo) => {
  50  |     testInfo.annotations.push(
  51  |       { type: 'Category', description: 'Authentication' },
  52  |       { type: 'User', description: 'ashoksingh1995' }
  53  |     );
  54  | 
  55  |     await page.goto('https://www.atitesting.com/login');
  56  |     await page.waitForLoadState('domcontentloaded');
  57  | 
  58  |     // Fill in credentials
  59  |     await page.locator('#username, input[type="text"]').first().fill('ashoksingh1995');
  60  |     await page.locator('#password, input[type="password"]').first().fill('sweetFor(e98');
  61  |     
  62  |     // Click login button using the exact class '.ua-submit' or button text 'Login'
  63  |     await page.locator('button.ua-submit:has-text("Login")').click();
  64  | 
  65  |     // Wait for post-login navigation/redirection
  66  |     await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {
  67  |       console.log('Login redirection completed or dynamic UI loaded.');
  68  |     });
  69  | 
  70  |     // Save browser storage state (cookies + localStorage) for authenticated steps
  71  |     await page.context().storageState({ path: authFilePath });
  72  |   });
  73  | 
  74  |   // =========================================================================
  75  |   // SCENARIO STEP 3: Check Accessibility of Home Page in Authenticated Session
  76  |   // =========================================================================
  77  |   test('Step 3: Check accessibility of home page as Logged-In User', async ({ browser }, testInfo) => {
  78  |     testInfo.annotations.push(
  79  |       { type: 'Category', description: 'Authenticated Accessibility' },
  80  |       { type: 'Session', description: 'Logged-In User Home Page' }
  81  |     );
  82  | 
  83  |     // Create a new browser context with the saved authentication state
  84  |     const authContext = await browser.newContext({ storageState: authFilePath });
  85  |     const authenticatedPage = await authContext.newPage();
  86  | 
  87  |     // Navigate to Home Page with full logged-in user permissions
  88  |     await authenticatedPage.goto('https://www.atitesting.com/');
  89  |     await authenticatedPage.waitForLoadState('domcontentloaded');
  90  | 
  91  |     // Perform Axe Scan on Authenticated Home Page
  92  |     const authenticatedPageResults = await new AxeBuilder({ page: authenticatedPage })
  93  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  94  |       .analyze();
  95  | 
  96  |     // Generate HTML Report
  97  |     createHtmlReport({
  98  |       results: authenticatedPageResults,
  99  |       options: {
  100 |         projectKey: 'ATI - Authenticated Home Page',
  101 |         outputDir: 'axe-reports',
  102 |         reportFileName: 'report-03-authenticated-homepage.html',
  103 |       },
  104 |     });
  105 | 
  106 |     // Attach raw JSON results
  107 |     await testInfo.attach('authenticated-homepage-axe-results', {
  108 |       body: JSON.stringify(authenticatedPageResults.violations, null, 2),
  109 |       contentType: 'application/json',
  110 |     });
  111 | 
  112 |     expect.soft(authenticatedPageResults.violations, 'Violations found on Authenticated Homepage').toEqual([]);
  113 | 
  114 |     await authContext.close();
  115 |   });
  116 | 
  117 | });
```