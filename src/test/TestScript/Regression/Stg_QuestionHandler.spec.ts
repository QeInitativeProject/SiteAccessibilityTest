/**
 * @author Neeraj Singhal
 * Test: Auto-detect question type and answer using QuestionHandler utility
 */

import { test } from '@playwright/test';
import { createTestSuite } from '@utils/TestSetup';
import { QuestionHandler } from '@utils/QuestionHandler';
import { MyATIPage } from '@delegates/MyATIPage';

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
      await page.waitForLoadState('domcontentloaded');
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

  test('TC2: Answer questions with feedback (4 sections)', async ({}, testInfo) => {
    test.setTimeout(900000);
    const { page, assertions, locators, myATIPage, logger } = getCtx(testInfo, 'TC2');
    try {
      await page.waitForLoadState('load');
      await page.waitForLoadState('domcontentloaded');
      await myATIPage.clickOnMyATITab();
      await myATIPage.clickOnAssessmentsTabOnMyAti();
      await myATIPage.clickAssessmentButton("ATI TEAS Online Practice B");
      logger.step('Starting QuestionHandler - feedback mode (4 sections)');
      const questionHandler = new QuestionHandler(page, testInfo);
      await questionHandler.answerAllQuestionsWithFeedback('UnifiedQuestions.json', 'STAGE', 4);
      logger.success('TC2 PASS: All 4 sections answered with feedback');
      await page.waitForLoadState('load');
      await page.waitForLoadState('domcontentloaded');
      await myATIPage.getAndValidateAssessmentName("ATI TEAS Online Practice B");
      logger.success('TC3 PASS: Validated the assessment name after completion');
      await myATIPage.validateMinutesSpent();
      logger.success('TC4 PASS: Validated minutes spent is > 0');
      await myATIPage.validateIndividualTotalScore();
      logger.success('TC5 PASS: Validated individual total score');
      await myATIPage.validateCloseButtonFunctional();
      logger.success('TC6 PASS: Validated close button is functional');
      await myATIPage.validateTestCompletedDate();
      logger.success('TC7 PASS: Validated test completed date is today');
      await myATIPage.validateAttemptIdInUrl();
      logger.success('TC8 PASS: Validated attempt ID is present in URL');
    } catch (error: any) {
      await logger.error('TC2 FAIL: ' + error.message, error);
      throw error;
    }
  });

});
