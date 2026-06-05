/**
 * Regression Test - Proctor Stop & Abandon Flow
 * Description: Validate the cheat incident escalation flow where after 4 incidents,
 * the Stop option appears, and faculty can Abandon the student's attempt.
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
const SCENARIO_NAME = 'Stg_Proctor_Ignore_4_CheatIncident';
const EXPECTED_PERCENTAGE = '0.0%';


test.describe.serial('@Regression - Stg_Proctor_Ignore_4_CheatIncident.spec.ts', { tag: '@regression' }, () => {
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

  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC2: Validate proctor not available message when student enters Batch ID without proctor session', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC2__Proctor_Not_Available', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC2' });

    logger.separator('TC2: PROCTOR NOT AVAILABLE VALIDATION');

    try {
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(studentTab);
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcabMultiSelectDD!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcabMultiSelectDD!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');

      myATIPage = new MyATIPage(studentTab);
      locators = new StudentFacingPageLocators(studentTab);
      myATIPage.setLogger(logger);

      const studentAssertions = new Assertions(studentTab);
      studentAssertions.setLogger(logger);

      await studentTab.waitForLoadState('load');
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

      const studentAssessmentPage = new AssessmentPage(studentTab);
      studentAssessmentPage.setLogger(logger);
      await studentAssessmentPage.validateProctorNotAvailableMessage();

      logger.success('TC2 PASS: Proctor not available message validated');
      await studentTab.close();
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Faculty login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Faculty_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    atiLoginPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC3: FACULTY LOGIN');

    try {
      await page.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');
      logger.success('TC3 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Navigate to Proctor Tab', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Navigate_Proctor_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);

    logger.separator('TC4: NAVIGATE TO PROCTOR TAB');

    try {
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      await page.waitForTimeout(10000);
      logger.success('TC4 PASS: Navigated to Proctor Tab');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Enter Assessment ID and Setup Proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    proctorUtil.setLogger(logger);

    logger.separator('TC5: SETUP PROCTORING');

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
      logger.success('TC5 PASS: Assessment ID entered and proctoring setup complete');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Start Proctoring Session and Student Login', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Start_Proctoring_Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    proctorUtil.setLogger(logger);

    logger.separator('TC6: START PROCTORING AND STUDENT LOGIN');

    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const studentLoginPage = new LoginPage(studentTab);
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab1!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab1!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      await studentTab.waitForLoadState('load');

      logger.success('TC6 PASS: Proctoring started and student logged in');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Reload Same Assessment - Enter Batch ID and Complete Attestation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC7__Reload_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    myATIPage = new MyATIPage(studentTab);
    assessmentPage = new AssessmentPage(studentTab);
    locators = new StudentFacingPageLocators(studentTab);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);

    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    logger.separator('TC7: RELOAD SAME ASSESSMENT AND ATTESTATION');

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

      logger.success('TC7 PASS: Assessment reloaded and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Approve and Start Test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Approve_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    proctorUtil.setLogger(logger);

    logger.separator('TC8: APPROVE AND START TEST');

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
      await studentProctorUtil.resumeTest();
      await page.waitForLoadState('load');

      logger.success('TC8 PASS: Test approved and started successfully');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Create Cheat Incident #1 - Validate "Your proctor notified" with Resume Test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC9__Cheat_Incident_1', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);

    logger.separator('TC9: CHEAT INCIDENT #1');

    try {
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateProctorNotifiedAndResume(1);
      logger.success('TC9 PASS: Cheat incident #1 - Proctor notified with Resume Test validated');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Create Cheat Incident #2 - Validate "Your proctor notified" with Resume Test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__Cheat_Incident_2', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: CHEAT INCIDENT #2');

    try {
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateProctorNotifiedAndResume(2);
      logger.success('TC10 PASS: Cheat incident #2 - Proctor notified with Resume Test validated');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Create Cheat Incident #3 - Validate "Invalid key pressed" warning with Resume Assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Cheat_Incident_3', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: CHEAT INCIDENT #3 - INVALID KEY WARNING');

    try {
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateInvalidKeyWarningAndResume();
      logger.success('TC11 PASS: Cheat incident #3 - Invalid key warning with Resume Assessment validated');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Create Cheat Incident #4 - Validate "Warning threshold maxed" with Close Assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Cheat_Incident_4_Threshold', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: CHEAT INCIDENT #4 - THRESHOLD MAXED');

    try {
      await assessmentPage.createCheatIncident();
      await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateThresholdMaxedAndClose();
      logger.success('TC12 PASS: Cheat incident #4 - Warning threshold maxed and assessment closed');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Validate Ignore, Close, and Abandon options on proctor side', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC13__Proctor_Ignore_Close_Abandon', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    proctorUtil.setLogger(logger);

    logger.separator('TC13: PROCTOR SIDE - IGNORE, CLOSE, ABANDON OPTIONS');

    try {
      await proctorUtil.validateIgnoreCloseAbandonVisible(extractedBatchId);
      logger.success('TC13 PASS: Ignore, Close, and Abandon options are all visible on proctor side');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Faculty IGNORE → Student reloads assessment → Cheat → Faculty CLOSE', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC14__Ignore_Reload_Close', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    proctorUtil.setLogger(logger);
    assessmentPage.setLogger(logger);

    logger.separator('TC14: IGNORE → RELOAD → CHEAT → CLOSE');

    try {

      await proctorUtil.ignoreIncident();
      logger.success('✅ Faculty clicked IGNORE');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(3000);

      myATIPage = new MyATIPage(studentTab);
      myATIPage.setLogger(logger);
      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(5000);

      await myATIPage.reloadSameAssessment(EXPECTED_ASSESSMENT_NAME!, extractedBatchId);

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('✅ Student reloaded same assessment');

      await page.bringToFront();
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      try {
        await proctorUtil.resumeByProctor();
        await page.waitForLoadState('load');
        logger.success('✅ Faculty resumed student');
      } catch {
        logger.info('ℹ️ RESUME button not visible - student may be auto-approved after IGNORE');
      }
      await studentTab.bringToFront();
      await studentTab.waitForTimeout(3000);
      try {
        await studentProctorUtil.resumeTest();
        await studentTab.waitForLoadState('load');
      } catch {
        logger.info('ℹ️ Resume button not visible - student may already be in test');
      }
      logger.success('✅ Student started test again');

      assessmentPage = new AssessmentPage(studentTab);
      assessmentPage.setLogger(logger);
      await assessmentPage.createCheatIncident();

     await proctorUtil.ignoreIncident();
      await studentTab.bringToFront();
      await assessmentPage.validateThresholdMaxedAndClose();

      logger.success('✅ Cheat incident created');
     await proctorUtil.validateIgnoreCloseAbandonVisible(extractedBatchId);

      await proctorUtil.closeAssessment();
      logger.success('TC14 PASS: Faculty IGNORED, student reloaded, cheated, and faculty CLOSED assessment');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Validate scoring is visible on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC15__Validate_Results_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });

    logger.separator('TC15: Validate scoring is visible on IPP Page');

    try {
      await studentTab.bringToFront();
      await studentTab.waitForTimeout(3000);

      myATIPage = new MyATIPage(studentTab);
      myATIPage.setLogger(logger);
      await myATIPage.navigateToResultsAndOpenAssessment(EXPECTED_ASSESSMENT_NAME!);

      assessmentPage = new AssessmentPage(studentTab);
      assessmentPage.setLogger(logger);
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      await assessmentPage.validateAssessmentName(EXPECTED_ASSESSMENT_NAME!);

      logger.success(`TC15 PASS: Student Results page validated with ${EXPECTED_PERCENTAGE} score`);
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
