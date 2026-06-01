/**
 * Regression Test - Multi-Select Dropdown Assessment
 * Description: Validate that student should be able to launch and attempt assessment
 * with multi-select dropdown questions (mat-select, cloze dropdown, flagging).
 * @author [Ashok Singh]
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { QnAUtil } from '@utils/QnAUtil';

const QUESTION_ANSWER_FILE = 'MultiSelectDropdown_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_Multi_SelectDropdown';
const EXPECTED_PERCENTAGE = '62.5%';
const BATCH_ID = process.env.MultiSelectDropdownBatchId || '';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';
const EXPECTED_ASSESSMENT_NAME = process.env.MultiSelectDragAndDropAssessment!;

test.describe.serial('@Regression - Stg_Multi_SelectDropdown', { tag: '@regression' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let atiLoginPage: LoginPage;
  let myATIPage: MyATIPage;
  let assessmentPage: AssessmentPage;
  let assertions: Assertions;
  let logger: Logger;
  let locators: StudentFacingPageLocators;
  let qnaUtil: QnAUtil;

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
    qnaUtil = new QnAUtil(page);

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
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzcabMultiSelect!);
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcabMultiSelect!);
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
      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);
      await myATIPage.addProductAndNavigateToAssessment(
        BATCH_ID,
        process.env.muassessmentpassword,
        locators,
        assertions
      );
      logger.success('TC2 PASS: Product added and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Answer first Dropdown question', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__First_Dropdown', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    qnaUtil.setLogger(logger);

    logger.separator('TC3: FIRST DROPDOWN QUESTION');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await qnaUtil.answerMultiSelectDropdownQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, SCENARIO_NAME);
      logger.success('TC3 PASS: First Dropdown question processed');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Navigate to previous question and return', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Previous_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    assessmentPage.setLogger(logger);

    logger.separator('TC4: PREVIOUS BUTTON NAVIGATION');

    try {
      await assessmentPage.navigateToPreviousQuestionAndReturn();
      logger.success('TC4 PASS: Previous button navigation validated');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Answer second Dropdown question', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Second_Dropdown', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    qnaUtil.setLogger(logger);

    logger.separator('TC5: SECOND DROPDOWN QUESTION');

    try {
      await qnaUtil.answerMultiSelectDropdownQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, SCENARIO_NAME);
      logger.success('TC5 PASS: Second Dropdown question processed');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Answer third Dropdown question', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Third_Dropdown', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    qnaUtil.setLogger(logger);

    logger.separator('TC6: THIRD DROPDOWN QUESTION');

    try {
      await qnaUtil.answerMultiSelectDropdownQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, SCENARIO_NAME);
      logger.success('TC6 PASS: Third Dropdown question processed');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Check flagged notification and finalize assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    assessmentPage.setLogger(logger);

    logger.separator('TC7: FLAGGED NOTIFICATION AND FINALIZE');

    try {
      await assessmentPage.checkFlaggedNotificationAndFinalize();
      logger.success('TC7 PASS: Flagged notification verified and assessment finalized');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate scoring on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__IPP_Scoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC8 PASS: IPP score validated');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate IPP heading and take screenshot', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__IPP_Screenshot', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: IPP HEADING AND SCREENSHOT');

    try {
      await assessmentPage.validateAssessmentName(EXPECTED_ASSESSMENT_NAME);
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, BATCH_ID);
      logger.success('TC9 PASS: IPP heading verified and screenshot taken');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
