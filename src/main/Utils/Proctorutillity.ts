import type { BrowserContext, Page, TestInfo } from '@playwright/test';
import { LoginPage } from '../Delegates/LoginPage';
import { MyATIPage } from '../Delegates/MyATIPage';
import { Logger } from './Logger';

/**
 * ProctorUtility - Generic methods for Proctoring workflows
 * This class provides reusable methods for faculty proctoring operations
 * Note: Uses MyATIPage for common ATI navigation methods
 */
export class ProctorUtility {
  readonly page: Page;
  private logger?: Logger;
  public assessmentID: string | null = null;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    if (testInfo) {
      this.logger = new Logger(page, 'ProctorUtility', testInfo);
    }
  }

  // Method to set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Click on menu bar to open navigation
   * Note: This method is specific to faculty navigation
   */
  clickOnMenuBar = async (): Promise<void> => {
    this.logger?.step('Clicking menu bar');
    await this.page.locator('//div[@class="flex items-center"]/button').click();
    this.logger?.success('Menu bar clicked');
  };

  /**
   * Navigate to Proctor tab from faculty home page
   */
  navigateToProctorTab = async (): Promise<void> => {
    this.logger?.step('Navigating to Proctor tab');
    await this.page.locator('//a[@href="/faculty/proctor"]').click();
    this.logger?.success('Navigated to Proctor Tab');
  };

  /**
   * Fill assessment ID and proceed to proctor setup
   * @param assessmentId - The assessment ID to proctor
   */
  fillAssessmentID = async (assessmentId: string): Promise<void> => {
    this.logger?.step(`Filling assessment ID: ${assessmentId}`);
    await this.page.locator('//mat-label[starts-with(text(),"Search")]').click({ timeout: 3000 }).catch(() => this.logger?.info('Close button not found or already closed'));
    await this.page.locator('//mat-label[starts-with(text(),"Search")]').fill(assessmentId);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
    await this.page.locator('//input[@type="checkbox"]').click();
    //await this.page.locator('(//span[text()="CONTINUE"])[2]').click();
    await this.page.locator('//button[@color="primary"]//span[text()="CONTINUE"]').click();


    
    this.assessmentID = assessmentId;
    this.logger?.success(`Assessment ID filled: ${assessmentId}`);
  };

  /**
   * Complete proctor agreement page by clicking continue
   */
  completeProctorAgreementPage = async (): Promise<void> => {
    this.logger?.step('Completing proctor agreement page');
    await this.page.locator('(//div[@class="mdc-checkbox"])[1]').click();
    await this.page.locator('(//div[@class="mdc-checkbox"])[2]').click();
    await this.page.locator('(//div[@class="mdc-checkbox"])[3]').click();
    await this.page.locator('(//div[@class="mdc-checkbox"])[4]').click();
    await this.page.locator('(//div[@class="mdc-checkbox"])[5]').click();
    await this.page.locator('(//div[@class="mdc-checkbox"])[6]').click();
    await this.page.locator('//mat-label[text()="Electronic Signature"]').fill('Ashish Ranjan');

    await this.page.locator('(//button[@role="button"]/span)[2]').click();
    this.logger?.success('Proctor agreement page completed');
  };

  /**
   * Check in students for the proctored assessment
   */
  checkInStudents = async (): Promise<void> => {
    this.logger?.step('Checking in students');
    await this.page
      .locator(
        '(//button[@color="primary"])[1]'
      )
      .click();
    //await this.page.locator('//div[@class="header-message-container"]/button').click();
    this.logger?.success('Students checked in successfully');
  };

  /**
   * Start the proctoring session
   */
  startProctoring = async (): Promise<void> => {
    this.logger?.step('Starting proctoring session');
    await this.page
      .locator('//div[@class="flex flex-row justify-center items-stretch"]/button')
      .click();
    this.logger?.success('Proctoring session started');
  };

  clickOnAddProduct = async () => {
    await this.page.locator('(//a[@data-atiid="addProductAction"])[4]').click();
  };

  enterAssessmentID = async (assessmentID: string) => {
    await this.page.locator('//input[@placeholder="Enter ID"]').fill(assessmentID);
    await this.page
      .locator("//form[@id='adForm']/section[@class='step-modal-nav']/a/span[text()='Continue']")
      .click();
    await this.page.waitForLoadState('load');
  };

  /**
   * Handle student login in a new browser tab/page
   * @param context - Browser context to create new page
   * @param studentUsername - Student username from environment
   * @param studentPassword - Student password from environment
   * @param baseUrl - Base URL for the application
   * @param assessmentId - Assessment ID to enter (optional, uses this.assessmentID if not provided)
   * @returns Promise<Page> - The new student page
   */
  handleStudentInNewBrowser = async (
    context: BrowserContext,
    studentUsername: string,
    studentPassword: string,
    baseUrl: string,
    assessmentId?: string
  ): Promise<Page> => {
    const studentTab = await context.newPage();
    await studentTab.goto(baseUrl);
    await studentTab.waitForLoadState();

    // Student login using LoginPage
    const studentLoginPage = new LoginPage(studentTab);
    await studentLoginPage.fillStuUserName(studentUsername);
    await studentLoginPage.fillStuPassword(studentPassword);
    await studentLoginPage.clickLogin();
    this.logger?.success('Student logged in successfully in new tab');

    // Navigate to assessments and add product using MyATIPage
    const studentATI = new MyATIPage(studentTab);
    await studentATI.clickOnMyATITab();
    await studentATI.clickOnAssessmentsTab();
    await studentATI.clickOnAddProduct();
    await studentATI.enterAssessmentID(assessmentId || this.assessmentID || '');
    // await studentATI.clickOnAddProductAtHomePage();

    const _idToUse = assessmentId || this.assessmentID;
    // if (idToUse) {
    //   await studentATI.enterAssessmentID(idToUse);
    //   console.log(`✅ Assessment ID ${idToUse} entered for student`);
    // }

    return studentTab;
  };

  /**
   * Fill attestation page with generic test data
   * @param fullName - Full name to enter (default: 'test')
   * @param initial1 - First initial (default: 'test')
   * @param initial2 - Second initial (default: 'test')
   * @param initial3 - Third initial (default: 'test')
   * @param fullName2 - Second full name (default: 'test')
   */
  fillAttestationPage = async (
    fullName: string = 'test',
    initial1: string = 'test',
    initial2: string = 'test',
    initial3: string = 'test',
    fullName2: string = 'test'
  ): Promise<void> => {
    await this.page
      .locator(
        '//form[@id="assessmentLoadForm"]/following-sibling::div[1]/section/div[4]/div[3]/input'
      )
      .fill(fullName);
    await this.page.locator('#initial1').click();
    await this.page.locator('#initial1').fill(initial1);
    await this.page.locator('#initial2').click();
    await this.page.locator('#initial2').fill(initial2);
    await this.page.locator('#initial3').click();
    await this.page.locator('#initial3').fill(initial3);
    await this.page.locator('#fullName2').click();
    await this.page.locator('#fullName2').fill(fullName2);
    await this.page.locator('(//label[@id="disabledApplyProductCheckbox"])[2]').click();
    this.logger?.success('Attestation page filled successfully');
  };

  /**
   * Approve student by proctor
   */
  approveByProctor = async (): Promise<void> => {
    //await this.page.locator('//span[text()="APPROVE"]').click();
    await this.page.locator('//span[text()="APPROVE"]').click({ timeout: 8000 }).catch(() => this.logger?.info('Approve button not found'));
    this.logger?.success('Student approved by proctor');
  };

/**
   * Resume student by proctor
   */
  resumeByProctor = async (): Promise<void> => {
    //await this.page.locator('//span[text()="RESUME"]').click();
    await this.page.locator('//span[text()="RESUME"]').click({ timeout: 8000 }).catch(() => this.logger?.info('Resume button not found'));
    this.logger?.success('Student resumed by proctor');
  };


  /**
   * Start the test for the student
   */
  startTest = async (): Promise<void> => {
    await this.page.locator('(//div[@class="proctor-agree-controls"])[2]/button').click();
    await this.page.locator('//button[@onclick="closeEnterFullscreenDialog()"]').click();
    await this.page.waitForLoadState('load');
    this.logger?.success('Test started successfully');
  };

 /**
   * Resume the test for the student
   */
  resumeTest = async (): Promise<void> => {
    await this.page.locator('(//div[@class="proctor-agree-controls"])[2]/button').click();
    await this.page.locator('//button[@onclick="closeEnterFullscreenDialog()"]').click();
    await this.page.waitForLoadState('load');
    this.logger?.success('Test resumed successfully');
  };



  /**
   * Close the guide/help page if it appears
   */
  closeGuidePage = async (): Promise<void> => {
    try {
      await this.page.locator('//button[@class="_pendo-close-guide"]').click({ timeout: 5000 });
      this.logger?.success('Guide page closed');
    } catch (error) {
      this.logger?.info('No guide page to close');
    }
  };

  /**
   * Get current assessment ID
   * @returns string | null - The current assessment ID
   */
  getAssessmentID = (): string | null => {
    return this.assessmentID;
  };

  /**
   * Set assessment ID
   * @param assessmentId - The assessment ID to set
   */
  setAssessmentID = (assessmentId: string): void => {
    this.assessmentID = assessmentId;
  };
}
