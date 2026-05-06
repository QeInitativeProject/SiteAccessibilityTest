import { expect, type TestInfo } from '@playwright/test';
import { Locator, Page } from '@playwright/test';
import { Logger } from './Logger';

/**
 * Comprehensive Assertion Utility for Playwright Tests
 * Contains all standard Playwright assertion methods in reusable form
 */
export class Assertions {
  private page: Page;
  private logger?: Logger;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    if (testInfo) {
      this.logger = new Logger(page, 'Assertions', testInfo);
    }
  }

  // Method to set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  // ============================================================================
  // PAGE ASSERTIONS
  // ============================================================================

  /**
   * Asserts that the page has the expected URL
   * @param expected - URL string or RegExp pattern
   */
  async assertPageHasURL(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expected);
  }

  /**
   * Asserts that the page title matches expected
   * @param expected - Title string or RegExp pattern
   */
  async assertPageHasTitle(expected: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  /**
   * Asserts that the page URL contains the expected string
   * @param expected - URL substring to check
   */
  async assertURLContains(expected: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expected));
  }

  /**
   * Asserts that the page URL does not contain the expected string
   * @param expected - URL substring to check
   */
  async assertURLNotContains(expected: string): Promise<void> {
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain(expected);
  }

  // ============================================================================
  // LOCATOR VISIBILITY ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element is visible
   * @param locator - The locator to check
   * @param timeout - Optional timeout in milliseconds
   */
  async assertVisible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Asserts that an element is hidden
   * @param locator - The locator to check
   * @param timeout - Optional timeout in milliseconds
   */
  async assertHidden(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  /**
   * Asserts that an element is attached to the DOM
   * @param locator - The locator to check
   */
  async assertAttached(locator: Locator): Promise<void> {
    await expect(locator).toBeAttached();
  }

  /**
   * Asserts that an element is detached from the DOM
   * @param locator - The locator to check
   */
  async assertDetached(locator: Locator): Promise<void> {
    await expect(locator).not.toBeAttached();
  }

  // ============================================================================
  // ELEMENT STATE ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element is enabled
   * @param locator - The locator to check
   */
  async assertEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  /**
   * Asserts that an element is disabled
   * @param locator - The locator to check
   */
  async assertDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  /**
   * Asserts that an element is editable
   * @param locator - The locator to check
   */
  async assertEditable(locator: Locator): Promise<void> {
    await expect(locator).toBeEditable();
  }

  /**
   * Asserts that an element is not editable
   * @param locator - The locator to check
   */
  async assertNotEditable(locator: Locator): Promise<void> {
    await expect(locator).not.toBeEditable();
  }

  /**
   * Asserts that a checkbox is checked
   * @param locator - The locator to check
   */
  async assertChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
  }

  /**
   * Asserts that a checkbox is not checked
   * @param locator - The locator to check
   */
  async assertNotChecked(locator: Locator): Promise<void> {
    await expect(locator).not.toBeChecked();
  }

  /**
   * Asserts that an element is focused
   * @param locator - The locator to check
   */
  async assertFocused(locator: Locator): Promise<void> {
    await expect(locator).toBeFocused();
  }

  // ============================================================================
  // TEXT AND CONTENT ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element has the expected text
   * @param locator - The locator to check
   * @param expected - Expected text (string or RegExp)
   */
  async assertHasText(locator: Locator, expected: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(expected);
  }

  /**
   * Asserts that an element contains the expected text
   * @param locator - The locator to check
   * @param expected - Expected text substring (string or RegExp)
   */
  async assertContainsText(locator: Locator, expected: string | RegExp): Promise<void> {
    await expect(locator).toContainText(expected);
  }

  /**
   * Asserts that an element has the expected value
   * @param locator - The locator to check
   * @param expected - Expected value (string or RegExp)
   */
  async assertHasValue(locator: Locator, expected: string | RegExp): Promise<void> {
    await expect(locator).toHaveValue(expected);
  }

  /**
   * Asserts that an element has empty value
   * @param locator - The locator to check
   */
  async assertHasEmptyValue(locator: Locator): Promise<void> {
    await expect(locator).toHaveValue('');
  }

  /**
   * Asserts that an element's text matches exactly
   * @param locator - The locator to check
   * @param expected - Expected exact text
   */
  async assertTextEquals(locator: Locator, expected: string): Promise<void> {
    const actualText = await locator.textContent();
    expect(actualText?.trim()).toBe(expected);
  }

  // ============================================================================
  // ATTRIBUTE ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element has a specific attribute
   * @param locator - The locator to check
   * @param name - Attribute name
   * @param value - Expected attribute value (string or RegExp)
   */
  async assertHasAttribute(locator: Locator, name: string, value: string | RegExp): Promise<void> {
    await expect(locator).toHaveAttribute(name, value);
  }

  /**
   * Asserts that an element has a specific class
   * @param locator - The locator to check
   * @param className - Class name to check
   */
  async assertHasClass(locator: Locator, className: string | RegExp): Promise<void> {
    await expect(locator).toHaveClass(className);
  }

  /**
   * Asserts that an element has a specific ID
   * @param locator - The locator to check
   * @param id - Expected ID value
   */
  async assertHasId(locator: Locator, id: string): Promise<void> {
    await expect(locator).toHaveId(id);
  }

  /**
   * Asserts that an element has a specific CSS property value
   * @param locator - The locator to check
   * @param name - CSS property name
   * @param value - Expected CSS property value (string or RegExp)
   */
  async assertHasCSS(locator: Locator, name: string, value: string | RegExp): Promise<void> {
    await expect(locator).toHaveCSS(name, value);
  }

  // ============================================================================
  // COUNT ASSERTIONS
  // ============================================================================

  /**
   * Asserts the count of elements matching the locator
   * @param locator - The locator to check
   * @param count - Expected count
   */
  async assertCount(locator: Locator, count: number): Promise<void> {
    await expect(locator).toHaveCount(count);
  }

  /**
   * Asserts that at least one element matches the locator
   * @param locator - The locator to check
   */
  async assertExists(locator: Locator): Promise<void> {
    await expect(locator).toHaveCount(1);
  }

  /**
   * Asserts that no elements match the locator
   * @param locator - The locator to check
   */
  async assertNotExists(locator: Locator): Promise<void> {
    await expect(locator).toHaveCount(0);
  }

  // ============================================================================
  // SCREENSHOT ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element matches a screenshot
   * @param locator - The locator to screenshot
   * @param name - Screenshot name
   */
  async assertScreenshot(locator: Locator, name: string): Promise<void> {
    await expect(locator).toHaveScreenshot(name);
  }

  /**
   * Asserts that the page matches a screenshot
   * @param name - Screenshot name
   */
  async assertPageScreenshot(name: string): Promise<void> {
    await expect(this.page).toHaveScreenshot(name);
  }

  // ============================================================================
  // COLLECTION ASSERTIONS
  // ============================================================================

  /**
   * Asserts that elements contain specific text values
   * @param locator - The locator to check
   * @param expected - Array of expected text values
   */
  async assertContainsTexts(locator: Locator, expected: string[]): Promise<void> {
    for (const text of expected) {
      await expect(locator).toContainText(text);
    }
  }

  /**
   * Asserts that elements have specific text values
   * @param locator - The locator to check
   * @param expected - Array of expected text values
   */
  async assertHasTexts(locator: Locator, expected: string[]): Promise<void> {
    const count = await locator.count();
    expect(count).toBe(expected.length);

    for (let i = 0; i < expected.length; i++) {
      await expect(locator.nth(i)).toHaveText(expected[i]);
    }
  }

  // ============================================================================
  // BOOLEAN / VALUE ASSERTIONS
  // ============================================================================

  /**
   * Asserts that a value is truthy
   * @param value - Value to check
   */
  assertTruthy(value: unknown): void {
    expect(value).toBeTruthy();
  }

  /**
   * Asserts that a value is falsy
   * @param value - Value to check
   */
  assertFalsy(value: unknown): void {
    expect(value).toBeFalsy();
  }

  /**
   * Asserts that a value equals expected value
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertEqual(actual: unknown, expected: unknown): void {
    expect(actual).toBe(expected);
  }

  /**
   * Asserts that a value does not equal expected value
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertNotEqual(actual: unknown, expected: unknown): void {
    expect(actual).not.toBe(expected);
  }

  /**
   * Asserts that a value matches a regex pattern
   * @param value - Value to check
   * @param pattern - RegExp pattern
   */
  assertMatches(value: string, pattern: RegExp): void {
    expect(value).toMatch(pattern);
  }

  /**
   * Asserts that a value does not match a regex pattern
   * @param value - Value to check
   * @param pattern - RegExp pattern
   */
  assertNotMatches(value: string, pattern: RegExp): void {
    expect(value).not.toMatch(pattern);
  }

  /**
   * Asserts that a number is greater than expected
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertGreaterThan(actual: number, expected: number): void {
    expect(actual).toBeGreaterThan(expected);
  }

  /**
   * Asserts that a number is greater than or equal to expected
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertGreaterThanOrEqual(actual: number, expected: number): void {
    expect(actual).toBeGreaterThanOrEqual(expected);
  }

  /**
   * Asserts that a number is less than expected
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertLessThan(actual: number, expected: number): void {
    expect(actual).toBeLessThan(expected);
  }

  /**
   * Asserts that a number is less than or equal to expected
   * @param actual - Actual value
   * @param expected - Expected value
   */
  assertLessThanOrEqual(actual: number, expected: number): void {
    expect(actual).toBeLessThanOrEqual(expected);
  }

  /**
   * Asserts that a string contains a substring
   * @param actual - Actual string
   * @param expected - Expected substring
   */
  assertStringContains(actual: string, expected: string): void {
    expect(actual).toContain(expected);
  }

  /**
   * Asserts that a string does not contain a substring
   * @param actual - Actual string
   * @param expected - Expected substring
   */
  assertStringNotContains(actual: string, expected: string): void {
    expect(actual).not.toContain(expected);
  }

  /**
   * Asserts that an array contains an item
   * @param array - Array to check
   * @param item - Item to find
   */
  assertArrayContains(array: unknown[], item: unknown): void {
    expect(array).toContain(item);
  }

  /**
   * Asserts that an array has a specific length
   * @param array - Array to check
   * @param length - Expected length
   */
  assertArrayLength(array: unknown[], length: number): void {
    expect(array).toHaveLength(length);
  }

  // ============================================================================
  // ROLE-BASED ASSERTIONS
  // ============================================================================

  /**
   * Asserts that an element with a specific role has expected text
   * @param role - Element role
   * @param name - Element name/text
   * @param expectedText - Expected text
   */
  async assertRoleHasText(role: string, name: string, expectedText: string): Promise<void> {
    const element = this.page.getByRole(role as 'button' | 'heading' | 'link' | 'textbox' | 'checkbox', { name });
    await expect(element).toHaveText(expectedText);
  }

  /**
   * Asserts that an element with a specific role is visible
   * @param role - Element role
   * @param name - Element name/text
   */
  async assertRoleVisible(role: string, name: string): Promise<void> {
    const element = this.page.getByRole(role as 'button' | 'heading' | 'link' | 'textbox' | 'checkbox', { name });
    await expect(element).toBeVisible();
  }

  // ============================================================================
  // CUSTOM ASSERTIONS FOR SPECIFIC USE CASES
  // ============================================================================

  /**
   * Asserts that a string is a valid numeric ID (digits only)
   * @param value - Value to check
   * @param minLength - Minimum length of the ID
   */
  assertValidNumericId(value: string, minLength: number = 1): void {
    expect(value).toBeTruthy();
    expect(value).toMatch(/^\d+$/);
    expect(value.length).toBeGreaterThan(minLength);
  }

  /**
   * Asserts that extracted text from a locator matches expected value
   * @param locator - The locator to extract text from
   * @param expected - Expected text value
   */
  async assertExtractedText(locator: Locator, expected: string): Promise<void> {
    const actualText = await locator.textContent();
    expect(actualText?.trim()).toBe(expected);
  }

  /**
   * Waits for a locator and asserts it's visible
   * @param locator - The locator to check
   * @param timeout - Timeout in milliseconds
   */
  async waitAndAssertVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeVisible();
  }

  /**
   * Asserts that a percentage value matches expected format and value
   * @param actual - Actual percentage string (e.g., "75.0%")
   * @param expected - Expected percentage string (e.g., "75.0%")
   */
  assertPercentage(actual: string, expected: string): void {
    expect(actual.trim()).toBe(expected);
    expect(actual).toMatch(/^\d+(\.\d+)?%$/);
  }

  /**
   * Wait for and assert that the APPROVE button is visible and enabled before clicking
   * @param timeout - Timeout in milliseconds (default: 15000)
   */
  async waitAndAssertApproveButtonVisible(timeout: number = 15000): Promise<void> {
    const approveButton = this.page.locator('//span[text()="APPROVE"]');
    this.logger?.info('Waiting for APPROVE button to be visible...');
    await approveButton.waitFor({ state: 'visible', timeout });
    await expect(approveButton).toBeVisible();
    await expect(approveButton).toBeEnabled();
    this.logger?.success('✅ APPROVE button is visible and enabled');
  }

  /**
   * Wait for and assert that the DENY button is visible and enabled
   * @param timeout - Timeout in milliseconds (default: 15000)
   */
  async waitAndAssertDenyButtonVisible(timeout: number = 15000): Promise<void> {
    const denyButton = this.page.locator('//span[text()="DENY"]');
    this.logger?.info('Waiting for DENY button to be visible...');
   // await denyButton.waitFor({ state: 'visible', timeout });
    await expect(denyButton).toBeVisible();
    await expect(denyButton).toBeEnabled();
    this.logger?.success('✅ DENY button is visible and enabled');
  }

  /**
   * Wait for and assert that the Start Proctoring button is visible and enabled
   * @param timeout - Timeout in milliseconds (default: 15000)
   */
  async waitAndAssertStartProctorButtonVisible(timeout: number = 15000): Promise<void> {
    const startProctorButton = this.page.locator('//div[@class="flex flex-row justify-center items-stretch"]/button');
    this.logger?.info('Waiting for Start Proctoring button to be visible...');
    await startProctorButton.waitFor({ state: 'visible', timeout });
    await expect(startProctorButton).toBeVisible();
    await expect(startProctorButton).toBeEnabled();
    this.logger?.success('✅ Start Proctoring button is visible and enabled');
  }
}
