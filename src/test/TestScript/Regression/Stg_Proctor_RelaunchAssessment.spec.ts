/**
 * Regression Test - Relaunch Assessment Flow
 * Description: Validate that after launching the assessment, if the student accidentally closes the browser tab,
 * then logs back in and relaunches the same assessment, "Resume" and "Deny" options should be visible on the proctor side.
 * @author [Ashok Singh]
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

const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const EXPECTED_PERCENTAGE = '100.0%';
const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_RelaunchAssessment';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';

test.describe.serial('@Regression - Stg_Proctor_RelaunchAssessment', { tag: '@regression' }, () => {
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
  let assessmentStartTime: number = 0;
  let assessmentEndTime: number = 0;

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({
      headless: process.env.CI ? true : false,
    });
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

  test('TC1: MU Batch creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(EXPECTED_ASSESSMENT_NAME!, EXPECTED_INSTITUTION!);
      stopTimer();

      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Faculty login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Faculty_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: FACULTY LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('TC2 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Navigate to Proctor Tab and setup proctoring', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC4: Start proctoring and Student login', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Start_Proctoring_Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    proctorUtil.setLogger(logger);

    logger.separator('TC4: START PROCTORING AND STUDENT LOGIN');

    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');

      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const stuLogin = new LoginPage(studentTab);
      stuLogin.setLogger(logger);
      await studentTab.waitForTimeout(2000);
      await stuLogin.fillStuUserName(process.env.stuUsernamezzcab1!);
      await stuLogin.fillStuPassword(process.env.stuPasswordzzcab1!);
      await stuLogin.clickLogin();
      await studentTab.waitForLoadState('load');

      const stuAssertions = new Assertions(studentTab);
      stuAssertions.setLogger(logger);
      await stuAssertions.assertURLNotContains('/login');

      await studentTab.bringToFront();
      logger.success('TC4 PASS: Proctoring started and student logged in');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT ADD PRODUCT & FIRST LAUNCH
  // ============================================================

  test('TC5: Student adds Product and fills Attestation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC5__Student_AddProduct', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });

    myATIPage = new MyATIPage(studentTab);
    locators = new StudentFacingPageLocators(studentTab);
    myATIPage.setLogger(logger);

    const stuAssertions = new Assertions(studentTab);
    stuAssertions.setLogger(logger);

    logger.separator('TC5: STUDENT ADD PRODUCT AND ATTESTATION');

    try {
      await myATIPage.addProductForProctoredAssessment(extractedBatchId, locators, stuAssertions);
      logger.success('Student entered Batch ID');

      const stuProctorUtil = new ProctorUtility(studentTab);
      stuProctorUtil.setLogger(logger);
      await stuProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      stuAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success('TC5 PASS: Student added product and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Faculty approves and Student starts test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Approve_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    proctorUtil.setLogger(logger);

    logger.separator('TC6: FACULTY APPROVES AND STUDENT STARTS TEST');

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
      await studentTab.waitForTimeout(5000);

      const stuProctorUtil = new ProctorUtility(studentTab);
      stuProctorUtil.setLogger(logger);
      await stuProctorUtil.resumeTest();
      await studentTab.waitForLoadState('load');

      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(25000);

      logger.success('TC6 PASS: Faculty approved and student started test');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // SIMULATE TAB CLOSE & RELAUNCH
  // ============================================================

  test('TC7: Student accidentally closes the browser tab', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Student_Closes_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    logger.separator('TC7: STUDENT CLOSES BROWSER TAB');

    try {
      const assessmentUrl = studentTab.url();
      logger.info(`Student is on: ${assessmentUrl}`);

      await studentTab.close();
      logger.success('Student tab closed (simulating accidental close)');

      await page.waitForTimeout(5000);
      logger.success('TC7 PASS: Student browser tab closed successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Student logs back in and relaunches the same assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Student_Relogin_Relaunch', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });

    logger.separator('TC8: STUDENT RE-LOGIN AND RELAUNCH');

    try {
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const stuLogin = new LoginPage(studentTab);
      stuLogin.setLogger(logger);
      await studentTab.waitForTimeout(2000);
      await stuLogin.fillStuUserName(process.env.stuUsernamezzcab1!);
      await stuLogin.fillStuPassword(process.env.stuPasswordzzcab1!);
      await stuLogin.clickLogin();
      await studentTab.waitForLoadState('load');
      logger.success('Student logged back in');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      await studentTab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      myATIPage = new MyATIPage(studentTab);
      locators = new StudentFacingPageLocators(studentTab);
      myATIPage.setLogger(logger);

      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(10000);

      await myATIPage.reloadSameAssessment(EXPECTED_ASSESSMENT_NAME!, extractedBatchId.trim());

      const stuProctorUtil = new ProctorUtility(studentTab);
      stuProctorUtil.setLogger(logger);
      await stuProctorUtil.fillAttestationPage();

      const stuAssertions = new Assertions(studentTab);
      stuAssertions.setLogger(logger);
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      stuAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success('TC8 PASS: Student logged back in and relaunched the same assessment');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // PROCTOR RESUME/DENY VALIDATION
  // ============================================================

  test('TC9: Validate RESUME and DENY buttons visible on proctor side', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Validate_Resume_Deny', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);

    logger.separator('TC9: VALIDATE RESUME AND DENY BUTTONS');

    try {
      await page.bringToFront();
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(5000);

      await proctorUtil.validateResumeAndDenyVisible();
      logger.success('TC9 PASS: RESUME and DENY buttons are visible on proctor side');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Proctor clicks RESUME and student resumes assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Proctor_Resume_Student', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    proctorUtil.setLogger(logger);

    logger.separator('TC10: PROCTOR RESUMES STUDENT ASSESSMENT');

    try {
      await proctorUtil.resumeByProctor();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);
      logger.success('Proctor clicked RESUME');

      await studentTab.bringToFront();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(5000);

      const stuProctorUtil = new ProctorUtility(studentTab);
      stuProctorUtil.setLogger(logger);
      await stuProctorUtil.resumeTest();
      await studentTab.waitForLoadState('load');

      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(10000);

      assessmentStartTime = Date.now();
      logger.success(`Assessment start time: ${new Date(assessmentStartTime).toISOString()}`);
      logger.success('TC10 PASS: Proctor resumed and student is back in assessment');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ANSWER & FINALIZE
  // ============================================================

  test('TC11: Answer assessment questions and finalize', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Answer_and_Finalize', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage = new AssessmentPage(studentTab);
    assessmentPage.setLogger(logger);

    logger.separator('TC11: ANSWER QUESTIONS AND FINALIZE ASSESSMENT');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('All assessment questions answered');

      assessmentEndTime = Date.now();
      logger.success(`Assessment end time: ${new Date(assessmentEndTime).toISOString()}`);

      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC11 PASS: Assessment finalized and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // IPP PAGE VALIDATIONS
  // ============================================================

  test('TC12: Validate IPP page is visible and not broken', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__IPP_Page_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: IPP PAGE VISIBILITY AND INTEGRITY');

    try {
      await studentTab.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await studentTab.waitForLoadState('domcontentloaded');
      await studentTab.waitForTimeout(3000);

      const stuAssertions = new Assertions(studentTab);
      stuAssertions.setLogger(logger);
      const currentUrl = studentTab.url();
      stuAssertions.assertStringContains(currentUrl, 'ViewResult');

      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      logger.success('TC12 PASS: Student can see the IPP Page and it is not broken');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Validate scoring is visible on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__IPP_Scoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);

    logger.separator('TC13: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      logger.success('TC13 PASS: Scoring is visible and matches expected percentage');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Validate assessment name is correctly reflecting on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__IPP_Assessment_Name', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    assessmentPage.setLogger(logger);

    logger.separator('TC14: IPP ASSESSMENT NAME VALIDATION');

    try {
      await assessmentPage.validateAssessmentName(EXPECTED_ASSESSMENT_NAME!);
      logger.success('TC14 PASS: Assessment name is correctly reflecting on IPP Page');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Validate time spent is reflecting on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC15__IPP_Time_Spent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });
    assessmentPage.setLogger(logger);

    logger.separator('TC15: IPP TIME SPENT VALIDATION');

    try {
      await assessmentPage.validateIPPTimeSpent(assessmentStartTime, assessmentEndTime);
      logger.success('TC15 PASS: Time spent is correctly reflecting on IPP Page');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC16: Validate Close button on IPP Page is functional', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC16__IPP_Close_Button', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC16' });
    assessmentPage.setLogger(logger);

    logger.separator('TC16: IPP CLOSE BUTTON VALIDATION');

    try {
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('Screenshot captured for IPP page');

      await assessmentPage.validateIPPCloseButton();
      logger.success('TC16 PASS: Close button on IPP Page is functional');
    } catch (error: any) {
      await logger?.error('TC16 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
