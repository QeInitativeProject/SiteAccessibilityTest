import type { Page, TestInfo } from '@playwright/test';
import { QnAUtil } from '../Utils/QnAUtil';
import { TextToSpeechUtility } from '../Utils/TexttospeechUtillity';
import { Logger } from '../Utils/Logger';

export class AssessmentPage {
  page: Page;
  private logger?: Logger;
  private qnaUtil: QnAUtil;
  private textToSpeechUtil: TextToSpeechUtility;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.qnaUtil = new QnAUtil(page, testInfo);
    this.textToSpeechUtil = new TextToSpeechUtility(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'AssessmentPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.qnaUtil.setLogger(logger);
    this.textToSpeechUtil.setLogger(logger);
  }

  /**
   * Generic method to answer assessment questions using Q&A from JSON file
   */
  answerAssessmentQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Scoring_QA_STAGE'
  ): Promise<void> => {
    await this.qnaUtil.answerAssessmentQuestions(jsonFileName, assessmentType);
  };

  /**
   * Finalize assessment and wait for IPP page to load
   */
  finalizeAssessmentAndViewResults = async (): Promise<void> => {
    await this.qnaUtil.finalizeAssessmentAndViewResults();
  };

  /**
   * Extract dynamic test attempt ID from URL
   */
  extractTestAttemptId = async (urlPattern: string): Promise<string> => {
    return await this.qnaUtil.extractTestAttemptId(urlPattern);
  };

  /**
   * Generic method to verify element by role and name
   */
  verifyElementByRole = async (
    role: string,
    name: string,
    elementDescription: string
  ): Promise<void> => {
    await this.qnaUtil.verifyElementByRole(role, name, elementDescription);
  };

  /**
   * Generic method to verify and extract text content
   */
  verifyAndExtractText = async (
    selector: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    return await this.qnaUtil.verifyAndExtractText(selector, elementDescription, isLabel);
  };

  /**
   * Generic method to verify text value matches expected value
   */
  verifyTextValue = async (
    selector: string,
    expectedValue: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    return await this.qnaUtil.verifyTextValue(selector, expectedValue, elementDescription, isLabel);
  };

  /**
   * Full flow: Flag -> Continue -> Previous -> Unflag -> Assert Flag visible
   */
  flagContinuePreviousUnflagFlow = async (
    assertions: any,
    timeoutMs: number = 30000
  ): Promise<void> => {
    await this.qnaUtil.flagContinuePreviousUnflagFlow(assertions, timeoutMs);
  };

  /**
   * Verifies blue banner is visible with correct background color in practice assessment
   */
  verifyBlueBannerVisibility = async (expectedColor: string = '#d7eef4'): Promise<void> => {
    await this.qnaUtil.verifyBlueBannerVisibility(expectedColor);
  };

  /**
   * Verifies close assessment dialog functionality
   */
  verifyCloseDialogFunctionality = async (): Promise<void> => {
    await this.qnaUtil.verifyCloseDialogFunctionality();
  };

  /**
   * Takes screenshot and saves it with scenario name and test attempt ID
   */
  takeScreenshot = async (scenarioName: string, testAttemptId?: string): Promise<void> => {
    await this.qnaUtil.takeScreenshot(scenarioName, testAttemptId);
  };

  /**
   * Clicks the Flag button and asserts that the Continue button becomes enabled
   */
  flagEnablesContinue = async (assertions: any): Promise<void> => {
    await this.qnaUtil.flagEnablesContinue(assertions);
  };

  /**
   * Verifies calculator functionality in assessment
   */
  verifyCalculatorFunctionality = async (operation: string = '2+2'): Promise<void> => {
    await this.qnaUtil.verifyCalculatorFunctionality(operation);
  };

  /**
   * Verifies pause and resume functionality in assessment
   */
  verifyPauseAndResumeFunctionality = async (): Promise<void> => {
    await this.qnaUtil.verifyPauseAndResumeFunctionality();
  };

  // ============================================
  // Text-to-Speech Methods (delegated to TextToSpeechUtility)
  // ============================================

  /**
   * Validates that text-to-speech toggle is functional
   */
  validateToggleFunctionality = async (): Promise<void> => {
    await this.textToSpeechUtil.validateToggleFunctionality();
  };

  /**
   * Turns the text-to-speech toggle ON
   */
  turnToggleOn = async (): Promise<void> => {
    await this.textToSpeechUtil.turnToggleOn();
  };

  /**
   * Turns the text-to-speech toggle OFF
   */
  turnToggleOff = async (): Promise<void> => {
    await this.textToSpeechUtil.turnToggleOff();
  };

  /**
   * Checks if the toggle is currently ON
   */
  isToggleOn = async (): Promise<boolean> => {
    return await this.textToSpeechUtil.isToggleOn();
  };

  /**
   * Verifies that the toggle switch thumb is visible
   */
  verifyToggleVisible = async (): Promise<void> => {
    await this.textToSpeechUtil.verifyToggleVisible();
  };

  /**
   * Validates that text-to-speech functionality content is visible
   */
  validateTextToSpeechContentVisibility = async (): Promise<void> => {
    await this.textToSpeechUtil.validateTextToSpeechContentVisibility();
  };

  /**
   * Validates settings button is clickable and speech rate, pitch rate controls are visible
   */
  validateSettingsButtonAndControls = async (): Promise<void> => {
    await this.textToSpeechUtil.validateSettingsButtonAndControls();
  };

  /**
   * Validates close and reset button functionality
   */
  validateCloseAndResetFunctionality = async (): Promise<void> => {
    await this.textToSpeechUtil.validateCloseAndResetFunctionality();
  };
}
