/**
 * Sanity Test - Proctor Flow (Reader On)
 * Description: Faculty login and proctor student assessment with Reader On (TTS enabled).
 * Covers: MU batch creation, faculty proctoring setup, student login, attestation,
 * flag/unflag flow, TTS toggle, settings validation, calculator, pause/resume,
 * answer questions, IPP validation.
 * @author [Ashish Ranjan]
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { FACHomePage } from '@delegates/FACHomePage';
import { MyATIPage } from '@delegates/MyATIPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';

const PROCTORED_ASSESSMENT_NAME = process.env.Proctored_Assessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Prod_Proctor_ReaderOn';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store Prod';
const EXPECTED_PERCENTAGE = '100.0%';

test.describe.serial('@Sanity - Prod_Proctor_ReaderOn', { tag: '@sanity' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let studentTab: Page;

  let atiLoginPage: LoginPage;
  let facHomePage: FACHomePage;
  let myATIPage: MyATIPage;
  let proctorUtil: ProctorUtility;
  let assertions: Assertions;
  let logger: Logger;
  let assessmentPage: AssessmentPage;
  let locators: StudentFacingPageLocators;
  let batchCreation: BatchCreation;
  let extractedBatchId: string;

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();

    atiLoginPage = new LoginPage(page);
    facHomePage = new FACHomePage(page);
    proctorUtil = new ProctorUtility(page);
    assertions = new Assertions(page);
    batchCreation = new BatchCreation(browser);

    page.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
  });

  test.afterAll(async () => {
    try {
      if (studentTab && !studentTab.isClosed()) await studentTab.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  // ============================================================
  // BATCH CREATION & FACULTY SETUP
  // ============================================================

  test('TC1: MU batch creation', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_batch_creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(PROCTORED_ASSESSMENT_NAME!, EXPECTED_INSTITUTION!);
      stopTimer();

      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);
      logger.success('TC1 PASS: MU Batch created successfully');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Faculty login to ATI', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Faculty_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: FACULTY LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab2!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab2!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('TC2 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Navigate to Proctor Tab', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Navigate_Proctor_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);

    logger.separator('TC3: NAVIGATE TO PROCTOR TAB');

    try {
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(10000);
      logger.success('TC3 PASS: Navigated to Proctor Tab');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Enter Assessment ID and Setup Proctoring', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    proctorUtil.setLogger(logger);

    logger.separator('TC4: SETUP PROCTORING');

    try {
      await page.waitForTimeout(20000);
      await proctorUtil.fillAssessmentID(extractedBatchId);
      await page.waitForLoadState('load');

      await proctorUtil.completeProctorAgreementPage();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);

      await proctorUtil.checkInStudents();
      await page.waitForLoadState('load');
      logger.success('TC4 PASS: Assessment ID entered and proctoring setup complete');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT FLOW
  // ============================================================

  test('TC5: Start Proctoring Session and Student Login', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Start_Proctoring_Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    proctorUtil.setLogger(logger);

    logger.separator('TC5: START PROCTORING AND STUDENT LOGIN');

    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');

      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const studentLoginPage = new LoginPage(studentTab);
      studentLoginPage.setLogger(logger);
      await studentLoginPage.fillStuUserName(process.env.studentUsernamezzcab3!);
      await studentLoginPage.fillStuPassword(process.env.studentPasswordzzcab3!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      logger.success('TC5 PASS: Proctoring started and student logged in');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Student adds Product and fills Attestation', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC6__Student_AddProduct', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    myATIPage = new MyATIPage(studentTab);
    assessmentPage = new AssessmentPage(studentTab);
    locators = new StudentFacingPageLocators(studentTab);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);

    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    logger.separator('TC6: STUDENT ADD PRODUCT AND ATTESTATION');

    try {
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(20000);

      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      logger.success('Clicked on My ATI tab');

      await studentTab.waitForTimeout(10000);

      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);
      logger.success('Add Product dialog opened');

      await studentAssertions.waitAndAssertVisible(locators.idTextbox, 15000);
      await locators.idTextbox.fill(extractedBatchId.trim());
      logger.success(`Batch ID entered: ${extractedBatchId.trim()}`);

      await studentAssertions.waitAndAssertVisible(locators.continueButton, 10000);
      await locators.continueButton.click();
      await studentTab.waitForTimeout(2000);
      logger.success('Continue clicked after ID entry');

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success('TC6 PASS: Product added and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Faculty approves Student and Student launches assessment', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);

    logger.separator('TC7: FACULTY APPROVES AND STUDENT STARTS TEST');

    try {
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');
      logger.success('Faculty approved student');

      await studentTab.bringToFront();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(3000);

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.startTest();
      await studentTab.waitForLoadState('load');

      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(5000);
      logger.success('TC7 PASS: Faculty approved, student launched assessment');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ASSESSMENT FLOW
  // ============================================================

  test('TC8: Flag, Continue, Previous, Unflag robust flow', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: FLAG/UNFLAG FLOW');

    try {
      await studentTab.waitForLoadState('load');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC8 PASS: Full Flag-Continue-Previous-Unflag flow succeeded');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // TEXT-TO-SPEECH VALIDATION
  // ============================================================

  test('TC9: Validate that text to speech functionality content is visible', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC9__TTS_Content_Visibility', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: TTS CONTENT VISIBILITY');

    try {
      await assessmentPage.validateTextToSpeechContentVisibility();
      logger.success('TC9 PASS: Text-to-speech content is visible');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Validate that text to speech toggle is functional', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__TTS_Toggle', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: TTS TOGGLE FUNCTIONALITY');

    try {
      await assessmentPage.validateToggleFunctionality();
      await assessmentPage.turnToggleOn();
      logger.success('TC10 PASS: Toggle is now ON and ready for subsequent tests');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Validate settings button is clickable and speech rate, pitch rate is visible', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Settings_Controls', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: SETTINGS CONTROLS VISIBILITY');

    try {
      await assessmentPage.validateSettingsButtonAndControls();
      logger.success('TC11 PASS: Settings controls verified');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ASSESSMENT COMPLETION
  // ============================================================

  test('TC12: Calculator functionality', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Calculator', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: CALCULATOR FUNCTIONALITY');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC12 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Pause and Resume assessment', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__Pause_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);

    logger.separator('TC13: PAUSE AND RESUME');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC13 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Answer assessment', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    assessmentPage.setLogger(logger);

    logger.separator('TC14: ANSWER ASSESSMENT');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC14 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Finish assessment and IPP page loaded', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC15__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });
    assessmentPage.setLogger(logger);

    logger.separator('TC15: FINALIZE ASSESSMENT');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC15 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC16: IPP page shows 100% score', { tag: '@sanity' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC16__IPP_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC16' });
    assessmentPage.setLogger(logger);

    logger.separator('TC16: IPP SCORE VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC16 PASS: IPP page shows 100% score on UI');

      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('Proctor Flow Sanity Test (Reader On) Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC16 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
 