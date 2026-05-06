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
const SCENARIO_NAME = 'Stg_Proctor_RelaunchAssessment';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';

/**
 * Regression Test - Relaunch Assessment Flow
 * Description: Validate that after launching the assessment, if the student accidentally closes the browser tab,
 * then logs back in and relaunches the same assessment, "Resume" and "Deny" options should be visible on the proctor side
 * @author [Ashish Ranjan]
 */

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

  test('TC7: Faculty Approves and Student Starts Test', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_and_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
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

      // Verify assessment iframe loaded
      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(30000);

      logger.success('TC7 PASS: Faculty approved and student started test successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  }); 

  test('TC8: Student accidentally closes the browser tab', async ({}, testInfo) => {
    logger = new Logger(page, 'TC8__Student_Closes_Tab', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      // Verify student is on assessment page before closing
      const assessmentUrl = studentTab.url();
      logger.success(`✅ Student is on: ${assessmentUrl}`);

      // Simulate accidental browser tab close
      await studentTab.close();
      logger.success('✅ Student tab closed (simulating accidental close)');

      // Wait for proctor side to detect the disconnection
      await page.waitForTimeout(5000);

      logger.success('TC8 PASS: Student browser tab closed successfully');
    } catch (error: any) {
      await logger?.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });   

  test('TC9: Student logs back in and relaunches the same assessment', async ({}, testInfo) => {
    logger = new Logger(page, 'TC9__Student_Relogin_Relaunch', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      // Create a new student tab and login again
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });
      
      // Student login
      const studentLoginPage = new LoginPage(studentTab);
      await studentTab.waitForTimeout(2000);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab1!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab1!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');
      logger.success('✅ Student logged back in');

      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
      await studentTab.waitForLoadState('load');

      // Wait for blockUI overlay to disappear
      await studentTab.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      // Initialize page objects for the new student tab
      myATIPage = new MyATIPage(studentTab);
      assessmentPage = new AssessmentPage(studentTab);
      locators = new StudentFacingPageLocators(studentTab);
      myATIPage.setLogger(logger);
      assessmentPage.setLogger(logger);

      // Navigate to My ATI tab
      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(10000);

      await myATIPage.reloadSameAssessment(EXPECTED_ASSESSMENT_NAME!, extractedBatchId.trim());

      // Fill attestation page
      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();

      // Verify navigation to Assessment page
      const studentAssertions = new Assertions(studentTab);
      studentAssertions.setLogger(logger);
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success(`✅ Student relaunched assessment: ${finalUrl}`);

      logger.success('TC9 PASS: Student logged back in and relaunched the same assessment');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Validate RESUME and DENY buttons visible on proctor side', async ({}, testInfo) => {
    logger = new Logger(page, 'TC10__Validate_Resume_Deny_Buttons', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      // Switch to faculty/proctor tab and refresh
      await page.bringToFront();
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(5000);
      logger.success('✅ Switched to proctor tab and refreshed');

      // Validate status shows "Waiting For Proctor"
      const statusCell = page.locator('mat-cell.mat-column-status');
      await statusCell.first().waitFor({ state: 'visible', timeout: 15000 });
      const statusText = await statusCell.first().textContent();
      const trimmedStatus = (statusText ?? '').trim();
      assertions.assertStringContains(trimmedStatus, 'Waiting For Proctor');
      logger.success(`✅ Proctor side status: "${trimmedStatus}"`);

      // Validate RESUME button is visible
      const resumeButton = page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'RESUME' });
      await resumeButton.first().waitFor({ state: 'visible', timeout: 15000 });
      logger.success('✅ RESUME button is visible on proctor side');

      // Validate DENY button is visible
      const denyButton = page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'DENY' });
      await denyButton.first().waitFor({ state: 'visible', timeout: 15000 });
      logger.success('✅ DENY button is visible on proctor side');

      logger.success('TC10 PASS: RESUME and DENY buttons are visible on proctor side after student relaunched assessment');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
