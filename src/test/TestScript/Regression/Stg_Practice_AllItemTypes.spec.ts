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

const QUESTION_ANSWER_FILE = 'AllItemTypes_QnA.json';
const ASSESSMENT_TYPE = process.env.ASSESSMENT_TYPE;
const EXPECTED_PERCENTAGE = '100.0%';
const BATCH_ID = process.env.AllItemsBatchId!;
const EXPECTED_ASSESSMENT_NAME = process.env.AllItemsAssessment!;
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

  test('TC1: Student login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: STUDENT LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzcabAllItems!);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcabAllItems!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('TC1 PASS: Student logged in successfully');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Add Product - Enter Batch ID and Password', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    myATIPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: ADD PRODUCT WITH BATCH ID');

    try {
      await page.waitForLoadState('domcontentloaded');
      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);
      await myATIPage.addProductAndNavigateToAssessment(
        BATCH_ID,
        process.env.muassessmentpassword || 'Test@123',
        locators,
        assertions
      );
      logger.success('TC2 PASS: Product added with Batch ID and password');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Answer all questions with all item types (shuffled)', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Answer_All_Item_Types', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    assessmentPage.setLogger(logger);

    logger.separator('TC3: ANSWER ALL ITEM TYPES (SMART AUTO-DETECT)');

    try {
      await assessmentPage.smartAnswerAssessment(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC3 PASS: All questions answered and assessment finalized');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Validate IPP page is visible and not broken', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__IPP_Page_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    assertions.setLogger(logger);

    logger.separator('TC4: IPP PAGE VISIBILITY');

    try {
      await page.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      assertions.assertStringContains(currentUrl, 'ViewResult');

      await assertions.waitAndAssertVisible(locators.ippHeading, 15000);
      logger.success('TC4 PASS: IPP page is visible and not broken');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Validate scoring on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__IPP_Scoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    assessmentPage.setLogger(logger);

    logger.separator('TC5: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC5 PASS: Scoring matches expected percentage');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Validate assessment name on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__IPP_Assessment_Name', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    assessmentPage.setLogger(logger);

    logger.separator('TC6: IPP ASSESSMENT NAME VALIDATION');

    try {
      await assessmentPage.validateAssessmentName(EXPECTED_ASSESSMENT_NAME);
      logger.success('TC6 PASS: Assessment name correctly reflects on IPP Page');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Validate IPP heading and take screenshot', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__IPP_Screenshot', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    assessmentPage.setLogger(logger);

    logger.separator('TC7: IPP HEADING AND SCREENSHOT');

    try {
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, BATCH_ID);
      logger.success('TC7 PASS: IPP heading verified and screenshot taken');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
