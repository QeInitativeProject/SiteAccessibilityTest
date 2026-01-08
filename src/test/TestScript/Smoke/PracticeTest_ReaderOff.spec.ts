/**
 * @author Shyan Wasi
 */

import { test } from '@playwright/test';
import type { Browser, BrowserContext, Page } from 'playwright';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { BatchCreation } from '@utils/BatchCreation';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const _EXPECTED_URL_PATTERN = '/ViewResult/FLAGTestResult/';
const EXPECTED_PERCENTAGE = '100.0%';
const _EXPECTED_ASSESSMENT_NAME = 'practicestg_shyan';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Scoring_QA_STAGE';
const SCENARIO_NAME = 'PracticeTest_ReaderOff';

test.describe.serial('@smoke PracticeTest_ReaderOff', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let assertions: Assertions;
  let batchCreation: BatchCreation;
  let extractedBatchId: string;
  let atiLoginPage: LoginPage;
  let myATIPage: MyATIPage;
  let assessmentPage: AssessmentPage;
  let logger: Logger;
  let locators: StudentFacingPageLocators;

  test.beforeAll(async () => {
    // Use import for Playwright
    const { chromium } = await import('playwright');
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    assertions = new Assertions(page);
    batchCreation = new BatchCreation(browser);
    atiLoginPage = new LoginPage(page);
    myATIPage = new MyATIPage(page);
    assessmentPage = new AssessmentPage(page);
    locators = new StudentFacingPageLocators(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
    // Success screenshots removed - only capturing final IPP screenshot
  });

  test.afterAll(async ({}, _testInfo) => {
    await browser.close();
  });

  test('TC1: MU batch creation', async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    const stopTimer = logger.startTimer('Batch creation');
    extractedBatchId = await batchCreation.createBatch();
    stopTimer();

    assertions.assertValidNumericId(extractedBatchId, 5);
    logger.success(`Batch created with ID: ${extractedBatchId}`);
    logger.separator();
  });

  test('TC2: ATI login and verify Home page elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__ATI_Login_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC2: ATI Login Validation');
    logger.step('1. Navigate to base URL');
    logger.step('2. Enter student credentials');
    logger.step('3. Verify Home page URL loaded');

    await page.goto(process.env.baseUrl);
    await atiLoginPage.fillStuUserName(process.env.stuUsernamezzdev1);
    await atiLoginPage.fillStuPassword(process.env.stuPasswordzzdev);
    await atiLoginPage.clickLogin();
    logger?.success('Logged into ATI with zzdev credentials');

    // Wait for Home page URL to load properly
    await assertions.assertPageHasURL(/\/Home/);
    logger?.success('Home page URL loaded successfully');

    logger?.success('TC Login successful and Home page loaded');
  });

  test('TC3: Verify Home page navigation elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Home_Page_Navigation_Elements', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC3: Home Page Navigation Elements Validation');
    logger?.step('1. Home navigation link');
    logger?.step('2. My ATI navigation link');
    logger?.step('3. Results navigation link');
    logger?.step('4. Help navigation link');
    logger?.step('5. Profile navigation link');
    logger?.step('6. Add a Product text');

    // Assert all navigation links are visible using Assertions class
    await assertions.assertVisible(locators.homeNavigationLink);
    logger?.success('✓ Home navigation link is visible');

    await assertions.assertVisible(locators.myATINavigationLink);
    logger?.success('✓ My ATI navigation link is visible');

    await assertions.assertVisible(locators.resultsNavigationLink);
    logger?.success('✓ Results navigation link is visible');

    await assertions.assertVisible(locators.helpNavigationLink);
    logger?.success('✓ Help navigation link is visible');

    await assertions.assertVisible(locators.profileNavigationLink);
    logger?.success('✓ Profile navigation link is visible');

    await assertions.assertVisible(locators.addProductText);
    logger?.success('✓ Add a Product text is visible');

    logger?.success('TC All Home page navigation elements verified successfully');
  });

  test('TC4: Verify My ATI page functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__My_ATI_Page_Functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC4: My ATI Page Functionality Validation');
    logger?.step('1. Click on My ATI tab');
    logger?.step('2. Verify Products page URL');
    logger?.step('3. Assessments Tab link visibility');
    logger?.step('4. Study Materials heading visibility');
    logger?.step('5. Learn Tab link visibility');
    logger?.step('6. NCLEX Prep Tab link visibility');

    try {
      // Click on My ATI tab
      await myATIPage.clickOnMyATITab();
      logger?.step('Clicked on My ATI tab');

      // Wait for Products page URL to load properly
      await assertions.assertPageHasURL(/\/Products/);
      logger?.success('Products page URL loaded successfully');

      // Assert Assessments Tab link is visible
      await assertions.assertVisible(locators.assessmentsTabLink);
      logger?.success('✓ Assessments Tab link is visible');

      // Assert Study Materials heading is visible
      await assertions.assertVisible(locators.studyMaterialsHeading);
      logger?.success('✓ Study Materials heading is visible');

      // Assert Learn Tab link is visible
      await assertions.assertVisible(locators.learnTabLink);
      logger?.success('✓ Learn Tab link is visible');

      // Assert NCLEX Prep Tab link is visible
      await assertions.assertVisible(locators.nclexPrepTabLink);
      logger?.success('✓ NCLEX Prep Tab link is visible');

      logger?.success('TC My ATI page functionality verified - all elements visible');
    } catch (error: any) {
      logger?.error('TC4 FAIL: ' + error.message);
      throw error;
    }
  });

  test('TC5: Click on Assessments tab, verify Add Product dialog, enter credentials and continue', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Add_Product_Dialog', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC5: Add Product Dialog and Credentials Validation');
    logger?.step('1. Click on Assessments tab');
    logger?.step('2. Verify Add Product dialog appears');
    logger?.step('3. Enter Batch ID from TC1');
    logger?.step('4. Enter Password');
    logger?.step('5. Click Continue');
    logger?.step('6. Navigate to Assessment page');

    // Click on Assessments tab
    await myATIPage.clickOnAssessmentsTab();
    logger?.step('Clicked on Assessments tab');

    // Verify Add Product dialog appears
    await assertions.assertRoleVisible('heading', 'Add a product to your account');
    logger?.success('✅ Add Product dialog is visible');

    // Verify Cancel and Continue buttons are visible when dialog appears
    await assertions.assertVisible(locators.cancelButton);
    logger?.success('✅ Cancel button is visible in Add Product dialog');

    await assertions.assertVisible(locators.continueButton);
    logger?.success('✅ Continue button is visible in Add Product dialog');

    // Verify ID textbox is visible
    await assertions.assertVisible(locators.idTextbox);
    logger?.success('✅ ID textbox is visible');

    // Enter Batch ID
    await locators.idTextbox.fill(extractedBatchId.trim());
    logger?.success(`✅ Batch ID entered: ${extractedBatchId.trim()}`);

    // Verify Cancel and Continue buttons are still visible after entering Batch ID
    await assertions.assertVisible(locators.cancelButton);
    logger?.success('✅ Cancel button is visible after entering Batch ID');

    await assertions.assertVisible(locators.continueButton);
    logger?.success('✅ Continue button is visible after entering Batch ID');

    // Click Continue button after entering Batch ID
    await locators.continueButton.click();
    logger?.success('✅ Continue clicked after ID entry');

    // Verify Password textbox is visible
    await assertions.assertVisible(locators.passwordTextboxDialog);
    logger?.success('✅ Password textbox is visible');

    // Enter Password
    await locators.passwordTextboxDialog.fill(process.env.muassessmentpassword || '');
    logger?.success(`✅ Password entered`);

    // Verify Cancel and Continue buttons are visible after entering Password
    await assertions.assertVisible(locators.cancelButton);
    logger?.success('✅ Cancel button is visible after entering Password');

    // Verify Continue button is visible after entering both Batch ID and Password
    await assertions.assertVisible(locators.continueButton);
    logger?.success('✅ Continue button is visible after entering Batch ID and Password');
    await locators.continueButton.click();
    logger?.success('✅ Continue clicked after password entry');

    // Verify navigation to Assessment page
    await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
    logger?.success('✅ Navigated to Assessment page');

    logger?.success(
      'TC5 PASS: Add Product dialog verified, credentials entered, and navigated to Assessment page.'
    );
  });

  test('TC6: Flag, Continue, Previous, Unflag robust flow', async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC6: Flag/Unflag Flow Validation');
    logger?.step('1. Flag a question');
    logger?.step('2. Continue to next question');
    logger?.step('3. Go back to previous question');
    logger?.step('4. Unflag the question');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger?.success('TC Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      logger?.error('TC6 FAIL: Full Flag-Continue-Previous-Unflag flow failed: ' + error);
      throw error;
    }
  });

  test('TC7: Verify blue banner is visible with correct background color', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Blue_Banner_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC7: Blue Banner Validation');
    logger?.step('1. Verify blue banner visibility');
    logger?.step('2. Validate background color (#d7eef4)');

    await assessmentPage.verifyBlueBannerVisibility('#d7eef4');
    logger?.success('TC Blue banner is visible');
  });

  test('TC8: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Calculator_Functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC8: Calculator Functionality Validation');
    logger?.step('1. Open calculator');
    logger?.step('2. Verify calculator input and operations');
    logger?.step('3. Close calculator');

    await assessmentPage.verifyCalculatorFunctionality();
    logger?.success('TC Calculator functionality verified');
  });

  test('TC9: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Pause_and_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC9: Pause and Resume Functionality Validation');
    logger?.step('1. Pause the assessment');
    logger?.step('2. Verify pause state');
    logger?.step('3. Resume the assessment');

    // Ensure assessment frame is loaded and visible
    await assessmentPage.verifyPauseAndResumeFunctionality();
    logger?.success('TC Pause and resume functionality verified');
  });

  test('TC10: answer assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC10: Answer Assessment Questions Validation');
    logger?.step('1. Load questions from JSON file (4_Correct_QnA.json)');
    logger?.step('2. Answer all assessment questions');
    logger?.step('3. Verify answers submitted');

    await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
    logger?.success('TC Assessment finished and IPP page loaded');
  });
  test('TC11: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC11: Finalize Assessment Validation');
    logger?.step('1. Click Finish button');
    logger?.step('2. Navigate to IPP page');
    logger?.step('3. Verify IPP page URL');

    await assessmentPage.finalizeAssessmentAndViewResults();
    logger?.success('TC Assessment finished and IPP page loaded');
  });

  test('TC12: IPP page shows 100% score', async ({}, testInfo) => {
    logger = new Logger(page, 'TC12__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC12: IPP Score Validation');
    logger?.step('1. Verify percentage score on IPP page');
    logger?.step('2. Assert score equals 100.0%');
    logger?.step('3. Verify IPP heading');
    logger?.step('4. Take screenshot for validation');

    await assertions.waitAndAssertVisible(locators.percentageScore);
    const percentageValue = await locators.percentageScore.textContent();
    const extractedPercentage = (percentageValue ?? '').trim();
    assertions.assertPercentage(extractedPercentage, EXPECTED_PERCENTAGE);
    logger?.success('TC IPP page shows 100% score on UI');

    // Optionally, verify IPP heading and take screenshot
    await assessmentPage.verifyElementByRole(
      'heading',
      'Individual Performance Profile',
      'IPP Page Heading'
    );
    await assessmentPage.takeScreenshot('100_Percent_IPP_Page', extractedBatchId);
  });
});
