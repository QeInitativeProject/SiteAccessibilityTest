/**
 * Regression Test - Proctor Pause, Stop & Resume Validations
 * Description: Validate proctor stop and resume scenarios:
 * TC1-TC3: Setup (batch creation, faculty login, student login)
 * TC4: Faculty pauses student → pause time expires → assessment auto-resumes
 * TC5: Faculty stops proctoring → all student assessments stop
 * TC6: Faculty rejoins proctoring → student can resume assessment
 *
 * Uses 2 students with the same batch ID.
 *
 * @author Ashok Singh
 */

import { test, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { FACHomePage } from '@delegates/FACHomePage';
import { MyATIPage } from '@delegates/MyATIPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_StopProctoring_Validations';
const STUDENT1_USERNAME = process.env.stuUsernameauto14;
const STUDENT1_PASSWORD = process.env.stuPasswordauto1;
const STUDENT2_USERNAME = process.env.stuUsernameauto15;
const STUDENT2_PASSWORD = process.env.stuPasswordauto1;


test.describe.serial('@Regression - Stg_Proctor_StopProctoring_Validations', { tag: '@regression' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let student1Tab: Page;
  let student1Context: BrowserContext;
  let student2Tab: Page;
  let student2Context: BrowserContext;
  let atiLoginPage: LoginPage;
  let facHomePage: FACHomePage;
  let proctorUtil: ProctorUtility;
  let assertions: Assertions;
  let logger: Logger;
  let batchCreation: BatchCreation;
  let extractedBatchId: string;

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
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
  });

  test.afterAll(async () => {
    try {
      if (student1Tab && !student1Tab.isClosed()) await student1Tab.close();
      if (student1Context) await student1Context.close();
      if (student2Tab && !student2Tab.isClosed()) await student2Tab.close();
      if (student2Context) await student2Context.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    batchCreation.setLogger(logger);
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
      logger.success(`TC1 PASS: Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Faculty login and setup proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Faculty_Login_Setup', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: FACULTY LOGIN AND SETUP PROCTORING');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab4!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab3!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');

      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(10000);

      await proctorUtil.fillAssessmentID(extractedBatchId);
      await page.waitForLoadState('load');
      await proctorUtil.completeProctorAgreementPage();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      await proctorUtil.checkInStudents();
      await page.waitForLoadState('load');
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');

      logger.success('TC2 PASS: Faculty logged in and proctoring started');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Student 1 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Student1_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });

    logger.separator('TC3: STUDENT 1 LOGIN AND START ASSESSMENT');

    try {
      student1Context = await browser.newContext();
      student1Tab = await student1Context.newPage();
      await student1Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(student1Tab);
      await student1Tab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(STUDENT1_USERNAME!);
      await studentLoginPage.fillStuPassword(STUDENT1_PASSWORD!);
      await studentLoginPage.clickLogin();
      await student1Tab.waitForLoadState('load');

      const myATIPage = new MyATIPage(student1Tab);
      myATIPage.setLogger(logger);
      const locators = new StudentFacingPageLocators(student1Tab);
      const studentAssertions = new Assertions(student1Tab);
      studentAssertions.setLogger(logger);

      await student1Tab.waitForTimeout(5000);
      await student1Tab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
      await student1Tab.waitForFunction(() => !document.querySelector('.blockUI.blockOverlay'), { timeout: 30000 }).catch(() => {});

      await myATIPage.clickOnMyATITab();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);

      await myATIPage.clickOnAssessmentsTab();
      await student1Tab.waitForTimeout(2000);

      await studentAssertions.waitAndAssertVisible(locators.idTextbox, 15000);
      await locators.idTextbox.fill(extractedBatchId.trim());
      await studentAssertions.waitAndAssertVisible(locators.continueButton, 10000);
      await locators.continueButton.click();
      await student1Tab.waitForTimeout(3000);

      const studentProctorUtil = new ProctorUtility(student1Tab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');

      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      await student1Tab.bringToFront();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);
      await studentProctorUtil.startTest();
      await student1Tab.waitForLoadState('load');
      logger.success('TC3 PASS: Student 1 logged in and started assessment');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Student 2 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Student2_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });

    logger.separator('TC4: STUDENT 2 LOGIN AND START ASSESSMENT');

    try {
      student2Context = await browser.newContext();
      student2Tab = await student2Context.newPage();
      await student2Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(student2Tab);
      await student2Tab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(STUDENT2_USERNAME!);
      await studentLoginPage.fillStuPassword(STUDENT2_PASSWORD!);
      await studentLoginPage.clickLogin();
      await student2Tab.waitForLoadState('load');

      const myATIPage = new MyATIPage(student2Tab);
      myATIPage.setLogger(logger);
      const locators = new StudentFacingPageLocators(student2Tab);
      const studentAssertions = new Assertions(student2Tab);
      studentAssertions.setLogger(logger);

      await student2Tab.waitForTimeout(5000);

      await myATIPage.clickOnMyATITab();
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(5000);

      await myATIPage.clickOnAssessmentsTab();
      await student2Tab.waitForTimeout(2000);

      await studentAssertions.waitAndAssertVisible(locators.idTextbox, 15000);
      await locators.idTextbox.fill(extractedBatchId.trim());
      await studentAssertions.waitAndAssertVisible(locators.continueButton, 10000);
      await locators.continueButton.click();
      await student2Tab.waitForTimeout(3000);

      const studentProctorUtil = new ProctorUtility(student2Tab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');

      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      await student2Tab.bringToFront();
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(5000);
      await studentProctorUtil.startTest();
      await student2Tab.waitForLoadState('load');

      logger.success('TC4 PASS: Student 2 logged in and started assessment');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Faculty pauses student 1 and validates auto-resume after pause time expires', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Pause_AutoResume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    proctorUtil.setLogger(logger);

    logger.separator('TC5: PAUSE TIME AUTO-RESUME VALIDATION');

    try {
      await proctorUtil.pauseStudentAndValidateAutoResume(student1Tab, 8000);
      await logger.captureScreenshot('student1_auto_resumed');
      logger.success('TC5 PASS: Assessment auto-resumed after pause time expired');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Faculty stops proctoring and verifies all student assessments stop', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__StopProctoring_AllStop', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    proctorUtil.setLogger(logger);

    logger.separator('TC6: STOP PROCTORING - ALL STUDENTS STOP');

    try {
      await proctorUtil.stopProctoring();
      await logger.captureScreenshot('faculty_stopped_proctoring');

      // Verify both students' assessments are stopped
      const student1Stopped = await proctorUtil.validateStudentAssessmentStopped(student1Tab);
      await logger.captureScreenshot('student1_after_stop');

      const student2Stopped = await proctorUtil.validateStudentAssessmentStopped(student2Tab);
      
      await logger.captureScreenshot('student2_after_stop');

      logger.success(`TC6 PASS: Faculty stopped proctoring - Student1 stopped: ${student1Stopped}, Student2 stopped: ${student2Stopped}`);
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Faculty rejoins proctoring and student resumes assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Rejoin_StudentResume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);
    facHomePage.setLogger(logger);
    atiLoginPage.setLogger(logger);
    logger.separator('TC7: PROCTOR REJOINS - STUDENT RESUMES');

    try {
      await page.bringToFront();
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab4!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab3!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('Faculty re-logged in');

      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      // Re-enter the batch ID
      await proctorUtil.fillAssessmentID(extractedBatchId);
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);

      await proctorUtil.completeProctorAgreementPage();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      await proctorUtil.checkInStudents();
      await page.waitForLoadState('load');
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');
      logger.success('Faculty rejoined and restarted proctoring');

      await student1Tab.bringToFront();
      await student1Tab.waitForTimeout(3000);

      const myATIPage = new MyATIPage(student1Tab);
      myATIPage.setLogger(logger);
      await myATIPage.clickOnMyATITab();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);
      await myATIPage.reloadSameAssessment(EXPECTED_ASSESSMENT_NAME!, extractedBatchId);
      await student1Tab.waitForTimeout(3000);

      const studentProctorUtil = new ProctorUtility(student1Tab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('Student 1 reloaded assessment');

      await page.bringToFront();
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(5000);
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');
      await logger.captureScreenshot('faculty_rejoined');

      await student1Tab.bringToFront();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);
      await studentProctorUtil.resumeTest();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(3000);

      await proctorUtil.verifyAssessmentContentVisible(student1Tab);
      logger.success('TC7 PASS: Student successfully resumed assessment after proctor rejoin');
      await logger.captureScreenshot('student_resumed_after_rejoin');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
