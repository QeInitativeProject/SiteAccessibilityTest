

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
const SCENARIO_NAME = 'Stg_Proctor_MultiFaculty_MultiStudentStop';
const ASSESSMENT_STATUS = 'Testing';

// Faculty credentials
const FACULTY1_USERNAME = process.env.facUsernamezz1;
const FACULTY1_PASSWORD = process.env.facPasswordzzcab;
const FACULTY2_USERNAME = process.env.facUsernamezz2;
const FACULTY2_PASSWORD = process.env.facPasswordzzcab;

// Student credentials
const STUDENT1_USERNAME = process.env.stuUsern1;
const STUDENT1_PASSWORD = process.env.stuPasswordzzcab1;
const STUDENT2_USERNAME = process.env.stuUsern2;
const STUDENT2_PASSWORD = process.env.stuPasswordzzcab1;


test.describe.serial('@Regression - Stg_Proctor_MultiFaculty_MultiStudentStop', { tag: '@regression' }, () => {
  let browser: Browser;
  let faculty1Context: BrowserContext;
  let faculty1Page: Page;
  let faculty2Context: BrowserContext;
  let faculty2Page: Page;
  let student1Context: BrowserContext;
  let student1Tab: Page;
  let student2Context: BrowserContext;
  let student2Tab: Page;
  let logger: Logger;
  let batchCreation: BatchCreation;
  let extractedBatchId: string;

  let faculty1LoginPage: LoginPage;
  let faculty1HomePage: FACHomePage;
  let faculty1ProctorUtil: ProctorUtility;
  let faculty1Assertions: Assertions;

  let faculty2LoginPage: LoginPage;
  let faculty2HomePage: FACHomePage;
  let faculty2ProctorUtil: ProctorUtility;
  let faculty2Assertions: Assertions;

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({
      headless: process.env.CI ? true : false,
    });

    faculty1Context = await browser.newContext();
    faculty1Page = await faculty1Context.newPage();
    faculty1LoginPage = new LoginPage(faculty1Page);
    faculty1HomePage = new FACHomePage(faculty1Page);
    faculty1ProctorUtil = new ProctorUtility(faculty1Page);
    faculty1Assertions = new Assertions(faculty1Page);

    faculty2Context = await browser.newContext();
    faculty2Page = await faculty2Context.newPage();
    faculty2LoginPage = new LoginPage(faculty2Page);
    faculty2HomePage = new FACHomePage(faculty2Page);
    faculty2ProctorUtil = new ProctorUtility(faculty2Page);
    faculty2Assertions = new Assertions(faculty2Page);

    batchCreation = new BatchCreation(browser);

    faculty1Page.on('dialog', async (dialog) => {
      logger?.info(`[Faculty1] Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });
    faculty2Page.on('dialog', async (dialog) => {
      logger?.info(`[Faculty2] Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
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
      if (faculty1Page && !faculty1Page.isClosed()) await faculty1Page.close();
      if (faculty1Context) await faculty1Context.close();
      if (faculty2Page && !faculty2Page.isClosed()) await faculty2Page.close();
      if (faculty2Context) await faculty2Context.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    batchCreation.setLogger(logger);
    faculty1Assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION');

    try {
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(
        EXPECTED_ASSESSMENT_NAME!,
        EXPECTED_INSTITUTION!
      );
      stopTimer();

      faculty1Assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`TC1 PASS: Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Faculty 1 login and start proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC2__Faculty1_Login_Setup', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    faculty1LoginPage.setLogger(logger);
    faculty1HomePage.setLogger(logger);
    faculty1ProctorUtil.setLogger(logger);
    faculty1Assertions.setLogger(logger);

    logger.separator('TC2: FACULTY 1 LOGIN AND START PROCTORING');

    try {
      await faculty1Page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await faculty1LoginPage.fillfacUserName(FACULTY1_USERNAME!);
      await faculty1LoginPage.fillfacPassword(FACULTY1_PASSWORD!);
      await faculty1LoginPage.clickLogin();
      await faculty1Page.waitForLoadState('load');
      await faculty1Assertions.assertURLNotContains('/login');

      await faculty1HomePage.clickOnMenuBar();
      await faculty1Page.waitForLoadState('load');
      await faculty1ProctorUtil.navigateToProctorTab();
      await faculty1Page.waitForLoadState('load');
      await faculty1Page.waitForTimeout(10000);
      await faculty1Page.waitForTimeout(10000);
      await faculty1Page.waitForTimeout(10000);

      await faculty1ProctorUtil.fillAssessmentID(extractedBatchId);
      await faculty1Page.waitForLoadState('load');
      await faculty1ProctorUtil.completeProctorAgreementPage();
      await faculty1Page.waitForLoadState('load');
      await faculty1Page.waitForTimeout(3000);
      await faculty1ProctorUtil.checkInStudents();
      await faculty1Page.waitForLoadState('load');
      await faculty1ProctorUtil.startProctoring();
      await faculty1Page.waitForLoadState('load');

      logger.success('TC2 PASS: Faculty 1 logged in and proctoring started');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Faculty 2 login and join same batch proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty2Page, 'TC3__Faculty2_Login_Join', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    faculty2LoginPage.setLogger(logger);
    faculty2HomePage.setLogger(logger);
    faculty2ProctorUtil.setLogger(logger);
    faculty2Assertions.setLogger(logger);

    logger.separator('TC3: FACULTY 2 LOGIN AND JOIN SAME BATCH PROCTORING');

    try {
      await faculty2Page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await faculty2LoginPage.fillfacUserName(FACULTY2_USERNAME!);
      await faculty2LoginPage.fillfacPassword(FACULTY2_PASSWORD!);
      await faculty2LoginPage.clickLogin();
      await faculty2Page.waitForLoadState('load');
      await faculty2Assertions.assertURLNotContains('/login');

      await faculty2HomePage.clickOnMenuBar();
      await faculty2Page.waitForLoadState('load');
      await faculty2ProctorUtil.navigateToProctorTab();
      await faculty2Page.waitForLoadState('load');
      await faculty2Page.waitForTimeout(10000);
      await faculty2Page.waitForLoadState('load');
      await faculty2Page.waitForTimeout(10000);
      await faculty2Page.waitForTimeout(10000);
      await faculty2ProctorUtil.fillAssessmentID(extractedBatchId);
      await faculty2Page.waitForLoadState('load');
      await faculty2ProctorUtil.completeProctorAgreementPage();
      await faculty2Page.waitForLoadState('load');
      await faculty2Page.waitForTimeout(3000);
      await faculty2ProctorUtil.checkInStudents();
      await faculty2Page.waitForLoadState('load');
      await faculty2ProctorUtil.startProctoring();
      await faculty2Page.waitForLoadState('load');

      logger.success('TC3 PASS: Faculty 2 logged in and joined same batch proctoring');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Student 1 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC4__Student1_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });

    logger.separator('TC4: STUDENT 1 LOGIN AND START ASSESSMENT');

    try {
      student1Context = await browser.newContext();
      student1Tab = await student1Context.newPage();
      await student1Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(student1Tab);
      studentLoginPage.setLogger(logger);
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
      await myATIPage.waitForBlockUIOverlay();

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

      await faculty1Page.bringToFront();
      await faculty1Page.reload();
      await faculty1Page.waitForLoadState('load');
      await faculty1ProctorUtil.approveByProctor();
      await faculty1Page.waitForLoadState('load');

      await student1Tab.bringToFront();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);
      await studentProctorUtil.startTest();
      await student1Tab.waitForTimeout(10000);
      await student1Tab.waitForLoadState('load');

      logger.success('TC4 PASS: Student 1 logged in, approved by Faculty 1, and started assessment');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Validate both Faculty 1 and Faculty 2 see student status', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC5__MultiFaculty_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    faculty1ProctorUtil.setLogger(logger);
    faculty2ProctorUtil.setLogger(logger);

    logger.separator('TC5: VALIDATE BOTH PROCTORS SEE STUDENT STATUS');

    try {
      await faculty1Page.bringToFront();
      await faculty1Page.reload();
      await faculty1Page.waitForLoadState('load');
      await faculty1Page.waitForTimeout(5000); await faculty1Page.waitForTimeout(15000);
      await faculty1ProctorUtil.validateProctorStatus(ASSESSMENT_STATUS, extractedBatchId);
      await logger.captureScreenshot('faculty1_monitoring_student');

      await faculty2Page.bringToFront();
      await faculty2Page.reload();
      await faculty2Page.waitForLoadState('load');
      await faculty2Page.waitForTimeout(5000);
      await faculty2ProctorUtil.validateProctorStatus(ASSESSMENT_STATUS, extractedBatchId);
      await logger.captureScreenshot('faculty2_monitoring_student');

      logger.success('TC5 PASS: Both Faculty 1 and Faculty 2 see student status as In Progress');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Student 2 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC6__Student2_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    logger.separator('TC6: STUDENT 2 LOGIN AND START ASSESSMENT');

    try {
      student2Context = await browser.newContext();
      student2Tab = await student2Context.newPage();
      await student2Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(student2Tab);
      studentLoginPage.setLogger(logger);
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
      await myATIPage.waitForBlockUIOverlay();

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

      await faculty1Page.bringToFront();
      await faculty1Page.reload();
      await faculty1Page.waitForLoadState('load');
      await faculty1Page.waitForTimeout(3000);
      await faculty1ProctorUtil.approveByProctor();
      await faculty1Page.waitForLoadState('load');

      await student2Tab.bringToFront();
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(5000);
      await studentProctorUtil.startTest();
      await student2Tab.waitForLoadState('load');
       await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      await student2Tab.waitForURL(/\/Assessment/i, { timeout: 60000 });
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(8000);
      logger.success('TC6 PASS: Student 2 logged in, approved, and started assessment');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Faculty closes Student 1 assessment only', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC7__Close_Student1_Only', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    faculty1ProctorUtil.setLogger(logger);

    logger.separator('TC7: FACULTY CLOSES STUDENT 1 ASSESSMENT ONLY');

    try {
      await faculty1Page.bringToFront();
      await faculty1Page.reload();
      await faculty1Page.waitForLoadState('load');
      await faculty1Page.waitForTimeout(5000);

      await faculty1ProctorUtil.closeIndividualStudent(0, extractedBatchId);
      await logger.captureScreenshot('faculty_stopped_student1');

      logger.success('TC7 PASS: Faculty stopped Student 1 assessment via checkbox + STOP ASSESSMENT');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate Student 1 assessment is stopped', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC8__Validate_Student1_Stopped', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    faculty1ProctorUtil.setLogger(logger);

    logger.separator('TC8: VALIDATE STUDENT 1 ASSESSMENT STOPPED');

    try {
      const student1Stopped = await faculty1ProctorUtil.validateStudentAssessmentStopped(student1Tab);
      await logger.captureScreenshot('student1_stopped');

      if (!student1Stopped) {
        throw new Error('Student 1 assessment was not stopped as expected');
      }

      logger.success('TC8 PASS: Student 1 assessment confirmed stopped');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate Student 2 assessment is still active', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC9__Validate_Student2_Active', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    faculty1ProctorUtil.setLogger(logger);

    logger.separator('TC9: VALIDATE STUDENT 2 ASSESSMENT STILL ACTIVE');

    try {
      const student2Active = await faculty1ProctorUtil.validateStudentAssessmentStillActive(student2Tab);
      await logger.captureScreenshot('student2_still_active');

      if (!student2Active) {
        throw new Error('Student 2 assessment was stopped unexpectedly - should still be active');
      }

      logger.success('TC9 PASS: Student 2 assessment confirmed still active - only targeted student was stopped');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Faculty logout mid-test stops student assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(faculty1Page, 'TC10__Faculty_Logout_MidTest', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    faculty1ProctorUtil.setLogger(logger);

    logger.separator('TC10: FACULTY LOGOUT MID-TEST - STUDENT ASSESSMENT STOPS');

    try {

      const student2StillActive = await faculty1ProctorUtil.validateStudentAssessmentStillActive(student2Tab);
      if (!student2StillActive) {
        throw new Error('Pre-condition failed: Student 2 should be active before faculty logout');
      }
      logger.info('Pre-condition verified: Student 2 is active');

      // Faculty 1 logs out while Student 2 is mid-test
      await faculty1Page.bringToFront();
      await faculty1HomePage.logoutFaculty();
      await logger.captureScreenshot('faculty1_logged_out');
      logger.success('Faculty 1 logged out mid-test');

      // Validate student sees Self Attestation page after faculty logout
      const onAttestationPage = await faculty1ProctorUtil.validateStudentOnAttestationPage(student2Tab);
      await logger.captureScreenshot('student2_attestation_after_faculty_logout');

      if (!onAttestationPage) {
        throw new Error('Student 2 did not land on attestation page after faculty logout');
      }

      logger.success('TC10 PASS: Faculty logout mid-test redirected student to Self Attestation page');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });
});