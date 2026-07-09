
import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';

const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const PARTIAL_QUESTIONS_COUNT = 1;
const EXPECTED_PERCENTAGE = '100.0%';
const SCENARIO_NAME = 'Stg_Practice_PartialSave_Resume';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';
const stuid = process.env.stuUserPartial;

test.describe.serial('@Regression - Stg_Practice_PartialSave_Resume', { tag: '@regression' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let atiLoginPage: LoginPage;
  let myATIPage: MyATIPage;
  let assessmentPage: AssessmentPage;
  let assertions: Assertions;
  let logger: Logger;
  let locators: StudentFacingPageLocators;
  let batchCreation: BatchCreation;
  let extractedBatchId: string;

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({
      headless: process.env.CI ? true : false,
    });
    context = await browser.newContext();
    page = await context.newPage();
    atiLoginPage = new LoginPage(page);
    myATIPage = new MyATIPage(page);
    assessmentPage = new AssessmentPage(page);
    assertions = new Assertions(page);
    batchCreation = new BatchCreation(browser);
    locators = new StudentFacingPageLocators(page);

    page.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logger?.info(`Console error: ${msg.text()}`);
      }
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
  });

  test.afterAll(async () => {
    try {
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
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

  test('TC2: Student login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: STUDENT LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillStuUserName(stuid!);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzdev!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('TC2 PASS: Student logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Add Product - Enter Batch ID and Password', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    myATIPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC3: ADD PRODUCT WITH BATCH ID');

    try {
      await page.waitForLoadState('domcontentloaded');
      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);
      await myATIPage.addProductAndNavigateToAssessment(
        extractedBatchId,
        process.env.muassessmentpassword || 'Test@123',
        locators,
        assertions
      );
      logger.success('TC3 PASS: Product added with Batch ID and password');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Student answers 1 out of 4 questions (partial save)', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Partial_Answer', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    assessmentPage.setLogger(logger);

    logger.separator('TC4: ANSWER PARTIAL QUESTIONS (1 OF 4)');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, PARTIAL_QUESTIONS_COUNT);
      logger.success(`TC4 PASS: Answered ${PARTIAL_QUESTIONS_COUNT} questions - partial save in progress`);
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });


  test('TC5: Student closes browser tab (simulating disconnect)', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Close_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });

    logger.separator('TC5: STUDENT CLOSES BROWSER TAB');

    try {
      const assessmentUrl = page.url();
      logger.info(`Student was on: ${assessmentUrl}`);

      await page.close();
      logger.success('TC5 PASS: Page closed (simulating accidental disconnect)');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Student logs back in', { tag: '@regression' }, async ({}, testInfo) => {
    page = await context.newPage();
    logger = new Logger(page, 'TC6__Student_Relogin', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    logger.separator('TC6: STUDENT RE-LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });

      page.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      atiLoginPage = new LoginPage(page);
      atiLoginPage.setLogger(logger);
      await atiLoginPage.fillStuUserName(stuid!);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzdev!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');

      assertions = new Assertions(page);
      assertions.setLogger(logger);
      await assertions.assertURLNotContains('/login');
      logger.success('TC6 PASS: Student logged back in successfully');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Student relaunches the same assessment and resumes', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Resume_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    logger.separator('TC7: RELAUNCH AND RESUME ASSESSMENT');

    try {
      myATIPage = new MyATIPage(page);
      locators = new StudentFacingPageLocators(page);
      myATIPage.setLogger(logger);

      await page.waitForTimeout(2000);
      await page.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      await myATIPage.clickOnMyATITab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      await myATIPage.addProductAndNavigateToAssessment(
        extractedBatchId,
        process.env.muassessmentpassword || 'Test@123',
        locators,
        assertions
      );
      logger.success('Assessment relaunched');

      await page.waitForTimeout(5000);
      const assessmentIframe = page.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await page.waitForTimeout(5000);

      assessmentPage = new AssessmentPage(page);
      assessmentPage.setLogger(logger);
      logger.success('TC7 PASS: Student resumed assessment successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Student completes remaining questions and finalizes', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Complete_Remaining', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: COMPLETE REMAINING QUESTIONS AND FINALIZE');

    try {
      const REMAINING_QUESTIONS = 4 - PARTIAL_QUESTIONS_COUNT;
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, REMAINING_QUESTIONS);
      logger.success(`Remaining ${REMAINING_QUESTIONS} questions answered`);

      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC8 PASS: Assessment finalized and results loaded');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate IPP page is visible', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__IPP_Page_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assertions = new Assertions(page);
    assertions.setLogger(logger);

    logger.separator('TC9: IPP PAGE VISIBILITY');

    try {
      await page.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      assertions.assertStringContains(currentUrl, 'ViewResult');

      await assertions.waitAndAssertVisible(locators.ippHeading, 15000);
      logger.success('TC9 PASS: IPP page is visible and not broken');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Validate scoring on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__IPP_Scoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC10 PASS: Scoring matches expected percentage');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Validate IPP heading and take screenshot', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__IPP_Screenshot', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: IPP HEADING AND SCREENSHOT');

    try {
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('TC11 PASS: IPP heading verified and screenshot taken');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
