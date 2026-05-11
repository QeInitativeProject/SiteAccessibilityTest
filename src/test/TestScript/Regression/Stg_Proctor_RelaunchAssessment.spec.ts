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

const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const EXPECTED_PERCENTAGE = '100.0%';
const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_RelaunchAssessment';


/**
 * Regression Test - Relaunch Assessment Flow
 * Description: Validate that after launching the assessment, if the student accidentally closes the browser tab,
 * then logs back in and relaunches the same assessment, "Resume" and "Deny" options should be visible on the proctor side
 * @author [Ashok Singh]
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
  let assessmentStartTime: number = 0;
  let assessmentEndTime: number = 0;

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

  
  test('TC1: MU batch creation', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC2: Faculty login to ATI', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC3: Navigate to Proctor Tab', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC4: Enter Assessment ID and Setup Proctoring', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC5: Start Proctoring Session and Student Login', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC6: Add Product - Enter Password and Complete', { tag: '@regression' }, async ({}, testInfo) => {
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
  

  test('TC7: Faculty Approves and Student Starts Test', { tag: '@regression' }, async ({}, testInfo) => {
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
      await studentTab.waitForTimeout(25000);

      logger.success('TC7 PASS: Faculty approved and student started test successfully');
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  }); 

  test('TC8: Student accidentally closes the browser tab', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC9: Student logs back in and relaunches the same assessment', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC10: Validate RESUME and DENY buttons visible on proctor side', { tag: '@regression' }, async ({}, testInfo) => {
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

  test('TC11: Proctor clicks RESUME and student resumes assessment', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(page, 'TC11__Proctor_Resume_Student', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    try {
      logger.separator('TC11: PROCTOR RESUMES STUDENT ASSESSMENT');

      // Faculty clicks RESUME button
      const resumeButton = page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'RESUME' });
      await resumeButton.first().click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(5000);
      logger.success('Proctor clicked RESUME for student');

      // Switch to student tab and resume the test
      await studentTab.bringToFront();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(5000);

      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.resumeTest();
      await studentTab.waitForLoadState('load');

      // Verify assessment iframe loaded
      const assessmentIframe = studentTab.frameLocator('iframe').first();
      await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await studentTab.waitForTimeout(10000);

      // Record assessment start time
      assessmentStartTime = Date.now();
      logger.success(`Assessment start time recorded: ${new Date(assessmentStartTime).toISOString()}`);

      logger.success('TC11 PASS: Proctor resumed and student is back in assessment');
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC12: Answer assessment questions and finalize', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Answer_and_Finalize', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage = new AssessmentPage(studentTab);
    assessmentPage.setLogger(logger);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC12: ANSWER QUESTIONS AND FINALIZE ASSESSMENT');

      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('All assessment questions answered');

      // Record assessment end time before finalizing
      assessmentEndTime = Date.now();
      logger.success(`Assessment end time recorded: ${new Date(assessmentEndTime).toISOString()}`);

      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC12 PASS: Assessment finalized and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC13: Validate student can see the IPP Page and it is not broken', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__IPP_Page_Visible_Not_Broken', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    locators = new StudentFacingPageLocators(studentTab);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC13: IPP PAGE VISIBILITY AND INTEGRITY');

      // Verify URL contains IPP pattern
      await studentTab.waitForURL(/ViewResult|IPPTestResult/i, { timeout: 60000 });
      await studentTab.waitForLoadState('domcontentloaded');
      await studentTab.waitForTimeout(3000);
      const currentUrl = studentTab.url();
      studentAssertions.assertStringContains(currentUrl, 'ViewResult');
      logger.success(`IPP page URL confirmed: ${currentUrl}`);

      // Verify IPP heading is visible (page not broken)
      await studentAssertions.waitAndAssertVisible(locators.ippHeading, 15000);
      logger.success('IPP heading "Individual Performance Profile" is visible');

      logger.success('TC13 PASS: Student can see the IPP Page and it is not broken');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  }); 

  test('TC14: Validate scoring is visible on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__IPP_Scoring_Visible', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC14' });
    locators = new StudentFacingPageLocators(studentTab);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC14: IPP SCORING VALIDATION');

 await studentAssertions.waitAndAssertVisible(locators.overallPercentageScore);
const percentageValue = await locators.overallPercentageScore.textContent();
      const extractedPercentage = (percentageValue?.trim() || '') ;
      studentAssertions.assertPercentage(extractedPercentage, EXPECTED_PERCENTAGE);

      logger.success(`Scoring is visible on IPP Page: ${extractedPercentage}`);

      logger.success('TC14 PASS: Scoring is visible and matches expected percentage');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC15: Validate assessment name is correctly reflecting on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC15__IPP_Assessment_Name', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC15' });
    locators = new StudentFacingPageLocators(studentTab);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC15: IPP ASSESSMENT NAME VALIDATION');

      await studentAssertions.waitAndAssertVisible(locators.ippAssessmentName, 10000);
      const assessmentNameText = await locators.ippAssessmentName.textContent();
      const trimmedName = (assessmentNameText ?? '').trim();
      logger.success(`Assessment name on IPP Page: "${trimmedName}"`);

      // Verify name is not empty and contains expected assessment name
      studentAssertions.assertStringContains(trimmedName, EXPECTED_ASSESSMENT_NAME!);
      logger.success('TC15 PASS: Assessment name is correctly reflecting on IPP Page');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC16: Validate time spent to complete the assessment is reflecting on IPP Page', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC16__IPP_Time_Spent', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC16' });
    locators = new StudentFacingPageLocators(studentTab);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC16: IPP TIME SPENT VALIDATION');

      await studentAssertions.waitAndAssertVisible(locators.ippTimeSpent, 10000);
      const timeSpentText = await locators.ippTimeSpent.textContent();
      const trimmedTime = (timeSpentText ?? '').trim();
      logger.success(`Time spent on IPP Page: "${trimmedTime}"`);

      // Verify time is not empty
      if (!trimmedTime || trimmedTime.length === 0) {
        throw new Error('Time spent value is empty on IPP Page');
      }

      // Parse IPP time (format "MM:SS" or "HH:MM:SS") to seconds
      const timeParts = trimmedTime.split(':').map(Number);
      let ippTimeInSeconds: number;
      if (timeParts.length === 3) {
        ippTimeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) {
        ippTimeInSeconds = timeParts[0] * 60 + timeParts[1];
      } else {
        throw new Error(`Unexpected time format on IPP Page: "${trimmedTime}"`);
      }

      // Calculate actual elapsed time from recorded timestamps
      const actualElapsedSeconds = Math.floor((assessmentEndTime - assessmentStartTime) / 1000);
      logger.success(`Actual elapsed time: ${actualElapsedSeconds}s | IPP reported time: ${ippTimeInSeconds}s`);

      // Allow a tolerance of 60 seconds for network/processing delays
      const toleranceSeconds = 30;
      const difference = Math.abs(ippTimeInSeconds - actualElapsedSeconds);
      if (difference > toleranceSeconds) {
        throw new Error(
          `Time mismatch beyond ${toleranceSeconds}s tolerance. IPP: ${ippTimeInSeconds}s, Actual: ${actualElapsedSeconds}s, Diff: ${difference}s`
        );
      }
      logger.success(`Time difference is within tolerance: ${difference}s (max allowed: ${toleranceSeconds}s)`);
      logger.success('TC16 PASS: Time spent to complete the assessment is correctly reflecting');
    } catch (error: any) {
      await logger?.error('TC16 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC17: Validate Close button on IPP Page is functional and visible', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC17__IPP_Close_Button', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC17' });
    locators = new StudentFacingPageLocators(studentTab);
    const studentAssertions = new Assertions(studentTab);
    studentAssertions.setLogger(logger);

    try {
      logger.separator('TC17: IPP CLOSE BUTTON VALIDATION');

      // Take screenshot before closing
      assessmentPage = new AssessmentPage(studentTab);
      assessmentPage.setLogger(logger);
     // await assessmentPage.takeScreenshot(SCENARIO_NAME, extractedBatchId);
      logger.success('Screenshot captured for IPP page');

      // Verify Close button is visible
      await studentAssertions.waitAndAssertVisible(locators.ippCloseButton, 10000);
      logger.success('Close button is visible on IPP Page');

      // Click Close button and verify navigation away from IPP
      await locators.ippCloseButton.click();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(3000);

      const postCloseUrl = studentTab.url();
      logger.success(`URL after clicking Close: ${postCloseUrl}`);

      // Verify we navigated away from IPP page
      if (postCloseUrl.includes('IPPTestResult') || postCloseUrl.includes('ViewResult')) {
        throw new Error('Close button did not navigate away from IPP Page');
      }
      logger.success('TC17 PASS: Close button on IPP Page is functional and visible');
    } catch (error: any) {
      await logger?.error('TC17 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
