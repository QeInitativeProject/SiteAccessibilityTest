import type { Page, TestInfo } from '@playwright/test';
import { Logger } from '../Utils/Logger';
import { ATICommonMethod } from '../Utils/ATICommonMethod';
import { StudentFacingPageLocators } from '../Locator_Store/StudentFacing_Page_Locators';
import { Assertions } from '../Utils/Assertion';

export class MyATIPage {
  page: Page;
  private logger?: Logger;
  private atiCommonMethod: ATICommonMethod;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.atiCommonMethod = new ATICommonMethod(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'MyATIPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.atiCommonMethod.setLogger(logger);
  }

  validateHeaderTitle = async (header: string) => {
    await this.atiCommonMethod.validateHeaderTitle(header);
  };

  getSubHeader = async (subHeader: string) => {
    return await this.atiCommonMethod.getSubHeader(subHeader);
  };

  clickOnMyATITab = async () => {
    await this.atiCommonMethod.clickOnMyATITab();
  };

  clickOnLearnTab = async () => {
    await this.atiCommonMethod.clickOnLearnTab();
  };

  clickOnAssessmentsTab = async () => {
    await this.atiCommonMethod.clickOnAssessmentsTab();
  };

  clickOnPracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnPracticeAssessment();
  };

  clickOnBeginPracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnBeginPracticeAssessment();
  };

  clickOnContinuePracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnContinuePracticeAssessment();
  };

  clickOnRetakePracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnRetakePracticeAssessment();
  };

  clickOnAddProductAtHomePage = async () => {
    await this.page.locator('//a[@data-atiid="addProductAction"]').click();
  };

  clickOnAddProduct = async () => {
    await this.page.locator('(//a[@data-atiid="addProductAction"])[4]').click();
  };
  //Enter Assessment and Click on Continue
  enterAssessmentID = async (assessmentID: string) => {
    await this.page.locator('//input[@placeholder="Enter ID"]').fill(assessmentID);
    await this.page
      .locator("//form[@id='adForm']/section[@class='step-modal-nav']/a/span[text()='Continue']")
      .click();
    await this.page.waitForLoadState('load');
  };

  startPracticeAssessment = async () => {
    await this.atiCommonMethod.startPracticeAssessment();
  };

  clickOnPrepTab = async () => {
    await this.atiCommonMethod.clickOnPrepTab();
  };

  clickOnCalendarTab = async () => {
    await this.atiCommonMethod.clickOnCalendarTab();
  };

  validateSubHeaderTitle = async () => {
    await this.atiCommonMethod.validateSubHeaderTitle();
  };

  waitForAssessmentPageAndVerify = async (): Promise<boolean> => {
    return await this.atiCommonMethod.waitForAssessmentPageAndVerify();
  };

  addProductToAccount = async (batchId: string, password: string): Promise<void> => {
    await this.atiCommonMethod.addProductToAccount(batchId, password);
  };

  waitForPageLoadAndVerifyNavigation = async (
    urlPattern: RegExp | string,
    timeout: number = 30000
  ): Promise<void> => {
    await this.atiCommonMethod.waitForPageLoadAndVerifyNavigation(urlPattern, timeout);
  };

  /**
   * Verifies all Home page navigation elements are visible
   * Used in: TC3 - Home page navigation elements validation
   */
  verifyHomePageNavigationElements = async (
    locators: StudentFacingPageLocators,
    assertions: Assertions
  ): Promise<void> => {
    this.logger?.step('1. Home navigation link');
    this.logger?.step('2. My ATI navigation link');
    this.logger?.step('3. Results navigation link');
    this.logger?.step('4. Help navigation link');
    this.logger?.step('5. Profile navigation link');
    this.logger?.step('6. Add a Product text');

    await assertions.assertVisible(locators.homeNavigationLink);
    this.logger?.success('✓ Home navigation link is visible');

    await assertions.assertVisible(locators.myATINavigationLink);
    this.logger?.success('✓ My ATI navigation link is visible');

    await assertions.assertVisible(locators.resultsNavigationLink);
    this.logger?.success('✓ Results navigation link is visible');

    await assertions.assertVisible(locators.helpNavigationLink);
    this.logger?.success('✓ Help navigation link is visible');

    await assertions.assertVisible(locators.profileNavigationLink);
    this.logger?.success('✓ Profile navigation link is visible');

    await assertions.assertVisible(locators.addProductText);
    this.logger?.success('✓ Add a Product text is visible');
  };

  /**
   * Verifies My ATI page functionality - clicks My ATI tab and verifies elements
   * Used in: TC4 - My ATI page functionality validation
   */
  verifyMyATIPageFunctionality = async (
    locators: StudentFacingPageLocators,
    assertions: Assertions
  ): Promise<void> => {
    await this.clickOnMyATITab();
    this.logger?.success('Clicked on My ATI tab');

    await assertions.assertPageHasURL(/\/Products/);
    this.logger?.success('Products page URL loaded successfully');

    await assertions.assertVisible(locators.assessmentsTabLink);
    this.logger?.success('✓ Assessments Tab link is visible');

    await assertions.assertVisible(locators.studyMaterialsHeading);
    this.logger?.success('✓ Study Materials heading is visible');
  };

  /**
   * Complete Add Product flow - enters batch ID and password, navigates to Assessment page
   * Used in: TC5 - Add Product dialog and credentials validation
   */
  addProductAndNavigateToAssessment = async (
    batchId: string,
    password: string,
    locators: StudentFacingPageLocators,
    assertions: Assertions
  ): Promise<void> => {
    // Click on Assessments tab
    await this.clickOnAssessmentsTab();
    this.logger?.success('Clicked on Assessments tab');

    // Verify Add Product dialog appears
    await assertions.assertRoleVisible('heading', 'Add a product to your account');
    this.logger?.success('✅ Add Product dialog is visible');

    // Verify Cancel and Continue buttons are visible when dialog appears
    await assertions.assertVisible(locators.cancelButton);
    this.logger?.success('✅ Cancel button is visible in Add Product dialog');

    await assertions.assertVisible(locators.continueButton);
    this.logger?.success('✅ Continue button is visible in Add Product dialog');

    // Verify ID textbox is visible
    await assertions.assertVisible(locators.idTextbox);
    this.logger?.success('✅ ID textbox is visible');

    // Enter Batch ID
    await locators.idTextbox.fill(batchId.trim());
    this.logger?.success(`✅ Batch ID entered: ${batchId.trim()}`);

    // Verify Cancel and Continue buttons are still visible after entering Batch ID
    await assertions.assertVisible(locators.cancelButton);
    this.logger?.success('✅ Cancel button is visible after entering Batch ID');

    await assertions.assertVisible(locators.continueButton);
    this.logger?.success('✅ Continue button is visible after entering Batch ID');

    // Click Continue button after entering Batch ID
    await locators.continueButton.click();
    this.logger?.success('✅ Continue clicked after ID entry');

    // Verify Password textbox is visible
    await assertions.assertVisible(locators.passwordTextboxDialog);
    this.logger?.success('✅ Password textbox is visible');

    // Enter Password
    await locators.passwordTextboxDialog.fill(password);
    this.logger?.success('✅ Password entered');

    // Verify Cancel and Continue buttons are visible after entering Password
    await assertions.assertVisible(locators.cancelButton);
    this.logger?.success('✅ Cancel button is visible after entering Password');

    await assertions.assertVisible(locators.continueButton);
    this.logger?.success('✅ Continue button is visible after entering Batch ID and Password');
    await locators.continueButton.click();
    this.logger?.success('✅ Continue clicked after password entry');

    // Verify navigation to Assessment page
    await this.waitForPageLoadAndVerifyNavigation('/Assessment');
    this.logger?.success('✅ Navigated to Assessment page');
  };

  /**
   * Reload same assessment after student accidentally closed the tab
   * Steps:
   * 1. Click on Assessments tab
   * 2. Look for the assessment name
   * 3. Click Continue on that assessment name
   * 4. Click Continue for the respective batch ID
   * @param assessmentName - The assessment name to look for
   * @param batchId - The batch ID to select from multiple instances
   */
  reloadSameAssessment = async (assessmentName: string, batchId: string): Promise<void> => {
    this.logger?.step(`Reloading assessment: ${assessmentName} with batch ID: ${batchId}`);

    // Step 1: Click on Assessments tab
    await this.page.getByRole('link', { name: 'Assessments Tab: Select to' }).click();
    await this.page.waitForTimeout(3000);
    this.logger?.success('✅ Clicked on Assessments tab');

    // Step 2 & 3: Look for the assessment name and click its Continue button
    const assessmentContinueButton = this.page.locator(`//div[contains(@class,"description") and contains(text(),"${assessmentName}")]/ancestor::li//a[contains(text(),"Continue")]`).first();
    await assessmentContinueButton.waitFor({ state: 'visible', timeout: 15000 });
    await assessmentContinueButton.click();
    this.logger?.success(`✅ Clicked Continue on assessment: ${assessmentName}`);

    // Step 4: Click Continue button for the respective batch ID
    const batchIdContinueButton = this.page.locator(`//span[contains(text(),"${batchId}")]/ancestor::li//div[contains(@class,"duplicate-action-proctored")]//a[contains(text(),"Continue")]`).first();
    await batchIdContinueButton.waitFor({ state: 'visible', timeout: 15000 });
    await batchIdContinueButton.click();
    this.logger?.success(`✅ Clicked Continue for batch ID: ${batchId}`);
  };
}
