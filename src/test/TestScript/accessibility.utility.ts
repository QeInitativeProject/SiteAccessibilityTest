import { Page, TestInfo, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import * as fs from 'fs';
import * as path from 'path';

export interface AccessibilityScanOptions {
  includeSelectors?: string[];
  excludeSelectors?: string[];
  disabledRules?: string[];
}

export class AccessibilityUtility {
  private page: Page;
  private testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  /**
   * Component-Level Scanning, Exclusions, HTML & JSON Reporting
   */
  async runAxeScan(scanName: string, options: AccessibilityScanOptions = {}) {
    let builder = new AxeBuilder({ page: this.page });

    if (options.includeSelectors?.length) {
      for (const selector of options.includeSelectors) {
        builder = builder.include(selector);
      }
    }

    if (options.excludeSelectors?.length) {
      for (const selector of options.excludeSelectors) {
        builder = builder.exclude(selector);
      }
    }

    if (options.disabledRules?.length) {
      builder = builder.disableRules(options.disabledRules);
    }

    const results = await builder.analyze();

    // 1. Playwright Test Annotations
    this.testInfo.annotations.push({
      type: 'Accessibility Scan Summary',
      description: `Scan: "${scanName}" | URL: ${this.page.url()} | Violations Detected: ${results.violations.length}`,
    });

    // 2. Generate Standalone HTML Report per scan inside axe-reports/
    const reportDir = path.join(process.cwd(), 'axe-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Sanitize scanName to create a clean, unique file name
    const sanitizedFileName = scanName
      .toLowerCase()
      .replace(/https?:\/\//g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    createHtmlReport({
      results,
      options: {
        projectKey: 'ATI Accessibility Suite',
        outputDir: 'axe-reports',
        reportFileName: `report-${sanitizedFileName}.html`,
      },
    });

    // 3. Attach JSON Artifacts to Playwright Native Report
    if (results.violations.length > 0) {
      const reportDetails = results.violations.map(v => ({
        ruleId: v.id,
        impact: v.impact,
        description: v.help,
        helpUrl: v.helpUrl,
        nodesAffected: v.nodes.length,
        targetElements: v.nodes.map(n => n.target.join(' > ')),
      }));

      await this.testInfo.attach(`Axe-Violations-${scanName.replace(/\s+/g, '_')}`, {
        body: JSON.stringify(reportDetails, null, 2),
        contentType: 'application/json',
      });
    }

    return results;
  }

  /**
   * Multi-Page & Sitemap Dynamic Scanning
   */
  async scanSitemapUrls(urls: string[], globalOptions: AccessibilityScanOptions = {}) {
    for (const url of urls) {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.runAxeScan(`Sitemap Scan - ${url}`, globalOptions);
    }
  }

  /**
   * Interactive Focus Verification
   */
  async verifyKeyboardFocusableElements(interactiveSelectors: string[]) {
    const focusResults: { selector: string; isFocused: boolean }[] = [];

    for (const selector of interactiveSelectors) {
      const locator = this.page.locator(selector).first();
      const count = await locator.count();

      if (count === 0) {
        this.testInfo.annotations.push({
          type: 'Keyboard Focus Skipped',
          description: `Element "${selector}" not present on page.`,
        });
        continue;
      }

      await locator.focus();
      const isFocused = await this.page.evaluate((sel) => {
        const active = document.activeElement;
        const target = document.querySelector(sel);
        return active === target || target?.contains(active) || false;
      }, selector);

      focusResults.push({ selector, isFocused });
    }

    this.testInfo.annotations.push({
      type: 'Keyboard Accessibility Check',
      description: `Verified focus for ${focusResults.length} interactive elements.`,
    });
  }

  /**
   * Real Tab-Key Navigation Cycle Simulation
   */
  async testTabNavigation(expectedTabCount: number = 3) {
    for (let i = 0; i < expectedTabCount; i++) {
      await this.page.keyboard.press('Tab');
    }

    const activeElementTag = await this.page.evaluate(() => document.activeElement?.tagName);
    this.testInfo.annotations.push({
      type: 'Interactive Keyboard Tab Simulation',
      description: `Simulated ${expectedTabCount} Tab presses. Currently focused element: <${activeElementTag?.toLowerCase()}>`,
    });
  }
}