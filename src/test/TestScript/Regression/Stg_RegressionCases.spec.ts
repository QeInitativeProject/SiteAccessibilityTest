/**
 * @author Neeraj Singhal
 */

import { test, expect } from '@playwright/test';
import { createTestSuite } from '@utils/TestSetup';
import { ElementActions } from '@utils/ElementActions';

createTestSuite({
  suiteName: '@regression Stg_RegressionCases',
  scenarioName: 'Stg_RegressionCases',
  loginAs: 'student',
  createBatch: true,
}, (getCtx) => {

  test('TC1: Validate student is able to Drag Calculator window', async ({}, testInfo) => {
    const { page, locators, myATIPage, logger } = getCtx(testInfo, 'TC1');
    const actions = new ElementActions(page, testInfo, 'TC1');

    try {
      logger.step('TC1: Home Page Navigation Elements Validation');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      
      await actions.click(locators.getCalculatorToggleButton(), 'Calculator Toggle Button');
      const calculatorDialog = locators.getCalculatorDialog();
      await myATIPage.verifyElementIsDraggable(calculatorDialog, 'Calculator Window');
      logger.success('TC1 PASS: Validate student is able to Drag Calculator window');
    } catch (error: any) {
      await logger.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC2: Validate Flagged Questions remained flagged after resume', async ({}, testInfo) => {
    const { page, locators, myATIPage, logger } = getCtx(testInfo, 'TC2');
    const actions = new ElementActions(page, testInfo, 'TC2');
    try {
      logger.step('TC2: Validate Flagged Questions remained flagged after resume');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      await actions.click(locators.getFlagButtonForReview(), 'Flag Question Button');
      await actions.click(locators.getPauseButton(), 'Pause Button');
      await actions.click(locators.getResumeButton(), 'Resume Button');
      await actions.waitForVisible(locators.getUnflagThisQuestionButton(), 'Unflag Button (flag still active)', 10000);
      logger.success('TC2 PASS: Validate Flagged Questions remained flagged after resume');
    
    } catch (error: any) {
      await logger.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });


test('TC3: Validate when browser is refreshed, it remains on same question.', async ({}, testInfo) => {
    const { page, locators, myATIPage, logger } = getCtx(testInfo, 'TC3');
    const actions = new ElementActions(page, testInfo, 'TC3');
    try {
      logger.step('TC3: Validate when browser is refreshed, it remains on same question.');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      const questionNumberBeforeReload = await actions.getText(locators.getQuestionNumber(), 'Question Number Before Reload');
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      const questionNumberAfterReload = await actions.getText(locators.getQuestionNumber(), 'Question Number After Reload');
      await actions.assertEqual(questionNumberAfterReload, questionNumberBeforeReload, 'Validate question number remains same after reload');  
      logger.success('TC3 PASS: Validate when browser is refreshed, it remains on same question.');
    
    } catch (error: any) {
      await logger.error('TC3 FAIL: ' + error.message, error);
      throw error;
    }
  });

test('TC4: Validate that the test attempt ID gets generated', async ({}, testInfo) => {
    const { page, locators, myATIPage, assessmentPage, logger } = getCtx(testInfo, 'TC4');
    const actions = new ElementActions(page, testInfo, 'TC4');
    try {
      logger.step('TC4: Validate that the test attempt ID gets generated');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickOnResultButton("All_Items_Types");
      await page.waitForLoadState('domcontentloaded');
      const testAttemptId = await assessmentPage.extractTestAttemptId('/ViewResult/IPPTestResult/');
      expect(testAttemptId, 'Test Attempt ID should not be empty').toBeTruthy();
      logger.success('TC4 PASS: Test attempt ID generated: ' + testAttemptId);
    } catch (error: any) {
      await logger.error('TC4 FAIL: ' + error.message, error);
      throw error;
    }
  });  

  test('TC5: Validate that Close button is visible', async ({}, testInfo) => {
    const { page, locators, myATIPage, assessmentPage, logger } = getCtx(testInfo, 'TC5');
    const actions = new ElementActions(page, testInfo, 'TC5');
    try {
      logger.step('TC5: Validate that the Close button is visible');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      await page.waitForLoadState('domcontentloaded');
      await assessmentPage.verifyCloseDialogFunctionality();
      logger.success('TC5 PASS: Close button is visible and dialog functionality verified');
    } catch (error: any) {
      await logger.error('TC5 FAIL: ' + error.message, error);
      throw error;
    }
  }); 

  test('TC6: Validate pause timer starts on pause and stops on resume', async ({}, testInfo) => {
    const { page, locators, myATIPage, assessmentPage, logger } = getCtx(testInfo, 'TC6');
    const actions = new ElementActions(page, testInfo, 'TC6');
    try {
      logger.step('TC6: Validate pause timer starts on pause and stops on resume');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      await page.waitForLoadState('domcontentloaded');
      await assessmentPage.verifyPauseAndResumeFunctionality();
      logger.success('TC6 PASS: Pause timer starts on pause and stops on resume');
    } catch (error: any) {
      await logger.error('TC6 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC7: Validate student can flag a question and move to next question', async ({}, testInfo) => {
    const { page, locators, myATIPage, assessmentPage, assertions, logger } = getCtx(testInfo, 'TC7');
    const actions = new ElementActions(page, testInfo, 'TC7');
    try {
      logger.step('TC7: Validate student can flag a question and move to next question');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      await page.waitForLoadState('domcontentloaded');
      await assessmentPage.flagEnablesContinue(assertions);
      logger.success('TC7 PASS: Student flagged the question and moved to next question');
    } catch (error: any) {
      await logger.error('TC7 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC8: Validate that scoring is visible on IPP Page', async ({}, testInfo) => {
    const { page, locators, myATIPage, assessmentPage, logger } = getCtx(testInfo, 'TC8');
    const actions = new ElementActions(page, testInfo, 'TC8');
    try {
      logger.step('TC8: Validate that scoring is visible on IPP Page');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickOnResultButton("All_Items_Types");
      await page.waitForLoadState('domcontentloaded');
      const score = await assessmentPage.validateIPPScoring('25.0%');
      logger.success('TC8 PASS: Scoring is visible on IPP Page - Score: ' + score);
    } catch (error: any) {
      await logger.error('TC8 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC9: Validate session expiry redirects to login page', async ({}, testInfo) => {
    const { page, locators, myATIPage, atiLoginPage, logger } = getCtx(testInfo, 'TC9');
    const actions = new ElementActions(page, testInfo, 'TC9');
    try {
      logger.step('TC9: Validate session expiry redirects to login page');

      // Ensure we are logged in first
      await page.goto(process.env.baseUrl!);
      await page.waitForLoadState('domcontentloaded');
      await atiLoginPage.fillStuUserName(process.env.stuUsername!);
      await atiLoginPage.fillStuPassword(process.env.stuPassword!);
      await atiLoginPage.clickLogin();
      await page.waitForLoadState('load');
      logger.success('Logged in successfully');

      // Now expire the session
      await myATIPage.expireSessionToken();
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // After session expires, page should redirect to login
      await page.waitForURL("https://user-management.stg.atitesting.com/", { timeout: 30000 });
      logger.success('TC9 PASS: Session expired and redirected to login page');
    } catch (error: any) {
      await logger.error('TC9 FAIL: ' + error.message, error);
      throw error;
    }
  });

  test('TC10: Validate multiple device detected when same assessment opened in new window', async ({}, testInfo) => {
    const { page, locators, myATIPage, logger } = getCtx(testInfo, 'TC10');
    const actions = new ElementActions(page, testInfo, 'TC10');
    try {
      logger.step('TC10: Validate multiple device detection');

      // Opens assessment in first tab, then opens same assessment in new tab
      const { newPage, message } = await myATIPage.verifyMultipleDeviceDetection("All item_Neeraj");
      expect(message).toBeTruthy();
      logger.success('TC10 PASS: Multiple device detected message shown: ' + message);

      // Close the second tab
      await newPage.close();
    } catch (error: any) {
      await logger.error('TC10 FAIL: ' + error.message, error);
      throw error;
    }
  });

});
