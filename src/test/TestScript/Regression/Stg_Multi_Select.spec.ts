/**
 * Regression Test - Multi-Select Assessment
 * Description: Validate that student should be able to launch and attempt assessment
 * with multi-select questions.
 * @author [Ashok Singh]
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import * as fs from 'fs';
import * as path from 'path';

const QUESTION_ANSWER_FILE = 'MultiSelect_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_Multi_Select';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';

// Load expected percentage from JSON file using SCENARIO_NAME as key
const jsonFilePath = path.join(process.cwd(), `src/test/TestData/${ASSESSMENT_TYPE}/${QUESTION_ANSWER_FILE}`);
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
const EXPECTED_PERCENTAGE = jsonData.assessments?.Stg_Multi_Select?.expectedPercentage || '100.0%';

// Batch ID from environment variable
const BATCH_ID = process.env.MultiSelectBatchId || '';

test.describe.serial('@Regression - Stg_Multi_Select', { tag: '@regression' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let assertions: Assertions;
  let atiLoginPage: LoginPage;
  let myATIPage: MyATIPage;
  let assessmentPage: AssessmentPage;
  let logger: Logger;
  let locators: StudentFacingPageLocators;

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({
      headless: process.env.CI ? true : false,
    });
    context = await browser.newContext();
    page = await context.newPage();
    assertions = new Assertions(page);
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
      await page.goto(process.env.baseUrl);
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzcabMultiSelect || '');
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcabMultiSelect || '');
      await atiLoginPage.clickLogin();
      logger.success('TC1 PASS: Login successful and Home page loaded');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Verify Home page navigation elements', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Home_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    myATIPage.setLogger(logger);

    logger.separator('TC2: HOME PAGE NAVIGATION ELEMENTS');

    try {
      await myATIPage.verifyHomePageNavigationElements(locators, assertions);
      logger.success('TC2 PASS: All Home page navigation elements verified successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Verify My ATI page functionality', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__MyATI_Page', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    myATIPage.setLogger(logger);

    logger.separator('TC3: MY ATI PAGE FUNCTIONALITY');

    try {
      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);
      logger.success('TC3 PASS: My ATI page functionality verified - all elements visible');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Add Product - Enter credentials and continue', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    myATIPage.setLogger(logger);

    logger.separator('TC4: ADD PRODUCT AND NAVIGATE TO ASSESSMENT');

    try {
      await myATIPage.addProductAndNavigateToAssessment(
        BATCH_ID,
        process.env.muassessmentpassword || '',
        locators,
        assertions
      );
      logger.success('TC4 PASS: Add Product dialog verified, credentials entered, and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Verify assessment page and question interface', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Assessment_Interface', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    myATIPage.setLogger(logger);

    logger.separator('TC5: ASSESSMENT INTERFACE VALIDATION');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('TC5 PASS: Assessment interface verified and ready');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Pause and Resume Assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Pause_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    assessmentPage.setLogger(logger);

    logger.separator('TC6: PAUSE AND RESUME FUNCTIONALITY');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC6 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Answer multi-select questions', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Answer_MultiSelect', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    assessmentPage.setLogger(logger);

    logger.separator('TC7: MULTI-SELECT QUESTION ANSWERING');

    try {
      await assessmentPage.smartAnswerAssessment(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC7 PASS: Multi-select questions answered from JSON');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Finish assessment and IPP page loaded', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: FINALIZE ASSESSMENT');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC8 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate IPP scoring and heading', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      logger.success('TC9 PASS: IPP Score validation completed successfully');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
