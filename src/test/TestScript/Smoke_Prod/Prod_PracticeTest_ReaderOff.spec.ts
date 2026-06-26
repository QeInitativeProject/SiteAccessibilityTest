/**
 * Sanity Test - Practice Test (Reader Off)
 * Description: Student login and complete practice assessment with Reader Off.
 * Covers: Login, home page validation, My ATI navigation, add product,
 * flag/unflag flow, blue banner, calculator, pause/resume, answer questions, IPP validation.
 * @author Shyan Wasi
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const EXPECTED_PERCENTAGE = '100.0%';
const BATCH_ID = process.env.practiceTest_ReaderOffBatchId || '41166013';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store Prod';
const SCENARIO_NAME = 'Prod_PracticeTest_ReaderOff';

test.describe.serial('@smoke Prod_PracticeTest_ReaderOff', { tag: '@smoke' }, () => {
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

  // ============================================================
  // LOGIN & HOME PAGE VALIDATION
  // ============================================================

  test('TC1: ATI login and verify Home page elements', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__ATI_Login_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: ATI LOGIN VALIDATION');

    try {
      await page.goto(process.env.baseUrl);
      await atiLoginPage.fillStuUserName(process.env.studentUsernamezzcab2 || '');
      await atiLoginPage.fillStuPassword(process.env.studentPasswordzzcab3 || '');
      await atiLoginPage.clickLogin();
      logger.success('TC1 PASS: Logged into ATI successfully');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Verify Home page navigation elements', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Home_Page_Navigation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    assertions.setLogger(logger);

    logger.separator('TC2: HOME PAGE NAVIGATION ELEMENTS');

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
        await assertions.assertVisible(element.locator);
        logger.success(`${element.name} is visible`);
      }

      logger.success('TC2 PASS: All navigation elements verified');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Verify My ATI page functionality', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__My_ATI_Page', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    myATIPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC3: MY ATI PAGE FUNCTIONALITY');

    try {
      await myATIPage.clickOnMyATITab();
      logger.success('Clicked on My ATI tab');

      await assertions.assertPageHasURL(/\/Products/);
      logger.success('Products page URL loaded');

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

      logger.success('TC3 PASS: My ATI page functionality verified');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ADD PRODUCT & ASSESSMENT SETUP
  // ============================================================

  test('TC4: Click on Assessments tab, verify Add Product dialog, enter credentials and continue', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    myATIPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC4: ADD PRODUCT DIALOG AND CREDENTIALS');

    try {
      await myATIPage.clickOnAssessmentsTab();
      logger.success('Clicked on Assessments tab');

      await assertions.assertRoleVisible('heading', 'Add a product to your account');
      logger.success('Add Product dialog is visible');

      await assertions.assertVisible(locators.cancelButton);
      await assertions.assertVisible(locators.continueButton);
      await assertions.assertVisible(locators.idTextbox);
      logger.success('Dialog elements verified');

      await locators.idTextbox.fill(BATCH_ID.trim());
      logger.success(`Batch ID entered: ${BATCH_ID.trim()}`);

      await locators.continueButton.click();
      logger.success('Continue clicked after ID entry');

      await assertions.assertVisible(locators.passwordTextboxDialog);
      await locators.passwordTextboxDialog.fill(process.env.muassessmentpassword || '');
      logger.success('Password entered');

      await locators.continueButton.click();
      logger.success('Continue clicked after password entry');

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('TC4 PASS: Navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ASSESSMENT FLOW
  // ============================================================

  test('TC5: Flag, Continue, Previous, Unflag robust flow', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    assessmentPage.setLogger(logger);

    logger.separator('TC5: FLAG/UNFLAG FLOW');

    try {
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC5 PASS: Full Flag-Continue-Previous-Unflag flow succeeded');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Verify blue banner is visible with correct background color', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Blue_Banner', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    assessmentPage.setLogger(logger);

    logger.separator('TC6: BLUE BANNER VALIDATION');

    try {
      await assessmentPage.verifyBlueBannerVisibility('#d7eef4');
      logger.success('TC6 PASS: Blue banner is visible');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Calculator functionality', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Calculator', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    assessmentPage.setLogger(logger);

    logger.separator('TC7: CALCULATOR FUNCTIONALITY');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC7 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Pause and Resume assessment', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Pause_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: PAUSE AND RESUME');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC8 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ANSWER & FINALIZE
  // ============================================================

  test('TC9: Answer assessment', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: ANSWER ASSESSMENT');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC9 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Finish assessment and IPP page loaded', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: FINALIZE ASSESSMENT');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC10 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: IPP page shows 100% score', { tag: '@smoke' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__IPP_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: IPP SCORE VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC11 PASS: IPP page shows 100% score on UI');

      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot(SCENARIO_NAME, BATCH_ID);
      logger.success('Practice Test (Reader Off) Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
