import type { Page, TestInfo } from '@playwright/test';
import { Logger } from '../Utils/Logger';
import { ATICommonMethod } from '../Utils/ATICommonMethod';

export class MyATIPage {
  page: Page;
  private logger?: Logger;
  private atiCommonMethod: ATICommonMethod;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.atiCommonMethod = new ATICommonMethod(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'MyATIPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.atiCommonMethod.setLogger(logger);
  }

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

  clickOnAddProductAtHomePage = async () => {
    await this.page.locator('//a[@data-atiid="addProductAction"]').click();
  };

  clickOnAddProduct = async () => {
    await this.page.locator('(//a[@data-atiid="addProductAction"])[4]').click();
  };
  //Enter Assessment and Click on Continue
  enterAssessmentID = async (assessmentID: string) => {
    await this.page.locator('//input[@placeholder="Enter ID"]').fill(assessmentID);
    await this.page
      .locator("//form[@id='adForm']/section[@class='step-modal-nav']/a/span[text()='Continue']")
      .click();
    await this.page.waitForLoadState('load');
  };

  startPracticeAssessment = async () => {
    await this.atiCommonMethod.startPracticeAssessment();
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

  waitForAssessmentPageAndVerify = async (): Promise<boolean> => {
    return await this.atiCommonMethod.waitForAssessmentPageAndVerify();
  };

  addProductToAccount = async (batchId: string, password: string): Promise<void> => {
    await this.atiCommonMethod.addProductToAccount(batchId, password);
  };

  waitForPageLoadAndVerifyNavigation = async (
    urlPattern: RegExp | string,
    timeout: number = 30000
  ): Promise<void> => {
    await this.atiCommonMethod.waitForPageLoadAndVerifyNavigation(urlPattern, timeout);
  };
}
