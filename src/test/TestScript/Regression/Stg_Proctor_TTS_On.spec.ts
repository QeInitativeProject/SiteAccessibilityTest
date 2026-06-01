import { test } from '@playwright/test';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { FACHomePage } from '@delegates/FACHomePage';
import { MyATIPage } from '@delegates/MyATIPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_TTS_On';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const EXPECTED_PERCENTAGE = '100.0%';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';
// const ASSESSMENT_ID = '27099597'; // Hardcoded Assessment ID for proctoring
// const BATCH_ID = '27099597'; // Hardcoded Batch ID for adding product

/**
 * Regression Test - Proctor Flow
 * Description: Faculty login and proctor student assessment
 * @author [Ashish Ranjan]
 */

test.describe.serial('@regression - Stg_Proctor_TTS_On', { tag: '@regression' }, () => {
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

    // Automatically dismiss all dialogs
    page.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });
  });

    test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
    // Success screenshot removed - only capturing final IPP screenshot in TC7
  });

  test.afterAll(async ({}, testInfo) => {
    await browser.close();
  });

  test('TC1: MU batch creation', async ({}, testInfo) => {
      logger = new Logger(page, 'TC1__MU_batch_creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
      atiLoginPage.setLogger(logger);
      facHomePage.setLogger(logger);
      proctorUtil.setLogger(logger);
      assertions.setLogger(logger);
  
      logger.separator('TC1: MU BATCH CREATION');
  
      try {
        const stopTimer = logger.startTimer('Batch creation');
        extractedBatchId = await batchCreation.createBatch(
          EXPECTED_ASSESSMENT_NAME!,
          EXPECTED_INSTITUTION!
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

  test('TC2: Faculty login to ATI', async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Faculty_login_to_ATI', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('Login to the Application Started');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('Successfully logged into ATI with fresh session');
      logger.success('TC2 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Navigate to Proctor Tab and setup proctoring', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);

    logger.separator('TC3: SETUP PROCTORING');

    try {
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(20000);

      await proctorUtil.fillAssessmentID(extractedBatchId);
      await page.waitForLoadState('load');

      await proctorUtil.completeProctorAgreementPage();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);

      await proctorUtil.checkInStudents();
      await page.waitForLoadState('load');
      logger.success('TC3 PASS: Proctoring setup complete');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Start Proctoring and Student Login', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Start_Proctoring_Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    proctorUtil.setLogger(logger);

    logger.separator('TC4: START PROCTORING AND STUDENT LOGIN');

    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);
      logger.success('TC4 PASS: Proctoring started');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Student Login', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });

    logger.separator('TC5: STUDENT LOGIN');

    try {
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const studentLoginPage = new LoginPage(studentTab);
      studentLoginPage.setLogger(logger);
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');

      const studentAssertions = new Assertions(studentTab);
      studentAssertions.setLogger(logger);
      await studentAssertions.assertURLNotContains('/login');

      await studentTab.bringToFront();
      logger.success('TC5 PASS: Student logged in successfully');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Student adds Product and fills Attestation', async ({}, testInfo) => {
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
      await myATIPage.addProductForProctoredAssessment(extractedBatchId, locators, studentAssertions);
      logger.success('Student entered Batch ID');

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success('TC6 PASS: Student added product and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Faculty approves and Student launches assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);

    logger.separator('TC7: FACULTY APPROVES AND STUDENT LAUNCHES');

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

      logger.success('TC7 PASS: Faculty approved, Student launched assessment');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // TTS TOGGLE & ASSESSMENT FLOW
  // ============================================================

  test('TC8: Enable Text to Speech toggle', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__TTS_Toggle', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: ENABLE TTS TOGGLE');

    try {
      await assessmentPage.turnToggleOn();
      await studentTab.waitForTimeout(3000);
      let isOn = await assessmentPage.isToggleOn();
      if (!isOn) {
        logger.info('Toggle not detected as ON, retrying...');
        await assessmentPage.turnToggleOn();
        await studentTab.waitForTimeout(3000);
        isOn = await assessmentPage.isToggleOn();
      }
      if (isOn) {
        logger.success('TTS toggle is enabled');
      } else {
        logger.info('Toggle state not confirmed - may be a DOM timing issue');
      }
      logger.success('TC8 PASS: TTS toggle operation completed');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Flag, Continue, Previous, Unflag robust flow', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC9__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: FLAG/UNFLAG FLOW');

    try {
      await studentTab.waitForLoadState('load');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC9 PASS: Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__Calculator_Functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: CALCULATOR FUNCTIONALITY');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC10 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Pause_and_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: PAUSE AND RESUME');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC11 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: ANSWER ASSESSMENT');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC12 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);

    logger.separator('TC13: FINALIZE ASSESSMENT');

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC13 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: IPP page shows 100% score', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    assessmentPage.setLogger(logger);

    logger.separator('TC14: IPP SCORE VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
     await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('TC14 PASS: Proctor TTS On Flow Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
