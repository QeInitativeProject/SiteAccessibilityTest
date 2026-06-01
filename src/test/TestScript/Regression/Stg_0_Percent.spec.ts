/**
 * Regression Test - 0% Score Assessment
 * Description: Validate student takes a practice assessment answering 0 questions correctly,
 * verifies IPP page shows 0.0% score.
 * @author [Shyan Wasi]
 */

import { test } from '@playwright/test';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { BatchCreation } from '@utils/BatchCreation';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const EXPECTED_PERCENTAGE = '0.0%';
const QUESTION_ANSWER_FILE = '0_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_0_Percent';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';

test.describe.serial('@regression Stg_0_Percent', () => {
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
    const { chromium } = await import('@playwright/test');
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
  });

  test.afterAll(async () => {
    await browser.close();
  });

  // ============================================================
  // BATCH CREATION & LOGIN
  // ============================================================

  test('TC1: MU batch creation', async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch();
      stopTimer();

      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: ATI login', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__ATI_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: ATI LOGIN');

    try {
      await page.goto(process.env.baseUrl);
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzdev);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzdev);
      await atiLoginPage.clickLogin();
      logger.success('TC2 PASS: Logged into ATI successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // HOME PAGE & MY ATI VALIDATION
  // ============================================================

  test('TC3: Verify Home page navigation elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Home_Page_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    myATIPage.setLogger(logger);

    logger.separator('TC3: HOME PAGE NAVIGATION ELEMENTS');

    try {
      await myATIPage.verifyHomePageNavigationElements(locators, assertions);
      logger.success('TC3 PASS: All Home page navigation elements verified');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Verify My ATI page functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__My_ATI_Page', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    myATIPage.setLogger(logger);

    logger.separator('TC4: MY ATI PAGE FUNCTIONALITY');

    try {
      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);
      logger.success('TC4 PASS: My ATI page functionality verified');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ADD PRODUCT & ASSESSMENT FLOW
  // ============================================================

  test('TC5: Add Product and navigate to Assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    myATIPage.setLogger(logger);

    logger.separator('TC5: ADD PRODUCT AND NAVIGATE TO ASSESSMENT');

    try {
      await myATIPage.addProductAndNavigateToAssessment(
        extractedBatchId,
        process.env.muassessmentpassword || '',
        locators,
        assertions
      );
      logger.success('TC5 PASS: Product added and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Flag, Continue, Previous, Unflag robust flow', async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    logger.separator('TC6: FLAG/UNFLAG FLOW');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC6 PASS: Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Verify blue banner is visible with correct background color', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Blue_Banner', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    logger.separator('TC7: BLUE BANNER VALIDATION');

    try {
      await assessmentPage.verifyBlueBannerVisibility('#d7eef4');
      logger.success('TC7 PASS: Blue banner is visible with correct color');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Calculator', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });

    logger.separator('TC8: CALCULATOR FUNCTIONALITY');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC8 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Pause_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });

    logger.separator('TC9: PAUSE AND RESUME');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC9 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ANSWER & FINALIZE
  // ============================================================

  test('TC10: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: ANSWER ASSESSMENT');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC10 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });

    logger.separator('TC11: FINALIZE ASSESSMENT');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC11 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: IPP page shows 0% score', async ({}, testInfo) => {
    logger = new Logger(page, 'TC12__IPP_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: IPP SCORE VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success(`TC12 PASS: IPP page shows ${EXPECTED_PERCENTAGE} score`);
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });
});

