/**
 * @author Neeraj Singhal
 */

import { test } from '@playwright/test';
import { createTestSuite } from '@utils/TestSetup';
import { ElementActions } from '@utils/ElementActions';

createTestSuite({
  suiteName: '@regression Stg_RegressionCases',
  scenarioName: 'Stg_RegressionCases',
  loginAs: 'student',
  createBatch: true,
}, (getCtx) => {

  test.afterEach(async ({}, testInfo) => {
    const { page, locators } = getCtx(testInfo, 'cleanup');
    try {
      const closeBtn = locators.getCloseButtonAssessment();
      if (await closeBtn.isVisible({ timeout: 3000 })) {
        await closeBtn.click();
        await locators.getYesButton().click();
      }
    } catch {
      // Assessment may already be closed — ignore
    }
  });

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




});
