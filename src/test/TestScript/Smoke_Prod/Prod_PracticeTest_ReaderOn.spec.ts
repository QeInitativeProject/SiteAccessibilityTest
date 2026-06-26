/**
 * @author Shyan Wasi
 */

import { test } from '@playwright/test';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const EXPECTED_PERCENTAGE = '100.0%';
const EXPECTED_ASSESSMENT_NAME = process.env.Practice_Assessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const BATCH_ID = process.env.practiceTest_ReaderOnBatchId;
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store Prod';
const SCENARIO_NAME = 'Prod_PracticeTest_ReaderOn';

test.describe.serial('@smoke Prod_PracticeTest_ReaderOn', () => {
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
    browser = await chromium.launch();
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
    await browser.close();
  });

  test('TC1: ATI login and verify Home page elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__ATI_Login_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
    logger.startSection('TC1: ATI Login Validation');

    try {
      logger.step('Navigate to base URL');
      await page.goto(process.env.baseUrl);
      await logger.logNavigation(process.env.baseUrl || '');

      logger.step('Enter student credentials');
      await atiLoginPage.fillStuUserName(process.env.studentUsernamezzcab3 || '');
      await atiLoginPage.fillStuPassword(process.env.studentPasswordzzcab3 || '');

      logger.step('Click login button');
      await atiLoginPage.clickLogin();
      logger.success('Logged into ATI with zzdev credentials');

      logger.step('Verify Home page URL loaded');
      logger.success('Home page URL loaded successfully');

      logger.endSection('TC1: ATI Login Validation');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Verify Home page navigation elements', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Home_Page_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    logger.startSection('TC2: Home Page Navigation Elements Validation');

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

      logger.endSection('TC2: Home Page Navigation Elements Validation');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Verify My ATI page functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__My_ATI_Page', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    logger.startSection('TC3: My ATI Page Functionality Validation');

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

      logger.endSection('TC3: My ATI Page Functionality Validation');
    } catch (error: any) {
      await logger.error('TC3 failed', error);
      throw error;
    }
  });

  test('TC4: Click on Assessments tab, verify Add Product dialog, enter credentials and continue', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    logger.startSection('TC4: Add Product Dialog and Credentials Validation');

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

      logger.step(`Enter Batch ID: ${BATCH_ID}`);
      await locators.idTextbox.fill((BATCH_ID || '').trim());
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
      logger.endSection('TC4: Add Product Dialog and Credentials Validation');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Flag, Continue, Previous, Unflag robust flow', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    logger.step('TC5: Flag/Unflag Flow Validation');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC5 PASS: Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Validate that text to speech functionality content is visible', async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__TTS_Content_Visibility', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    logger.step('TC6: Text-to-Speech Content Visibility Validation');

    try {
      await assessmentPage.validateTextToSpeechContentVisibility();
      logger.success('TC6 PASS: Text-to-speech content is visible');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Validate that text to speech toggle is functional', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__TTS_Toggle', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    logger.step('TC7: Text-to-Speech Toggle Functionality Validation');

    try {
      await assessmentPage.validateToggleFunctionality();
      await assessmentPage.turnToggleOn();
      logger.success('TC7 PASS: Toggle is now ON and ready for subsequent tests');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate settings button is clickable and speech rate, pitch rate is visible', async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Settings_Controls', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    logger.step('TC8: Settings Controls Visibility Validation');

    try {
      await assessmentPage.validateSettingsButtonAndControls();
      logger.success('TC8 PASS: Settings controls verified');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Verify blue banner is visible with correct background color', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Blue_Banner', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    logger.step('TC9: Blue Banner Validation');

    try {
      await assessmentPage.verifyBlueBannerVisibility('#d7eef4');
      logger.success('TC9 PASS: Blue banner is visible');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Calculator', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    logger.step('TC10: Calculator Functionality Validation');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC10 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__Pause_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    logger.step('TC11: Pause and Resume Functionality Validation');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC11 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC12__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    logger.step('TC12: Answer Assessment Questions');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC12 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(page, 'TC13__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    logger.step('TC13: Finalize Assessment');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC13 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: IPP page shows 100% score', async ({}, testInfo) => {
    logger = new Logger(page, 'TC14__IPP_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    logger.step('TC14: IPP Score Validation');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC14 PASS: IPP page shows 100% score on UI');

      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot('Prod_PracticeTest_ReaderOn', BATCH_ID);
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
