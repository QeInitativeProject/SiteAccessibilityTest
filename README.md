# ATI Automated Accessibility & UI Testing Suite

Enterprise-grade automated accessibility testing framework built with **Playwright**, **@axe-core/playwright**, and **axe-html-reporter** to audit ATI platforms (`atitesting.com`, `user-management.atitesting.com`, and `student.atitesting.com`).

---

## Key Features

- **Multi-Page & Sitemap Dynamic Crawling:** Iterates across lists of URLs to execute WCAG compliance scans on public and authenticated pages.
- **Component-Level Scoping:** Isolates targeted sections using `includeSelectors` (`header`, `footer`) and bypasses third-party vendor noise using `excludeSelectors`.
- **Keyboard Interaction & Focus Verification:** Verifies programmatic input focus and simulates sequential `Tab` key navigation cycles across interactive controls.
- **Dual-Layer Reporting:**
  - **Standalone HTML Reports:** Generates per-scan HTML reports in `axe-reports/` (e.g., `report-ati-login-page.html`).
  - **CI/CD Native Attachments:** Logs violation summaries directly into Playwright's HTML dashboard with attached JSON details.
- **Legacy Debt Management:** Configurable `disabledRules` arrays to manage non-blocking audit logging without failing continuous delivery pipelines.

---

## Tech Stack

- **Framework:** Playwright (TypeScript)
- **Accessibility Engine:** `@axe-core/playwright`
- **HTML Reporter:** `axe-html-reporter`

---

## Prerequisites & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/QeInitativeProject/SiteAccessibilityTest.git](https://github.com/QeInitativeProject/SiteAccessibilityTest.git)
   cd SiteAccessibilityTest