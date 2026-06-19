import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { MU_Batch_Creation_Locators } from '@locators/MU_Batch_Creation_Locators';
import { MU_Common_Methods } from './MU_Common_Methods';
import { Logger } from './Logger';

/**
 * Utility class for MU Batch Creation
 * This class handles the creation of MU batches and can be reused across test scenarios
 */
export class BatchCreation {
  private muContext: BrowserContext | null = null;
  private muPage: Page | null = null;
  private browser: Browser;
  private logger?: Logger;
  public batchId: string = '';

  constructor(browser: Browser, testInfo?: TestInfo) {
    this.browser = browser;
    if (testInfo) {
      this.logger = new Logger(browser as any, 'BatchCreation', testInfo);
    }
  }

  // Method to set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }
  /**
   * Creates a new MU batch and returns the batch ID
   * @param assessmentName - Optional assessment name (defaults to process.env.Assessment)
   * @param institution - Optional institution name (defaults to process.env.Institution)
  * @param cohort - Optional cohort name (defaults to process.env.Cohort)
  * @returns Promise<string> - The created batch ID
   */
  async createBatch(assessmentName?: string, institution?: string, cohort?: string): Promise<string> {
    this.logger?.separator('MU BATCH CREATION');

    this.logger?.step('Creating new browser context for MU');
    this.muContext = await this.browser.newContext();
    this.muPage = await this.muContext.newPage();

    // Update logger to use the muPage
    if (this.logger && this.muPage) {
      this.logger = new Logger(this.muPage, 'BatchCreation', undefined);
    }

    const muLoginPage = new MU_Common_Methods(this.muPage);
    const muLocators = new MU_Batch_Creation_Locators(this.muPage);

    this.logger?.step('Logging into MU application');
    await muLoginPage.loginToApplication();
    await muLoginPage.assertNavigationToUrl(/main\.aspx$/);

    this.logger?.step('Navigating to Manage Assessments');
    await muLocators.systemAdministrationText.hover();
    await muLocators.manageUtilityOption.hover();
    await muLocators.manageAssessments.click();
    await muLocators.addNewAssessmentButton.click();

    await this.muPage.waitForLoadState('load');
    this.logger?.debug('Page loaded, preparing to fill batch details');

    const institutionValue = institution || process.env.Institution || '';
    const assessmentValue = assessmentName || process.env.Assessment || '';
    const cohortValue = cohort || process.env.Cohort || '';

    this.logger?.step(`Selecting institution: ${institutionValue}`);
    await muLocators.institutionDropdown.selectOption({ label: institutionValue });
    this.logger?.info(`Institution option selected: "${institutionValue}"`);

    // Wait for ASP.NET auto-postback after institution selection (populates assessment dropdown)
    try {
      await this.muPage.waitForLoadState('load', { timeout: 15000 });
      this.logger?.info('Page auto-refresh after institution selection completed');
    } catch {
      this.logger?.info('No auto-refresh detected, continuing...');
    }
    await this.muPage.waitForTimeout(2000);

    if (cohortValue.trim().length > 0) {
      this.logger?.step(`Selecting cohort: ${cohortValue}`);
      await muLocators.cohortDropdown.selectOption({ label: cohortValue });
      this.logger?.info(`Cohort option selected: "${cohortValue}"`);

      // Wait for any postback after cohort selection
      try {
        await this.muPage.waitForLoadState('load', { timeout: 15000 });
      } catch {
        // No postback expected for cohort, continue
      }
      await this.muPage.waitForTimeout(1000);
    } else {
      this.logger?.info('Cohort not provided, skipping cohort selection');
    }

    this.logger?.step(`Selecting assessment: ${assessmentValue}`);
    await muLocators.assessmentDropdown.selectOption({ label: assessmentValue });
    this.logger?.info(`Assessment option selected: "${assessmentValue}"`);

    // Wait for any postback after assessment selection
    try {
      await this.muPage.waitForLoadState('load', { timeout: 15000 });
    } catch {
      // No postback expected for assessment, continue
    }
    await this.muPage.waitForTimeout(1000);

    this.logger?.step('Entering password and paid booklets');
    await muLoginPage.enterTextInTextbox(
      muLocators.passwordTextbox,
      process.env.muassessmentpassword,
      'Password'
    );
    await muLoginPage.enterTextInTextbox(
      muLocators.paidBookletsTextbox,
      process.env.paidbookletcounts,
      'Paid Booklets'
    );

    this.logger?.step('Saving batch');
    await muLoginPage.clickSaveButton('Save');

    this.batchId = await muLoginPage.extractTextFromNextCell('ID:', 'Batch ID');
    this.logger?.success(`Batch ID created: ${this.batchId}`);

    await muLoginPage.logoutFromApplication();
    await this.cleanup();

    this.logger?.separator();
    return this.batchId;
  }

  /**
   * Gets the current batch ID
   * @returns string - The batch ID
   */
  getBatchId(): string {
    return this.batchId;
  }

  /**
   * Closes the MU context and page
   */
  async cleanup(): Promise<void> {
    if (this.muContext) {
      await this.muContext.close();
      this.muContext = null;
      this.muPage = null;
    }
  }
}
