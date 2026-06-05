/**
 * @author Neeraj Singhal
 * Test: Auto-detect question type and answer using QuestionHandler utility
 */

import { test } from '@playwright/test';
import { createTestSuite } from '@utils/TestSetup';
import { QuestionHandler } from '@utils/QuestionHandler';

createTestSuite({
  suiteName: '@regression Stg_QuestionHandler',
  scenarioName: 'Stg_QuestionHandler',
  loginAs: 'student',
  createBatch: true,
}, (getCtx) => {

  test('TC1: Auto-detect and answer all shuffled questions', async ({}, testInfo) => {
    test.setTimeout(600000); 
    const { page, assertions, locators, myATIPage, logger } = getCtx(testInfo, 'TC1');
    try {
       await page.waitForLoadState('load');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("All item_Neeraj");
      logger.step('Starting QuestionHandler - auto-detect mode');
      const questionHandler = new QuestionHandler(page, testInfo);
      await questionHandler.answerAllQuestions('UnifiedQuestions.json', 'STAGE');
      logger.success('TC1 PASS: All questions answered via auto-detection');
    } catch (error: any) {
      await logger.error('TC1 FAIL: ' + error.message, error);
      throw error;
    }
  });

});
