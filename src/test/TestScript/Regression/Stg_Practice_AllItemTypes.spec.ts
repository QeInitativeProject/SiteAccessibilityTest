/**
 * Regression Test - Practice Assessment with All Item Types
 * Description: Validate that student should be able to launch and attempt practice assessment
 * with all item types (Multiple Choice, Multi-Select, Drag & Drop / Ordered Response,
 * Fill in the Blank, Drop-Down / Cloze, Bow-Tie, Matrix / Grid, Highlight / Text Select).
 * Note: Questions in this assessment are shuffled - uses smartAnswerAssessment for auto-detection.
 * @author [Ashok Singh]
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';

const QUESTION_ANSWER_FILE = 'AllItemTypes_QnA.json';
const ASSESSMENT_TYPE = process.env.ASSESSMENT_TYPE;
const EXPECTED_PERCENTAGE = '100.0%';
const EXPECTED_ASSESSMENT_NAME = process.env.AllItemsAssessment!;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab!;
const SCENARIO_NAME = 'Stg_Practice_AllItemTypes';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';

test.describe.serial('@Regression - Stg_Practice_AllItemTypes', { tag: '@regression' }, () => {
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
    locators = new StudentFacingPageLocators(page);
    batchCreation = new BatchCreation(browser);

    // Automatically dismiss all dialogs
    page.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Handle console errors
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
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  // ============================================================
  // BATCH CREATION
  // ============================================================

  test('TC1: MU Batch Creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(EXPECTED_ASSESSMENT_NAME, EXPECTED_INSTITUTION);
      stopTimer();

      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`TC1 PASS: Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT LOGIN & ADD PRODUCT
  // ============================================================

  test('TC2: Student login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: STUDENT LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzcabAllItems!);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcabAllItems!);
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

  // ============================================================
  // ANSWER ASSESSMENT
  // ============================================================

  test('TC4: Answer all questions with all item types (shuffled)', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Answer_All_Item_Types', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    assessmentPage.setLogger(logger);

    logger.separator('TC4: ANSWER ALL ITEM TYPES (SMART AUTO-DETECT)');

    try {
      await assessmentPage.smartAnswerAssessment(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC4 PASS: All questions answered and assessment finalized');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // IPP PAGE VALIDATIONS
  // ============================================================

  test('TC5: Validate IPP page is visible and not broken', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__IPP_Page_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    assertions.setLogger(logger);

    logger.separator('TC5: IPP PAGE VISIBILITY');

    try {
      await page.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      assertions.assertStringContains(currentUrl, 'ViewResult');

      await assertions.waitAndAssertVisible(locators.ippHeading, 15000);
      logger.success('TC5 PASS: IPP page is visible and not broken');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Validate scoring on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__IPP_Scoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    assessmentPage.setLogger(logger);

    logger.separator('TC6: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC6 PASS: Scoring matches expected percentage');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Validate assessment name on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__IPP_Assessment_Name', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    assessmentPage.setLogger(logger);

    logger.separator('TC7: IPP ASSESSMENT NAME VALIDATION');

    try {
      await assessmentPage.validateAssessmentName(EXPECTED_ASSESSMENT_NAME);
      logger.success('TC7 PASS: Assessment name correctly reflects on IPP Page');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate IPP heading and take screenshot', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__IPP_Screenshot', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: IPP HEADING AND SCREENSHOT');

    try {
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('TC8 PASS: IPP heading verified and screenshot taken');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
