import type { Page, TestInfo } from 'playwright/test';
import { ATICommonMethod } from '../Utils/ATICommonMethod';
import { Logger } from '../Utils/Logger';

export class MUPage {
  page: Page;
  private logger?: Logger;
  private atiCommonMethod: ATICommonMethod;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.atiCommonMethod = new ATICommonMethod(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'MUPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.atiCommonMethod.setLogger(logger);
  }

  // ============================================
  // Header and Navigation Methods
  // ============================================

  validateHeaderTitle = async (header: string) => {
    await this.atiCommonMethod.validateHeaderTitle(header);
  };

  getSubHeader = async (subHeader: string) => {
    return await this.atiCommonMethod.getSubHeader(subHeader);
  };

  clickOnMyATITab = async () => {
    await this.atiCommonMethod.clickOnMyATITab();
  };

  clickOnLearnTab = async () => {
    await this.atiCommonMethod.clickOnLearnTab();
  };

  clickOnAssessmentsTab = async () => {
    await this.atiCommonMethod.clickOnAssessmentsTab();
  };

  clickOnPrepTab = async () => {
    await this.atiCommonMethod.clickOnPrepTab();
  };

  clickOnCalendarTab = async () => {
    await this.atiCommonMethod.clickOnCalendarTab();
  };

  validateSubHeaderTitle = async () => {
    await this.atiCommonMethod.validateSubHeaderTitle();
  };

  // ============================================
  // Practice Assessment Methods
  // ============================================

  clickOnPracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnPracticeAssessment();
  };

  clickOnBeginPracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnBeginPracticeAssessment();
  };

  clickOnContinuePracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnContinuePracticeAssessment();
  };

  clickOnRetakePracticeAssessment = async () => {
    await this.atiCommonMethod.clickOnRetakePracticeAssessment();
  };

  startPracticeAssessment = async () => {
    await this.atiCommonMethod.startPracticeAssessment();
  };

  // ============================================
  // Page Navigation and Verification Methods
  // ============================================

  waitForAssessmentPageAndVerify = async (): Promise<boolean> => {
    return await this.atiCommonMethod.waitForAssessmentPageAndVerify();
  };

  waitForPageLoadAndVerifyNavigation = async (
    urlPattern: RegExp | string,
    timeout: number = 30000
  ): Promise<void> => {
    await this.atiCommonMethod.waitForPageLoadAndVerifyNavigation(urlPattern, timeout);
  };

  // ============================================
  // Product Management Methods
  // ============================================

  addProductToAccount = async (batchId: string, password: string): Promise<void> => {
    await this.atiCommonMethod.addProductToAccount(batchId, password);
  };
}
