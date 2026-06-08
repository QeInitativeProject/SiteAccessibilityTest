/**
 * Regression Test - Proctor Abandon Assessment Flow
 * Description: Validate that after 4 cheat incidents, the Abandon option appears on the proctor side,
 * and when faculty clicks Abandon, the student's assessment attempt is terminated.
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

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_Abandon_Assessment';

test.describe.serial('@Regression - Stg_Proctor_Abandon_Assessment', { tag: '@regression' }, () => {
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

    // Automatically dismiss all dialogs
    page.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Handle console errors
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
      if (studentTab && !studentTab.isClosed()) {
        await studentTab.close();
      }
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

  test('TC1: MU Batch Creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
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
      logger.success(`TC1 PASS: Batch created with ID: ${extractedBatchId}`);
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Faculty login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Faculty_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });
    atiLoginPage.setLogger(logger);
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

  test('TC3: Navigate to Proctor Tab', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC4: Enter Assessment ID and Setup Proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    proctorUtil.setLogger(logger);

    logger.separator('TC4: SETUP PROCTORING');

    try {
      await page.waitForLoadState('load');
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

  test('TC5: Start Proctoring Session and Student Login', { tag: '@regression' }, async ({}, testInfo) => {
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
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcabMultiSelect!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcabMultiSelect!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      await studentTab.waitForLoadState('load');

      logger.success('TC5 PASS: Proctoring started and student logged in');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT ADD PRODUCT & START ASSESSMENT
  // ============================================================

  test('TC6: Student enters Batch ID and completes Attestation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC6__Add_Product_Attestation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    myATIPage = new MyATIPage(studentTab);
    assessmentPage = new AssessmentPage(studentTab);
    locators = new StudentFacingPageLocators(studentTab);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);

    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    logger.separator('TC6: ADD PRODUCT AND ATTESTATION');

    try {
      await studentTab.waitForLoadState('load');
      await studentTab.waitForLoadState('domcontentloaded');
      await studentTab.waitForTimeout(5000);

      await studentTab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(5000);
      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);

      await studentAssertions.waitAndAssertVisible(locators.idTextbox, 15000);
      await locators.idTextbox.fill(extractedBatchId.trim());
      await studentAssertions.waitAndAssertVisible(locators.continueButton, 10000);
      await locators.continueButton.click();
      await studentTab.waitForTimeout(3000);

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

  test('TC7: Faculty approves and Student starts test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);

    logger.separator('TC7: APPROVE AND START TEST');

    try {
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');

      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      await studentTab.bringToFront();
      await studentTab.waitForLoadState('load');
      await page.waitForTimeout(5000);

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.resumeTest();
      await page.waitForLoadState('load');

      logger.success('TC7 PASS: Test approved and started successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Create 4 Cheat Incidents - Escalate to threshold maxed', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__Cheat_Incidents_1_to_4', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: CREATE 4 CHEAT INCIDENTS');

    try {
      // Cheat Incident #1
      logger.step('Creating cheat incident #1');
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateProctorNotifiedAndResume(1);
      logger.success('Cheat incident #1 - Faculty ignored, student resumed');

      // Cheat Incident #2
      logger.step('Creating cheat incident #2');
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateProctorNotifiedAndResume(2);
      logger.success('Cheat incident #2 - Faculty ignored, student resumed');

      // Cheat Incident #3
      logger.step('Creating cheat incident #3');
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateInvalidKeyWarningAndResume();
      logger.success('Cheat incident #3 - Faculty ignored, student resumed');

      // Cheat Incident #4 - Threshold maxed
      logger.step('Creating cheat incident #4 - threshold maxed');
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateThresholdMaxedAndClose();
      logger.success('TC8 PASS: All 4 cheat incidents created - threshold maxed and assessment closed');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // ABANDON FLOW
  // ============================================================

  test('TC9: Validate Ignore, Close, and Abandon options visible on proctor side', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Validate_Abandon_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);

    logger.separator('TC9: VALIDATE ABANDON OPTION VISIBLE');

    try {
      await proctorUtil.validateIgnoreCloseAbandonVisible(extractedBatchId);
      logger.success('TC9 PASS: Ignore, Close, and Abandon options are all visible');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Faculty clicks ABANDON to terminate student attempt', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Faculty_Abandons', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    proctorUtil.setLogger(logger);

    logger.separator('TC10: FACULTY ABANDONS STUDENT ATTEMPT');

    try {
      await proctorUtil.abandonStudent();
      logger.success('TC10 PASS: Faculty abandoned the student assessment attempt');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // POST-ABANDON VALIDATIONS
  // ============================================================

  test('TC11: Validate no results generated after abandon', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Validate_No_Results_After_Abandon', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });

    logger.separator('TC11: VALIDATE NO RESULTS GENERATED AFTER ABANDON');

    try {
      await studentTab.bringToFront();
      await studentTab.waitForTimeout(3000);

      myATIPage = new MyATIPage(studentTab);
      myATIPage.setLogger(logger);

      await myATIPage.validateNoResultsGenerated(EXPECTED_ASSESSMENT_NAME!);

      logger.success('TC11 PASS: No results generated after abandon');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
