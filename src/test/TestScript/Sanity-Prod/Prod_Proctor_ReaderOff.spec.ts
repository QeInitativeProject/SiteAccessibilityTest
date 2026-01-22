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
const SCENARIO_NAME = 'Prod_Proctor_ReaderOff';
const QUESTION_ANSWER_FILE = '4_Correct_QnA.json';
const ASSESSMENT_TYPE = 'Question Store Prod';
const EXPECTED_PERCENTAGE = '100.0%';
// const ASSESSMENT_ID = '27099597'; // Hardcoded Assessment ID for proctoring
// const BATCH_ID = '27099597'; // Hardcoded Batch ID for adding product

/**
 * Smoke Test - Proctor Flow
 * Description: Faculty login and proctor student assessment
 * @author [Ashish Ranjan]
 */

test.describe.serial('@Sanity - Prod_Proctor_ReaderOff', { tag: '@sanity' }, () => {
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
    browser = await chromium.launch();
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
    // Success screenshot removed - only capturing final IPP screenshot in TC7
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
  
      const stopTimer = logger.startTimer('Batch creation');
      extractedBatchId = await batchCreation.createBatch(
        EXPECTED_ASSESSMENT_NAME!,
        EXPECTED_INSTITUTION!
      );
      stopTimer();
  
      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);
      logger.separator();
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
      logger.success('Successfully logged into ATI with fresh session');
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
    await page.waitForTimeout(10000)
   
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
   
    logger.step('TC6: Add Product to Student Account');
    logger.step('1. Click on My ATI tab');
    logger.step('2. Click on Assessments tab to open Add Product dialog');
    logger.step('3. Enter Batch ID');
    logger.step('4. Enter Password');
    logger.step('5. Click Continue');
    logger.step('6. Navigate to Assessment page');

    try {
      // Create new Assertions instance for studentTab
      const studentAssertions = new Assertions(studentTab);
      studentAssertions.setLogger(logger);

      // Wait for page to be ready after attestation
      await studentTab.waitForLoadState('load');
      await studentTab.waitForLoadState('domcontentloaded');
      await studentTab.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => 
        logger.info('Network idle timeout - continuing anyway')
      );
      
      // Wait for any potential overlays to disappear
      await studentTab.waitForTimeout(5000);
      
      // Hard assertion: Validate URL before clicking My ATI
      const currentUrl = studentTab.url();
      logger.info(`Current URL: ${currentUrl}`);
      studentAssertions.assertStringContains(currentUrl, 'atitesting.com');
      logger.success('✅ On correct domain');

      // Navigate to My ATI tab with enhanced validation
      await myATIPage.clickOnMyATITab();
      await studentTab.waitForLoadState('load');
      logger.success('✅ Clicked on My ATI tab');

      // Hard assertion: Validate navigation to My ATI
      await studentTab.waitForTimeout(3000);
      const myATIUrl = studentTab.url();
      logger.info(`My ATI URL: ${myATIUrl}`);
      
      // Wait for page to stabilize
      await studentTab.waitForTimeout(10000);

      // Click on Assessments tab (this opens the Add Product dialog)
      await myATIPage.clickOnAssessmentsTab();
      await studentTab.waitForTimeout(2000);
      logger.success('✅ Add Product dialog opened');

      // Hard assertion: Validate ID textbox is visible
      const idTextbox = locators.idTextbox;
      await studentAssertions.waitAndAssertVisible(idTextbox, 15000);
      logger.success('✅ ID textbox is visible');
      
      await studentAssertions.assertEnabled(idTextbox);
      logger.success('✅ ID textbox is enabled');
      
      await studentAssertions.assertEditable(idTextbox);
      logger.success('✅ ID textbox is editable');

      // Enter Batch ID
      await idTextbox.fill(extractedBatchId.trim());
      logger.success(`✅ Batch ID entered: ${extractedBatchId.trim()}`);
      
      // Hard assertion: Validate entered value
      await studentAssertions.assertHasValue(idTextbox, extractedBatchId.trim());
      logger.success('✅ Batch ID value validated');

      // Click Continue after entering Batch ID
      const continueButton = locators.continueButton;
      await studentAssertions.waitAndAssertVisible(continueButton, 10000);
      logger.success('✅ Continue button is visible');
      
      await studentAssertions.assertEnabled(continueButton);
      logger.success('✅ Continue button is enabled');
      
      await continueButton.click();
      await studentTab.waitForTimeout(2000);
      logger.success('✅ Continue clicked after ID entry');

      // Fill attestation page
      const studentProctorUtil = new ProctorUtility(studentTab);
      studentProctorUtil.setLogger(logger);
      await studentProctorUtil.fillAttestationPage();
      
      // Verify navigation to Assessment page with hard assertions
      await myATIPage.waitForPageLoadAndVerifyNavigation('/Assessment');
      logger.success('✅ Navigated to Assessment page');
      
      // Hard assertion: Validate final URL
      const finalUrl = studentTab.url();
      studentAssertions.assertStringContains(finalUrl, '/Assessment');
      logger.success(`✅ Final URL validated: ${finalUrl}`);

      logger.success('TC6 PASS: Product added successfully with all validations.');
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
    logger = new Logger(studentTab, 'TC7__Flag_Unflag_Flow', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC7' });
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

   

  test('TC9: Calculator functionality', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC9__Calculator_Functionality', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC9' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC9: Calculator Functionality Validation');
    logger.step('1. Open calculator');
    logger.step('2. Verify calculator input and operations');
    logger.step('3. Close calculator');

    try {
      await assessmentPage.verifyCalculatorFunctionality();
      logger.success('TC9 PASS: Calculator functionality verified');
    } catch (error: any) {
      await logger?.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Pause and Resume assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC10__Pause_and_Resume', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC10' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC10: Pause and Resume Functionality Validation');
    logger.step('1. Pause the assessment');
    logger.step('2. Verify pause state');
    logger.step('3. Resume the assessment');

    try {
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC10 PASS: Pause and resume functionality verified');
    } catch (error: any) {
      await logger?.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC11: Answer assessment', async ({}, testInfo) => {
    logger = new Logger(studentTab, 'TC11__Answer_Assessment', testInfo, { scenarioName: SCENARIO_NAME, tcNumber: 'TC11' });
    assessmentPage.setLogger(logger);
    assertions.setLogger(logger);

    logger.step('TC11: Answer Assessment Questions Validation');
    logger.step('1. Load questions from JSON file (4_Correct_QnA.json)');
    logger.step('2. Answer all assessment questions');
    logger.step('3. Verify answers submitted');

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

    logger.step('TC12: Finalize Assessment Validation');
    logger.step('1. Click Finish button');
    logger.step('2. Navigate to IPP page');
    logger.step('3. Verify IPP page URL');

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

    logger.step('TC13: IPP Score Validation');
    logger.step('1. Verify percentage score on IPP page');
    logger.step('2. Assert score equals 100.0%');
    logger.step('3. Verify IPP heading');
    logger.step('4. Take screenshot for validation');

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
      await assessmentPage.takeScreenshot('Prod_Proctor_ReaderOff', extractedBatchId);
      
      logger.success('Proctor Flow Smoke Test Completed with 100% Score');
    } catch (error: any) {
      await logger?.error('TC13 FAIL: ' + error.message, error);
      throw error;
    }
  });
});
