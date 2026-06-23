import type { Page, TestInfo } from '@playwright/test';
import { QnAUtil } from '../Utils/QnAUtil';
import { TextToSpeechUtility } from '../Utils/TexttospeechUtillity';
import { Logger } from '../Utils/Logger';
import { Assertions } from '../Utils/Assertion';
import { StudentFacingPageLocators } from '../Locator_Store/StudentFacing_Page_Locators';

export class AssessmentPage {
  page: Page;
  private logger?: Logger;
  private qnaUtil: QnAUtil;
  private textToSpeechUtil: TextToSpeechUtility;
  private assertions: Assertions;
  private locators: StudentFacingPageLocators;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.qnaUtil = new QnAUtil(page, testInfo);
    this.textToSpeechUtil = new TextToSpeechUtility(page, testInfo);
    this.assertions = new Assertions(page);
    this.locators = new StudentFacingPageLocators(page);
    if (testInfo) {
      this.logger = new Logger(page, 'AssessmentPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.qnaUtil.setLogger(logger);
    this.textToSpeechUtil.setLogger(logger);
  }

  /**
   * Generic method to answer assessment questions using Q&A from JSON file
   */
  answerAssessmentQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Scoring_QA_STAGE'
  ): Promise<void> => {
    await this.qnaUtil.answerAssessmentQuestions(jsonFileName, assessmentType);
  };

  /**
   * Finalize assessment and wait for IPP page to load
   */
  finalizeAssessmentAndViewResults = async (): Promise<void> => {
    await this.qnaUtil.finalizeAssessmentAndViewResults();
  };

  /**
   * Extract dynamic test attempt ID from URL
   */
  extractTestAttemptId = async (urlPattern: string): Promise<string> => {
    return await this.qnaUtil.extractTestAttemptId(urlPattern);
  };

  /**
   * Generic method to verify element by role and name
   */
  verifyElementByRole = async (
    role: string,
    name: string,
    elementDescription: string
  ): Promise<void> => {
    await this.qnaUtil.verifyElementByRole(role, name, elementDescription);
  };

  /**
   * Generic method to verify and extract text content
   */
  verifyAndExtractText = async (
    selector: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    return await this.qnaUtil.verifyAndExtractText(selector, elementDescription, isLabel);
  };

  /**
   * Generic method to verify text value matches expected value
   */
  verifyTextValue = async (
    selector: string,
    expectedValue: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    return await this.qnaUtil.verifyTextValue(selector, expectedValue, elementDescription, isLabel);
  };

  /**
   * Full flow: Flag -> Continue -> Previous -> Unflag -> Assert Flag visible
   */
  flagContinuePreviousUnflagFlow = async (
    assertions: any,
    timeoutMs: number = 30000
  ): Promise<void> => {
    await this.qnaUtil.flagContinuePreviousUnflagFlow(assertions, timeoutMs);
  };

  /**
   * Verifies blue banner is visible with correct background color in practice assessment
   */
  verifyBlueBannerVisibility = async (expectedColor: string = '#d7eef4'): Promise<void> => {
    await this.qnaUtil.verifyBlueBannerVisibility(expectedColor);
  };

  /**
   * Verifies close assessment dialog functionality
   */
  verifyCloseDialogFunctionality = async (): Promise<void> => {
    await this.qnaUtil.verifyCloseDialogFunctionality();
  };

  /**
   * Takes screenshot and saves it with scenario name and test attempt ID
   */
  takeScreenshot = async (scenarioName: string, testAttemptId?: string): Promise<void> => {
    await this.qnaUtil.takeScreenshot(scenarioName, testAttemptId);
  };

  /**
   * Clicks the Flag button and asserts that the Continue button becomes enabled
   */
  flagEnablesContinue = async (assertions: any): Promise<void> => {
    await this.qnaUtil.flagEnablesContinue(assertions);
  };

  /**
   * Verifies calculator functionality in assessment
   */
  verifyCalculatorFunctionality = async (operation: string = '2+2'): Promise<void> => {
    await this.qnaUtil.verifyCalculatorFunctionality(operation);
  };

  /**
   * Verifies pause and resume functionality in assessment
   */
  verifyPauseAndResumeFunctionality = async (): Promise<void> => {
    await this.qnaUtil.verifyPauseAndResumeFunctionality();
  };

  // ============================================
  // Text-to-Speech Methods (delegated to TextToSpeechUtility)
  // ============================================

  /**
   * Validates that text-to-speech toggle is functional
   */
  validateToggleFunctionality = async (): Promise<void> => {
    await this.textToSpeechUtil.validateToggleFunctionality();
  };

  /**
   * Turns the text-to-speech toggle ON
   */
  turnToggleOn = async (): Promise<void> => {
    await this.textToSpeechUtil.turnToggleOn();
  };

  /**
   * Turns the text-to-speech toggle OFF
   */
  turnToggleOff = async (): Promise<void> => {
    await this.textToSpeechUtil.turnToggleOff();
  };

  /**
   * Checks if the toggle is currently ON
   */
  isToggleOn = async (): Promise<boolean> => {
    return await this.textToSpeechUtil.isToggleOn();
  };

  /**
   * Verifies that the toggle switch thumb is visible
   */
  verifyToggleVisible = async (): Promise<void> => {
    await this.textToSpeechUtil.verifyToggleVisible();
  };

  /**
   * Validates that text-to-speech functionality content is visible
   */
  validateTextToSpeechContentVisibility = async (): Promise<void> => {
    await this.textToSpeechUtil.validateTextToSpeechContentVisibility();
  };

  /**
   * Validates settings button is clickable and speech rate, pitch rate controls are visible
   */
  validateSettingsButtonAndControls = async (): Promise<void> => {
    await this.textToSpeechUtil.validateSettingsButtonAndControls();
  };

  /**
   * Validates close and reset button functionality
   */
  validateCloseAndResetFunctionality = async (): Promise<void> => {
    await this.textToSpeechUtil.validateCloseAndResetFunctionality();
  };

  // ============================================
  // Multi-Select Assessment Methods
  // ============================================

  /**
   * Navigate to previous question and return to current question
   * Used in: TC8 (Dropdown) - Previous button navigation validation
   */
  navigateToPreviousQuestionAndReturn = async (): Promise<void> => {
    const questionFrame = this.page.frameLocator('#assessmentFrame');
    
    // Click Previous button to go back to first question
    // Wait for button to be visible and clickable (has 'move-to-prev-content-active' class)
    const previousBtn = questionFrame.locator('#movePrevious.move-to-prev-content-active');
    await previousBtn.waitFor({ state: 'visible', timeout: 10000 });
    await previousBtn.click();
    this.logger?.success('✅ Clicked Previous button - navigated to first question');
    
    await this.page.waitForTimeout(5000);
    
    // Verify we are on the first question (it should be visible)
    const stemText = questionFrame.locator('.stem-text');
    await stemText.first().waitFor({ state: 'visible', timeout: 5000 });
    this.logger?.success('✅ First question is displayed');
    
    // Click Continue to go forward again to second question
    const continueBtn = questionFrame.locator('#moveNext');
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✅ Clicked Continue - returned to second question');
    
    await this.page.waitForTimeout(2000);
  };

  /**
   * Check for flagged question notification and finalize assessment
   * Used in: TC11 (Dropdown) - Flagged notification and finalize
   */
  checkFlaggedNotificationAndFinalize = async (): Promise<void> => {
    const questionFrame = this.page.frameLocator('#assessmentFrame');
    
    // Look for flagged question notification/count
    const flaggedNotification = questionFrame.locator('text=/flagged|Flagged/i');
    const hasNotification = await flaggedNotification.count() > 0;
    
    if (hasNotification) {
      const flaggedText = await flaggedNotification.first().textContent();
      this.logger?.success(`✅ Flagged question notification displayed: "${flaggedText}"`);
    } else {
      this.logger?.info('No flagged question notification found');
    }
    
    // Verify Finalize and View Results button is visible
    const finalizeBtn = questionFrame.locator('button.primary-button', { hasText: 'Finalize and View Results' });
    await finalizeBtn.waitFor({ state: 'visible', timeout: 5000 });
    this.logger?.success('✅ Finalize and View Results button is visible');
    
    // Click Finalize and View Results
    await finalizeBtn.click();
    this.logger?.success('✅ Clicked Finalize and View Results button');

    // Click Continue button in confirmation dialog
    const continueBtn = questionFrame.locator('button.secondary-button', { hasText: 'Continue' });
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✅ Clicked Continue to confirm finalization');
  };

  /**
   * Verify IPP page score and take screenshot
   * Used in: TC12/TC10 - IPP score validation
   */
  verifyIPPScoreAndScreenshot = async (
    expectedPercentage: string,
    scenarioName: string,
    batchId: string,
    assertions: Assertions
  ): Promise<void> => {
    // Wait for IPP page to load
    await this.page.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 100000 });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000);

    // Use first() to avoid strict mode violation (2 elements with same attribute)
    const scoreLocator = this.page.locator('.reporting-header-score > span[data-atiid="individualScore"]').first();
    await scoreLocator.waitFor({ state: 'visible', timeout: 10000 });
    const percentageValue = await scoreLocator.textContent();
    const extractedPercentage = (percentageValue?.trim() || '') + '%';
    assertions.assertPercentage(extractedPercentage, expectedPercentage);
    this.logger?.success(`✅ IPP page shows ${expectedPercentage} score on UI`);

    // Verify IPP heading
    await this.verifyElementByRole('heading', 'Individual Performance Profile', 'IPP Page Heading');
    
    // Take screenshot
    await this.takeScreenshot(scenarioName, batchId);
    this.logger?.success('✅ Screenshot captured for IPP page');
  };


  /**
   * Validate IPP scoring - verifies percentage score is visible and matches expected value.
   * Reusable across any test that needs to validate the IPP percentage score.
   * @param expectedPercentage - Expected score string (e.g., '100.0%')
   * @returns The extracted percentage string
   */
  validateIPPScoring = async (expectedPercentage: string): Promise<string> => {
    await this.page.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 100000 });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.assertions.waitAndAssertVisible(this.locators.percentageScore, 30000);
    const percentageValue = await this.locators.percentageScore.textContent();
    const trimmed = percentageValue?.trim() || '';
    const extractedPercentage = trimmed.endsWith('%') ? trimmed : trimmed + '%';
    this.assertions.assertPercentage(extractedPercentage, expectedPercentage);
    this.logger?.success(`✅ IPP score validated: ${extractedPercentage}`);
    return extractedPercentage;
  };

   /**
   * Smart answer assessment - auto-detects question types  and answers accordingly
   * Supports all item types: multipleChoice, multipleSelect, dropdown, clozeDropdown,
   * dragAndDrop, bowtie, fillInBlank, highlightText, highlightTable, hotspot, matrix, orderedResponse, exhibit
   */
  validateAssessmentName = async (expectedAssessmentName: string): Promise<string> => {
    await this.assertions.waitAndAssertVisible(this.locators.ippAssessmentName, 30000);
    const assessmentNameText = await this.locators.ippAssessmentName.textContent();
    const trimmedName = (assessmentNameText ?? '').trim();
    this.assertions.assertStringContains(trimmedName, expectedAssessmentName);
    this.logger?.success(`✅ Assessment name validated: "${trimmedName}"`);
    return trimmedName;
  };



  smartAnswerAssessment = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage'
  ): Promise<void> => {
    await this.qnaUtil.smartAnswerAssessment(jsonFileName, assessmentType);
  };

  /**
   * Validates that the current date is reflecting correctly on IPP page.
   * Matches the app's M/D/YYYY format.
   * @returns The extracted date string from the DOM
   */
  validateIPPDate = async (): Promise<string> => {
    const today = new Date();
    const expectedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    const dateElement = this.page.locator('span').filter({ hasText: /^\d{1,2}\/\d{1,2}\/\d{4}$/ }).first();
    await dateElement.waitFor({ state: 'visible', timeout: 10000 });
    const dateText = await dateElement.textContent();
    const trimmedDate = (dateText ?? '').trim();

    this.assertions.assertStringContains(trimmedDate, expectedDate);
    this.logger?.success(`\u2705 IPP date validated: "${trimmedDate}"`);
    return trimmedDate;
  };

  /**
   * Simulates a cheat incident by pressing Ctrl+C inside the assessment iframe.
   * Waits for the "Invalid key pressed" modal to appear.
   */
  createCheatIncident = async (): Promise<void> => {
    const assessmentIframe = this.page.frameLocator('iframe').first();
    await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success('\u2705 Assessment iframe loaded');

    const iframeElement = this.page.locator('iframe').first();
    await iframeElement.click();
    await this.page.waitForTimeout(1000);

    await this.page.keyboard.press('Control+c');
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Pressed Ctrl+C to trigger invalid key detection');

    const invalidKeyModal = assessmentIframe.locator('#end-assessment-confirm-title');
    await invalidKeyModal.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('\u2705 Invalid key pressed modal is visible');
  };

  /**
   * Resumes assessment after a cheat incident by clicking the Resume Test button in the iframe modal.
   */
  resumeAfterIncident = async (): Promise<void> => {
    await this.page.bringToFront();
    await this.page.waitForTimeout(2000);

    const assessmentFrame = this.page.frameLocator('iframe').first();
    const resumeTestButton = assessmentFrame.locator('button.primary-button', { hasText: 'Resume Test' });
    await resumeTestButton.waitFor({ state: 'visible', timeout: 10000 });
    await resumeTestButton.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Clicked Resume Test button');
  };

  /**
   * Validates that the "Your proctor notified" message appears with the Resume Test button,
   * then clicks Resume Test to continue the assessment.
   * Used for incidents #1 and #2.
   * @param incidentNumber - The incident number for logging purposes
   */
  validateProctorNotifiedAndResume = async (incidentNumber: number): Promise<void> => {
    const assessmentFrame = this.page.frameLocator('iframe').first();
    const proctorNotifiedText = assessmentFrame.locator('#end-assessment-confirm-body', { hasText: /proctor.*notified/i }).first();
    await proctorNotifiedText.waitFor({ state: 'visible', timeout: 60000 });
    this.logger?.success(`\u2705 "Your proctor has been notified" message is visible (Incident #${incidentNumber})`);

    const resumeTestBtn = assessmentFrame.locator('button.primary-button', { hasText: /Resume Test/i });
    await resumeTestBtn.waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success(`\u2705 Resume Test button is visible (Incident #${incidentNumber})`);

    await resumeTestBtn.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    this.logger?.success(`\u2705 Resumed test after incident #${incidentNumber}`);
  };

  /**
   * Validates the "Invalid key pressed" warning popup (3rd incident) and clicks Resume Assessment.
   * Title: "Invalid key pressed"
   * Body: "WARNING: Continued detection of this behavior will result in your assessment being ended."
   * Button: "Resume Assessment"
   */
  validateInvalidKeyWarningAndResume = async (): Promise<void> => {
    const assessmentFrame = this.page.frameLocator('iframe').first();
    const warningTitle = assessmentFrame.locator('#end-assessment-confirm-title', { hasText: /Invalid key pressed/i }).first();
    await warningTitle.waitFor({ state: 'visible', timeout: 60000 });
    this.logger?.success('\u2705 "Invalid key pressed" warning title is visible (Incident #3)');

    const warningBody = assessmentFrame.locator('#end-assessment-confirm-body', { hasText: /continued detection/i }).first();
    await warningBody.waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success('\u2705 Warning body message is visible');

    const resumeAssessmentBtn = assessmentFrame.locator('button.primary-button', { hasText: /Resume Assessment/i });
    await resumeAssessmentBtn.waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success('\u2705 Resume Assessment button is visible');

    await resumeAssessmentBtn.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Clicked Resume Assessment after warning');
  };

  /**
   * Validates the "Warning threshold maxed" popup (4th/final incident) with Close Assessment button.
   * Title: "Moving outside of the test is prohibited."
   * Body: "Your warning threshold has been maxed. Your assessment is now ended."
   * Button: "Close Assessment"
   */
  validateThresholdMaxedAndClose = async (): Promise<void> => {
    const assessmentFrame = this.page.frameLocator('iframe').first();
    const thresholdBody = assessmentFrame.locator('#end-assessment-confirm-body', { hasText: /threshold.*maxed/i }).first();
    await thresholdBody.waitFor({ state: 'visible', timeout: 60000 });
    this.logger?.success('\u2705 "Warning threshold maxed" message is visible (Final incident)');

    const closeBtn = assessmentFrame.locator('button.secondary-button', { hasText: /Close Assessment/i });
    await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
    this.logger?.success('\u2705 Close Assessment button is visible');

    await closeBtn.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Clicked Close Assessment - assessment ended');
  };

  /**
   * Validates that the "proctor not available" message appears when student tries to take
   * a proctored assessment without a proctor session being started.
   */
  validateProctorNotAvailableMessage = async (): Promise<string> => {
    const proctorNotAvailableMsg = this.page.locator('text=/proctor.*not.*available/i').first();
    await proctorNotAvailableMsg.waitFor({ state: 'visible', timeout: 15000 });
    const msgText = await proctorNotAvailableMsg.textContent();
    const trimmedMsg = (msgText ?? '').trim();
    this.logger?.success(`\u2705 Proctor not available message shown: "${trimmedMsg}"`);
    return trimmedMsg;
  };

  /**
   * Validates that the student sees an abandoned/ended message after faculty abandons the attempt.
   * @returns true if message is visible, false otherwise
   */
  validateAbandonedMessage = async (): Promise<boolean> => {
    await this.page.bringToFront();
    await this.page.waitForTimeout(5000);

    const assessmentFrame = this.page.frameLocator('iframe').first();
    const abandonedMsg = assessmentFrame.locator('text=/abandon|ended|closed/i').first();
    const msgVisible = await abandonedMsg.isVisible().catch(() => false);

    if (msgVisible) {
      const msgText = await abandonedMsg.textContent();
      this.logger?.success(`\u2705 Student sees abandon message: "${msgText?.trim()}"`);
      return true;
    } else {
      const currentUrl = this.page.url();
      this.logger?.info(`Student current URL after abandon: ${currentUrl}`);
      this.logger?.success('\u2705 Student assessment session ended after abandon');
      return false;
    }
  };

  /**
   * Validates the time spent on IPP page against actual elapsed time.
   * @param assessmentStartTime - Start time in ms (Date.now())
   * @param assessmentEndTime - End time in ms (Date.now())
   * @param toleranceSeconds - Allowed tolerance in seconds (default: 30)
   * @returns The extracted time string from IPP page
   */
  validateIPPTimeSpent = async (
    assessmentStartTime: number,
    assessmentEndTime: number,
    toleranceSeconds: number = 30
  ): Promise<string> => {
    await this.assertions.waitAndAssertVisible(this.locators.ippTimeSpent, 10000);
    const timeSpentText = await this.locators.ippTimeSpent.textContent();
    const trimmedTime = (timeSpentText ?? '').trim();

    if (!trimmedTime || trimmedTime.length === 0) {
      throw new Error('Time spent value is empty on IPP Page');
    }

    const timeParts = trimmedTime.split(':').map(Number);
    let ippTimeInSeconds: number;
    if (timeParts.length === 3) {
      ippTimeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) {
      ippTimeInSeconds = timeParts[0] * 60 + timeParts[1];
    } else {
      throw new Error(`Unexpected time format on IPP Page: "${trimmedTime}"`);
    }

    const actualElapsedSeconds = Math.floor((assessmentEndTime - assessmentStartTime) / 1000);
    this.logger?.info(`Actual elapsed: ${actualElapsedSeconds}s | IPP reported: ${ippTimeInSeconds}s`);

    const difference = Math.abs(ippTimeInSeconds - actualElapsedSeconds);
    if (difference > toleranceSeconds) {
      throw new Error(
        `Time mismatch beyond ${toleranceSeconds}s tolerance. IPP: ${ippTimeInSeconds}s, Actual: ${actualElapsedSeconds}s, Diff: ${difference}s`
      );
    }
    this.logger?.success(`✅ IPP time validated: "${trimmedTime}" (diff: ${difference}s)`);
    return trimmedTime;
  };

  /**
   * Validates the Close button on IPP page is visible, clicks it, and verifies navigation away.
   */
  validateIPPCloseButton = async (): Promise<void> => {
    await this.assertions.waitAndAssertVisible(this.locators.ippCloseButton, 10000);
    this.logger?.success('Close button is visible on IPP Page');

    await this.locators.ippCloseButton.click();
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);

    const postCloseUrl = this.page.url();
    if (postCloseUrl.includes('IPPTestResult') || postCloseUrl.includes('ViewResult')) {
      throw new Error('Close button did not navigate away from IPP Page');
    }
    this.logger?.success(`✅ Close button navigated away from IPP: ${postCloseUrl}`);
  };
}
