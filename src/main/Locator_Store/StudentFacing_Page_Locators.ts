import type { FrameLocator, Page } from '@playwright/test';

/**
 * StudentFacing_Page_Locators
 *
 * Centralized locator repository for all student-facing page elements
 * Used across PracticeTest_ReaderOff.spec.ts and PracticeTest_ReaderOn.spec.ts
 *
 * Purpose: Eliminate hard-coded locators from test cases and utility methods
 * Maintainability: Single source of truth for all locators
 */
export class StudentFacingPageLocators {
  readonly page: Page;
  readonly assessmentFrame: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.assessmentFrame = page.frameLocator('iframe[name="assessmentFrame"]');
  }

  // ============================================
  // LOGIN PAGE LOCATORS (TC2)
  // Used in: LoginPage.ts methods
  // ============================================

  /**
   * Username textbox on login page
   * Used in: LoginPage.fillStuUserName(), LoginPage.fillfacUserName()
   */
  get usernameTextbox() {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  /**
   * Password textbox on login page
   * Used in: LoginPage.fillStuPassword(), LoginPage.fillfacPassword()
   */
  get passwordTextbox() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  /**
   * Login button on login page
   * Used in: LoginPage.clickLogin()
   * Handles both "Log In" (stage) and "Login" (prod)
   */
  get loginButton() {
    return this.page.getByRole('button', { name: /^Log ?In$/i });
  }

  // ============================================
  // HOME PAGE NAVIGATION LOCATORS (TC3)
  // Used in: Test cases directly for home page validation
  // ============================================

  /**
   * Home navigation link
   * Used in: TC3 - Home page navigation elements validation
   */
  get homeNavigationLink() {
    return this.page.locator('#homeTab');
  }

  /**
   * My ATI navigation link
   * Used in: TC3 - Home page navigation elements validation
   */
  get myATINavigationLink() {
    return this.page.getByRole('link', { name: 'Select this link to navigate to the My ATI page' });
  }

  /**
   * Results navigation link
   * Used in: TC3 - Home page navigation elements validation
   */
  get resultsNavigationLink() {
    return this.page.getByRole('link', {
      name: 'Select this link to navigate to the Results page',
    });
  }

  /**
   * Help navigation link
   * Used in: TC3 - Home page navigation elements validation
   */
  get helpNavigationLink() {
    return this.page.getByRole('link', { name: 'Select this link to navigate to the Help page' });
  }

  /**
   * Profile navigation link
   * Used in: TC3 - Home page navigation elements validation
   */
  get profileNavigationLink() {
    return this.page.getByRole('link', {
      name: 'Select this link to navigate to the Profile page',
    });
  }

  /**
   * Add a Product text element
   * Used in: TC3 - Home page navigation elements validation
   */
  get addProductText() {
    return this.page.getByText('addAdd a Product');
  }

  // ============================================
  // MY ATI PAGE LOCATORS (TC4)
  // Used in: ATICommonMethod.ts and MyATIPage.ts
  // ============================================

  /**
   * BlockUI overlay - loading indicator
   * Used in: ATICommonMethod.clickOnMyATITab()
   */
  get blockUIOverlay() {
    return this.page.locator('.blockUI.blockOverlay');
  }

  /**
   * My ATI tab link (first occurrence)
   * Used in: ATICommonMethod.clickOnMyATITab()
   */
  get myATITabLink() {
    return this.page.locator('text=My ATI').first();
  }

  /**
   * BlockUI message on page load
   * Used in: ATICommonMethod.waitForPageLoadAndVerifyNavigation()
   */
  get blockUIMessage() {
    return this.page.locator('.blockUI.blockMsg.blockPage');
  }

  /**
   * Assessments Tab link on My ATI page
   * Used in: TC4 - My ATI page functionality validation
   */
  get assessmentsTabLink() {
    return this.page.getByRole('link', { name: 'Assessments Tab: Select to' });
  }

  /**
   * Study Materials heading on My ATI page
   * Used in: TC4 - My ATI page functionality validation
   */
  get studyMaterialsHeading() {
    return this.page.getByRole('heading', { name: 'Study Materials', exact: true });
  }

  /**
   * Learn Tab link on My ATI page
   * Used in: TC4 - My ATI page functionality validation
   */
  get learnTabLink() {
    return this.page.getByRole('link', { name: 'Learn Tab: Select to display' });
  }

  /**
   * NCLEX Prep Tab link on My ATI page
   * Used in: TC4 - My ATI page functionality validation
   */
  get nclexPrepTabLink() {
    return this.page.getByRole('link', { name: 'N CLEX Prep Tab: Select to' });
  }

  // ============================================
  // ADD PRODUCT DIALOG LOCATORS (TC5)
  // Used in: ATICommonMethod.ts for product addition flow
  // ============================================

  /**
   * Add a Product button (multiple occurrences on page)
   * Used in: ATICommonMethod.clickOnAssessmentsTab()
   */
  get addProductButtons() {
    return this.page.getByText('Add a Product');
  }

  /**
   * Add Product dialog heading
   * Used in: TC5 - Add Product dialog validation
   */
  get addProductDialogHeading() {
    return this.page.getByRole('heading', { name: 'Add a product to your account' });
  }

  /**
   * Cancel button in Add Product dialog
   * Used in: TC5 - Add Product dialog validation
   */
  get cancelButton() {
    return this.page.getByRole('link', { name: 'Cancel' });
  }

  /**
   * Continue button in Add Product dialog
   * Used in: TC5 - Add Product dialog validation
   */
  get continueButton() {
    return this.page.getByRole('link', { name: 'Continue' });
  }

  /**
   * ID textbox in Add Product dialog
   * Used in: TC5 - Add Product dialog validation
   */
  get idTextbox() {
    return this.page.getByRole('textbox', { name: 'ID' });
  }

  /**
   * Password textbox in Add Product dialog
   * Used in: TC5 - Add Product dialog validation
   */
  get passwordTextboxDialog() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  // ============================================
  // ASSESSMENT FRAME LOCATORS
  // Used across multiple test cases (TC6-TC15)
  // ============================================

  /**
   * Assessment iframe selector
   * Used in: Multiple utility methods for frame context
   */
  get assessmentFrameSelector() {
    return 'iframe[name="assessmentFrame"]';
  }

  /**
   * Assessment iframe by ID selector
   * Used in: QnAUtil.verifyBlueBannerVisibility()
   */
  get assessmentFrameById() {
    return this.page.frameLocator('#assessmentFrame');
  }

  /**
   * Assessment frame body locator
   * Used in: Various methods for frame readiness checks
   */
  getAssessmentFrameBody() {
    return this.assessmentFrame.locator('body');
  }

  // ============================================
  // FLAG/UNFLAG FUNCTIONALITY LOCATORS (TC6)
  // Used in: QnAUtil.flagContinuePreviousUnflagFlow()
  // ============================================

  /**
   * Flag button in assessment frame
   * Used in: TC6 - Flag/Unflag flow validation
   */
  getFlagButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Flag' });
  }

  /**
   * Flag this question for Review button (alternative name)
   * Used in: QnAUtil.flagEnablesContinue()
   */
  getFlagButtonForReview() {
    return this.assessmentFrame.getByRole('button', { name: 'Flag this question for Review' });
  }

  /**
   * Continue To Next Question button in assessment frame
   * Used in: TC6, TC10 - Question navigation
   */
  getContinueButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Continue To Next Question' });
  }

  /**
   * Continue To Previous Question button in assessment frame
   * Used in: TC6 - Previous navigation
   */
  getPreviousButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Continue To Previous Question' });
  }

  /**
   * Unflag button in assessment frame
   * Used in: TC6 - Unflag flow validation
   */
  getUnflagButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Unflag' });
  }

  /**
   * Unflag this question for Review button (alternative name)
   * Used in: TC6 - Unflag flow validation
   */
  getUnflagButtonForReview() {
    return this.assessmentFrame.getByRole('button', { name: 'Unflag this question for Review' });
  }

  // ============================================
  // BLUE BANNER LOCATORS (TC7/TC10)
  // Used in: QnAUtil.verifyBlueBannerVisibility()
  // ============================================

  /**
   * Blue banner header (practice header) - XPath
   * Used in: TC7/TC10 - Blue banner visibility validation
   */
  getBlueBannerHeader() {
    return this.assessmentFrame.locator(
      '//header[@class="main-header product tutorial-header practice-header"]'
    );
  }

  // ============================================
  // TEXT-TO-SPEECH LOCATORS (TC7-TC9 ReaderOn only)
  // Used in: TextToSpeechUtility.ts methods
  // ============================================

  /**
   * Settings button for text-to-speech
   * Used in: TC7, TC9 - Text-to-speech functionality
   */
  getSettingsButton() {
    return this.assessmentFrame.getByRole('button').filter({ hasText: 'settings' });
  }

  /**
   * "Click and Listen" text element
   * Used in: TC7 - Text-to-speech content visibility
   */
  getClickAndListenText() {
    return this.assessmentFrame.getByText('Click and Listen');
  }

  /**
   * "playlist_play" icon element
   * Used in: TC7 - Text-to-speech content visibility
   */
  getPlaylistPlayIcon() {
    return this.assessmentFrame.getByText('playlist_play');
  }

  /**
   * Toggle switch thumb for text-to-speech
   * Used in: TC7, TC8 - Toggle functionality
   */
  getToggleSwitchThumb() {
    return this.assessmentFrame.locator('.mat-slide-toggle-thumb');
  }

  /**
   * Mat-slide-toggle parent element (for state checking)
   * Used in: TC8 - Toggle state validation
   */
  getToggleParent() {
    return this.assessmentFrame.locator('mat-slide-toggle');
  }

  /**
   * Pitch text in settings panel
   * Used in: TC9 - Settings controls visibility
   */
  getPitchText() {
    return this.assessmentFrame.getByText('Pitch');
  }

  /**
   * Speech rate text in settings panel
   * Used in: TC9 - Settings controls visibility
   */
  getSpeechRateText() {
    return this.assessmentFrame.getByText('Speech rate');
  }

  /**
   * Close button in settings panel
   * Used in: TC9 - Settings controls visibility
   */
  getCloseButtonSettings() {
    return this.assessmentFrame.getByRole('button', { name: 'Close', exact: true });
  }

  /**
   * Reset button in settings panel
   * Used in: TC9 - Settings controls visibility
   */
  getResetButton() {
    return this.assessmentFrame.getByText('Reset');
  }

  /**
   * Speech rate slider (range input) - first occurrence
   * Used in: TextToSpeechUtility.validateCloseAndResetFunctionality()
   */
  getSpeechRateSlider() {
    return this.assessmentFrame.locator('input[type="range"]').first();
  }

  /**
   * Pitch slider (range input) - second occurrence
   * Used in: TextToSpeechUtility.validateCloseAndResetFunctionality()
   */
  getPitchSlider() {
    return this.assessmentFrame.locator('input[type="range"]').nth(1);
  }

  // ============================================
  // CALCULATOR LOCATORS (TC8/TC11)
  // Used in: QnAUtil.verifyCalculatorFunctionality()
  // ============================================

  /**
   * Calculator toggle button
   * Used in: TC8/TC11 - Calculator functionality
   */
  getCalculatorToggleButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Toggle Calculator' });
  }

  /**
   * Calculator button "2"
   * Used in: TC8/TC11 - Calculator operation testing
   */
  getCalculatorButton2() {
    return this.assessmentFrame.getByRole('button', { name: '2' });
  }

  /**
   * Calculator Plus button
   * Used in: TC8/TC11 - Calculator operation testing
   */
  getCalculatorPlusButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Plus' });
  }

  /**
   * Calculator Equals button
   * Used in: TC8/TC11 - Calculator operation testing
   */
  getCalculatorEqualsButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Equals' });
  }

  /**
   * Calculator display (input/textbox)
   * Used in: TC8/TC11 - Calculator result verification
   */
  getCalculatorDisplay() {
    return this.assessmentFrame
      .locator('.calculator-display, [role="textbox"], input[type="text"]')
      .first();
  }

  /**
   * Calculator close button
   * Used in: TC8/TC11 - Calculator close functionality
   */
  getCalculatorCloseButton() {
    return this.assessmentFrame.getByRole('button', { name: 'CLOSE' });
  }

  /**
   * Calculator container (for scrolling)
   * Used in: TC8/TC11 - Calculator scrolling to reveal close button
   */
  getCalculatorContainer() {
    return this.assessmentFrame
      .locator('.calculator-container, .calculator, [class*="calculator"]')
      .first();
  }

  // ============================================
  // PAUSE/RESUME LOCATORS (TC9/TC12)
  // Used in: QnAUtil.verifyPauseAndResumeFunctionality()
  // ============================================

  /**
   * Pause this assessment button
   * Used in: TC9/TC12 - Pause functionality
   */
  getPauseButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Pause this assessment' });
  }

  /**
   * Resume assessment button
   * Used in: TC9/TC12 - Resume functionality
   */
  getResumeButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Resume assessment' });
  }

  // ============================================
  // QUESTION ANSWERING LOCATORS (TC10/TC13)
  // Used in: QnAUtil.answerAssessmentQuestions()
  // ============================================

  /**
   * Question text selectors (multiple fallback options)
   * Used in: QnAUtil.findQuestionText()
   */
  getQuestionTextSelector1() {
    return this.assessmentFrame.locator('div.stem-text.read-area p');
  }

  getQuestionTextSelector2() {
    return this.assessmentFrame.locator('div.stem-text.read-area');
  }

  getQuestionTextSelector3() {
    return this.assessmentFrame.locator('.stem-text p');
  }

  getQuestionTextSelector4() {
    return this.assessmentFrame.locator('.stem-text');
  }

  getQuestionTextSelector5() {
    return this.assessmentFrame.locator('#highlightWordsText');
  }

  getQuestionTextSelector6() {
    return this.assessmentFrame.locator('.question-stem');
  }

  /**
   * Radio group for answer options
   * Used in: QnAUtil.selectAnswerOption()
   */
  getRadioGroup() {
    return this.assessmentFrame.locator('ie-choice-interaction-delivery mat-radio-group');
  }

  /**
   * Individual answer choice containers
   * Used in: QnAUtil.selectAnswerOption()
   */
  getAnswerChoices() {
    return this.assessmentFrame.locator('div.ie-choice-interaction');
  }

  /**
   * Radio button within an answer choice (by index)
   * Used in: QnAUtil.selectAnswerOption()
   */
  getRadioButtonByIndex(index: number) {
    return this.assessmentFrame
      .locator('div.ie-choice-interaction')
      .nth(index)
      .locator('mat-radio-button')
      .first();
  }

  /**
   * All buttons in assessment frame (for debugging)
   * Used in: QnAUtil diagnostic methods
   */
  getAllButtonsInFrame() {
    return this.assessmentFrame.locator('button');
  }

  // ============================================
  // FINALIZE ASSESSMENT LOCATORS (TC11/TC14)
  // Used in: QnAUtil.finalizeAssessmentAndViewResults()
  // ============================================

  /**
   * Finalize and View Results button
   * Used in: TC11/TC14 - Assessment finalization
   */
  getFinalizeButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Finalize and View Results' });
  }

  // ============================================
  // IPP (INDIVIDUAL PERFORMANCE PROFILE) LOCATORS (TC12/TC15)
  // Used in: Test cases for IPP score validation
  // ============================================

  /**
   * Individual Performance Profile heading on IPP page
   * Used in: TC11/TC14, TC12/TC15 - IPP page validation
   */
  get ippHeading() {
    return this.page.getByRole('heading', { name: 'Individual Performance Profile' });
  }

  /**
   * Individual Performance Profile text (fallback selector)
   * Used in: QnAUtil.finalizeAssessmentAndViewResults()
   */
  get ippHeadingText() {
    return this.page.locator('text=Individual Performance Profile').first();
  }

  /**
   * Percentage score locator (regex pattern for digits with %)
   * Used in: TC12/TC15 - Score percentage validation
   */
  get percentageScore() {
    return this.page.locator('text=/\\d+%/').first();
  }

  // ============================================
  // CLOSE DIALOG LOCATORS
  // Used in: QnAUtil.verifyCloseDialogFunctionality()
  // ============================================

  /**
   * CLOSE button in assessment
   * Used in: QnAUtil.verifyCloseDialogFunctionality()
   */
  getCloseButtonAssessment() {
    return this.assessmentFrame.getByRole('button', { name: 'CLOSE' });
  }


getQuestionNumber()
{
  return this.assessmentFrame.locator('h1 span:first-child');
}


  /**
   * Yes button in close confirmation dialog
   * Used in: QnAUtil.verifyCloseDialogFunctionality()
   */
  getYesButton() {
    return this.assessmentFrame.getByRole('button', { name: 'Yes' });
  }

  /**
   * No button in close confirmation dialog
   * Used in: QnAUtil.verifyCloseDialogFunctionality()
   */
  getNoButton() {
    return this.assessmentFrame.getByRole('button', { name: 'No' });
  }

  // ============================================
  // HELPER METHODS FOR DYNAMIC LOCATORS
  // ============================================

  /**
   * Get assessment frame from main page
   * Used in: Multiple utility methods
   */
  getAssessmentFrameLocator(): FrameLocator {
    return this.page.frameLocator('iframe[name="assessmentFrame"]');
  }

  /**
   * Get assessment frame by ID
   * Used in: QnAUtil.verifyBlueBannerVisibility()
   */
  getAssessmentFrameByIdLocator(): FrameLocator {
    return this.page.frameLocator('#assessmentFrame');
  }

  // ============================================
  // IPP PAGE DETAIL LOCATORS
  // Used in: IPP page validation test cases
  // ============================================

  /**
   * Close button on IPP page
   */
  get ippCloseButton() {
    return this.page.locator('div.close-button[aria-label="close"]').first();
  }


  /**
   * Assessment name displayed on IPP page
   */
  get ippAssessmentName() {
    return this.page.locator('.lesson-header-details ul li span').nth(1);
  }

  
  /**
   * Time spent displayed on IPP page
   */
  get ippTimeSpent() {
    return this.page.locator('.reporting-header-timespent > span').first();
  }

  /**
   * Overall percentage score on IPP page
   */
  get overallPercentageScore() {
  return this.page.locator('.ipp-test-reporting-header-score > span').first();
}

  // ============================================
  // REGRESSION TEST LOCATORS
  // Used in: Stg_RegressionCases.spec.ts
  // ============================================

  /**
   * IN PROGRESS assessment dial on home page
   * Used in: TC1, TC2 - Clicking in-progress assessment
   */
  get inProgressAssessmentDial() {
    return this.page.locator('div.rb-row-main div.status-in-progress-dial[aria-label="IN PROGRESS"]').first();
  }

  /**
   * Calculator dialog/window inside assessment frame
   * Used in: TC1 - Drag calculator window validation
   */
  getCalculatorDialog() {
    return this.assessmentFrame.locator('#viewCalculator');
  }

  /**
   * Unflag this question button (after flagging)
   * Used in: TC2 - Verify flag persists after resume
   */
  getUnflagThisQuestionButton() {
    return this.assessmentFrame.locator('button[aria-label="Unflag this question"]');
  }
}
