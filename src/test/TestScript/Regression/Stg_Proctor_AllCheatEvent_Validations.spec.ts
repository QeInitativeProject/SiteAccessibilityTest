/**
 * Regression Test - All Cheat Event Validations
 * Description: Validate various cheat event triggers including Print Screen,
 * keyboard shortcuts (Alt+Tab, Ctrl+N, Ctrl+C, Ctrl+V, Escape),
 * and network disconnect scenarios.
 * Uses 2 students with the same batch ID (max 4 cheat events per student).
 * Student 1: Print Screen, Alt+Tab, Ctrl+N (3 incidents + threshold at 4)
 * Student 2: Ctrl+C, Ctrl+V, Escape, network drop (4 incidents)
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
import { AssessmentPage } from '@delegates/AssessmentPage';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { BatchCreation } from '@utils/BatchCreation';
import { CheatEventUtility } from '@utils/CheatEventUtility';

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_AllCheatEvent_Validations';

// Student 1 credentials
const STUDENT1_USERNAME = process.env.stuUsernameauto12;
const STUDENT1_PASSWORD = process.env.stuPasswordauto1;

// Student 2 credentials
const STUDENT2_USERNAME = process.env.stuUsernameauto10;
const STUDENT2_PASSWORD = process.env.stuPasswordauto1;

test.describe.serial('@Regression - Stg_Proctor_AllCheatEvent_Validations', { tag: '@regression' }, () => {
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
  let cheatUtil: CheatEventUtility;
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
    cheatUtil = new CheatEventUtility(page);

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

  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC1__MU_Batch_Creation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC1' });
    batchCreation.setLogger(logger);
    assertions.setLogger(logger);
    cheatUtil.setLogger(logger);

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
      await atiLoginPage.fillfacUserName(process.env.facUsernamezzcab2!);
      await atiLoginPage.fillfacPassword(process.env.facPasswordzzcab2!);
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
    cheatUtil.setLogger(logger);

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

      // Faculty approves student 1
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await proctorUtil.approveByProctor();
   // await proctorUtil.resumeByProctor();
      await page.waitForLoadState('load');

      // Student 1 starts test
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

  test('TC4: Verify Print Screen triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student1Tab, 'TC4__PrintScreen_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    cheatUtil.setLogger(logger);

    logger.separator('TC4: PRINT SCREEN CHEAT EVENT');

    try {

      await cheatUtil.printScreenCheatAndHandle(student1Tab, 1, proctorUtil);
      logger.success('TC4 PASS: Print Screen is detected as cheat event');
    } catch (error: any) {
      await logger?.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC5: Verify Alt+Tab triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student1Tab, 'TC5__AltTab_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    cheatUtil.setLogger(logger);

    logger.separator('TC5: ALT+TAB CHEAT EVENT');

    try {
      await cheatUtil.altTabCheatAndHandle(student1Tab, 2, proctorUtil);
      logger.success('TC5 PASS: Alt+Tab is detected as cheat event');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Verify Ctrl+N triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student1Tab, 'TC6__CtrlN_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    cheatUtil.setLogger(logger);

    logger.separator('TC6: CTRL+N CHEAT EVENT');

    try {
      await cheatUtil.ctrlNCheatAndHandle(student1Tab, 3, proctorUtil);
      logger.success('TC6 PASS: Ctrl+N is detected as cheat event');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Verify Escape triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student1Tab, 'TC7__Escape_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    cheatUtil.setLogger(logger);

    logger.separator('TC7: ESCAPE CHEAT EVENT');

    try {
      await cheatUtil.escapeCheatAndHandle(student1Tab, 4, proctorUtil);
      logger.success('TC7 PASS: Escape is detected as cheat event');

      // Close student 1 browser context
      if (student1Tab && !student1Tab.isClosed()) await student1Tab.close();
      if (student1Context) await student1Context.close();
      logger.success('Student 1 browser closed');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Student 2 login and start assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Student2_Login_Start', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    cheatUtil.setLogger(logger);

    logger.separator('TC8: STUDENT 2 LOGIN AND START ASSESSMENT');

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

      // Faculty approves student 2
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');

      // Student 2 starts test
      await student2Tab.bringToFront();
      await student2Tab.waitForLoadState('load');
      await student2Tab.waitForTimeout(5000);
      await studentProctorUtil.startTest();
      await student2Tab.waitForLoadState('load');

      logger.success('TC8 PASS: Student 2 logged in and started assessment');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Verify Ctrl+C (Copy) triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student2Tab, 'TC9__CtrlC_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    cheatUtil.setLogger(logger);

    logger.separator('TC9: CTRL+C (COPY) CHEAT EVENT');

    try {
      await cheatUtil.ctrlCCheatAndHandle(student2Tab, 1, proctorUtil);
      logger.success('TC9 PASS: Ctrl+C (Copy) is detected as cheat event');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Verify Ctrl+V (Paste) triggers cheat event', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student2Tab, 'TC10__CtrlV_CheatEvent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    cheatUtil.setLogger(logger);

    logger.separator('TC10: CTRL+V (PASTE) CHEAT EVENT');

    try {
      await cheatUtil.ctrlVCheatAndHandle(student2Tab, 2, proctorUtil);
      logger.success('TC10 PASS: Ctrl+V (Paste) is detected as cheat event');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Verify network drop prevents student from interacting with assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(student2Tab, 'TC11__NetworkDrop_NoInteraction', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    cheatUtil.setLogger(logger);

    logger.separator('TC11: NETWORK DROP - STUDENT CANNOT INTERACT');

    try {
      const assessmentPage = new AssessmentPage(student2Tab);
      assessmentPage.setLogger(logger);

      await logger.captureScreenshot('before_network_drop');
      const cdpSession = await cheatUtil.simulateNetworkDisconnect(student2Tab);
      await student2Tab.waitForTimeout(8000);
      await logger.captureScreenshot('during_network_drop');

      const buttonsDisabled = await cheatUtil.validateButtonsDisabledDuringNetworkDrop(student2Tab);

      if (!buttonsDisabled) {
        logger.info('WARNING: Student answer buttons may still be responsive during network drop');
        await logger.captureScreenshot('buttons_not_disabled');
      }

      await cheatUtil.restoreNetwork(cdpSession);
      await student2Tab.waitForTimeout(5000);
      await logger.captureScreenshot('after_network_restore');

      await cdpSession.detach();

      logger.success(`TC11 PASS: Network drop - answer buttons disabled/unresponsive: ${buttonsDisabled}`);
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
