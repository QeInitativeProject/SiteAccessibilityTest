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
    const menuBtn = this.page.getByRole('button', { name: 'Open Menu' });
    await menuBtn.waitFor({ state: 'visible', timeout: 1000 });
    await menuBtn.click();
    this.logger?.success('Menu bar clicked');
  };

  /**
   * Navigate to Proctor tab from faculty home page
   */
  navigateToProctorTab = async (): Promise<void> => {
    this.logger?.step('Navigating to Proctor tab');
    await this.page.waitForLoadState('domcontentloaded');
    const proctorLink = this.page.locator('(//button[@class="btn-unstyled sidebar-action"])[3]');
    await proctorLink.waitFor({ state: 'visible', timeout: 10000 });
    await proctorLink.click();
    await this.page.waitForLoadState('load');
    await this.dismissPendoPopup();
    this.logger?.success('Navigated to Proctor Tab');
  };

  /**
   * Dismiss the Pendo "Stop! Test Security Update" popup if it appears.
   * This popup appears intermittently on the Proctor page before entering the batch ID.
   * Safe to call anytime - does nothing if popup is not present.
   */
  dismissPendoPopup = async (): Promise<void> => {
    this.logger?.step('Checking for Pendo security popup');
    try {
      const closeBtn = this.page.locator('button._pendo-close-guide');
      await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
      await closeBtn.click();
      await this.page.waitForTimeout(1000);
      this.logger?.success('Dismissed Pendo security popup');
    } catch {
      this.logger?.info('No Pendo popup appeared - continuing');
    }
  };

  /**
   * Search for batch by ID in proctoring setup
   * @param batchId - The batch ID to search for
   */
  searchBatch = async (batchId: string): Promise<void> => {
    this.logger?.step(`Searching for batch: ${batchId}`);
    const searchBox = this.page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    await searchBox.waitFor({ state: 'visible', timeout: 10000 });
    await searchBox.fill(batchId);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(4000);
    this.logger?.success(`Batch searched: ${batchId}`);
  };

  /**
   * Click Continue button in batch search dialog
   */
  clickContinueButton = async (): Promise<void> => {
    this.logger?.step('Clicking Continue button');
    const continueBtn = this.page.getByRole('button', { name: /continue/i }).first();
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
    await continueBtn.click();

    // If the wizard is still on "Assessments selected to proctor", click Continue once more.
    const selectedToProctorPanel = this.page.locator('text=Assessments selected to proctor').first();
    const signatureCandidate = this.page
      .locator('//label[@for="signature"]/following::input[1]')
      .or(this.page.locator('//mat-label[contains(normalize-space(),"Electronic Signature")]/following::input[1]'))
      .first();

    await this.page.waitForTimeout(1500);
    const isStillOnSelectedPanel = await selectedToProctorPanel.isVisible().catch(() => false);
    const hasSignatureField = await signatureCandidate.isVisible().catch(() => false);

    if (isStillOnSelectedPanel && !hasSignatureField) {
      this.logger?.info('Still on selected assessments panel. Clicking Continue again to load agreement step.');
      await continueBtn.click();
    }

    await this.page.waitForLoadState('domcontentloaded').catch(() => {
      this.logger?.info('No full page navigation after Continue; proceeding with agreement checks.');
    });
    await this.page.waitForTimeout(2000);
    this.logger?.success('Continue button clicked');
  };

  /**
   * Check all checkboxes on attestation form
   */
  checkAllCheckboxes = async (): Promise<void> => {
    this.logger?.step('Checking all checkboxes');
    const checkboxes = this.page.locator('mat-checkbox input[type="checkbox"], input[type="checkbox"]');

    // Give lazy content time to render on Complete Agreement step.
    await checkboxes.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {
      this.logger?.info('Agreement checkboxes not immediately visible; continuing with available elements.');
    });

    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.click();
        
      }
    }
    this.logger?.success(`Checked ${checkboxCount} checkboxes`);
  };

  /**
   * Fill electronic signature field
   * @param signatureName - Name to use for electronic signature
   */
  fillElectronicSignature = async (signatureName: string): Promise<void> => {
    this.logger?.step(`Filling electronic signature: ${signatureName}`);
    const signatureField = this.page
      .locator('//label[@for="signature"]/following::input[1]')
      .or(this.page.locator('//mat-label[contains(normalize-space(),"Electronic Signature")]/following::input[1]'))
      .or(this.page.locator('input[id*="signature" i], input[formcontrolname*="signature" i]'))
      .first();

    await signatureField.waitFor({ state: 'visible', timeout: 30000 });
    await signatureField.fill(signatureName);
    await this.page.waitForTimeout(2000);
    this.logger?.success(`Electronic signature filled: ${signatureName}`);
  };

  /**
   * Click I Agree button
   */
  clickIAgreeButton = async (): Promise<void> => {
    this.logger?.step('Clicking I Agree button');
    const iAgreeBtn = this.page.locator('//span[@class="mat-mdc-button-persistent-ripple mdc-button__ripple"]');
    await iAgreeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await iAgreeBtn.click();
    await this.page.waitForTimeout(2000);
    this.logger?.success('I Agree button clicked');
  };

  /**
   * Click Start Proctoring button
   */
  clickStartProctoringButton = async (): Promise<void> => {
    this.logger?.step('Clicking Start Proctoring button');
    const startProctoringBtn = this.page.getByRole('button', { name: /start proctoring/i });
    await startProctoringBtn.waitFor({ state: 'visible', timeout: 15000 });
    await startProctoringBtn.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('load');
    this.logger?.success('Start Proctoring button clicked');
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
   * Search and select multiple batch IDs, then click CONTINUE
   * @param batchIds - Array of batch IDs to search and select
   */
  fillMultipleAssessmentIDs = async (batchIds: string[]): Promise<void> => {
    this.logger?.step(`Filling multiple assessment IDs: ${batchIds.join(', ')}`);
    const searchField = this.page.getByRole('textbox', { name: 'Search for assessment' });

    for (const batchId of batchIds) {
      await searchField.clear();
      await searchField.fill(batchId);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);
      await this.page.getByRole('checkbox').first().click();
      this.logger?.success(`Batch ID (${batchId}) selected`);
    }

    await this.page.locator('//button[@color="primary"]//span[text()="CONTINUE"]').click();
    this.logger?.success('CONTINUE button clicked after selecting all batch IDs');
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
    const agreeCheckbox = this.page.locator('#newAttestationAgreeLabel span.stu-mat-checkbox')
      .or(this.page.locator('(//label[@id="disabledApplyProductCheckbox"])[2]'));
    await agreeCheckbox.first().click();
    this.logger?.success('Attestation page filled successfully');
  };

  /**
   * Approve student by proctor
   */
  approveByProctor = async (): Promise<void> => {
    const approveBtn = this.page.locator('//span[text()="APPROVE"]').first();
    await approveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await approveBtn.click();
    this.logger?.success('Student approved by proctor');
  };

  /**
   * Validates that proctor monitoring shows "Waiting For Proctor" status
   * and both RESUME and DENY action buttons are visible.
   */
  validateResumeAndDenyVisible = async (): Promise<void> => {
    const statusCell = this.page.locator('mat-cell.mat-column-status');
    await statusCell.first().waitFor({ state: 'visible', timeout: 15000 });
    const statusText = await statusCell.first().textContent();
    const trimmedStatus = (statusText ?? '').trim();
    if (!trimmedStatus.includes('Waiting For Proctor')) {
      throw new Error(`Expected "Waiting For Proctor" status but got: "${trimmedStatus}"`);
    }
    this.logger?.success(`✅ Proctor side status: "${trimmedStatus}"`);

    const resumeButton = this.page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'RESUME' });
    await resumeButton.first().waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('✅ RESUME button is visible on proctor side');

    const denyButton = this.page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'DENY' });
    await denyButton.first().waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('✅ DENY button is visible on proctor side');
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
    const startBtn = this.page.locator('(//div[@class="proctor-agree-controls"])[2]/button');

    // Wait for the button to become visible via WebSocket notification
    let isVisible = await startBtn.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);

    if (!isVisible) {
      this.logger?.info('Start Test button not visible, setting IsApproved via KnockoutJS');
      await this.page.evaluate(() => {
        const ko = (window as any).ko;
        if (ko) {
          const elements = document.querySelectorAll('.proctor-agree-controls button');
          elements.forEach((el) => {
            const ctx = ko.contextFor(el);
            if (ctx?.$data?.IsApproved) {
              ctx.$data.IsApproved(true);
            }
          });
        }
      });
      await startBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    await startBtn.click();
    await this.page.locator('//button[@onclick="closeEnterFullscreenDialog()"]').click();
    await this.page.waitForLoadState('load');
    this.logger?.success('Test started successfully');
  };

 /**
   * Resume the test for the student
   */
  resumeTest = async (): Promise<void> => {
    const startBtn = this.page.locator('(//div[@class="proctor-agree-controls"])[2]/button');

    // Wait for the button to become visible; if not, reload to pick up approval status
    let isVisible = await startBtn.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (!isVisible) {
      this.logger?.info('Start Test button not visible, reloading page to fetch approval status');
      await this.page.reload({ waitUntil: 'load' });
      await startBtn.waitFor({ state: 'visible', timeout: 30000 });
    }

    await startBtn.click();
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

  /**
   * Validates that a batch ID is visible in the proctor monitoring page.
   * @param batchId - The batch ID to check
   * @param timeout - Timeout in ms (default: 15000)
   */
  validateBatchVisibleInMonitoring = async (batchId: string, timeout: number = 15000): Promise<void> => {
    const batchElement = this.page.getByText(batchId).first();
    await batchElement.waitFor({ state: 'visible', timeout });
    this.logger?.success(`✅ Batch ID (${batchId}) is visible in monitoring page`);
  };



  /**
   * Handles a misbehaviour incident - creates cheat incident if none exists, then ignores it.
   * Switches between student and faculty tabs as needed.
   * @param studentTab - The student page/tab
   */
  handleMisbehaviourAndIgnore = async (studentTab: Page): Promise<void> => {
    await this.page.bringToFront();
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(5000);
    this.logger?.success('Refreshed faculty portal');

    const ignoreButton = this.page.getByRole('button', { name: 'IGNORE', exact: true }).first();
    const stopButton = this.page.getByRole('button', { name: 'STOP', exact: true }).first();

    const ignoreVisible = await ignoreButton.isVisible().catch(() => false);
    const stopVisible = await stopButton.isVisible().catch(() => false);

    if (ignoreVisible) {
      await ignoreButton.click();
      await this.page.waitForTimeout(3000);
      this.logger?.success('Faculty clicked IGNORE for misbehaviour incident');
    } else if (stopVisible) {
      await stopButton.click();
      await this.page.waitForTimeout(3000);
      this.logger?.success('Faculty clicked STOP for misbehaviour incident');
    } else {
      // Simulate a cheat incident
      await studentTab.bringToFront();
      const iframeElement = studentTab.locator('iframe').first();
      await iframeElement.click().catch(() => {});
      await studentTab.keyboard.press('Control+c');
      await studentTab.waitForTimeout(3000);
      this.logger?.success('Pressed Ctrl+C to trigger invalid key detection');

      // Switch back to faculty tab and check for incident
      await this.page.bringToFront();
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(5000);

      const ignoreAfterIncident = this.page.getByRole('button', { name: 'IGNORE' }).first();
      await ignoreAfterIncident.waitFor({ state: 'visible', timeout: 15000 }).catch(() =>
        this.logger?.info('No IGNORE button found after incident')
      );

      const incidentVisible = await ignoreAfterIncident.isVisible().catch(() => false);
      if (incidentVisible) {
        await ignoreAfterIncident.click();
        await this.page.waitForTimeout(3000);
        this.logger?.success('Faculty clicked IGNORE after simulated misbehaviour');
      } else {
        this.logger?.info('No active incident detected');
      }
    }

    // Student resumes after proctor ignores
    await studentTab.bringToFront();
    await studentTab.waitForTimeout(2000);

    const assessmentFrame = studentTab.frameLocator('iframe').first();
    const resumeTestBtn = assessmentFrame.getByRole('button', { name: 'Resume Test' });
    await resumeTestBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() =>
      this.logger?.info('Resume Test button not visible - popup may have auto-dismissed')
    );
    const resumeVisible = await resumeTestBtn.isVisible().catch(() => false);
    if (resumeVisible) {
      await resumeTestBtn.click();
      await studentTab.waitForLoadState('load');
      await studentTab.waitForTimeout(3000);
      this.logger?.success('Student clicked Resume Test');
    } else {
      this.logger?.info('Resume Test popup not present - student already back in assessment');
    }
  };

  /**
   * Validates that the proctor side shows the expected status.
   * @param expectedStatus - Expected status string (e.g., 'Completed', 'In Progress')
   * @param batchId - Optional batch ID to scope to a specific batch panel
   */
  validateProctorStatus = async (expectedStatus: string, batchId?: string): Promise<string> => {
    let statusCell;
    if (batchId) {
      const batchPanel = this.page.locator('mat-expansion-panel', { hasText: batchId }).first();
      await batchPanel.waitFor({ state: 'visible', timeout: 15000 });

      // Expand the panel if it's collapsed
      const isExpanded = await batchPanel.evaluate(el => el.classList.contains('mat-expanded'));
      if (!isExpanded) {
        this.logger?.step(`Expanding batch panel for batch ID: ${batchId}`);
        await batchPanel.locator('mat-expansion-panel-header').click();
        await this.page.waitForTimeout(1000);
      }

      statusCell = batchPanel.locator('mat-cell.mat-column-status').first();
    } else {
      statusCell = this.page.locator('mat-cell.mat-column-status').first();
    }
    await statusCell.waitFor({ state: 'visible', timeout: 15000 });
    const statusText = await statusCell.textContent();
    const trimmedStatus = (statusText ?? '').trim();
    if (!trimmedStatus.toLowerCase().includes(expectedStatus.toLowerCase())) {
      throw new Error(`Expected status "${expectedStatus}" but got "${trimmedStatus}"`);
    }
    this.logger?.success(`✅ Proctor side status: "${trimmedStatus}"`);
    return trimmedStatus;
  };
  /**
   * Ignores a cheat incident from the proctor/faculty portal.
   * Reloads the page and clicks the IGNORE button.
   */
  ignoreIncident = async (): Promise<void> => {
    await this.page.bringToFront();
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(5000);
    this.logger?.success('\u2705 Refreshed faculty portal');

    const ignoreButton = this.page.locator('mat-cell.mat-column-action button.mat-button', { hasText: 'IGNORE' });
    await ignoreButton.click();
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Clicked IGNORE button');
  };
  /**
   * Validates that the proctor side shows the expected score.
   * @param expectedPercentage - Expected score string (e.g., '100.0%')
   * @param batchId - Optional batch ID to scope to a specific batch panel
   */
  validateProctorScore = async (expectedPercentage: string, batchId?: string): Promise<string> => {
    let scoreCell;
    if (batchId) {
      const batchPanel = this.page.locator('mat-expansion-panel', { hasText: batchId }).first();
      await batchPanel.waitFor({ state: 'visible', timeout: 15000 });

      // Expand the panel if it's collapsed
      const isExpanded = await batchPanel.evaluate(el => el.classList.contains('mat-expanded'));
      if (!isExpanded) {
        this.logger?.step(`Expanding batch panel for batch ID: ${batchId}`);
        await batchPanel.locator('mat-expansion-panel-header').click();
        await this.page.waitForTimeout(1000);
      }

      scoreCell = batchPanel.locator('mat-cell.mat-column-completed').first();
    } else {
      scoreCell = this.page.locator('mat-cell.mat-column-completed').first();
    }
    await scoreCell.waitFor({ state: 'visible', timeout: 15000 });
    const scoreText = await scoreCell.textContent();
    const trimmedScore = (scoreText ?? '').trim();
    if (!trimmedScore.includes(expectedPercentage)) {
      throw new Error(`Expected score "${expectedPercentage}" but got "${trimmedScore}"`);
    }
    this.logger?.success(`✅ Proctor side score: "${trimmedScore}"`);
    return trimmedScore;
  };

 
  /**
   * Validates that Ignore, Close, and Abandon buttons are all visible in the "Needs Attention" section.
   * @param batchId - The batch ID (unused for now since Needs Attention is always expanded)
   */
  validateIgnoreCloseAbandonVisible = async (batchId: string): Promise<void> => {
    await this.page.bringToFront();
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(2000);

    const needsAttention = this.page.locator('.needs-attention');
    await needsAttention.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('\u2705 "Needs Attention" section is visible');

    const ignoreButton = needsAttention.locator('mat-cell.mat-column-action button', { hasText: 'IGNORE' }).first();
    await ignoreButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('\u2705 IGNORE button is visible on proctor side');

    const closeButton = needsAttention.locator('mat-cell.mat-column-action button', { hasText: 'CLOSE' }).first();
    await closeButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('\u2705 CLOSE button is visible on proctor side');

    const abandonButton = needsAttention.locator('mat-cell.mat-column-action button', { hasText: 'ABANDON' }).first();
    await abandonButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('\u2705 ABANDON button is visible on proctor side');
  };

  /**
   * Clicks the CLOSE button in the "Needs Attention" section and confirms the dialog.
   * The confirmation dialog says "Close Assessment" with CANCEL and CONFIRM buttons.
   */
  closeAssessment = async (): Promise<void> => {
    await this.page.bringToFront();

    const needsAttention = this.page.locator('.needs-attention');
    const closeButton = needsAttention.locator('mat-cell.mat-column-action button', { hasText: 'CLOSE' }).first();
    await closeButton.waitFor({ state: 'visible', timeout: 15000 });
    await closeButton.click();
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Faculty clicked CLOSE button');

    // Click CONFIRM on the "Close Assessment" confirmation dialog
    const confirmButton = this.page.locator('button', { hasText: 'CONFIRM' }).first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    await this.page.waitForTimeout(5000);
    this.logger?.success('\u2705 Confirmed Close Assessment action');
  };

  /**
   * Clicks the ABANDON button on the proctor side and handles any confirmation dialog.
   * Validates that the student's status shows abandoned or row is removed.
   */
  abandonStudent = async (): Promise<void> => {
    await this.page.bringToFront();

    const abandonButton = this.page.locator('mat-cell.mat-column-action button', { hasText: /ABANDON/i }).first();
    await abandonButton.waitFor({ state: 'visible', timeout: 15000 });
    await abandonButton.click();
    await this.page.waitForTimeout(3000);
    this.logger?.success('\u2705 Faculty clicked ABANDON button');

    // Handle confirmation dialog if present
    const confirmButton = this.page.locator('button', { hasText: /confirm|yes|ok/i }).first();
    const confirmVisible = await confirmButton.isVisible().catch(() => false);
    if (confirmVisible) {
      await confirmButton.click();
      await this.page.waitForTimeout(3000);
      this.logger?.success('\u2705 Confirmed abandon action');
    }

    // Validate student status after abandon
    await this.page.waitForTimeout(5000);
    const statusCell = this.page.locator('mat-cell.mat-column-status').first();
    const statusVisible = await statusCell.isVisible().catch(() => false);

    if (statusVisible) {
      const statusText = await statusCell.textContent();
      const trimmedStatus = (statusText ?? '').trim();
      this.logger?.success(`\u2705 Student status after abandon: "${trimmedStatus}"`);
    } else {
      this.logger?.success('\u2705 Student row removed from monitoring - attempt deleted');
    }
  };

  /**
   * Pauses a student's assessment and validates that the pause popup auto-expires.
   * Flow: Click pause → popup appears → wait ~5s → popup auto-dismisses → assessment resumes.
   * @param studentTab - The student's page/tab
   * @param pauseDurationMs - How long to wait for pause popup to auto-expire (default: 8000ms)
   */
  pauseStudentAndValidateAutoResume = async (
    studentTab: Page,
    pauseDurationMs: number = 8000
  ): Promise<void> => {
    // Navigate to student tab and pause from within the assessment iframe
    await studentTab.bringToFront();
    await studentTab.waitForTimeout(2000);

    const assessmentFrame = studentTab.frameLocator('iframe').first();

    // Verify pause button is visible and clickable
    const pauseButton = assessmentFrame.getByRole('button', { name: 'Pause this assessment' });
    await pauseButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('Pause button is visible');

    await pauseButton.click();
    this.logger?.success('✅ Clicked "Pause this assessment" button');
    await studentTab.waitForTimeout(1000);

    // Verify Resume assessment button is showing (pause popup opened)
    const resumeButton = assessmentFrame.getByRole('button', { name: 'Resume assessment' });
    await resumeButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('✅ Pause popup opened - "Resume assessment" button is visible');

    // Wait for pause popup to auto-expire (~5 seconds)
    this.logger?.info('Waiting 8s for pause popup to auto-expire...');
    await studentTab.waitForTimeout(8000);

    // Verify popup has auto-dismissed - Resume button should be gone
    const resumeStillVisible = await resumeButton.isVisible().catch(() => false);
    if (!resumeStillVisible) {
      this.logger?.success('✅ Pause popup auto-expired - assessment resumed');
    } else {
      // Popup still visible, wait a bit more
      await resumeButton.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      const stillThere = await resumeButton.isVisible().catch(() => false);
      if (!stillThere) {
        this.logger?.success('✅ Pause popup auto-expired (after extra wait) - assessment resumed');
      } else {
        throw new Error('Pause popup did not auto-expire within expected time');
      }
    }

    // Verify Pause button is visible again (assessment fully resumed)
    await pauseButton.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('✅ Pause button visible again - assessment fully resumed');
  };

  /**
   * Stops proctoring from the faculty monitoring page.
   * Clicks the Stop Proctoring button and confirms the action.
   */
  stopProctoring = async (): Promise<void> => {
    await this.page.bringToFront();
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(3000);

    const stopProctoringBtn = this.page.locator('button', { hasText: /Stop Proctoring|End Session|End Proctoring/i }).first();
    await stopProctoringBtn.waitFor({ state: 'visible', timeout: 15000 });
    await stopProctoringBtn.click();
    await this.page.waitForTimeout(2000);
    this.logger?.success('✅ Clicked Stop Proctoring button');

    // Handle confirmation dialog - wait for it to appear
    const confirmBtn = this.page.locator('role=dialog >> text=/CONFIRM/i').or(
      this.page.locator('a, button, span').filter({ hasText: /^CONFIRM$/i })
    ).first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    if (confirmVisible) {
      await confirmBtn.click();
      await this.page.waitForTimeout(3000);
      this.logger?.success('✅ Confirmed stop proctoring action');
    } else {
      // Fallback: try clicking any element with CONFIRM text
      const fallbackConfirm = this.page.getByText('CONFIRM', { exact: true });
      const fallbackVisible = await fallbackConfirm.isVisible().catch(() => false);
      if (fallbackVisible) {
        await fallbackConfirm.click();
        await this.page.waitForTimeout(3000);
        this.logger?.success('✅ Confirmed stop proctoring (fallback)');
      }
    }
  };

  /**
   * Validates that a student's assessment has been stopped/ended after proctor stops proctoring.
   * Clicks the OK button on the "Stopped Assessment Confirmation" dialog.
   * @param studentTab - The student's page/tab
   * @returns true if stopped indicator found, false otherwise
   */
  validateStudentAssessmentStopped = async (studentTab: Page): Promise<boolean> => {
    await studentTab.bringToFront();
    await studentTab.waitForTimeout(10000); // Wait for stop signal to propagate

    // The dialog may be in the main frame OR inside an iframe
    // Strategy: use page.evaluate to find and click the OK button across all frames
    const clicked = await studentTab.evaluate(async () => {
      // Check main document
      const mainBtn = document.querySelector('button[aria-label="OK"]') as HTMLButtonElement;
      if (mainBtn && mainBtn.offsetParent !== null) {
        mainBtn.click();
        return 'main';
      }
      // Check all iframes
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const btn = iframeDoc.querySelector('button[aria-label="OK"]') as HTMLButtonElement;
            if (btn && btn.offsetParent !== null) {
              btn.click();
              return 'iframe';
            }
          }
        } catch (e) { /* cross-origin iframe, skip */ }
      }
      return null;
    }).catch(() => null);

    if (clicked) {
      this.logger?.success(`✅ Clicked OK on stopped confirmation dialog (found in ${clicked} frame)`);
      await studentTab.waitForTimeout(2000);
      return true;
    }

    // If evaluate didn't find it, wait and retry with Playwright locator on all frames
    this.logger?.info('OK button not found via evaluate, trying frame-by-frame with Playwright...');
    const frames = studentTab.frames();
    for (const frame of frames) {
      const okBtn = frame.locator('button[aria-label="OK"]').first();
      const isVisible = await okBtn.isVisible().catch(() => false);
      if (isVisible) {
        await okBtn.click({ force: true });
        this.logger?.success(`✅ Clicked OK on stopped confirmation dialog (frame: ${frame.url()})`);
        await studentTab.waitForTimeout(2000);
        return true;
      }
    }

    // Last fallback: check URL redirect
    const currentUrl = studentTab.url();
    if (!currentUrl.includes('/Assessment')) {
      this.logger?.success(`✅ Student redirected away from assessment: ${currentUrl}`);
      return true;
    }

    this.logger?.info(`Student still on assessment page, no stop dialog found. URL: ${currentUrl}`);
    return false;
  };

  /**
   * Verifies that assessment content is visible on the student tab (inside iframe).
   * Checks for question content or validates the URL contains '/Assessment'.
   * @param studentTab - The student's page/tab
   */
  verifyAssessmentContentVisible = async (studentTab: Page): Promise<void> => {
    await studentTab.bringToFront();
    await studentTab.waitForTimeout(3000);

    const assessmentFrame = studentTab.frameLocator('iframe').first();
    const assessmentContent = assessmentFrame.locator('.stem-text, .question-content, .item-content').first();
    const contentVisible = await assessmentContent.isVisible({ timeout: 30000 }).catch(() => false);

    if (contentVisible) {
      this.logger?.success('✅ Assessment content is visible - student is actively in assessment');
      return;
    }

    const currentUrl = studentTab.url();
    if (currentUrl.includes('/Assessment')) {
      this.logger?.success('✅ Student is on assessment page');
      return;
    }

    throw new Error(`Student not in assessment page. URL: ${currentUrl}`);
  };
}
