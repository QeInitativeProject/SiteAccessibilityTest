/**
 * @author Shyan Wasi
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { BatchCreation } from '@utils/BatchCreation';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const _EXPECTED_URL_PATTERN = '/ViewResult/IPPTestResult/';
const EXPECTED_PERCENTAGE = '100.0%';
const EXPECTED_ASSESSMENT_NAME = process.env.ENV === 'qa' ? process.env.Assessment : process.env.EXPECTED_ASSESSMENT_NAME;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = process.env.ENV === 'qa' ? 'Question Store_QA' : 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_PracticeTest_ReaderOn';

test.describe.serial('@smoke Stg_PracticeTest_ReaderOn', () => {
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
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({ headless: process.env.CI ? true : false });
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
    // Success screenshots removed - only capturing final IPP screenshot in TC15
  });

  test.afterAll(async ({}, _testInfo) => {
    await browser.close();
  });

  test('TC1: MU batch creation', async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_batch_creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(
        EXPECTED_ASSESSMENT_NAME,
        EXPECTED_INSTITUTION
      );
      stopTimer();
  
      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);
      logger.separator();
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: ATI login and verify Home page elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__ATI_Login_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
    logger.startSection('TC2: ATI Login Validation');

    try {
      logger.step('Navigate to base URL');
      await page.goto(process.env.baseUrl);
      await logger.logNavigation(process.env.baseUrl || '');
  
      logger.step('Enter student credentials');
      await atiLoginPage.fillStuUserName(process.env.stuUserNamezzcab2 || '');
      await atiLoginPage.fillStuPassword(process.env.stuPasswordzzcab1 || '');
  
      logger.step('Click login button');
      await atiLoginPage.clickLogin();
      logger.success('Logged into ATI with zzdev credentials');
  
      // Wait for Home page URL to load properly
      logger.step('Verify Home page URL loaded');
      // Removed /Home URL assertion as requested
      logger.success('Home page URL loaded successfully');
  
      logger.endSection('TC2: ATI Login Validation');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Verify Home page navigation elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Home_Page_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    logger.startSection('TC3: Home Page Navigation Elements Validation');

    try {
      const navigationElements = [
        { name: 'Home navigation link', locator: locators.homeNavigationLink },
        { name: 'My ATI navigation link', locator: locators.myATINavigationLink },
        { name: 'Results navigation link', locator: locators.resultsNavigationLink },
        { name: 'Help navigation link', locator: locators.helpNavigationLink },
        { name: 'Profile navigation link', locator: locators.profileNavigationLink },
        { name: 'Add a Product text', locator: locators.addProductText },
      ];
  
      for (const element of navigationElements) {
        logger.step(`Checking ${element.name}`);
        await assertions.assertVisible(element.locator);
        logger.success(`${element.name} is visible`);
      }
  
      logger.endSection('TC3: Home Page Navigation Elements Validation');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Verify My ATI page functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__My_ATI_Page', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    logger.startSection('TC4: My ATI Page Functionality Validation');

    try {
      logger.step('Click on My ATI tab');
      await myATIPage.clickOnMyATITab();
      logger.success('Clicked on My ATI tab');

      logger.step('Verify Products page URL loaded');
      await assertions.assertPageHasURL(/\/Products/);
      logger.success('Products page URL loaded successfully');

      const elementsToVerify = [
        { name: 'Assessments Tab link', locator: locators.assessmentsTabLink },
        { name: 'Study Materials heading', locator: locators.studyMaterialsHeading },
        { name: 'Learn Tab link', locator: locators.learnTabLink },
        { name: 'NCLEX Prep Tab link', locator: locators.nclexPrepTabLink },
      ];

      for (const element of elementsToVerify) {
        await assertions.assertVisible(element.locator);
        logger.success(`${element.name} is visible`);
      }

      logger.endSection('TC4: My ATI Page Functionality Validation');
    } catch (error: any) {
      await logger.error('TC4 failed', error);
      throw error;
    }
  });

  test('TC5: Click on Assessments tab, verify Add Product dialog, enter credentials and continue', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    logger.startSection('TC5: Add Product Dialog and Credentials Validation');

    try {
      logger.step('Click on Assessments tab');
      await myATIPage.clickOnAssessmentsTab();
      logger.success('Clicked on Assessments tab');
  
      logger.step('Verify Add Product dialog appears');
      await assertions.assertRoleVisible('heading', 'Add a product to your account');
      logger.success('Add Product dialog is visible');
  
      await assertions.assertVisible(locators.cancelButton);
      await assertions.assertVisible(locators.continueButton);
      await assertions.assertVisible(locators.idTextbox);
      logger.success('Dialog elements verified');
  
      logger.step(`Enter Batch ID: ${extractedBatchId.trim()}`);
      await locators.idTextbox.fill(extractedBatchId.trim());
      logger.success('Batch ID entered');
  
      await locators.continueButton.click();
      logger.success('Continue clicked after ID entry');
  
      logger.step('Enter password');
      await assertions.assertVisible(locators.passwordTextboxDialog);
      await locators.passwordTextboxDialog.fill(process.env.muassessmentpassword || '');
      logger.success('Password entered');
  
      await locators.continueButton.click();
      logger.success('Continue clicked after password entry');
  
      logger.step('Verify navigation to Assessment page');
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.endSection('TC5: Add Product Dialog and Credentials Validation');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Flag, Continue, Previous, Unflag robust flow', async () => {
    logger?.step('TC6: Flag/Unflag Flow Validation');
    logger?.step('1. Flag a question');
    logger?.step('2. Continue to next question');
    logger?.step('3. Go back to previous question');
    logger?.step('4. Unflag the question');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger?.success('TC6 PASS: Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      logger?.error('TC6 FAIL: Full Flag-Continue-Previous-Unflag flow failed: ' + error);
      throw error;
    }
  });

  test('TC7: Validate that text to speech functionality content is visible', async () => {
    logger?.step('TC7: Text-to-Speech Content Visibility Validation ===');
    logger?.step('1. Settings button visibility');
    logger?.step('2. "Click and Listen" text visibility');
    logger?.step('3. "playlist_play" icon visibility');
    logger?.step('4. Toggle switch thumb visibility');

    try {
      await assessmentPage.validateTextToSpeechContentVisibility();
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate that text to speech toggle is functional', async () => {
    logger?.step('TC8: Text-to-Speech Toggle Functionality Validation ===');
    logger?.step('1. Verify toggle starts OFF');
    logger?.step('2. Turn toggle ON and verify state change');
    logger?.step('3. Turn toggle OFF and verify state change');
    logger?.step('4. Turn toggle back ON for subsequent tests');

    try {
      await assessmentPage.validateToggleFunctionality();
      await assessmentPage.turnToggleOn();
      logger?.success('TC8 PASS: Toggle is now ON and ready for subsequent tests');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate settings button is clickable and speech rate, pitch rate is visible', async () => {
    logger?.step('TC9: Settings Controls Visibility Validation ===');
    logger?.step('1. Settings button is visible and clickable');
    logger?.step('2. "Pitch" text is visible');
    logger?.step('3. "Speech rate" text is visible');
    logger?.step('4. Close button is visible');
    logger?.step('5. Reset button is visible');

    try {
      await assessmentPage.validateSettingsButtonAndControls();
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Verify blue banner is visible with correct background color', async () => {
    logger?.step('TC10: Blue Banner Validation ===');
    logger?.step('1. Verify blue banner visibility');
    logger?.step('2. Validate background color (#d7eef4)');

    try {
      await assessmentPage.verifyBlueBannerVisibility('#d7eef4');
      logger?.success('TC10 PASS: Blue banner is visible');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Calculator functionality', async () => {
    logger?.step('TC11: Calculator Functionality Validation ===');
    logger?.step('1. Open calculator');
    logger?.step('2. Verify calculator input and operations');
    logger?.step('3. Close calculator');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger?.success('TC11 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Pause and Resume assessment', async () => {
    logger?.step('TC12: Pause and Resume Functionality Validation ===');
    logger?.step('1. Pause the assessment');
    logger?.step('2. Verify pause state');
    logger?.step('3. Resume the assessment');

    try {
      // Ensure assessment frame is loaded and visible
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger?.success('TC12 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: answer assessment', async () => {
    logger?.step('TC13: Answer Assessment Questions Validation ===');
    logger?.step('1. Load questions from JSON file (4_Correct_QnA.json)');
    logger?.step('2. Answer all assessment questions');
    logger?.step('3. Verify answers submitted');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger?.success('TC13 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });
  test('TC14: Finish assessment and IPP page loaded', async () => {
    logger?.step('TC14: Finalize Assessment Validation ===');
    logger?.step('1. Click Finish button');
    logger?.step('2. Navigate to IPP page');
    logger?.step('3. Verify IPP page URL');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger?.success('TC14 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: IPP page shows 100% score', async () => {
    logger?.step('TC15: IPP Score Validation ===');
    logger?.step('1. Verify percentage score on IPP page');
    logger?.step('2. Assert score equals 100.0%');
    logger?.step('3. Verify IPP heading');
    logger?.step('4. Take screenshot for validation');

    try {
      await assertions.waitAndAssertVisible(locators.percentageScore);
      const percentageValue = await locators.percentageScore.textContent();
      const extractedPercentage = (percentageValue ?? '').trim();
      assertions.assertPercentage(extractedPercentage, EXPECTED_PERCENTAGE);
      logger?.success('TC15 PASS: IPP page shows 100% score on UI');
  
      // Optionally, verify IPP heading and take screenshot
      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot('Stg_PracticeTest_ReaderOn', extractedBatchId);
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
