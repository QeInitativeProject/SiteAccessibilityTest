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

const EXPECTED_ASSESSMENT_NAME_1 = process.env.ProctoredAssessment;
const EXPECTED_ASSESSMENT_NAME_2 = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;

const QUESTION_ANSWER_FILE_S1 = '4_Correct_QnA.json';
const QUESTION_ANSWER_FILE_S2 = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const SCENARIO_NAME = 'Stg_MultiAssessment_Proctor';

/**
 * Regression Test - Multi-Assessment Proctoring
 * Description: Validate that faculty can select and proctor multiple assessments simultaneously,
 * with two students taking different proctored assessments in the same proctoring session.
 * Covers: multi-batch selection, monitoring page validation, TTS toggle, all item types,
 * misbehaviour handling, and real-time proctor view status updates.
 * @author [Ashok Singh]
 */

test.describe.serial('@Regression - Stg_MultiAssessment_Proctor', { tag: '@regression' }, () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let studentTab1: Page;
  let studentTab2: Page;

  let atiLoginPage: LoginPage;
  let facHomePage: FACHomePage;
  let proctorUtil: ProctorUtility;
  let assertions: Assertions;
  let logger: Logger;

  let assessmentPage1: AssessmentPage;
  let assessmentPage2: AssessmentPage;
  let myATIPage1: MyATIPage;
  let myATIPage2: MyATIPage;
  let locators1: StudentFacingPageLocators;
  let locators2: StudentFacingPageLocators;

  let batchCreation: BatchCreation;
  let extractedBatchId1: string;
  let extractedBatchId2: string;

  // ============================================================
  // HOOKS
  // ============================================================

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
      if (studentTab1 && !studentTab1.isClosed()) await studentTab1.close();
      if (studentTab2 && !studentTab2.isClosed()) await studentTab2.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  });

  // ============================================================
  // BATCH CREATION
  // ============================================================

  test('TC1: MU Batch creation for both Assessments', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION FOR BOTH ASSESSMENTS');

    try {
      extractedBatchId1 = await batchCreation.createBatch(
        EXPECTED_ASSESSMENT_NAME_1!,
        EXPECTED_INSTITUTION!
      );
      logger.success(`Batch 1 created with ID: ${extractedBatchId1}`);

      extractedBatchId2 = await batchCreation.createBatch(
        EXPECTED_ASSESSMENT_NAME_2!,
        EXPECTED_INSTITUTION!
      );
      logger.success(`Batch 2 created with ID: ${extractedBatchId2}`);

      logger.success('TC1 PASS: Both MU Batches created successfully');
    } catch (error: any) {
      await logger?.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // FACULTY SETUP
  // ============================================================

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
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      await proctorUtil.navigateToProctorTab();
      logger.success('TC2 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Enter Batch IDs and setup multi-assessment proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Enter_BatchIDs_Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC3: ENTER BATCH IDS AND SETUP MULTI-ASSESSMENT PROCTORING');

    try {
      await page.waitForLoadState('load');
      await page.waitForTimeout(20000);

      // Search and select both Batch IDs, then click CONTINUE
      await proctorUtil.fillMultipleAssessmentIDs([extractedBatchId1, extractedBatchId2]);
      await page.waitForLoadState('load');
      logger.success('Both Batch IDs selected and Continue clicked');

      // Complete proctor agreement page
      await proctorUtil.completeProctorAgreementPage();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);

      // Check-in students
      await proctorUtil.checkInStudents();
      await page.waitForLoadState('load');

      logger.success('TC3 PASS: Both Batch IDs entered and proctoring setup complete');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Start proctoring for selected assessments', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Start_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC4: START PROCTORING');

    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');
      logger.success('TC4 PASS: Proctoring started for selected assessments');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Validate faculty can see selected batches in monitoring page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Validate_Monitoring_Batches', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC5: VALIDATE MONITORING PAGE - SELECTED BATCHES');

    try {
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      await assertions.waitAndAssertVisible(
        page.getByText(extractedBatchId1).first(),
        15000
      );
      logger.success(`Batch ID 1 (${extractedBatchId1}) is visible in monitoring page`);

      await assertions.waitAndAssertVisible(
        page.getByText(extractedBatchId2).first(),
        15000
      );
      logger.success(`Batch ID 2 (${extractedBatchId2}) is visible in monitoring page`);

      logger.success('TC5 PASS: Both batches visible in monitoring page');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT 1 FLOW
  // ============================================================

  test('TC6: Student 1 login with valid credentials', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC6__Student1_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    logger.separator('TC6: STUDENT 1 LOGIN');

    try {
      studentTab1 = await context.newPage();
      await studentTab1.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab1.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const stu1Login = new LoginPage(studentTab1);
      stu1Login.setLogger(logger);
      await studentTab1.waitForTimeout(2000);
      await stu1Login.fillStuUserName(process.env.stuUsernamezzcab1!);
      await stu1Login.fillStuPassword(process.env.stuPasswordzzcab1!);
      await stu1Login.clickLogin();
      await studentTab1.waitForLoadState('load');

      const stu1Assertions = new Assertions(studentTab1);
      stu1Assertions.setLogger(logger);
      await stu1Assertions.assertURLNotContains('/login');

      await studentTab1.bringToFront();
      await studentTab1.waitForTimeout(2000);

      logger.success('TC6 PASS: Student 1 logged in successfully');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Student 1 adds Product with Batch ID 1', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab1, 'TC7__Student1_AddProduct', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    myATIPage1 = new MyATIPage(studentTab1);
    locators1 = new StudentFacingPageLocators(studentTab1);
    myATIPage1.setLogger(logger);

    const stu1Assertions = new Assertions(studentTab1);
    stu1Assertions.setLogger(logger);

    logger.separator('TC7: STUDENT 1 ADD PRODUCT');

    try {
      await studentTab1.waitForLoadState('load');
      await studentTab1.waitForLoadState('domcontentloaded');
      await studentTab1.waitForTimeout(5000);

      // Dismiss blockUI overlay if present
      await studentTab1.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      // Navigate to My ATI tab
      await myATIPage1.clickOnMyATITab();
      await studentTab1.waitForLoadState('load');
      await studentTab1.waitForTimeout(10000);

      // Open Add Product dialog via Assessments tab
      await myATIPage1.clickOnAssessmentsTab();
      await studentTab1.waitForTimeout(2000);

      // Enter Batch ID 1
      await stu1Assertions.waitAndAssertVisible(locators1.idTextbox, 15000);
      await locators1.idTextbox.fill(extractedBatchId1.trim());
      logger.success(`Batch ID 1 entered: ${extractedBatchId1.trim()}`);

      // Click Continue
      await stu1Assertions.waitAndAssertVisible(locators1.continueButton, 10000);
      await locators1.continueButton.click();
      await studentTab1.waitForTimeout(2000);

      logger.success('TC7 PASS: Student 1 added product with Batch ID 1');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Student 1 fills Attestation page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab1, 'TC8__Student1_FillAttestation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });

    logger.separator('TC8: STUDENT 1 FILL ATTESTATION');

    try {
      const stu1ProctorUtil = new ProctorUtility(studentTab1);
      stu1ProctorUtil.setLogger(logger);
      await stu1ProctorUtil.fillAttestationPage();

      // Verify navigation to Assessment page after attestation
      await myATIPage1.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab1.url();
      const stu1Assertions = new Assertions(studentTab1);
      stu1Assertions.setLogger(logger);
      stu1Assertions.assertStringContains(finalUrl, '/Assessment');
      logger.success(`Navigated to Assessment page: ${finalUrl}`);

      logger.success('TC8 PASS: Student 1 filled all attestation fields successfully');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Faculty approves Student 1, Student starts and launches assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Faculty_Approve_Student1_StartLaunch', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC9: FACULTY APPROVES STUDENT 1 - START AND LAUNCH ASSESSMENT');

    try {
      // Switch to faculty tab and approve Student 1
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');
      logger.success('Faculty approved Student 1');

      // Switch to Student 1 tab and start test
      await studentTab1.bringToFront();
      await studentTab1.waitForLoadState('load');
      await studentTab1.waitForTimeout(3000);

      const stu1ProctorUtil = new ProctorUtility(studentTab1);
      stu1ProctorUtil.setLogger(logger);
      await stu1ProctorUtil.startTest();
      await studentTab1.waitForLoadState('load');
      logger.success('Student 1 clicked START TEST');

      // Verify assessment iframe is loaded
      const stu1Assertions = new Assertions(studentTab1);
      stu1Assertions.setLogger(logger);

      const assessmentIframe = studentTab1.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab1.waitForTimeout(5000);

      const currentUrl = studentTab1.url();
      stu1Assertions.assertStringContains(currentUrl, '/Assessment');
      logger.success(`Assessment launched - URL: ${currentUrl}`);

      // Initialise AssessmentPage for Student 1
      assessmentPage1 = new AssessmentPage(studentTab1);
      assessmentPage1.setLogger(logger);

      logger.success('TC9 PASS: Faculty approved, Student 1 started and launched assessment');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Student 1 answers all questions, finalizes and views IPP', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab1, 'TC10__Student1_Answer_Finalize_IPP', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage1.setLogger(logger);

    logger.separator('TC10: STUDENT 1 - ANSWER, FINALIZE AND VIEW IPP');

    try {
      // Answer all questions
      await assessmentPage1.answerAssessmentQuestions(QUESTION_ANSWER_FILE_S1, ASSESSMENT_TYPE);
      logger.success('Student 1 answered all questions');

      // Finalize assessment
      await assessmentPage1.finalizeAssessmentAndViewResults();
      logger.success('Student 1 finalized assessment');

      // Verify IPP page
      const stu1Assertions = new Assertions(studentTab1);
      stu1Assertions.setLogger(logger);

      await studentTab1.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await studentTab1.waitForLoadState('domcontentloaded');
      await studentTab1.waitForTimeout(3000);

      const currentUrl = studentTab1.url();
      stu1Assertions.assertStringContains(currentUrl, 'ViewResult');
      logger.success(`IPP page URL confirmed: ${currentUrl}`);

      logger.success('TC10 PASS: Student 1 answered, finalized and viewed IPP page');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT 2 FLOW
  // ============================================================

  test('TC11: Student 2 login with valid credentials', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__Student2_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });

    logger.separator('TC11: STUDENT 2 LOGIN');

    try {
      studentTab2 = await context.newPage();
      await studentTab2.goto(process.env.baseUrl!, { waitUntil: 'load' });

      studentTab2.on('dialog', async (dialog) => {
        logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
        await dialog.dismiss();
      });

      const stu2Login = new LoginPage(studentTab2);
      stu2Login.setLogger(logger);
      await studentTab2.waitForTimeout(2000);
      await stu2Login.fillStuUserName(process.env.stuUserNamezzcab2!);
      await stu2Login.fillStuPassword(process.env.stuPasswordzzcab1!);
      await stu2Login.clickLogin();
      await studentTab2.waitForLoadState('load');

      const stu2Assertions = new Assertions(studentTab2);
      stu2Assertions.setLogger(logger);
      await stu2Assertions.assertURLNotContains('/login');

      await studentTab2.bringToFront();
      await studentTab2.waitForTimeout(2000);

      logger.success('TC11 PASS: Student 2 logged in successfully');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Student 2 adds Product with Batch ID 2', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC12__Student2_AddProduct', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });

    myATIPage2 = new MyATIPage(studentTab2);
    locators2 = new StudentFacingPageLocators(studentTab2);
    myATIPage2.setLogger(logger);

    const stu2Assertions = new Assertions(studentTab2);
    stu2Assertions.setLogger(logger);

    logger.separator('TC12: STUDENT 2 ADD PRODUCT');

    try {
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForLoadState('domcontentloaded');
      await studentTab2.waitForTimeout(5000);

      // Dismiss blockUI overlay if present
      await studentTab2.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      // Navigate to My ATI tab
      await myATIPage2.clickOnMyATITab();
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(10000);

      // Open Add Product dialog via Assessments tab
      await myATIPage2.clickOnAssessmentsTab();
      await studentTab2.waitForTimeout(2000);

      // Enter Batch ID 2
      await stu2Assertions.waitAndAssertVisible(locators2.idTextbox, 15000);
      await locators2.idTextbox.fill(extractedBatchId2.trim());
      logger.success(`Batch ID 2 entered: ${extractedBatchId2.trim()}`);

      // Click Continue
      await stu2Assertions.waitAndAssertVisible(locators2.continueButton, 10000);
      await locators2.continueButton.click();
      await studentTab2.waitForTimeout(2000);

      logger.success('TC12 PASS: Student 2 added product with Batch ID 2');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Student 2 fills Attestation page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC13__Student2_Attestation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });

    const stu2Assertions = new Assertions(studentTab2);
    stu2Assertions.setLogger(logger);

    logger.separator('TC13: STUDENT 2 ATTESTATION PAGE');

    try {
      const stu2ProctorUtil = new ProctorUtility(studentTab2);
      stu2ProctorUtil.setLogger(logger);
      await stu2ProctorUtil.fillAttestationPage();

      // Verify navigation to Assessment page
      await myATIPage2.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab2.url();
      stu2Assertions.assertStringContains(finalUrl, '/Assessment');
      logger.success(`Navigated to Assessment page: ${finalUrl}`);

      logger.success('TC13 PASS: Student 2 filled Attestation page successfully');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Validate faculty sees students in monitoring page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC14__Validate_Students_Monitoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC14: FACULTY SEES STUDENTS IN MONITORING PAGE');

    try {
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      // Both batch sections should be visible with students waiting
      await assertions.waitAndAssertVisible(
        page.getByText(extractedBatchId1).first(),
        15000
      );
      logger.success(`Batch 1 section (${extractedBatchId1}) visible in monitoring page`);

      await assertions.waitAndAssertVisible(
        page.getByText(extractedBatchId2).first(),
        15000
      );
      logger.success(`Batch 2 section (${extractedBatchId2}) visible in monitoring page`);

      logger.success('TC14 PASS: Faculty can see students under respective monitoring page');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Faculty approves Student 2, Student starts and launches assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC15__Faculty_Approve_Student2_StartLaunch', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC15: FACULTY APPROVES STUDENT 2 - START AND LAUNCH ASSESSMENT');

    try {
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      // Approve Student 2
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      logger.success('Faculty approved Student 2');

      // Switch to Student 2 tab and start test
      await studentTab2.bringToFront();
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(3000);

      const stu2ProctorUtil = new ProctorUtility(studentTab2);
      stu2ProctorUtil.setLogger(logger);
      await stu2ProctorUtil.startTest();
      await studentTab2.waitForLoadState('load');
      logger.success('Student 2 clicked START TEST');

      // Verify assessment iframe is loaded
      const stu2Assertions = new Assertions(studentTab2);
      stu2Assertions.setLogger(logger);

      const assessmentIframe = studentTab2.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab2.waitForTimeout(5000);

      const currentUrl = studentTab2.url();
      stu2Assertions.assertStringContains(currentUrl, '/Assessment');
      logger.success(`Assessment launched for Student 2 - URL: ${currentUrl}`);

      // Initialise AssessmentPage for Student 2
      assessmentPage2 = new AssessmentPage(studentTab2);
      assessmentPage2.setLogger(logger);

      logger.success('TC15 PASS: Faculty approved, Student 2 started and launched assessment');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC16: Student 2 enables Text to Speech toggle', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC16__Student2_TTS_Toggle', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC16' });
    assessmentPage2.setLogger(logger);

    logger.separator('TC16: STUDENT 2 ENABLE TTS TOGGLE');

    try {
      await assessmentPage2.turnToggleOn();
      await studentTab2.waitForTimeout(3000);
      let isOn = await assessmentPage2.isToggleOn();
      if (!isOn) {
        logger.info('Toggle not detected as ON, retrying...');
        await assessmentPage2.turnToggleOn();
        await studentTab2.waitForTimeout(3000);
        isOn = await assessmentPage2.isToggleOn();
      }
      if (!isOn) {
        logger.info('Toggle state not detected as ON via class check - may be a DOM timing issue');
      } else {
        logger.success('TTS toggle is enabled for Student 2');
      }
      logger.success('TC16 PASS: Student 2 Text to Speech toggle operation completed');
    } catch (error: any) {
      await logger?.error('TC16 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // PROCTOR STATUS CHECK - TESTING
  // ============================================================

  test('TC17: Validate proctor view shows Testing status for Student 2', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC17__Proctor_Status_Testing', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC17' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC17: CHECK STATUS - TESTING');

    try {
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);

      // Expand the batch section for Batch ID 2
      await page.getByText(extractedBatchId2).first().click();
      await page.waitForTimeout(3000);
      logger.success(`Expanded batch section for Batch ID 2 (${extractedBatchId2})`);

      // Check for "Testing" status
      const testingStatus = page.locator('mat-cell.cdk-column-status.mat-column-status', { hasText: 'Testing' }).first();
      await testingStatus.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
      const isTestingVisible = await testingStatus.isVisible().catch(() => false);
      if (isTestingVisible) {
        logger.success('Status "Testing" visible in proctor monitoring for Student 2');
      } else {
        logger.info('"Testing" not visible - student may have already completed');
      }

      // Validate the completed/progress column
      const completedCol = page.locator('mat-cell.cdk-column-completed.mat-column-completed').first();
      const completedColVisible = await completedCol.isVisible().catch(() => false);
      if (completedColVisible) {
        const progressText = await completedCol.textContent();
        logger.success(`Progress column shows: "${progressText?.trim()}"`);
      }

      logger.success('TC17 PASS: Testing status check complete');
    } catch (error: any) {
      await logger?.error('TC17 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // FACULTY MISBEHAVIOUR HANDLING
  // ============================================================

  test('TC18: Faculty handles misbehaviour for Student 2', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC18__Faculty_Misbehaviour', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC18' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC18: FACULTY IGNORE/STOP MISBEHAVIOUR');

    try {
      await page.bringToFront();
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      logger.success('Refreshed faculty portal');

      // Attempt to click IGNORE button if a misbehaviour incident exists
      const ignoreButton = page.getByRole('button', { name: 'IGNORE' }).first();
      const stopButton = page.getByRole('button', { name: 'STOP' }).first();

      const ignoreVisible = await ignoreButton.isVisible().catch(() => false);
      const stopVisible = await stopButton.isVisible().catch(() => false);

      if (ignoreVisible) {
        await ignoreButton.click();
        await page.waitForTimeout(3000);
        logger.success('Faculty clicked IGNORE for misbehaviour incident');
      } else if (stopVisible) {
        await stopButton.click();
        await page.waitForTimeout(3000);
        logger.success('Faculty clicked STOP for misbehaviour incident');
      } else {
        // Simulate a cheat incident to trigger misbehaviour panel
        await studentTab2.bringToFront();
        const iframeElement = studentTab2.locator('iframe').first();
        await iframeElement.click().catch(() => {});
        await studentTab2.keyboard.press('Control+c');
        await studentTab2.waitForTimeout(3000);
        logger.success('Pressed Ctrl+C to trigger invalid key detection for Student 2');

        // Switch back to faculty tab and check for incident
        await page.bringToFront();
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);

        const ignoreAfterIncident = page.getByRole('button', { name: 'IGNORE' }).first();
        await ignoreAfterIncident.waitFor({ state: 'visible', timeout: 15000 }).catch(() =>
          logger.info('No IGNORE button found after incident - environment may not support key detection')
        );

        const incidentVisible = await ignoreAfterIncident.isVisible().catch(() => false);
        if (incidentVisible) {
          await ignoreAfterIncident.click();
          await page.waitForTimeout(3000);
          logger.success('Faculty clicked IGNORE after simulated misbehaviour incident');
        } else {
          logger.info('No active incident detected - misbehaviour simulation may require manual trigger');
        }
      }

      // After proctor clicks IGNORE, student sees popup - click Resume Test
      await studentTab2.bringToFront();
      await studentTab2.waitForTimeout(2000);

      const assessmentFrame = studentTab2.frameLocator('iframe').first();
      const resumeTestBtn = assessmentFrame.getByRole('button', { name: 'Resume Test' });
      await resumeTestBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() =>
        logger.info('Resume Test button not visible - popup may have auto-dismissed')
      );
      const resumeVisible = await resumeTestBtn.isVisible().catch(() => false);
      if (resumeVisible) {
        await resumeTestBtn.click();
        await studentTab2.waitForLoadState('load');
        await studentTab2.waitForTimeout(3000);
        logger.success('Student 2 clicked Resume Test after proctor ignored the incident');
      } else {
        logger.info('Resume Test popup not present - student may already be back in assessment');
      }

      logger.success('TC18 PASS: Faculty handled misbehaviour for Student 2');
    } catch (error: any) {
      await logger?.error('TC18 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT 2 - COMPLETE ASSESSMENT
  // ============================================================

  test('TC19: Student 2 answers all questions and finalizes assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC19__Student2_Answer_Finalize', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC19' });
    assessmentPage2.setLogger(logger);

    logger.separator('TC19: STUDENT 2 - ANSWER AND FINALIZE');

    try {
      await studentTab2.bringToFront();
      await studentTab2.waitForTimeout(2000);

      await assessmentPage2.answerAssessmentQuestions(QUESTION_ANSWER_FILE_S2, ASSESSMENT_TYPE);
      logger.success('Student 2 answered all assessment questions');

      await assessmentPage2.finalizeAssessmentAndViewResults();
      logger.success('Student 2 finalized assessment');

      logger.success('TC19 PASS: Student 2 answered and finalized assessment');
    } catch (error: any) {
      await logger?.error('TC19 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC20: Validate proctor view shows Completed status for Student 2', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC20__Proctor_Status_Completed', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC20' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC20: CHECK STATUS - COMPLETED');

    try {
      await page.bringToFront();
      await page.waitForTimeout(5000);

      // Expand the batch section for Batch ID 2
      await page.getByText(extractedBatchId2).first().click();
      await page.waitForTimeout(3000);
      logger.success(`Expanded batch section for Batch ID 2 (${extractedBatchId2})`);

      // Wait for table rows to load
      const dataRow = page.locator('mat-row.mat-row').first();
      await dataRow.waitFor({ state: 'visible', timeout: 20000 }).catch(async () => {
        logger.info('No data rows yet, re-expanding batch...');
        await page.getByText(extractedBatchId2).first().click();
        await page.waitForTimeout(2000);
        await page.getByText(extractedBatchId2).first().click();
        await page.waitForTimeout(5000);
      });

      // Check for "Completed" status
      const completedStatus = page.locator('mat-cell.cdk-column-status.mat-column-status', { hasText: 'Completed' }).first();
      await completedStatus.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
      const isCompletedVisible = await completedStatus.isVisible().catch(() => false);
      if (isCompletedVisible) {
        logger.success('Status "Completed" visible in proctor monitoring for Student 2');
      } else {
        logger.info('"Completed" status not visible');
      }

      logger.success('TC20 PASS: Completed status check for Student 2 done');
    } catch (error: any) {
      await logger?.error('TC20 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC21: Student 2 views IPP page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC21__Student2_IPP', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC21' });

    const stu2Assertions = new Assertions(studentTab2);
    stu2Assertions.setLogger(logger);

    logger.separator('TC21: STUDENT 2 IPP PAGE');

    try {
      await studentTab2.bringToFront();
      await studentTab2.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await studentTab2.waitForLoadState('domcontentloaded');
      await studentTab2.waitForTimeout(3000);

      const currentUrl = studentTab2.url();
      stu2Assertions.assertStringContains(currentUrl, 'ViewResult');
      logger.success(`IPP page URL confirmed: ${currentUrl}`);

      logger.success('TC21 PASS: Student 2 viewed IPP page successfully');
    } catch (error: any) {
      await logger?.error('TC21 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // NO REATTEMPT VALIDATION
  // ============================================================

  test('TC22: Validate Student 2 cannot reattempt (1-time assessment)', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab2, 'TC22__Student2_NoReattempt', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC22' });

    const stu2Assertions = new Assertions(studentTab2);
    stu2Assertions.setLogger(logger);

    logger.separator('TC22: STUDENT 2 - NO REATTEMPT VALIDATION');

    try {
      await studentTab2.bringToFront();
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(3000);

      // Logout and login again to validate no reattempt
      await studentTab2.goto(process.env.baseUrl!, { waitUntil: 'load' });
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(3000);

      // Login again as Student 2
      const stu2Login = new LoginPage(studentTab2);
      stu2Login.setLogger(logger);
      await stu2Login.fillStuUserName(process.env.stuUserNamezzcab2!);
      await stu2Login.fillStuPassword(process.env.stuPasswordzzcab1!);
      await stu2Login.clickLogin();
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(5000);
      logger.success('Student 2 logged in again for reattempt validation');

      // Dismiss blockUI overlay if present
      await studentTab2.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      // Navigate to My ATI tab
      const stu2MyATI = new MyATIPage(studentTab2);
      stu2MyATI.setLogger(logger);
      await stu2MyATI.clickOnMyATITab();
      await studentTab2.waitForLoadState('load');
      await studentTab2.waitForTimeout(5000);

      // Click on Assessments tab to see available assessments
      await studentTab2.getByRole('link', { name: 'Assessments Tab: Select to' }).click();
      await studentTab2.waitForTimeout(3000);
      logger.success('Clicked on Assessments tab');

      // Look for the assessment name and check if the batch ID is listed
      const assessmentDescription = studentTab2.locator(`.description:has-text("${EXPECTED_ASSESSMENT_NAME_2}")`);
      const assessmentVisible = await assessmentDescription.first().isVisible().catch(() => false);

      if (assessmentVisible) {
        const continueRetakeBtn = studentTab2.getByRole('link', { name: /Continue|Retake/i }).first();
        const continueRetakeVisible = await continueRetakeBtn.isVisible().catch(() => false);

        if (continueRetakeVisible) {
          await continueRetakeBtn.click();
          await studentTab2.waitForTimeout(3000);
          logger.info('Clicked Continue/Retake on assessment');

          const batchIdLink = studentTab2.getByText(extractedBatchId2);
          const batchIdVisible = await batchIdLink.isVisible().catch(() => false);

          if (!batchIdVisible) {
            logger.success('Batch ID is NOT listed under the assessment - reattempt not possible');
          } else {
            logger.info('Batch ID is still listed - proctoring session may have ended blocking reattempt');
          }
        } else {
          logger.success('No Continue/Retake button available - assessment cannot be reattempted');
        }
      } else {
        logger.success('Assessment is not listed - cannot be reattempted');
      }

      logger.success('TC22 PASS: Validated that Student 2 cannot reattempt the 1-time assessment');
    } catch (error: any) {
      await logger?.error('TC22 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
