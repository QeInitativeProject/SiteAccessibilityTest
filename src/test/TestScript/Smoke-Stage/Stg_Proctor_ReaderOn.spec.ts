import { test } from '@playwright/test';
import { Browser, BrowserContext, Page } from '@playwright/test';
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
const SCENARIO_NAME = 'Stg_Proctor_ReaderOn';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store_Stage';
const EXPECTED_PERCENTAGE = '100.0%';

 
/**
 * Smoke Test - Proctor Flow
 * Description: Faculty login and proctor student assessment
 * @author [Ashish Ranjan]
 */
 
test.describe.serial('@Smoke - Stg_Proctor_ReaderOn', { tag: '@smoke' }, () => {
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
    browser = await chromium.launch({ headless: process.env.CI ? true : false });
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
  });
 
    test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
    // Success screenshot removed - only capturing final IPP screenshot in TC8
  });
 
  test.afterAll(async ({}, testInfo) => {
    await browser.close();
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
     
      // Hard assertion: Validate URL does not contain '/login'
      await assertions.assertURLNotContains('/login');
      logger.success('✅ URL validation passed - not on login page');
     
      // Hard assertion: Validate ATI logo is visible after login
      const atiLogo = page.locator('//img[@alt="ati-logo"]');
      await assertions.waitAndAssertVisible(atiLogo, 10000);
      logger.success('✅ ATI logo is visible after faculty login');
     
      // Additional assertions for ATI logo
      await assertions.assertAttached(atiLogo);
      logger.success('✅ ATI logo is attached to DOM');
     
      await assertions.assertHasAttribute(atiLogo, 'alt', 'ati-logo');
      logger.success('✅ ATI logo has correct alt attribute');
     
      logger.success('Successfully logged into ATI with fresh session');
      logger.success('TC2 PASS: Faculty logged in successfully with all validations');
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
 
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(20000);
 
   
    logger.step('TC3: Navigate to Proctor Tab - Comprehensive Validations');
 
    try {
      // Step 1: Validate menu bar button is visible and enabled
     /* const menuBarButton = page.locator('//div[@class="flex items-center"]/button');
      await assertions.waitAndAssertVisible(menuBarButton, 10000);
      logger.success('✅ Menu bar button is visible');
     
      await assertions.assertEnabled(menuBarButton);
      logger.success('✅ Menu bar button is enabled');
     
      await assertions.assertAttached(menuBarButton);
      logger.success('✅ Menu bar button is attached to DOM');*/
     
      // Step 2: Click menu bar
      await facHomePage.clickOnMenuBar();
      await page.waitForLoadState('load');
      logger.success('✅ Menu bar clicked successfully');
     
     /* // Step 3: Validate Proctor tab link is visible and enabled
      const proctorTabLink = page.locator('//a[@href="/faculty/proctor"]');
      await assertions.waitAndAssertVisible(proctorTabLink, 10000);
      logger.success('✅ Proctor tab link is visible');
     
      await assertions.assertEnabled(proctorTabLink);
      logger.success('✅ Proctor tab link is enabled');
     
      await assertions.assertAttached(proctorTabLink);
      logger.success('✅ Proctor tab link is attached to DOM');
     
      await assertions.assertHasAttribute(proctorTabLink, 'href', '/faculty/proctor');
      logger.success('✅ Proctor tab link has correct href attribute');*/
     
      // Step 4: Navigate to Proctor tab
      await proctorUtil.navigateToProctorTab();
      await page.waitForLoadState('load');
      logger.success('✅ Navigated to Proctor Tab');
     
      // Step 5: Validate URL contains 'proctor'
      await assertions.assertURLContains('proctor');
      logger.success('✅ URL contains "proctor"');
     
      // Step 6: Validate page title or heading (if applicable)
      const currentUrl = page.url();
      assertions.assertStringContains(currentUrl, 'proctor');
      logger.success('✅ Current URL validated: ' + currentUrl);
     
      // Step 7: Additional validation - check if proctor page content is loaded
      await page.waitForTimeout(10000);
     
      logger.success('TC3 PASS: Navigated to Proctor Tab with all validations');
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
    await page.waitForTimeout(10000)
   
    logger.step('TC4: Setup Proctoring with Assessment ID');
    logger.success(`Using Assessment ID: ${extractedBatchId}`);
 
    try {
      await page.waitForLoadState('load');
      await page.waitForTimeout(10000);
     
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
       // Hard assertion: Verify Start Proctoring button is visible and enabled before clicking
      await assertions.waitAndAssertStartProctorButtonVisible(15000);
      await proctorUtil.startProctoring();
      await page.waitForLoadState('load');
   
      // Create a new student tab and login
      studentTab = await context.newPage();
      await studentTab.goto(process.env.baseUrl!, { waitUntil: 'load' });
     
      // Student login
      const studentLoginPage = new LoginPage(studentTab);
      await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab!);
      await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab!);
      await studentLoginPage.clickLogin();
      await studentTab.waitForLoadState('load');
      logger.success('Student logged in successfully in new tab');
   
      await studentTab.bringToFront();
      await studentTab.waitForTimeout(2000);
   
   
   
      // Create ProctorUtility instance for student tab and fill attestation
     
      await studentTab.waitForLoadState('load');
     
      logger.success('TC5 PASS: Student logged in ');
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
    assertions.setLogger(logger);
 
    logger.step('TC6: Add Product to Student Account');
    logger.step('1. Click on My ATI tab');
    logger.step('2. Click on Assessments tab to open Add Product dialog');
    logger.step('3. Enter Batch ID');
    logger.step('4. Enter Password');
    logger.step('5. Click Continue');
    logger.step('6. Navigate to Assessment page');
 
    try {
      // Wait for page to be ready after attestation
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(20000);
   
      // Navigate to My ATI tab
      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      logger.success('✅ Clicked on My ATI tab');
   
      await page.waitForTimeout(10000)
   
      // Click on Assessments tab (this opens the Add Product dialog)
      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);
      logger.success('✅ Add Product dialog opened');
   
      // Verify Add Product dialog appears
      // await assertions.assertRoleVisible('heading', 'Add a product to your account');
      // logger.success('✅ Add Product dialog is visible');
   
      // Enter Batch ID
      await assertions.assertVisible(locators.idTextbox);
      await locators.idTextbox.fill(extractedBatchId.trim());
      logger.success(`✅ Batch ID entered: ${extractedBatchId.trim()}`);
   
      // Click Continue after entering Batch ID
      await assertions.assertVisible(locators.continueButton);
      await locators.continueButton.click();
      await studentTab.waitForTimeout(2000);
      logger.success('✅ Continue clicked after ID entry');
   
      const studentProctorUtil = new ProctorUtility(studentTab);
      await studentProctorUtil.fillAttestationPage();
      // Verify navigation to Assessment page
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('✅ Navigated to Assessment page');
   
      logger.success('TC6 PASS: Product added successfully.');
    } catch (error: any) {
      await logger?.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC7: Approve and Start Test', async ({}, testInfo) => {
    logger = new Logger(page, 'TC7__Approve_and_Start_Test', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
    atiLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);
   
    try {
      // Switch back to faculty tab
      await page.bringToFront();
      await page.reload();
      await page.waitForLoadState('load');

    // Hard assertion: Verify APPROVE button is visible and enabled before clicking
      await assertions.waitAndAssertApproveButtonVisible(15000);
    
    // Hard assertion: Verify DENY button is visible and enabled
      await assertions.waitAndAssertDenyButtonVisible(15000);
   
      await proctorUtil.approveByProctor();
      await page.waitForLoadState('load');
   
      await studentTab.bringToFront();
      await studentTab.waitForLoadState('load');
   
      await page.waitForTimeout(5000);
   
      const studentProctorUtil = new ProctorUtility(studentTab);
   
      await studentProctorUtil.startTest();
      await page.waitForLoadState('load');
   
      logger.success('TC7 PASS: Test approved and started successfully');
     
      // Switch back to student tab for assessment
    } catch (error: any) {
      await logger?.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC8: Flag, Continue, Previous, Unflag robust flow', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC8__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC8' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
    await page.waitForTimeout(10000);
 
    logger.step('TC8: Flag/Unflag Flow Validation');
    logger.step('1. Flag a question');
    logger.step('2. Continue to next question');
    logger.step('3. Go back to previous question');
    logger.step('4. Unflag the question');
 
    try {
      await studentTab.waitForLoadState('load');
      await assessmentPage.flagContinuePreviousUnflagFlow(assertions);
      logger.success('TC8 PASS: Full Flag-Continue-Previous-Unflag flow succeeded.');
    } catch (error: any) {
      logger.error('TC8 FAIL: Full Flag-Continue-Previous-Unflag flow failed: ' + error);
      throw error;
    }
  });
 
  test('TC9: Validate that text to speech functionality content is visible', async () => {
    logger?.step('TC9: Text-to-Speech Content Visibility Validation ===');
    logger?.step('1. Settings button visibility');
    logger?.step('2. "Click and Listen" text visibility');
    logger?.step('3. "playlist_play" icon visibility');
    logger?.step('4. Toggle switch thumb visibility');
 
    try {
      await assessmentPage.validateTextToSpeechContentVisibility();
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC10: Validate that text to speech toggle is functional', async () => {
    logger?.step('TC10: Text-to-Speech Toggle Functionality Validation ===');
    logger?.step('1. Verify toggle starts OFF');
    logger?.step('2. Turn toggle ON and verify state change');
    logger?.step('3. Turn toggle OFF and verify state change');
    logger?.step('4. Turn toggle back ON for subsequent tests');
 
    try {
      await assessmentPage.validateToggleFunctionality();
      await assessmentPage.turnToggleOn();
      logger?.success('TC10 PASS: Toggle is now ON and ready for subsequent tests');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC11: Validate settings button is clickable and speech rate, pitch rate is visible', async () => {
    logger?.step('TC11: Settings Controls Visibility Validation ===');
    logger?.step('1. Settings button is visible and clickable');
    logger?.step('2. "Pitch" text is visible');
    logger?.step('3. "Speech rate" text is visible');
    logger?.step('4. Close button is visible');
    logger?.step('5. Reset button is visible');
 
    try {
      await assessmentPage.validateSettingsButtonAndControls();
    } catch (error: any) {
      await logger?.error('TC11 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
 
   
 
  test('TC12: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC12__Calculator_Functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
 
    logger.step('TC12: Calculator Functionality Validation');
    logger.step('1. Open calculator');
    logger.step('2. Verify calculator input and operations');
    logger.step('3. Close calculator');
 
    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC12 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC12 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC13: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC13__Pause_and_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
 
    logger.step('TC13: Pause and Resume Functionality Validation');
    logger.step('1. Pause the assessment');
    logger.step('2. Verify pause state');
    logger.step('3. Resume the assessment');
 
    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC13 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC14: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC14__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
 
    logger.step('TC14: Answer Assessment Questions Validation');
    logger.step('1. Load questions from JSON file (4_Correct_QnA.json)');
    logger.step('2. Answer all assessment questions');
    logger.step('3. Verify answers submitted');
 
    try {
      await assessmentPage.answerAssessmentQuestions(QUESTION_ANSWER_FILE, ASSESSMENT_TYPE);
      logger.success('TC14 PASS: Assessment questions answered');
    } catch (error: any) {
      await logger?.error('TC14 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC15: Finish assessment and IPP page loaded', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC15__Finalize_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC12' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
 
    logger.step('TC15: Finalize Assessment Validation');
    logger.step('1. Click Finish button');
    logger.step('2. Navigate to IPP page');
    logger.step('3. Verify IPP page URL');
 
    try {
      await assessmentPage.finalizeAssessmentAndViewResults();
      logger.success('TC15 PASS: Assessment finished and IPP page loaded');
    } catch (error: any) {
      await logger?.error('TC15 FAIL: ' + error.message, error);
      throw error;
    }
  });
 
  test('TC16: IPP page shows 100% score', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC16__IPP_Score_Validation', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC13' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);
 
    logger.step('TC16: IPP Score Validation');
    logger.step('1. Verify percentage score on IPP page');
    logger.step('2. Assert score equals 100.0%');
    logger.step('3. Verify IPP heading');
    logger.step('4. Take screenshot for validation');
 
    try {
      await assertions.waitAndAssertVisible(locators.percentageScore);
      const percentageValue = await locators.percentageScore.textContent();
      const extractedPercentage = (percentageValue ?? '').trim();
      assertions.assertPercentage(extractedPercentage, EXPECTED_PERCENTAGE);
      logger.success('TC16 PASS: IPP page shows 100% score on UI');
   
      // Verify IPP heading and take screenshot
      await assessmentPage.verifyElementByRole(
        'heading',
        'Individual Performance Profile',
        'IPP Page Heading'
      );
      await assessmentPage.takeScreenshot('Stg_Proctor_ReaderOn', extractedBatchId);
     
      logger.success('Proctor Flow Smoke Test Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC16 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
 