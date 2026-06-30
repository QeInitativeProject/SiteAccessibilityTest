/**
 * Regression Test - Proctored Scramble Validation
 * Description: Validate that question order and option order are scrambled
 * across two students for the same proctored assessment batch.
 *
 * Notes:
 * - This test assumes the target assessment has scramble enabled.
 * - If scramble is not enabled in assessment configuration, validation will fail by design.
 * @author [Ashok Singh]
 */

import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { FACHomePage } from '@delegates/FACHomePage';
import { MyATIPage } from '@delegates/MyATIPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { BatchCreation } from '@utils/BatchCreation';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { ScrambleUtil, QuestionSnapshot } from '@utils/ScrambleUtil';

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_Scramble';

const STUDENT1_USERNAME = process.env.stuUsernameauto12;
const STUDENT1_PASSWORD = process.env.stuPasswordauto1;
const STUDENT2_USERNAME = process.env.stuUsernameauto10;
const STUDENT2_PASSWORD = process.env.stuPasswordauto1;
const QUESTIONS_TO_COMPARE = 4;

test.describe.serial('@Regression - Stg_Proctor_Scramble', { tag: '@regression' }, () => {
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
  let student1Snapshots: QuestionSnapshot[] = [];
  let student2Snapshots: QuestionSnapshot[] = [];

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

  // ============================================================
  // BATCH CREATION & FACULTY SETUP
  // ============================================================

  test('TC1: MU Batch creation for scramble validation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    assertions.setLogger(logger);

    logger.separator('TC1: MU BATCH CREATION FOR SCRAMBLE VALIDATION');

    try {
      extractedBatchId = await batchCreation.createBatch(EXPECTED_ASSESSMENT_NAME!, EXPECTED_INSTITUTION!);
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
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab3!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab3!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      await assertions.assertURLNotContains('/login');

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
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');

      logger.success('TC2 PASS: Faculty logged in and proctoring started');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT 1 FLOW
  // ============================================================

  test('TC3: Student 1 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Student1_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    proctorUtil.setLogger(logger);

    logger.separator('TC3: STUDENT 1 LOGIN AND START ASSESSMENT');

    try {
      student1Context = await browser.newContext();
      student1Tab = await student1Context.newPage();
      await student1Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const stu1Login = new LoginPage(student1Tab);
      stu1Login.setLogger(logger);
      await student1Tab.waitForTimeout(2000);
      await stu1Login.fillStuUserName(STUDENT1_USERNAME!);
      await stu1Login.fillStuPassword(STUDENT1_PASSWORD!);
      await stu1Login.clickLogin();
      await student1Tab.waitForLoadState('load');

      const myATIPage1 = new MyATIPage(student1Tab);
      myATIPage1.setLogger(logger);
      const locators1 = new StudentFacingPageLocators(student1Tab);
      const stu1Assertions = new Assertions(student1Tab);
      stu1Assertions.setLogger(logger);

      await student1Tab.waitForTimeout(5000);
      await student1Tab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      await myATIPage1.addProductForProctoredAssessment(extractedBatchId, locators1, stu1Assertions);
      logger.success('Student 1 entered Batch ID');

      const stu1ProctorUtil = new ProctorUtility(student1Tab);
      stu1ProctorUtil.setLogger(logger);
      await stu1ProctorUtil.fillAttestationPage();

      await myATIPage1.waitForPageLoadAndVerifyNavigation('/Assessment');

      // Faculty approves student 1
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      // Student 1 starts test
      await student1Tab.bringToFront();
      await student1Tab.waitForLoadState('load');
      await student1Tab.waitForTimeout(5000);
      await stu1ProctorUtil.startTest();
      await student1Tab.waitForLoadState('load');

      const assessmentIframe = student1Tab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await student1Tab.waitForTimeout(5000);

      logger.success('TC3 PASS: Student 1 logged in and started assessment');
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Student 1 captures scrambled question sequence', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student1Tab, 'TC4__Student1_Capture_Sequence', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });

    logger.separator('TC4: STUDENT 1 CAPTURE QUESTION/OPTION ORDER');

    try {
      const s1Locators = new StudentFacingPageLocators(student1Tab);
      const scrambleUtil1 = new ScrambleUtil(student1Tab);
      scrambleUtil1.setLogger(logger);

      student1Snapshots = await scrambleUtil1.captureQuestionSequence(s1Locators, QUESTIONS_TO_COMPARE);

      logger.info(`Student 1 sequence captured: ${student1Snapshots.map((q) => q.stem.substring(0, 40)).join(' | ')}`);
      logger.success('TC4 PASS: Student 1 question/option sequence captured');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // STUDENT 2 FLOW
  // ============================================================

  test('TC5: Student 2 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Student2_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    proctorUtil.setLogger(logger);

    logger.separator('TC5: STUDENT 2 LOGIN AND START ASSESSMENT');

    try {
      student2Context = await browser.newContext();
      student2Tab = await student2Context.newPage();
      await student2Tab.goto(process.env.baseUrl!, { waitUntil: 'load' });

      const stu2Login = new LoginPage(student2Tab);
      stu2Login.setLogger(logger);
      await student2Tab.waitForTimeout(2000);
      await stu2Login.fillStuUserName(STUDENT2_USERNAME!);
      await stu2Login.fillStuPassword(STUDENT2_PASSWORD!);
      await stu2Login.clickLogin();
      await student2Tab.waitForLoadState('load');

      const myATIPage2 = new MyATIPage(student2Tab);
      myATIPage2.setLogger(logger);
      const locators2 = new StudentFacingPageLocators(student2Tab);
      const stu2Assertions = new Assertions(student2Tab);
      stu2Assertions.setLogger(logger);

      await student2Tab.waitForTimeout(5000);
      await student2Tab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      await myATIPage2.addProductForProctoredAssessment(extractedBatchId, locators2, stu2Assertions);
      logger.success('Student 2 entered Batch ID');

      const stu2ProctorUtil = new ProctorUtility(student2Tab);
      stu2ProctorUtil.setLogger(logger);
      await stu2ProctorUtil.fillAttestationPage();

      await myATIPage2.waitForPageLoadAndVerifyNavigation('/Assessment');

      // Faculty approves student 2
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      // Student 2 starts test
      await student2Tab.bringToFront();
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(5000);
      await stu2ProctorUtil.startTest();
      await student2Tab.waitForLoadState('load');

      const assessmentIframe = student2Tab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await student2Tab.waitForTimeout(5000);

      logger.success('TC5 PASS: Student 2 logged in and started assessment');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Student 2 captures scrambled question sequence', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student2Tab, 'TC6__Student2_Capture_Sequence', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });

    logger.separator('TC6: STUDENT 2 CAPTURE QUESTION/OPTION ORDER');

    try {
      const s2Locators = new StudentFacingPageLocators(student2Tab);
      const scrambleUtil2 = new ScrambleUtil(student2Tab);
      scrambleUtil2.setLogger(logger);

      student2Snapshots = await scrambleUtil2.captureQuestionSequence(s2Locators, QUESTIONS_TO_COMPARE);

      logger.info(`Student 2 sequence captured: ${student2Snapshots.map((q) => q.stem.substring(0, 40)).join(' | ')}`);
      logger.success('TC6 PASS: Student 2 question/option sequence captured');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  // ============================================================
  // SCRAMBLE VALIDATION
  // ============================================================

  test('TC7: Validate questions and options are scrambled', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Validate_Scrambling', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });

    logger.separator('TC7: SCRAMBLE ASSERTIONS');

    try {
      expect(student1Snapshots.length).toBeGreaterThan(0);
      expect(student2Snapshots.length).toBeGreaterThan(0);

      const student1QuestionOrder = student1Snapshots.map((q) => q.stem).join(' || ');
      const student2QuestionOrder = student2Snapshots.map((q) => q.stem).join(' || ');

      expect(
        student1QuestionOrder,
        'Question order is identical for both students. Ensure question scramble is enabled in assessment configuration.'
      ).not.toBe(student2QuestionOrder);

      const student2ByStem = new Map(student2Snapshots.map((q) => [q.stem, q.options]));

      let optionOrderDiffCount = 0;
      for (const q1 of student1Snapshots) {
        const q2Options = student2ByStem.get(q1.stem);
        if (!q2Options || q1.options.length < 2 || q2Options.length < 2) continue;

        if (q1.options.join('||') !== q2Options.join('||')) {
          optionOrderDiffCount++;
        }
      }

      expect(
        optionOrderDiffCount,
        'No option-order difference found for common questions. Ensure option scramble is enabled in assessment configuration.'
      ).toBeGreaterThan(0);

      logger.success(`Question order is scrambled across students`);
      logger.success(`Option order differs for ${optionOrderDiffCount} common question(s)`);
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
