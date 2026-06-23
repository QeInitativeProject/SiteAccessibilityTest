/**
 * Regression Test - Start Proctoring
 * Description: Validate that faculty can login, navigate to the Proctor tab,
 * set up proctoring, and successfully start a proctoring session.
 * Then open a student window side by side and start the assessment.
 * @author [Neeraj Singhal]
 */

import { test } from '@playwright/test';
import { createTestSuite } from '@utils/TestSetup';
import { ProctorUtility } from '@utils/Proctorutillity';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { QuestionHandler } from '@utils/QuestionHandler';
import { FACHomePage } from '@delegates/FACHomePage';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const ASSESSMENT_NAME ='ATI TEAS Automation Set 1 AR Proctored';
const INSTITUTION = process.env.Institution_zzcab || '';


createTestSuite({
  suiteName: '@regression Stg_Proctor_StartProctoring',
  scenarioName: 'Stg_Proctor_StartProctoring',
  loginAs: 'faculty',
  createBatch: false,
}, (getCtx) => {

  test('TC1: Start proctoring and student takes assessment', async ({}, testInfo) => {
    test.setTimeout(900000);
    const { page, logger, batchCreation, assertions ,myATIPage} = getCtx(testInfo, 'TC1');
    const proctorUtil = new ProctorUtility(page, testInfo);

    try {
      // === STEP 1: Create MU Batch to get Assessment ID ===
      logger.separator('BATCH CREATION');
      const stopTimer = logger.startTimer('Batch creation');
      const extractedBatchId = await batchCreation.createSpecificBatch(ASSESSMENT_NAME, INSTITUTION);
      stopTimer();
      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);

      // === FACULTY: Start Proctoring ===
      await page.waitForLoadState('load');
      const proctorTab = page.locator('button.sidebar-action', { hasText: 'Proctor' });
      await proctorTab.click();
      await page.waitForLoadState('load');
      logger.success('Navigated to Proctor tab');
      await page.waitForTimeout(18000);
      await proctorUtil.fillAssessmentID(extractedBatchId);
      logger.success('Assessment ID filled and selected');
      await page.waitForTimeout(2000);
      await proctorUtil.completeProctorAgreementPage();
      logger.success('Proctor agreement page completed');
      await proctorUtil.checkInStudents();
      logger.success('Students checked in');
      await proctorUtil.startProctoring();
      logger.success('Proctoring started successfully');

      // === STUDENT: Open new incognito window and login ===
      const browser = page.context().browser()!;
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();

      // Login as student
      await studentPage.goto(process.env.baseUrl!);
      await studentPage.waitForLoadState('load');
      const studentLogin = new LoginPage(studentPage);
      await studentLogin.fillStuUserName(process.env.stuUsername!);
      await studentLogin.fillStuPassword(process.env.stuPassword!);
      await studentLogin.clickLogin();
      await studentPage.waitForLoadState('load');
      await studentPage.waitForLoadState('domcontentloaded');
      logger.success('Student logged in successfully');

      // Navigate to assessment and start it
      const studentATI = new MyATIPage(studentPage, testInfo);
      await studentATI.clickOnMyATITab();
      await studentATI.clickOnAssessmentsTabOnMyAti();
      await studentATI.clickOnAddProduct();
      if (extractedBatchId) {
        await studentATI.enterAssessmentID(extractedBatchId);
      }
      logger.success(`Student started assessment: ${ASSESSMENT_NAME} (batch: ${extractedBatchId})`);

      // Attestation page is on the student side
      const studentFacPage = new FACHomePage(studentPage, testInfo);
      await studentFacPage.handleAttestationPage();
      logger.success('Student completed attestation page');

      // Switch to faculty window to approve the student
      await page.bringToFront();
      await page.waitForTimeout(5000);
      const facHomePage = new FACHomePage(page, testInfo);
      await facHomePage.approveByProctor();
      logger.success('Faculty approved the student');

      // Switch back to student window to start the test
      await studentPage.bringToFront();
      await studentPage.waitForTimeout(10000);
      await studentFacPage.startTest();
      logger.success('Student started the test');
      await studentPage.waitForTimeout(10000);
      // Answer all questions with feedback (4 sections) - Direct page mode for proctored assessment
      const questionHandler = new QuestionHandler(studentPage, testInfo);
      await questionHandler.answerAllQuestionsWithFeedbackProctor('UnifiedQuestions.json', 'STAGE', 4);
      logger.success('TC1 PASS: All 4 sections answered successfully by student with survey');
      await studentPage.waitForLoadState('load');
      const myATIPage = new MyATIPage(studentPage, testInfo);
      await myATIPage.verifyIIPPageVisible();
      logger.success('TC2 PASS: IPP page is visible');


      // Cleanup student context
      await studentContext.close();
    } catch (error: any) {
      await logger.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Verify Go back to the last question from popup', async ({}, testInfo) => {
    test.setTimeout(900000);
    const { page, logger, batchCreation, assertions } = getCtx(testInfo, 'TC2');
    const proctorUtil = new ProctorUtility(page, testInfo);

    try {
      // === STEP 1: Create MU Batch to get Assessment ID ===
      logger.separator('BATCH CREATION');
      const stopTimer = logger.startTimer('Batch creation');
      const extractedBatchId = await batchCreation.createSpecificBatch(ASSESSMENT_NAME, INSTITUTION);
      stopTimer();
      assertions.assertValidNumericId(extractedBatchId, 5);
      logger.success(`Batch created with ID: ${extractedBatchId}`);

      // === FACULTY: Start Proctoring ===
      await page.waitForLoadState('load');
      const proctorTab = page.locator('button.sidebar-action', { hasText: 'Proctor' });
      await proctorTab.click();
      await page.waitForLoadState('load');
      logger.success('Navigated to Proctor tab');
      await page.waitForTimeout(18000);
      await proctorUtil.fillAssessmentID(extractedBatchId);
      logger.success('Assessment ID filled and selected');
      await page.waitForTimeout(2000);
      await proctorUtil.completeProctorAgreementPage();
      logger.success('Proctor agreement page completed');
      await proctorUtil.checkInStudents();
      logger.success('Students checked in');
      await proctorUtil.startProctoring();
      logger.success('Proctoring started successfully');

      // === STUDENT: Open new incognito window and login ===
      const browser = page.context().browser()!;
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();

      await studentPage.goto(process.env.baseUrl!);
      await studentPage.waitForLoadState('load');
      const studentLogin = new LoginPage(studentPage);
      await studentLogin.fillStuUserName(process.env.stuUsername!);
      await studentLogin.fillStuPassword(process.env.stuPassword!);
      await studentLogin.clickLogin();
      await studentPage.waitForLoadState('load');
      await studentPage.waitForLoadState('domcontentloaded');
      logger.success('Student logged in successfully');

      // Navigate to assessment and start it
      const studentATI = new MyATIPage(studentPage, testInfo);
      await studentATI.clickOnMyATITab();
      await studentATI.clickOnAssessmentsTabOnMyAti();
      await studentATI.clickOnAddProduct();
      if (extractedBatchId) {
        await studentATI.enterAssessmentID(extractedBatchId);
      }
      logger.success(`Student started assessment: ${ASSESSMENT_NAME} (batch: ${extractedBatchId})`);

      const studentFacPage = new FACHomePage(studentPage, testInfo);
      await studentFacPage.handleAttestationPage();
      logger.success('Student completed attestation page');

      // Switch to faculty window to approve the student
      await page.bringToFront();
      await page.waitForTimeout(5000);
      const facHomePage = new FACHomePage(page, testInfo);
      await facHomePage.approveByProctor();
      logger.success('Faculty approved the student');

      // Switch back to student window to start the test
      await studentPage.bringToFront();
      await studentPage.waitForTimeout(10000);
      await studentFacPage.startTest();
      logger.success('Student started the test');
      await studentPage.waitForTimeout(10000);

      // Answer all questions in section 1 — popup with "Go back to the last question" will appear when section is completed
      const questionHandler = new QuestionHandler(studentPage, testInfo);
      const locators = new StudentFacingPageLocators(studentPage);
      const frame = locators.getAssessmentFrameLocator();

      await questionHandler.answerAllQuestionsWithFeedbackProctor('UnifiedQuestions.json', 'STAGE', 1, true);
      logger.success('Section 1 completed — popup should be visible');

      // Click "Go back to the last question" and validate navigation
      await questionHandler.clickGoBackToLastQuestion(frame);
      logger.success('TC2 PASS: "Go back to the last question" works — navigated back successfully');

      // Cleanup student context
      await studentContext.close();
    } catch (error: any) {
      await logger.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

});