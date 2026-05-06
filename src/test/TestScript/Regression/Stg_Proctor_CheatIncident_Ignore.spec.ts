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

/**
 * Regression Test - Proctor Cheat Incident Ignore Flow
 * Description: Validate that when faculty/proctor ignores the incident, student should be able to resume the test
 * @author [Ashish Ranjan]
 */

test.describe.serial('@Smoke - Stg_Proctor_CheatIncident_Ignore', { tag: '@smoke' }, () => {
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
      headless: process.env.CI ? true : false
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
      logger.success('TC2 PASS: Faculty logged in successfully');
    } catch (error: any) {
      await logger?.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC3: Navigate to Proctor Tab', async ({}, testInfo) => {
    logger = new Logger(page, 'TC3__Navigate_to_Proctor_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC3' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
  
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      logger.success('TC3 PASS: Navigated to Proctor Tab');
      await page.waitForTimeout(10000);
    } catch (error: any) {
      await logger?.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC4: Enter Assessment ID and Setup Proctoring', async ({}, testInfo) => {
    logger = new Logger(page, 'TC4__Enter_Assessment_ID_and_Setup_Proctoring', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC4' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);
    
    logger.step('TC4: Setup Proctoring with Assessment ID');
    logger.success(`Using Assessment ID: ${extractedBatchId}`);

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

  test('TC5: Start Proctoring Session and Student Login', async ({}, testInfo) => {
    logger = new Logger(page, 'TC5__Start_Proctoring_Session_and_Student_Login', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC5' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);
    
    try {
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');

      // Create a new student tab and login
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });
      
      // Student login
      const studentLoginPage = new LoginPage(studentTab);
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab1!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab1!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');
      
      logger.success('Student logged in successfully in new tab');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      await studentTab.waitForLoadState('load');
      
      logger.success('TC5 PASS: Student logged in');
    } catch (error: any) {
      await logger?.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC6: Add Product - Enter Password and Complete', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC6__Add_Product_Password_Entry', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC6' });
    
    // Initialize MyATI page and locators for student tab
    myATIPage = new MyATIPage(studentTab);
    assessmentPage = new AssessmentPage(studentTab);
    locators = new StudentFacingPageLocators(studentTab);
    myATIPage.setLogger(logger);
    assessmentPage.setLogger(logger);
    
    // Create new Assertions instance for studentTab
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      await studentTab.waitForLoadState('load');
      await studentTab.waitForLoadState('domcontentloaded');
      await studentTab.waitForTimeout(5000);

      // Wait for blockUI overlay to disappear before interacting
      await studentTab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
      
      // Navigate to My ATI tab
      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(10000);
  
      // Click on Assessments tab (opens Add Product dialog)
      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);
  
      // Enter Batch ID
      const idTextbox = locators.idTextbox;
      await studentAssertions.waitAndAssertVisible(idTextbox, 15000);
      await idTextbox.fill(extractedBatchId.trim());
      logger.success(`✅ Batch ID entered: ${extractedBatchId.trim()}`);
  
      // Click Continue
      const continueButton = locators.continueButton;
      await studentAssertions.waitAndAssertVisible(continueButton, 10000);
      await continueButton.click();
      await studentTab.waitForTimeout(2000);
  
      // Fill attestation page
      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();
      
      // Verify navigation to Assessment page
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success(`✅ Final URL validated: ${finalUrl}`);
  
      logger.success('TC6 PASS: Product added successfully.');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Resume Test', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Resume_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);
    
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

      logger.success('TC7 PASS: Test resumed successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Create Cheat Incident in Student Portal', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__Create_Cheat_Incident', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);
    
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      // Verify student is on assessment page
      const assessmentUrl = studentTab.url();
      studentAssertions.assertStringContains(assessmentUrl, '/Assessment');
      logger.success('✅ Student is on assessment page');

      // Wait for the assessment iframe to fully load
      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(5000);
      logger.success('✅ Assessment iframe loaded');

      // Click inside the iframe to ensure it has focus
      const iframeElement = studentTab.locator('iframe').first();
      await iframeElement.click();
      await studentTab.waitForTimeout(1000);

      // Simulate cheat using keyboard shortcut (Ctrl+C triggers invalid key detection)
      await studentTab.keyboard.press('Control+c');
      await studentTab.waitForTimeout(3000);
      logger.success('✅ Pressed Ctrl+C to trigger invalid key detection');

      // Verify "Invalid key pressed" modal appears (inside iframe)
      const assessmentFrame = studentTab.frameLocator('iframe').first();
      const invalidKeyModal = assessmentFrame.locator('#end-assessment-confirm-title');
      await invalidKeyModal.waitFor({ state: 'visible', timeout: 15000 });
      logger.success('✅ Invalid key pressed modal is visible');
      
      logger.success('TC8 PASS: Cheat incident created successfully');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Faculty Ignores the Incident', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Faculty_Ignores_Incident', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      await page.bringToFront();
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      logger.success('✅ Refreshed faculty portal');

      // Click the IGNORE button in the incident action column
      const ignoreButton = page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'IGNORE' });
      await ignoreButton.click();
      logger.success('✅ Clicked IGNORE button');
      await page.waitForTimeout(3000);

      logger.success('TC9 PASS: Faculty ignored the incident');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Student Resumes Assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__Student_Resumes_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);

    try {
      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);

      // Click Resume Test button on the modal (inside iframe)
      const assessmentFrame = studentTab.frameLocator('iframe').first();
      const resumeTestButton = assessmentFrame.locator('button.primary-button', { hasText: 'Resume Test' });
      await resumeTestButton.waitFor({ state: 'visible', timeout: 10000 });
      await resumeTestButton.click();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(3000);
      logger.success('✅ Clicked Resume Test button');

      logger.success('TC10 PASS: Student resumed assessment successfully');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC11 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC12 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: IPP page shows 100% score', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    try {
      await assertions.waitAndAssertVisible(locators.percentageScore);
      const percentageValue = await locators.percentageScore.textContent();
      const extractedPercentage = (percentageValue ?? '').trim();
      assertions.assertPercentage(extractedPercentage, EXPECTED_PERCENTAGE);
      logger.success('TC13 PASS: IPP page shows 100% score on UI');
  
      // Verify IPP heading and take screenshot
      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot('Stg_Proctor_CheatIncident_Ignore', extractedBatchId);
      
      logger.success('Cheat Incident Ignore Flow Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC14: Validate current date is reflecting correctly on IPP', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__IPP_Date_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    try {
      // Get today's date in M/D/YYYY format (matching the app's format)
      const today = new Date();
      const expectedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

      // Locate the date span on IPP by matching a date pattern (not the expected value)
      const dateElement = studentTab.locator('span').filter({ hasText: /^\d{1,2}\/\d{1,2}\/\d{4}$/ }).first();
      await dateElement.waitFor({ state: 'visible', timeout: 10000 });
      const dateText = await dateElement.textContent();
      const trimmedDate = (dateText ?? '').trim();
      
      // Assert that the date from DOM matches today's date
      assertions.assertStringContains(trimmedDate, expectedDate);
      logger.success(`✅ IPP date validated: DOM shows "${trimmedDate}", expected "${expectedDate}"`);

      logger.success('TC14 PASS: Current date is reflecting correctly on IPP');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Validate proctor side shows same score with Completed status', async ({}, testInfo) => {
    logger = new Logger(page, 'TC15__Proctor_Score_Status_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      // Switch to faculty/proctor tab and refresh
      await page.bringToFront();
      await page.waitForTimeout(5000);
      logger.success('✅ Switched to proctor tab and refreshed');

      // Validate status shows "Completed"
      const statusCell = page.locator('mat-cell.mat-column-status');
      await statusCell.first().waitFor({ state: 'visible', timeout: 15000 });
      const statusText = await statusCell.first().textContent();
      const trimmedStatus = (statusText ?? '').trim();
      assertions.assertStringContains(trimmedStatus.toLowerCase(), 'completed');
      logger.success(`✅ Proctor side status: "${trimmedStatus}"`);

      // Validate score shows 100.0%
      const scoreCell = page.locator('mat-cell.mat-column-completed');
      await scoreCell.first().waitFor({ state: 'visible', timeout: 15000 });
      const scoreText = await scoreCell.first().textContent();
      const trimmedScore = (scoreText ?? '').trim();
      assertions.assertStringContains(trimmedScore, EXPECTED_PERCENTAGE);
      logger.success(`✅ Proctor side score: "${trimmedScore}"`);

      logger.success('TC15 PASS: Proctor side shows same score with Completed status');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
    logger.success('Cheat Incident Ignore Flow Completed with 100% Score');
  });
  
});