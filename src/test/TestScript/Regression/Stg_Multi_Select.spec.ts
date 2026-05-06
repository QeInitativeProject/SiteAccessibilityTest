
/**
 * @author Ashok Singh
 * @description Multi-Select Assessment Test Suite
 */

import { test } from '@playwright/test';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { QnAUtil } from '@utils/QnAUtil';
import * as fs from 'fs';
import * as path from 'path';

const _EXPECTED_URL_PATTERN = '/ViewResult/IPPTestResult/';
const _EXPECTED_ASSESSMENT_NAME = 'multiselectstg_test';
const QUESTION_ANSWER_FILE = 'MultiSelect_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_Multi_Select';

// Load expected percentage from JSON file using SCENARIO_NAME as key
const jsonFilePath = path.join(process.cwd(), `src/test/TestData/${ASSESSMENT_TYPE}/${QUESTION_ANSWER_FILE}`);
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
const EXPECTED_PERCENTAGE = jsonData.assessments?.Stg_Multi_Select?.expectedPercentage || '100.0%';

// Batch ID from environment variable
const BATCH_ID = process.env.MultiSelectBatchId || '';

test.describe.serial('@regression Stg_Multi_Select', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let assertions: Assertions;
  let atiLoginPage: LoginPage;
  let myATIPage: MyATIPage;
  let assessmentPage: AssessmentPage;
  let logger: Logger;
  let locators: StudentFacingPageLocators;
  let qnaUtil: QnAUtil;

  test.beforeAll(async () => {
    // Use import for Playwright
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    assertions = new Assertions(page);
    atiLoginPage = new LoginPage(page);
    myATIPage = new MyATIPage(page);
    assessmentPage = new AssessmentPage(page);
    locators = new StudentFacingPageLocators(page);
    qnaUtil = new QnAUtil(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
    
  });

  test.afterAll(async ({}, _testInfo) => {
    await browser.close();
  });

  test('TC1: ATI login and verify Home page elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC1: ATI login and verify Home page elements', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    try {
      logger?.success('\n=== TC1: ATI Login Validation ===');;
      logger?.step('1. Navigate to base URL');
      logger?.step('2. Enter student credentials');
      logger?.step('3. Verify Home page URL loaded');

      await page.goto(process.env.baseUrl);
      await atiLoginPage.fillStuUserName(process.env.stuUsernamezzcabMultiSelect || '');
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcabMultiSelect || '');
      await atiLoginPage.clickLogin();
      logger?.success('Logged into ATI with multi-select credentials');

      logger?.success('TC1 PASS: Login successful and Home page loaded');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  
  test('TC2: Verify Home page navigation elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2: Verify Home page navigation elements', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    myATIPage.setLogger(logger);
    
    try {
      logger?.success('\n=== TC2: Home Page Navigation Elements Validation ===');

      await myATIPage.verifyHomePageNavigationElements(locators, assertions);

      logger?.success('TC2 PASS: All Home page navigation elements verified successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });   

  test('TC3: Verify My ATI page functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3: Verify My ATI page functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    myATIPage.setLogger(logger);

    try {
      logger?.success('\n=== TC3: My ATI Page Functionality Validation ===');

      await myATIPage.verifyMyATIPageFunctionality(locators, assertions);

      logger?.success('TC3 PASS: My ATI page functionality verified - all elements visible');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    } 
  }); 

  test('TC4: Click on Assessments tab, verify Add Product dialog, enter credentials and continue', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4: Add Product Dialog and Credentials', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    myATIPage.setLogger(logger);
    
    try {
      logger?.success('\n=== TC4: Add Product Dialog and Credentials Validation ===');

      await myATIPage.addProductAndNavigateToAssessment(
        BATCH_ID,
        process.env.muassessmentpassword || '',
        locators,
        assertions
      );

      logger?.success(
        '\nTC4 PASS: Add Product dialog verified, credentials entered, and navigated to Assessment page.'
      );
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Verify assessment page and question interface', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5: Verify assessment page and question interface', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    
    try {
      logger?.success('\n=== TC5: Assessment Interface Validation ===');;
      logger?.step('1. Verify assessment page is loaded');
      logger?.step('2. Check question frame is visible');
      logger?.step('3. Verify assessment interface elements');

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger?.success('Assessment page loaded successfully');

      logger?.success('TC5 PASS: Assessment interface verified and ready');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  }); 


  test('TC6: Pause and Resume MultiItemAssessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC6: Pause and Resume MultiItemAssessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    
    try {
      logger?.success('\n=== TC6: Pause and Resume Functionality Validation ===');;
      logger?.step('1. Pause the assessment');
      logger?.step('2. Verify pause state');
      logger?.step('3. Resume the assessment');

      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger?.success('TC6 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });



  test('TC7: Validate multi-select question functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7: Validate multi-select question functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    qnaUtil.setLogger(logger);
    
    try {
      logger?.success('\n=== TC7: Multi-Select Question Functionality Validation ===');;
      logger?.step('1. Load answers from JSON file');
      logger?.step('2. Select multiple checkbox options');
      logger?.step('3. Click Continue to submit');

      await qnaUtil.answerMultiSelectAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE, SCENARIO_NAME);
      
      logger?.success('TC7 PASS: Multi-select question answered from JSON');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });



  test('TC8: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(page, 'TC8: Finish assessment and IPP page loaded', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    
    try {
      logger?.success('\n=== TC8: Finalize Assessment Validation ===');;
      logger?.step('1. Click Finish button');
      logger?.step('2. Navigate to IPP page');
      logger?.step('3. Verify IPP page URL');

      await assessmentPage.finalizeAssessmentAndViewResults();
      logger?.success('TC8 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: IPP page shows multi-select score', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9: IPP page shows multi-select score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);
    
    try {
      logger?.success('\n=== TC9: IPP Score Validation ===');

      await assessmentPage.verifyIPPScoreWithLocator(
        locators,
        EXPECTED_PERCENTAGE,
        SCENARIO_NAME,
        BATCH_ID,
        assertions
      );
      
      logger?.success('TC9 PASS: IPP Score validation completed successfully');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
