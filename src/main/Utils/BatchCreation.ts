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
   * @returns Promise<string> - The created batch ID
   */
  async createBatch(assessmentName?: string, institution?: string): Promise<string> {
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
    await this.muPage.waitForLoadState('domcontentloaded');
    this.logger?.debug('Page loaded, preparing to fill batch details');

    const institutionValue = institution || process.env.Institution || '';
    const assessmentValue = assessmentName || process.env.Assessment || '';

    // Step 1: Select Institution
    this.logger?.step(`Selecting institution: ${institutionValue}`);
    await muLoginPage.selectDropdownByTypingWithHighlight(
      muLocators.institutionDropdown,
      institutionValue,
      institutionValue,
      'Institution'
    );

    // Step 2: Verify Institution selection was successful
    this.logger?.step('Verifying Institution dropdown value...');
    try {
      const selectedInstitution = await muLocators.institutionDropdown.inputValue();
      this.logger?.info(`Institution dropdown value: "${selectedInstitution}"`);
      
      if (selectedInstitution && selectedInstitution.trim() !== '') {
        this.logger?.success(`✅ Institution successfully selected: ${selectedInstitution}`);
      } else {
        this.logger?.warning('⚠️ Institution dropdown appears empty - may not have selected properly');
      }
    } catch (e) {
      this.logger?.warning(`Could not verify Institution selection: ${e}`);
    }

    // Step 3: Check Assessment dropdown state BEFORE waiting (diagnostic)
    try {
      const initialDisabledState = await muLocators.assessmentDropdown.getAttribute('disabled');
      this.logger?.info(`Assessment dropdown initial state - disabled: ${initialDisabledState !== null}`);
    } catch (e) {
      this.logger?.warning(`Could not check initial Assessment dropdown state: ${e}`);
    }

    // Step 4: Wait for postback after Institution selection
    this.logger?.step('Waiting for ASP.NET postback to complete...');
    
    // Give time for postback to start and complete
    await this.muPage.waitForTimeout(2000);
    
    // Wait for network to be idle (important for ASP.NET postback)
    try {
      await this.muPage.waitForLoadState('networkidle', { timeout: 20000 });
      this.logger?.success('Network idle - postback completed');
    } catch (e) {
      this.logger?.info('Network idle timeout - postback may still be in progress');
    }
    
    // Additional wait for DOM updates after postback
    await this.muPage.waitForTimeout(2000);

    // Step 5: Check if Assessment dropdown is now enabled (diagnostic logging only)
    this.logger?.step('Checking Assessment dropdown state after postback...');
    try {
      const finalDisabledState = await muLocators.assessmentDropdown.getAttribute('disabled');
      const isEnabled = finalDisabledState === null;
      
      if (isEnabled) {
        this.logger?.success('✅ Assessment dropdown is ENABLED - ready for selection');
      } else {
        this.logger?.warning('⚠️ Assessment dropdown is still DISABLED - will try to select anyway');
        
        // Log all available options in Assessment dropdown for debugging
        const optionCount = await muLocators.assessmentDropdown.locator('option').count();
        this.logger?.info(`Assessment dropdown has ${optionCount} options`);
      }
    } catch (e) {
      this.logger?.warning(`Could not verify Assessment dropdown state: ${e}`);
    }

    // Step 6: Proceed with Assessment selection (let the method handle timing)
    this.logger?.step(`Selecting assessment: ${assessmentValue}`);
    await muLoginPage.selectDropdownByTypingWithHighlight(
      muLocators.assessmentDropdown,
      assessmentValue,
      assessmentValue,
      'Assessment'
    );

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
