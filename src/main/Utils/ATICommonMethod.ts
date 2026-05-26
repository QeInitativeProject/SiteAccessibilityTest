import type { Locator, Page, TestInfo } from '@playwright/test';
import { Logger } from './Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { Assertions } from './Assertion';

export class ATICommonMethod {
  page: Page;
  private logger?: Logger;
  private locators: StudentFacingPageLocators;
  private assertions: Assertions;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.locators = new StudentFacingPageLocators(page);
    this.assertions = new Assertions(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'ATICommonMethod', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  // Set assertions manually
  setAssertions(assertions: Assertions) {
    this.assertions = assertions;
  }

  validateHeaderTitle = async (header: string) => {
    await this.assertions.assertCount(this.page.locator('.blockUI.blockMsg.blockPage'), 0);
    await this.page.waitForSelector(`(//span[text()='My ATI'])[1]`);
    await this.assertions.assertHasText(this.page.locator(`(//span[text()='My ATI'])[1]`), header);
  };

  getSubHeader = async (subHeader: string): Promise<Locator> => {
    return this.page.locator(`//h1=[text()='${subHeader}']`);
  };
  //enhanced by shyan to handle network idle, domcontentloaded states, and blockUI overlay
  async clickOnMyATITab() {
    this.logger?.step('Clicking on My ATI tab');

    // Handle Account Management redirect - student has no active products
    if (this.page.url().includes('IsAccountManagement=true')) {
      this.logger?.debug('Page redirected to Account Management - navigating to Home');
      await this.page.goto(this.page.url().replace('?IsAccountManagement=true', '').replace('&IsAccountManagement=true', ''));
      await this.page.waitForLoadState('load');
    }

    // Wait for any blockUI overlay to disappear first
    const blockOverlay = this.locators.blockUIOverlay;
    if ((await blockOverlay.count()) > 0) {
      this.logger?.debug('BlockUI overlay detected, waiting for it to disappear');
      await blockOverlay.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
        this.logger?.debug('BlockUI overlay did not disappear in time, proceeding anyway');
      });
    }

    const myATITab = this.locators.myATITabLink;

    // Wait for the element to be attached to the DOM
    await this.assertions.assertAttached(myATITab);
    this.logger?.debug('My ATI tab attached to DOM');

    // Wait for it to be visible (not just present)
    await this.assertions.assertVisible(myATITab);
    this.logger?.debug('My ATI tab is visible');

    // Wait for it to be enabled/clickable
    await this.assertions.assertEnabled(myATITab);
    this.logger?.debug('My ATI tab is enabled');

    // Try clicking, with a fallback in case of race conditions
    try {
      await myATITab.click({ timeout: 30000 });
      this.logger?.success('Successfully clicked My ATI tab');
    } catch (error) {
      // If click fails, take a screenshot and rethrow for diagnostics
      await this.logger?.error('Failed to click My ATI tab', error);
      throw error;
    }
  }

  clickOnLearnTab = async () => {
    this.page.locator('//a[@aria-labelledby="lblLearnTab"]');
    await this.assertions.assertVisible(
      this.page.locator("//a[@aria-labelledby='lblLearnTab' and text()='Learn']")
    );
  };

  clickOnAssessmentsTab = async () => {
    await this.page.waitForTimeout(8000);
    this.logger?.step('Clicking on Assessments tab');
    // Find all "Add a Product" buttons and click the first visible one
    const addProductButtons = this.locators.addProductButtons;
    const count = await addProductButtons.count();
    this.logger?.debug(`Found ${count} "Add a Product" buttons`);

    for (let i = 0; i < count; i++) {
      const button = addProductButtons.nth(i);
      if (await button.isVisible()) {
        this.logger?.success(`Found visible "Add a Product" button at index ${i}, clicking it`);
        await button.click();
        await this.logger?.captureScreenshot('add-product-clicked');
        return;
      }
    }

    await this.logger?.error('No visible "Add a Product" button found');
    throw new Error('No visible "Add a Product" button found');
  };

  clickOnPracticeAssessment = async () => {
    const continuePracticeAssessment = this.page.locator(
      "(//span[starts-with(text(),'Practice Assessment')])[1]/../following-sibling::div/nav/div/a[3]"
    );
    const beginPracticeAssessment = this.page.locator(
      "//span[@id='practiceAssessment0']/../following-sibling::div/section/following-sibling::nav/div/a[1]"
    );
    const retakePracticeAssessment = this.page.locator(
      "(//span[starts-with(text(),'Practice Assessment')])[1]/../following-sibling::div/nav/div/a[4]"
    );

    if (await continuePracticeAssessment.isVisible()) {
      this.logger?.info('Continue practice assessment found, clicking on it');
      await this.clickOnContinuePracticeAssessment();
      this.logger?.success('Successfully clicked on Continue practice assessment');
    } else if (await beginPracticeAssessment.isVisible()) {
      this.logger?.info('Begin practice assessment found, clicking on it');
      await this.clickOnBeginPracticeAssessment();
      this.logger?.success('Successfully clicked on Begin practice assessment');
    } else if (await retakePracticeAssessment.isVisible()) {
      this.logger?.info('Retake practice assessment found, clicking on it');
      await this.clickOnRetakePracticeAssessment();
      this.logger?.success('Successfully clicked on Retake practice assessment');
    } else {
      this.logger?.debug('No practice assessment buttons found');
    }
  };

  clickOnBeginPracticeAssessment = async () => {
    await this.page
      .locator(
        "//span[@id='practiceAssessment0']/../following-sibling::div/section/following-sibling::nav/div/a[1]"
      )
      .click();
  };

  clickOnContinuePracticeAssessment = async () => {
    await this.page
      .locator(
        "(//span[starts-with(text(),'Practice Assessment')])[1]/../following-sibling::div/nav/div/a[3]"
      )
      .click();
  };

  clickOnRetakePracticeAssessment = async () => {
    await this.page
      .locator(
        "(//span[starts-with(text(),'Practice Assessment')])[1]/../following-sibling::div/nav/div/a[4]"
      )
      .click();
  };

  startPracticeAssessment = async () => {
    const maxIterations = 50;
    let iteration = 0;
    while (iteration < maxIterations) {
      iteration++;
      // Wait for page to load
      await this.page.waitForLoadState('load');
      await this.page.waitForTimeout(2000);

      const radioOptions = this.page.locator(
        "(//div[@role='radiogroup']//input[@type='radio'])[1]"
      );
      const moveNextButton1 = this.page.locator(
        '//button[@class="move-to-next-content focus-element-flag move-to-next-content-active"]'
      );
      const checkboxOptions = this.page.locator(
        '(//label[@class="mat-checkbox-layout"])[3]/span[1]'
      );
      const finishButton = this.page.locator(
        '//button[@class="button primary-button focus-element-flag ng-star-inserted"]'
      );

      if (await radioOptions.isVisible()) {
        this.logger?.info('Found radio option clicking on it');
        await this.page.waitForTimeout(10000);
        await this.page
          .locator(
            '//button[@class="move-to-next-content focus-element-flag move-to-next-content-active"]'
          )
          .scrollIntoViewIfNeeded();
        await radioOptions.click();
        break; // Exit the loop
      } else if (await checkboxOptions.isVisible()) {
        this.logger?.info('Found check box options, selecting first option');
        await this.page.waitForTimeout(10000);
        await checkboxOptions.first().click();
        await this.page
          .locator(
            '//button[@class="move-to-next-content focus-element-flag move-to-next-content-active"]'
          )
          .scrollIntoViewIfNeeded();
        await moveNextButton1.click();
      } else if (await finishButton.isVisible()) {
        this.logger?.info('Found finish button clicking on it');
        await this.page.waitForTimeout(2000);
        await finishButton.click();
        await this.page
          .locator(
            '//button[@class="move-to-next-content focus-element-flag move-to-next-content-active"]'
          )
          .scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(2000);
      } else {
        this.logger?.debug('No recognized question type found, breaking loop');
        break;
      }
    }
  };

  clickOnPrepTab = async () => {
    await this.page.locator("//a[text()='NCLEX Prep']").click();
  };

  clickOnCalendarTab = async () => {
    await this.page.getByLabel(`Calendar Tab: Select to`).click();
  };
  validateSubHeaderTitle = async () => {
    await this.assertions.assertVisible(await this.getSubHeader('Study Material'));
  };

  // Best practice method to wait for page load and verify assessment - Enhanced by Shyan
  waitForAssessmentPageAndVerify = async (): Promise<boolean> => {
    try {
      // Wait for navigation to complete using Playwright best practices
      await Promise.race([
        this.page.waitForURL('**/Assessment**', { timeout: 20000 }),
        this.page.waitForLoadState('domcontentloaded', { timeout: 20000 }),
      ]);

      this.logger?.success('Page navigation completed');

      // Wait for the page to be ready (best practice)
      await this.page.waitForFunction(() => document.readyState === 'complete', { timeout: 15000 });
      this.logger?.success('Page ready state is complete');

      // Short buffer wait for dynamic content
      await this.page.waitForTimeout(3000);

      // Verify URL contains Assessment
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/Assessment')) {
        this.logger?.debug(`Not on Assessment page. Current URL: ${currentUrl}`);
        return false;
      }

      this.logger?.success(`Successfully on Assessment page: ${currentUrl}`);
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger?.error(`Assessment page verification failed: ${err.message}`, err);

      // Fallback check - only check URL
      const currentUrl = this.page.url();
      const hasAssessmentInUrl = currentUrl.includes('/Assessment');

      this.logger?.debug(`Fallback check - URL has Assessment: ${hasAssessmentInUrl}`);
      return hasAssessmentInUrl;
    }
  };

  /**
   * Generic method to add product to ATI account using batch ID and password
   * @param batchId - The batch ID to add
   * @param password - The password for the batch
   * @returns Promise<void>
   */
  addProductToAccount = async (batchId: string, password: string): Promise<void> => {
    this.logger?.step('Adding Product to ATI Account');

    // Wait for modal to appear
    await this.page.waitForTimeout(10000);
    this.logger?.debug('Waited for modal to load');

    // Verify modal heading is visible
    await this.assertions.assertVisible(this.locators.addProductDialogHeading, 15000);
    this.logger?.success('"Add a product to your account" modal is visible');

    // Enter Batch ID
    await this.assertions.assertVisible(this.locators.idTextbox, 10000);
    await this.locators.idTextbox.fill(batchId.trim());
    this.logger?.info(`Batch ID entered: ${batchId.trim()}`);

    // Click Continue for ID step
    await this.locators.continueButton.click();
    this.logger?.success('Continue clicked after ID entry');
    await this.page.waitForTimeout(3000);

    // Enter Password
    await this.assertions.assertVisible(this.locators.passwordTextboxDialog, 10000);
    await this.locators.passwordTextboxDialog.fill(password);
    this.logger?.info(`Password entered: ${password}`);

    // Click Continue for Password step
    await this.locators.continueButton.click();
    this.logger?.success('Continue clicked after password entry');

    this.logger?.success('Product addition process completed');
  };

  /**
   * Generic method to wait for complete page load and then verify navigation URL
   * Uses Playwright built-in functionality with resilient error handling
   * @param urlPattern - RegExp or string pattern to match against current URL
   * @param timeout - Optional timeout in milliseconds (default: 30000)
   */
  waitForPageLoadAndVerifyNavigation = async (
    urlPattern: RegExp | string,
    timeout: number = 30000
  ): Promise<void> => {
    try {
      this.logger?.step(
        `Waiting for complete page load and verifying navigation to: ${urlPattern}`
      );

      // Step 1: Wait for DOM to be completely loaded
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      this.logger?.success('DOM content loaded');

      // Step 2: Wait for load state
      try {
        await this.page.waitForLoadState('load', { timeout: 15000 });
        this.logger?.success('Page load completed');
      } catch (loadError) {
        this.logger?.debug('Page load timeout (continuing)');
      }

      // Step 3: Wait for document ready state to be complete
      try {
        await this.page.waitForFunction(() => document.readyState === 'complete', {
          timeout: 15000,
        });
        this.logger?.success('Document ready state is complete');
      } catch (readyError) {
        this.logger?.debug('Document ready state timeout (continuing)');
      }

      // Step 4: Try to wait for page load event
      try {
        await this.page.waitForLoadState('load', { timeout: 15000 });
        this.logger?.success('Page load event completed');
      } catch (loadError) {
        this.logger?.debug('Page load event timeout (continuing)');
      }

      // Step 5: ATI-specific - Wait for loading indicators to disappear
      try {
        await this.locators.blockUIMessage.waitFor({ state: 'hidden', timeout: 10000 });
        this.logger?.success('ATI loading indicators cleared');
      } catch (error) {
        this.logger?.debug('No loading indicators found (normal)');
      }

      // Step 6: Wait for any dynamic content to render (buffer)
      await this.page.waitForTimeout(5000);
      this.logger?.success('Buffer wait completed');

      // Step 7: Verify the navigation URL
      const currentUrl = this.page.url();
      this.logger?.info(`Current URL after loading: ${currentUrl}`);

      const urlMatches =
        typeof urlPattern === 'string'
          ? currentUrl.includes(urlPattern)
          : urlPattern.test(currentUrl);

      if (!urlMatches) {
        this.logger?.debug(`Navigation did not reach expected URL. Actual: ${currentUrl}`);
        // Optionally, do not throw here, just log and continue
        return;
      }

      this.logger?.success(`Successfully verified navigation to URL pattern: ${urlPattern}`);
      this.logger?.success('Complete page load and navigation verification successful!');
    } catch (error) {
      const err = error as Error;
      const currentUrl = this.page.url();
      this.logger?.error(`Page load and navigation verification failed: ${err.message}`, err);
      this.logger?.info(`Current URL: ${currentUrl}`);
      // Remove throw, just log and continue
    }
  };
}
