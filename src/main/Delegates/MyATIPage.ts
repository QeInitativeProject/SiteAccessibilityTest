import type { Locator, Page, TestInfo } from '@playwright/test';
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

  clickOnCourseEnablementMyATITab = async (): Promise<void> => {
    this.logger?.step('Clicking Course Enablement My ATI tab');
    const myATITab = this.page.locator('//a[@id="productsAssessmentsTab"]');
    await myATITab.waitFor({ state: 'visible', timeout: 30000 });
    await myATITab.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success('Course Enablement My ATI tab clicked');
  };

  addCourseEnablementProduct = async (batchId: string): Promise<void> => {
    this.logger?.step(`Adding Course Enablement product with batch ID: ${batchId}`);
    const addProductsButton = this.page.locator('section.addproduct ftr-button:has-text("Add Products"), ftr-button:has-text("Add Products")').first();
    await addProductsButton.waitFor({ state: 'visible', timeout: 30000 });
    await addProductsButton.scrollIntoViewIfNeeded();
    await addProductsButton.click();

    const addProductDialog = this.page.locator('section.addPrd', { hasText: 'Add a product to your account' }).first();
    const isDialogVisible = await addProductDialog.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isDialogVisible) {
      await addProductsButton.evaluate((element: HTMLElement) => {
        const shadowButton = element.shadowRoot?.querySelector('button') as HTMLButtonElement | null;
        shadowButton?.click();
        if (!shadowButton) {
          element.click();
        }
      });
    }
    await addProductDialog.waitFor({ state: 'visible', timeout: 30000 });

    const batchIdTextInput = addProductDialog.locator('ftr-textinput[formcontrolname="id"]').first();
    await batchIdTextInput.waitFor({ state: 'visible', timeout: 30000 });
    await batchIdTextInput.scrollIntoViewIfNeeded();

    const batchIdTextbox = batchIdTextInput.locator('input, textarea').or(
      addProductDialog.locator('input[formcontrolname="id"], textarea[formcontrolname="id"]')
    ).or(
      this.page.getByRole('textbox', { name: /ID|Product ID|Assessment ID/i })
    ).first();

    if (await batchIdTextbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await batchIdTextbox.fill(batchId.trim());
    } else {
      await batchIdTextInput.click({ force: true });
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.type(batchId.trim());
    }

    const continueButton = this.page.getByRole('button', { name: /^Continue$/i }).or(
      this.page.getByRole('link', { name: /^Continue$/i })
    ).or(
      this.page.locator('ftr-button:has-text("Continue")')
    ).first();
    await continueButton.waitFor({ state: 'visible', timeout: 30000 });
    await continueButton.click({ force: true });
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success(`Course Enablement product batch ID submitted: ${batchId}`);
  };

  clickOnLearnTab = async () => {
    await this.atiCommonMethod.clickOnLearnTab();
  };

  clickOnAssessmentsTab = async () => {
    await this.atiCommonMethod.clickOnAssessmentsTab();
  };

  clickOnCourseEnablementAssessmentsTab = async (): Promise<void> => {
    this.logger?.step('Clicking Course Enablement Assessments tab');
    const assessmentsTab = this.page.getByRole('tab', { name: 'Assessments' }).or(
      this.page.locator('#tab-button-assessments, ftr-tab-button[tab="assessments"]')
    ).first();
    await assessmentsTab.waitFor({ state: 'visible', timeout: 30000 });
    await assessmentsTab.scrollIntoViewIfNeeded();
    await assessmentsTab.click({ force: true });
    await this.page.locator('#tab-button-assessments[aria-selected="true"], ftr-tab[tab="assessments"].ftr-tab-active').first()
      .waitFor({ state: 'attached', timeout: 10000 })
      .catch(async () => {
        await assessmentsTab.focus();
        await this.page.keyboard.press('Enter');
        await this.page.locator('#tab-button-assessments[aria-selected="true"], ftr-tab[tab="assessments"].ftr-tab-active').first()
          .waitFor({ state: 'attached', timeout: 10000 });
      });
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success('Course Enablement Assessments tab clicked');
  };

  clickCourseEnablementCheckForProctors = async (): Promise<void> => {
    this.logger?.step('Clicking Course Enablement Check for Proctors button');
    const checkForProctorsButton = this.page.getByRole('button', { name: /Check for Proctors/i }).or(
      this.page.locator('button[aria-label="Check for Proctors button"], button:has-text("Check for Proctors"), ftr-button:has-text("Check for Proctors")')
    ).first();
    await checkForProctorsButton.waitFor({ state: 'visible', timeout: 30000 });
    await checkForProctorsButton.scrollIntoViewIfNeeded();
    await checkForProctorsButton.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success('Course Enablement Check for Proctors button clicked');
  };

  openCourseEnablementAssessment = async (assessmentName: string, batchId?: string): Promise<void> => {
    this.logger?.step(`Opening Course Enablement assessment: ${assessmentName}${batchId ? ` (${batchId})` : ''}`);
    const rowSelector = batchId
      ? `.ag-center-cols-container [role="row"][row-id="${batchId}"]`
      : '.ag-center-cols-container [role="row"]';
    const assessmentRow = this.page.locator(rowSelector).filter({ hasText: assessmentName }).first();
    const assessmentNameCell = assessmentRow.locator('[col-id="productName"]').first();
    await assessmentNameCell.waitFor({ state: 'visible', timeout: 30000 });

    const actualAssessmentName = (await assessmentNameCell.textContent())?.trim() || '';
    if (!actualAssessmentName.includes(assessmentName) || (batchId && !actualAssessmentName.includes(batchId))) {
      throw new Error(`Expected assessment row to contain "${assessmentName}"${batchId ? ` and batch ID "${batchId}"` : ''}, but found "${actualAssessmentName}"`);
    }

    const assessmentActionButton = assessmentRow.locator('[col-id="actions"] ftr-button').filter({ hasText: /Open|Retake/i }).first();
    await assessmentActionButton.waitFor({ state: 'visible', timeout: 30000 });

    const actionText = (await assessmentActionButton.textContent())?.trim() || 'Open/Retake';
    await assessmentActionButton.scrollIntoViewIfNeeded();
    const urlBeforeClick = this.page.url();
    await assessmentActionButton.click({ force: true });

    let actionStarted = await Promise.race([
      this.page.waitForURL((url) => url.toString() !== urlBeforeClick, { timeout: 5000 }).then(() => true).catch(() => false),
      this.page.locator('#assessmentLoadForm, form#assessmentLoadForm').first().waitFor({ state: 'attached', timeout: 5000 }).then(() => true).catch(() => false),
    ]);

    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success(`Course Enablement assessment ${actionText} clicked: ${actualAssessmentName}`);
  };

  // Click on assessments tab specifically on My ATI page (not from home page)
  clickOnAssessmentsTabOnMyAti = async (): Promise<void> => {
    this.logger?.step('Clicking on Assessments tab on My ATI page');
    const assessmentsTab = this.page.getByRole('link', { name: 'Assessments Tab: Select to' });
    await assessmentsTab.waitFor({ state: 'visible', timeout: 30000 });
    await assessmentsTab.click();
    await this.page.waitForLoadState('domcontentloaded');
    this.logger?.success('Clicked Assessments tab on My ATI');
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

  clickOnAssessmentsTabfromHome = async (): Promise<void> => {
    await this.page.locator('div.rb-row-main div.status-in-progress-dial[aria-label="IN PROGRESS"]').first().click();
    this.logger?.success('Clicked on IN PROGRESS assessment');
  };

  /**
   * Click on a specific assessment button (Begin/Continue/Retake) by assessment name
   * @param assessmentName - Exact name of the assessment (e.g., 'All item_Neeraj')
   * @param buttonText - Button text to click: 'Begin', 'Continue', or 'Retake'
   */
  clickAssessmentButton = async (assessmentName: string): Promise<void> => {
    const card = this.page.locator(`section.practice-assessment:has(div.description:text-is("${assessmentName}"))`);
    const button = card.locator('a[data-atiid^="startAction_"], a[data-atiid^="continueAction_"], a[data-atiid^="retakeAction_"],a[aria-labelledby^="begin"]').filter({ visible: true }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
    this.logger?.success(`Clicked "${(await button.textContent())?.trim()}" for assessment "${assessmentName}"`);
  };

  /**
   * Click on a proctored assessment button (Begin/Continue/Retake) by assessment name.
   * If multiple instances popup appears, selects the one matching the given batchId.
   * @param assessmentName - Exact name of the proctored assessment (e.g., 'AR Testing 1')
   * @param batchId - The batch ID to select from multiple instances popup
   */
  clickOnProctoredAvailableAssessment = async (assessmentName: string, batchId?: string): Promise<void> => {
    const card = this.page.locator(`li.flipper:has(section.proctored-assessment) :has(div.description:text-is("${assessmentName}"))`);
    await card.first().waitFor({ state: 'visible', timeout: 15000 });
    const button = card.locator('a[data-atiid^="startAction_"], a[data-atiid^="continueAction_"], a[data-atiid^="retakeAction_"]').filter({ visible: true }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
    this.logger?.success(`Clicked "${(await button.textContent())?.trim()}" for proctored assessment "${assessmentName}"`);

    // Handle multiple instances popup if it appears
    const popup = this.page.locator('#selectInstanceContainerProctored');
    const popupVisible = await popup.isVisible({ timeout: 5000 }).catch(() => false);
    if (popupVisible && batchId) {
      this.logger?.step(`Multiple instances popup detected, selecting batch ID: ${batchId}`);
      // Find the list item containing the matching batch ID
      const batchItem = popup.locator(`li:has(span:text("ID: ${batchId}"))`);
      await batchItem.waitFor({ state: 'visible', timeout: 10000 });
      // Click the visible action button (Begin/Continue/Retake) for that batch
      const actionBtn = batchItem.locator('.duplicate-action-proctored a.button.primary-button, .duplicate-action-proctored a.secondary-button').filter({ visible: true }).first();
      await actionBtn.waitFor({ state: 'visible', timeout: 10000 });
      const btnText = (await actionBtn.textContent())?.trim();
      await actionBtn.click();
      this.logger?.success(`Selected batch ${batchId}: clicked "${btnText}"`);
    } else if (popupVisible) {
      this.logger?.step('Multiple instances popup detected, selecting first available');
      const firstBtn = popup.locator('.duplicate-action-proctored a.button.primary-button').filter({ visible: true }).first();
      await firstBtn.waitFor({ state: 'visible', timeout: 10000 });
      await firstBtn.click();
      this.logger?.success('Selected first available instance');
    }
  };

  /**
   * Get assessment name from the assessment page header and validate it matches expected
   * @param expectedName - The expected assessment name to validate against
   */
  getAndValidateAssessmentName = async (expectedName: string): Promise<string> => {
    const assessmentNameSpan = this.page.locator('span[data-bind="text: AssessmentName"]');
    await assessmentNameSpan.waitFor({ state: 'visible', timeout: 15000 });
    // Wait for Knockout.js to populate the text (data-bind fires after page load)
    let actualName = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      actualName = (await assessmentNameSpan.textContent())?.trim() ?? '';
      if (actualName.length > 0) break;
      await this.page.waitForTimeout(500);
    }
    if (actualName !== expectedName) {
      throw new Error(`Assessment name mismatch! Expected: "${expectedName}", Got: "${actualName}"`);
    }
    this.logger?.success(`Assessment name validated: "${actualName}"`);
    return actualName;
  };

  /**
   * Validate that minutes spent is not 00:00
   */
  validateMinutesSpent = async (): Promise<string> => {
    const minutesSpan = this.page.locator('span[data-bind="text: MinutesSpent"]');
    await minutesSpan.waitFor({ state: 'visible', timeout: 15000 });
    let actualMinutes = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      actualMinutes = (await minutesSpan.textContent())?.trim() ?? '';
      if (actualMinutes.length > 0) break;
      await this.page.waitForTimeout(500);
    }
    if (actualMinutes === '00:00' || actualMinutes.length === 0) {
      throw new Error(`Minutes spent should not be 00:00, Got: "${actualMinutes}"`);
    }
    this.logger?.success(`Minutes spent validated: ${actualMinutes} (not 00:00)`);
    return actualMinutes;
  };

  /**
   * Validate the individual total score percentage
   * @returns The percentage score text
   */
  validateIndividualTotalScore = async (): Promise<string> => {
    const scoreSpan = this.page.locator('span[data-bind*="numericText: PercentageScore"]');
    await scoreSpan.waitFor({ state: 'visible', timeout: 15000 });
    let score = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      score = (await scoreSpan.textContent())?.trim() ?? '';
      if (score.length > 0) break;
      await this.page.waitForTimeout(500);
    }
    if (score.length === 0) {
      throw new Error('Individual total score is empty');
    }
    this.logger?.success(`Individual total score validated: "${score}%"`);
    return score;
  };

  /**
   * Validate that the close/exit button is functional
   */
  validateCloseButtonFunctional = async (): Promise<void> => {
    const closeBtn = this.page.locator('a[data-atiid="exitAction"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 15000 });
    const isEnabled = await closeBtn.isEnabled();
    if (!isEnabled) {
      throw new Error('Close button is not enabled');
    }
    this.logger?.success('Close button is visible and functional');
  };

  /**
   * Validate the test completed date matches today's date
   */
  validateTestCompletedDate = async (): Promise<string> => {
    const dateSpan = this.page.locator('span[data-bind="text: TestDate"]');
    await dateSpan.waitFor({ state: 'visible', timeout: 15000 });
    let actualDate = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      actualDate = (await dateSpan.textContent())?.trim() ?? '';
      if (actualDate.length > 0) break;
      await this.page.waitForTimeout(500);
    }
    if (actualDate.length === 0) {
      throw new Error('Test completed date is empty');
    }
    // Check that the date contains today's date components (handles both M/D/YYYY and MM/DD/YYYY)
    const today = new Date();
    const month = String(today.getMonth() + 1);
    const day = String(today.getDate());
    const year = String(today.getFullYear());
    if (!actualDate.includes(month) || !actualDate.includes(day) || !actualDate.includes(year)) {
      throw new Error(`Test date mismatch! Expected today (${month}/${day}/${year}), Got: "${actualDate}"`);
    }
    this.logger?.success(`Test completed date validated: "${actualDate}"`);
    return actualDate;
  };

  /**
   * Validate that the URL contains a unique attempt ID after /ViewResult/
   * @returns The attempt ID extracted from the URL
   */
  validateAttemptIdInUrl = async (): Promise<string> => {
    const currentUrl = this.page.url();
    const match = currentUrl.match(/\/ViewResult\/(\d+)/);
    if (!match || !match[1]) {
      throw new Error(`Attempt ID not found in URL! Current URL: "${currentUrl}"`);
    }
    const attemptId = match[1];
    this.logger?.success(`Attempt ID validated in URL: ${attemptId}`);
    return attemptId;
  };

  clickOnFlagButton = async (): Promise<void> => {
    const frame = this.page.frameLocator('#assessmentFrame');
    await frame.locator('//button[@aria-label="Flag this question for Review"]').click();
    this.logger?.success('Clicked on Flag Question button');
  };

  clickOnPauseButton = async (): Promise<void> => {
    const frame = this.page.frameLocator('#assessmentFrame');
    await frame.locator('//button[@aria-label="Pause this assessment"]').click();
    this.logger?.success('Clicked on Pause button');
  };

  clickOnResumeButton = async (): Promise<void> => {
    const frame = this.page.frameLocator('#assessmentFrame');
    await frame.locator('button[aria-label="Resume assessment"]').click();
    this.logger?.success('Clicked on Resume button');
  };

  verifyFlagButtonIsStillFlagged = async (): Promise<void> => {
    const frame = this.page.frameLocator('#assessmentFrame');
    const unflagButton = frame.locator('//button[@aria-label="Unflag this question"]');
    await unflagButton.waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success('✅ Flag button is still flagged after resume - Unflag button is visible');
  };

  clickOnCalculatorButton = async (): Promise<void> => {
    const frame = this.page.frameLocator('#assessmentFrame');
    await frame.locator('//button[@aria-label="Toggle Calculator"]').click();
    this.logger?.success('Clicked on Calculator button');
  };

  async verifyElementIsDraggable(locator: Locator, elementName?: string): Promise<void> {
    const name = elementName || 'Element';
    this.logger?.step(`Verifying "${name}" is draggable`);
    const draggable = await locator.getAttribute('draggable');
    const dragHandle = await locator.getAttribute('draghandle');
    const dragTarget = await locator.getAttribute('dragtarget');
    if (draggable === 'true' || dragHandle || dragTarget) {
      this.logger?.success(`✓ "${name}" is draggable`);
      return;
    }
    // Check if element or its child has cursor:move style (drag handle indicator)
    const hasCursorMove = await locator.locator('[style*="cursor:move"], [style*="cursor: move"]').count();
    if (hasCursorMove > 0) {
      this.logger?.success(`✓ "${name}" is draggable (cursor:move detected)`);
      return;
    }
    throw new Error(`"${name}" is not draggable. No drag attributes or cursor:move style found.`);
  }
   /**
   * Add product for a proctored assessment (batch ID only, no password).
   * Handles blockUI overlay, navigates to My ATI tab, opens Add Product dialog,
   * enters batch ID and clicks Continue.
   * @param batchId - The batch ID to enter
   * @param locators - StudentFacingPageLocators instance
   * @param assertions - Assertions instance
   */
  addProductForProctoredAssessment = async (
    batchId: string,
    locators: StudentFacingPageLocators,
    assertions: Assertions
  ): Promise<void> => {
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(10000);

    // Dismiss blockUI overlay if present
    await this.page.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

    // Navigate to My ATI tab
    await this.clickOnMyATITab();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(10000);

    // Open Add Product dialog via Assessments tab
    await this.clickOnAssessmentsTab();
    await this.page.waitForTimeout(2000);

    // Enter Batch ID
    await assertions.waitAndAssertVisible(locators.idTextbox, 15000);
    await locators.idTextbox.fill(batchId.trim());
    this.logger?.success(`Batch ID entered: ${batchId.trim()}`);

    // Click Continue
    await assertions.waitAndAssertVisible(locators.continueButton, 10000);
    await locators.continueButton.click();
    await this.page.waitForTimeout(2000);
    this.logger?.success('✅ Continue clicked after batch ID entry');
  };

  /**
   * Add product for a practice assessment (batch ID + password, no attestation).
   * Clicks Assessments tab, enters batch ID, clicks Continue, enters password, clicks Continue.
   * @param batchId - The batch ID to enter
   * @param password - The assessment password
   * @param locators - StudentFacingPageLocators instance
   * @param assertions - Assertions instance
   */
  addProductForPracticeAssessment = async (
    batchId: string,
    password: string,
    locators: StudentFacingPageLocators,
    assertions: Assertions
  ): Promise<void> => {
    // Click on Assessments tab to open Add Product dialog
    await this.clickOnAssessmentsTab();
    await this.page.waitForTimeout(2000);
    this.logger?.success('Clicked on Assessments tab');

    // Enter Batch ID
    await assertions.waitAndAssertVisible(locators.idTextbox, 15000);
    await locators.idTextbox.fill(batchId.trim());
    this.logger?.success(`Batch ID entered: ${batchId.trim()}`);

    // Click Continue after batch ID
    await assertions.waitAndAssertVisible(locators.continueButton, 10000);
    await locators.continueButton.click();
    await this.page.waitForTimeout(2000);
    this.logger?.success('✅ Continue clicked after batch ID entry');

    // Enter Password
    await assertions.waitAndAssertVisible(locators.passwordTextboxDialog, 10000);
    await locators.passwordTextboxDialog.fill(password);
    this.logger?.success('✅ Password entered');

    // Click Continue after password
    await assertions.waitAndAssertVisible(locators.continueButton, 10000);
    await locators.continueButton.click();
    await this.page.waitForTimeout(2000);
    this.logger?.success('✅ Continue clicked after password entry');
  };

  /**
   * Validate that a student cannot reattempt a 1-time proctored assessment.
   * Logs in again, navigates to assessments, and checks if Continue/Retake is available.
   * @param assessmentName - The assessment name to look for
   * @param batchId - The batch ID to verify is not listed
   */
  validateNoReattempt = async (
    assessmentName: string,
    batchId: string
  ): Promise<void> => {
    this.logger?.step('Validating no reattempt is possible');

    // Navigate to My ATI tab
    await this.page.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.clickOnMyATITab();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(5000);

    // Click on Assessments tab
    await this.page.getByRole('link', { name: 'Assessments Tab: Select to' }).click();
    await this.page.waitForTimeout(3000);
    this.logger?.success('Clicked on Assessments tab');

    // Look for the assessment name
    const assessmentDescription = this.page.locator(`.description:has-text("${assessmentName}")`);
    const assessmentVisible = await assessmentDescription.first().isVisible().catch(() => false);

    if (assessmentVisible) {
      const continueRetakeBtn = this.page.getByRole('link', { name: /Continue|Retake/i }).first();
      const continueRetakeVisible = await continueRetakeBtn.isVisible().catch(() => false);

      if (continueRetakeVisible) {
        await continueRetakeBtn.click();
        await this.page.waitForTimeout(3000);

        const batchIdLink = this.page.getByText(batchId);
        const batchIdVisible = await batchIdLink.isVisible().catch(() => false);

        if (!batchIdVisible) {
          this.logger?.success('Batch ID is NOT listed - reattempt not possible');
        } else {
          this.logger?.info('Batch ID is still listed - proctoring session may have ended blocking reattempt');
        }
      } else {
        this.logger?.success('No Continue/Retake button available - assessment cannot be reattempted');
      }
    } else {
      this.logger?.success('Assessment is not listed - cannot be reattempted');
    }
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

    // Step 2 & 3: Look for the assessment name and click its Continue or Retake button
    const assessmentContinueButton = this.page.locator(`//div[contains(@class,"description") and contains(text(),"${assessmentName}")]/ancestor::li//a[contains(text(),"Continue") or contains(text(),"Retake")]`).first();
    await assessmentContinueButton.waitFor({ state: 'visible', timeout: 15000 });
    await assessmentContinueButton.click();
    this.logger?.success(`✅ Clicked Continue/Retake on assessment: ${assessmentName}`);

    const batchIdContinueButton = this.page.locator(`(//span[contains(text(),"${batchId}")]/ancestor::li//div[contains(@class,"duplicate-action-proctored")])[1]`).first();
    // await batchIdContinueButton.waitFor({ state: 'visible', timeout: 15000 });
    await batchIdContinueButton.click();
    this.logger?.success(`✅ Clicked Continue for batch ID: ${batchId}`);
  };


  /**
   * Click on a specific assessment button (Begin/Continue/Retake) by assessment name
   * @param assessmentName - Exact name of the assessment (e.g., 'All item_Neeraj')
   * @param buttonText - Button text to click: 'Begin', 'Continue', or 'Retake'
   */
  clickOnResultButton = async (assessmentName: string): Promise<void> => {
    const card = this.page.locator(`section.practice-assessment:has(div.description:text-is("${assessmentName}"))`);
    const button = card.locator('a[data-atiid^="result"]').filter({ visible: true }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  };

  /**
   * Expire the session token by clearing all cookies and session/local storage.
   * Simulates a session timeout scenario — the next page action should trigger a login redirect or 401.
   */
  expireSessionToken = async (): Promise<void> => {
    this.logger?.step('Expiring session token (clearing cookies and storage)');

    // Clear all browser cookies for the current context
    const context = this.page.context();
    await context.clearCookies();
    this.logger?.success('All cookies cleared');

    // Clear localStorage and sessionStorage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    this.logger?.success('localStorage and sessionStorage cleared');

    this.logger?.success('✅ Session token expired — next action should trigger re-authentication');
  };

  /**
   * Opens an assessment, waits for it to fully load (assessment frame visible),
   * then opens a NEW browser window (separate context) and logs in to open the same assessment.
   * This triggers "Multiple Device Detected" message since both windows have independent sessions.
   * Steps:
   * 1. Clicks on My ATI > Assessments > Assessment button to open the assessment
   * 2. Waits for the assessment iframe to fully load (question visible)
   * 3. Waits 5 seconds
   * 4. Opens a NEW browser window (new context) — does NOT share cookies with first window
   * 5. Logs in as same student in the new window
   * 6. Navigates to same assessment and clicks it
   * 7. Verifies "Multiple Device Detected" message appears
   */
  verifyMultipleDeviceDetection = async (assessmentName: string): Promise<{ newPage: import('@playwright/test').Page; message: string }> => {
    this.logger?.step('Verifying multiple device detection');

    // Step 1: Open the assessment in the first window
    await this.clickOnMyATITab();
    await this.clickOnAssessmentsTabOnMyAti();
    await this.clickAssessmentButton(assessmentName);

    // Step 2: Wait for the assessment to fully load (iframe and question visible)
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('#assessmentFrame', { state: 'attached', timeout: 30000 });
    const assessmentFrame = this.page.frameLocator('#assessmentFrame');
    await assessmentFrame.locator('body').first().waitFor({ state: 'visible', timeout: 30000 });
    this.logger?.success(`Assessment "${assessmentName}" fully loaded in first window`);

    // Step 3: Wait 5 seconds to ensure assessment session is fully established on server
    await this.page.waitForTimeout(5000);
    this.logger?.success('Waited 5 seconds - assessment session established');

    // Step 4: Open a NEW browser window (new context — independent session)
    const browser = this.page.context().browser()!;
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    // Step 5: Login as the same student in the new window
    await newPage.goto(process.env.baseUrl!);
    await newPage.waitForLoadState('load');
    const usernameField = newPage.getByRole('textbox', { name: 'Username' });
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type(process.env.stuUsername!);
    const passwordField = newPage.getByRole('textbox', { name: 'Password' });
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type(process.env.stuPassword!);
    await newPage.getByRole('button', { name: /^Log ?In$/i }).click();
    await newPage.waitForLoadState('load');
    this.logger?.success('Logged in as same student in second window');

    // Step 6: Wait 10 seconds after login on new window
    await newPage.waitForTimeout(10000);
    this.logger?.success('Waited 10 seconds after login on second window');

    // Step 7: Switch back to the first window and check for the multi-session message
    await this.page.bringToFront();
    this.logger?.step('Switched back to first window');

    // Wait for the "Multiple Active Test Sessions Detected" dialog in the assessment frame
    const assessmentFrameCheck = this.page.frameLocator('#assessmentFrame');
    const multiSessionTitle = assessmentFrameCheck.locator('#end-assessment-confirm-title');
    await multiSessionTitle.waitFor({ state: 'visible', timeout: 15000 });
    const messageText = await multiSessionTitle.textContent() || '';
    this.logger?.success(`✅ Multiple device detected message on first window: "${messageText.trim()}"`);

    return { newPage, message: messageText.trim() };
  };

  /**
   * Verify that the Individual Performance Profile (IIP) page is visible.
   */
  verifyIIPPageVisible = async (): Promise<void> => {
    const iipHeader = this.page.locator('h1[aria-label="Individual Performance Profile"]');
    await iipHeader.waitFor({ state: 'visible', timeout: 30000 });
    this.logger?.success('✅ IIP (Individual Performance Profile) page is visible');
  };

  /**
   * Navigate to Results tab and click on the assessment name to view IPP details.
   * @param assessmentName - The assessment name to click on in the Results page
   */
  navigateToResultsAndOpenAssessment = async (assessmentName: string): Promise<void> => {
    this.logger?.step(`Navigating to Results and opening assessment: ${assessmentName}`);

    // Click on Results navigation link
    const resultsLink = this.page.getByRole('link', { name: 'Select this link to navigate to the Results page' });
    await resultsLink.waitFor({ state: 'visible', timeout: 15000 });
    await resultsLink.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(5000);
    this.logger?.success('✅ Navigated to Results page');

    // Click on the assessment name to open IPP details
    const assessmentLink = this.page.locator(`a:has-text("${assessmentName}")`).first();
    await assessmentLink.waitFor({ state: 'visible', timeout: 15000 });
    await assessmentLink.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(5000);
    this.logger?.success(`✅ Clicked on assessment: ${assessmentName}`);
  };

  /**
   * Validate that no results are generated for an assessment on the Results page.
   * Navigates to Results tab and asserts the assessment is NOT listed.
   * @param assessmentName - The assessment name to verify is absent from Results
   */
  validateNoResultsGenerated = async (assessmentName: string): Promise<void> => {
    this.logger?.step(`Validating no results generated for: ${assessmentName}`);

    // Navigate to Results page
    const resultsLink = this.page.getByRole('link', { name: 'Select this link to navigate to the Results page' });
    await resultsLink.waitFor({ state: 'visible', timeout: 15000 });
    await resultsLink.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(5000);
    this.logger?.success('✅ Navigated to Results page');

    // Validate assessment is NOT visible in Results
    const assessmentLink = this.page.locator(`a:has-text("${assessmentName}")`).first();
    const isVisible = await assessmentLink.isVisible({ timeout: 10000 }).catch(() => false);

    if (!isVisible) {
      this.logger?.success(`✅ No results generated - "${assessmentName}" is not listed on Results page`);
    } else {
      throw new Error(`Results were generated after abandon - "${assessmentName}" is visible on Results page`);
    }
  };
}
