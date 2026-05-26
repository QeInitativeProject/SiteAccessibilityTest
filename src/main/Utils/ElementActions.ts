import type { Locator, Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';
import { Logger } from './Logger';

export class ElementActions {
  private page: Page;
  private logger: Logger;
  private defaultTimeout: number;

  constructor(page: Page, testInfo: TestInfo, tcNumber?: string) {
    this.page = page;
    this.logger = new Logger(page, 'ElementActions', testInfo, { tcNumber });
    this.defaultTimeout = 30000;
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  async assertVisible(locator: Locator, elementName?: string, timeout?: number): Promise<void> {
    const name = elementName || 'Element';
    this.logger.step(`Asserting "${name}" is visible`);
    await expect(locator).toBeVisible({ timeout: timeout ?? this.defaultTimeout });
    this.logger.success(`✓ "${name}" is visible`);
  }

  async click(locator: Locator, elementName?: string, timeout?: number): Promise<void> {
    const name = elementName || 'Element';
    this.logger.step(`Clicking "${name}"`);
    await locator.waitFor({ state: 'visible', timeout: timeout ?? this.defaultTimeout });
    await locator.click();
    this.logger.success(`✓ Clicked "${name}"`);
  }

  async waitForVisible(locator: Locator, elementName?: string, timeout?: number): Promise<void> {
    const name = elementName || 'Element';
    this.logger.step(`Waiting for "${name}" to be visible`);
    await locator.waitFor({ state: 'visible', timeout: timeout ?? this.defaultTimeout });
    this.logger.success(`✓ "${name}" is visible`);
  }

  async fill(locator: Locator, value: string, elementName?: string, timeout?: number): Promise<void> {
    const name = elementName || 'Element';
    this.logger.step(`Filling "${name}" with value`);
    await locator.waitFor({ state: 'visible', timeout: timeout ?? this.defaultTimeout });
    await locator.fill(value);
    this.logger.success(`✓ Filled "${name}"`);
  }

  async assertHidden(locator: Locator, elementName?: string, timeout?: number): Promise<void> {
    const name = elementName || 'Element';
    this.logger.step(`Asserting "${name}" is hidden`);
    await expect(locator).toBeHidden({ timeout: timeout ?? this.defaultTimeout });
    this.logger.success(`✓ "${name}" is hidden`);
  }

  async getText(locator: Locator, elementName?: string, timeout?: number): Promise<string> {
    const name = elementName || 'Element';
    this.logger.step(`Getting text from "${name}"`);
    await locator.waitFor({ state: 'visible', timeout: timeout ?? this.defaultTimeout });
    const text = (await locator.textContent()) ?? '';
    this.logger.success(`✓ Got text from "${name}": "${text.trim()}"`);
    return text.trim();
  }

  async assertEqual(actual: string | number, expected: string | number, description?: string): Promise<void> {
    const desc = description || 'Values';
    this.logger.step(`Asserting ${desc}: "${actual}" equals "${expected}"`);
    expect(actual).toBe(expected);
    this.logger.success(`✓ ${desc} match: "${actual}" === "${expected}"`);
  }
}
