/**
 * Regression Test - Proctor Cheat Incident Ignore Flow
 * Description: Validate that when faculty/proctor ignores the incident, student should be able to resume the test
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
const SCENARIO_NAME = 'Stg_Proctor_CheatIncident_Ignore';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const EXPECTED_PERCENTAGE = '100.0%';
const ASSESSMENT_STATUS = 'Completed';
const IppPageHeading = 'heading';
const IndividualPerformanceProfile = 'Individual Performance Profile';
const IppHeading = 'IPP Page Heading';

test.describe.serial('@Regression - Stg_Proctor_CheatIncident_Ignore', { tag: '@regression' }, () => {
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

      // Create a new student tab and login
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

      logger.success('TC5 PASS: Proctoring started and student logged in');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Add Product - Enter Batch ID and Complete Attestation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC6__Add_Product', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    // Initialize delegates for student tab
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

      // Wait for blockUI overlay to disappear
      await studentTab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(10000);

      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);

      // Enter Batch ID
      await studentAssertions.waitAndAssertVisible(locators.idTextbox, 15000);
      await locators.idTextbox.fill(extractedBatchId.trim());
      logger.success(`Batch ID entered: ${extractedBatchId.trim()}`);

      // Click Continue
      await studentAssertions.waitAndAssertVisible(locators.continueButton, 10000);
      await locators.continueButton.click();
      await studentTab.waitForTimeout(2000);

      // Fill attestation page
      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      // Verify navigation to Assessment page
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');

      logger.success('TC6 PASS: Product added and navigated to Assessment page');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Approve and Resume Test', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_Resume_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);

    logger.separator('TC7: APPROVE AND RESUME TEST');

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

      logger.success('TC7 PASS: Test approved and resumed successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Create Cheat Incident in Student Portal', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__Create_Cheat_Incident', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);

    logger.separator('TC8: CREATE CHEAT INCIDENT');

    try {
      await assessmentPage.createCheatIncident();
      logger.success('TC8 PASS: Cheat incident created successfully');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Faculty Ignores the Incident', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Faculty_Ignores_Incident', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);

    logger.separator('TC9: FACULTY IGNORES INCIDENT');

    try {
      await proctorUtil.ignoreIncident();
      logger.success('TC9 PASS: Faculty ignored the incident');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Student Resumes Assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__Student_Resumes', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    logger.separator('TC10: STUDENT RESUMES ASSESSMENT');

    try {
      await assessmentPage.resumeAfterIncident();
      logger.success('TC10 PASS: Student resumed assessment successfully');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Answer assessment and finalize', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);

    logger.separator('TC11: ANSWER ASSESSMENT AND FINALIZE');

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC11 PASS: Assessment answered and finalized');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Validate IPP scoring and heading', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);

    logger.separator('TC12: IPP SCORING VALIDATION');

    try {
      await assessmentPage.validateIPPScoring(EXPECTED_PERCENTAGE);
      await assessmentPage.verifyElementByRole(IppPageHeading, IndividualPerformanceProfile, IppHeading);
      await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('TC12 PASS: IPP score and heading validated');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Validate current date on IPP page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__IPP_Date_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);

    logger.separator('TC13: IPP DATE VALIDATION');

    try {
      await assessmentPage.validateIPPDate();
      logger.success('TC13 PASS: Current date is reflecting correctly on IPP');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Validate proctor side shows Completed status and correct score', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC14__Proctor_Status_Score', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    proctorUtil.setLogger(logger);

    logger.separator('TC14: PROCTOR STATUS AND SCORE VALIDATION');

    try {
      await page.bringToFront();
      await page.waitForTimeout(5000);
      await proctorUtil.validateProctorStatus(ASSESSMENT_STATUS);
      await proctorUtil.validateProctorScore(EXPECTED_PERCENTAGE);
      logger.success('TC14 PASS: Proctor side shows Completed status and correct score');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
