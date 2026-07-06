import type { Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { MyATIPage } from './MyATIPage';
import { Logger } from '../Utils/Logger';

export class FACHomePage {
  page: Page;
  public assessmentID: string | null = null;
  private logger?: Logger;
  private ati: MyATIPage;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.ati = new MyATIPage(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'FACHomePage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.ati.setLogger(logger);
  }

  /**
   * Click on Student Catalog Access from sidebar menu
   */
  clickStudentCatalogAccess = async (): Promise<void> => {
    this.logger?.step('Clicking Student Catalog Access');
    const studentCatalogBtn = this.page.locator('(//span[@class="mat-mdc-list-item-unscoped-content mdc-list-item__primary-text"])[8]');
    const lazyLoader = this.page.locator('text=Loading...').first();
    await studentCatalogBtn.waitFor({ state: 'visible', timeout: 20000 });
    await studentCatalogBtn.scrollIntoViewIfNeeded();
    await studentCatalogBtn.click({ force: true });
    await lazyLoader.waitFor({ state: 'visible', timeout: 50000 }).catch(() => {
      this.logger?.info('Student Catalog lazy loader did not become visible');
    });
    await lazyLoader.waitFor({ state: 'hidden', timeout: 50000 }).catch(() => {
      this.logger?.info('Student Catalog lazy loader did not fully disappear within timeout');
    });
    await this.page.waitForLoadState('load');
    this.logger?.success('Student Catalog Access clicked');
  };

  /**
   * Navigate to Assessment Builder page for setting up proctoring
   */
  clickAssessmentsTab = async (): Promise<void> => {
    this.logger?.step('Clicking Assessments button');

    const assessmentButton = this.page.locator('(//span[@class="mdc-tab__text-label"])[3]');


    
        await assessmentButton.waitFor({ state: 'visible', timeout: 5000 });
        await assessmentButton.scrollIntoViewIfNeeded();
        await assessmentButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('load');
        this.logger?.success('Assessments button clicked');

      
    
  };

  /**
   * Search for assessment by name
   * @param assessmentName - Name of the assessment to search for
   */
  searchAssessment = async (assessmentName: string): Promise<void> => {
    this.logger?.step(`Searching for assessment: ${assessmentName}`);
    
    // Look for search input with placeholder containing 'search' (case insensitive)
    const searchBox = this.page.locator('//input[@name="search"]').first();
    
    // Scroll it into view if needed
    await searchBox.scrollIntoViewIfNeeded().catch(() => {
      this.logger?.step('Could not scroll search box, trying anyway');
    });
    
    // Wait for it to be visible (scroll into view might help)
    await searchBox.waitFor({ state: 'visible', timeout: 10000 });
    await searchBox.fill(assessmentName);
    await this.page.waitForTimeout(2000);
    this.logger?.success(`Assessment search: ${assessmentName}`);
  };

  /**
   * Click on assessment card by name
   * @param assessmentName - Name of the assessment card to click
   */
  clickAssessmentCard = async (assessmentName: string): Promise<void> => {
    this.logger?.step(`Clicking assessment card: ${assessmentName}`);
      const assessmentCard = this.page.locator(`//span[@class="assessment-card-name" and text()="${assessmentName}"]`);
    await assessmentCard.waitFor({ state: 'visible', timeout: 10000 });
    await assessmentCard.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('load');
    this.logger?.success(`Assessment card clicked: ${assessmentName}`);
  };

  /**
   * Click Proctor Insights icon for a specific batch ID.
   * @param batchId - Batch ID whose proctor insights icon should be clicked
   */
  clickProctorInsightsIcon = async (batchId: string): Promise<void> => {
    this.logger?.step(`Clicking Proctor Insights for batch ID: ${batchId}`);
      const batchRow = this.page.locator('mat-row, tr, [role="row"], .mat-mdc-row, .mat-row').filter({ hasText: batchId }).first();
      await batchRow.waitFor({ state: 'visible', timeout: 15000 });

      const proctorButton = batchRow.locator('xpath=.//button[.//mat-icon[normalize-space()="assessment"]]').first();
      const proctorIcon = batchRow.locator('xpath=.//mat-icon[normalize-space()="assessment"]').first();
      await proctorIcon.waitFor({ state: 'visible', timeout: 15000 });

      if (await proctorButton.isVisible()) {
        await proctorButton.scrollIntoViewIfNeeded();
        await proctorButton.click({ force: true });
      } else {
        await proctorIcon.scrollIntoViewIfNeeded();
        await proctorIcon.click({ force: true });
      }
    await this.page.waitForTimeout(10000);
    await this.page.waitForLoadState('load');
    this.logger?.success(`Proctor Insights clicked for batch ID: ${batchId}`);
  };

  /**
   * Enable a specific batch from the Assessments grid, if currently disabled.
   * @param batchId - Batch ID whose Enable toggle should be set to ON
   */
  enableBatchById = async (batchId: string): Promise<void> => {
    this.logger?.step(`Enabling batch for batch ID: ${batchId}`);

    const rowMatcher = new RegExp(`\\b${batchId}\\b`);
    let batchRow = this.page.locator('[role="row"]').filter({ hasText: rowMatcher }).first();

    // If batch not on current page, navigate through pagination
    if (!(await batchRow.isVisible().catch(() => false))) {
      this.logger?.info('Batch not on current page, navigating to next page...');
      const nextBtn = this.page.locator('button.mat-mdc-paginator-navigation-next');
      for (let i = 0; i < 20; i++) {
        if (await nextBtn.isEnabled().catch(() => false)) {
          await nextBtn.click();
          await this.page.waitForTimeout(2000);
          batchRow = this.page.locator('[role="row"]').filter({ hasText: rowMatcher }).first();
          if (await batchRow.isVisible().catch(() => false)) break;
        } else {
          break;
        }
      }
    }

    await batchRow.waitFor({ state: 'visible', timeout: 15000 });

    // Enable toggle lives in the same row and exposes current state through aria-checked.
    const enableSwitch = batchRow.locator('button[role="switch"]').first();
    await enableSwitch.waitFor({ state: 'visible', timeout: 15000 });
    const isEnabled = (await enableSwitch.getAttribute('aria-checked')) === 'true';

    if (!isEnabled) {
      this.logger?.step(`Batch ${batchId} is disabled. Enabling now.`);
      await enableSwitch.scrollIntoViewIfNeeded();
      await enableSwitch.click({ force: true });

      // Handle confirmation dialog if it appears
      const confirmBtn = this.page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK"), button:has-text("Enable")');
      try {
        await confirmBtn.first().waitFor({ state: 'visible', timeout: 5000 });
        this.logger?.info('Confirmation dialog detected, clicking confirm...');
        await confirmBtn.first().click();
      } catch {
        // No confirmation dialog appeared
      }

      await expect(enableSwitch).toHaveAttribute('aria-checked', 'true', { timeout: 15000 });
      await this.page.waitForTimeout(5000);
      this.logger?.success(`Batch ${batchId} enabled`);
    } else {
      this.logger?.info(`Batch ${batchId} already enabled`);
    }
  };

  /**
   * Click Proctor Insights icon for a specific batch.
   * @param batchId - Batch ID whose Proctor Insights icon should be clicked
   */
  clickProctorInsightsIconByBatchId = async (batchId: string): Promise<void> => {
    this.logger?.step(`Clicking Proctor Insights icon for batch ID: ${batchId}`);

    const rowMatcher = new RegExp(`\\b${batchId}\\b`);
    const batchRow = this.page.locator('mat-row, tr, [role="row"], .mat-mdc-row, .mat-row').filter({ hasText: rowMatcher }).first();
    await batchRow.waitFor({ state: 'visible', timeout: 20000 });

    const proctorButton = batchRow.locator('xpath=.//button[.//mat-icon[normalize-space()="assessment"]]').first();
    await expect(proctorButton).toBeVisible({ timeout: 15000 });
    await expect(proctorButton).toBeEnabled({ timeout: 15000 });
    await proctorButton.scrollIntoViewIfNeeded();
    await proctorButton.click({ force: true });
    await this.page.waitForLoadState('load', { timeout: 30000 }).catch(() => {
      this.logger?.info('Full page load state not reached after clicking Proctor Insights');
    });
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      this.logger?.info('Network did not become idle after clicking Proctor Insights');
    });

    this.logger?.success(`Proctor Insights icon clicked for batch ID: ${batchId}`);
  };

  validateHeaderTitle = async (_header: string) => {
    await expect(this.page.locator('.blockUI.bblockPagelockMsg.')).toHaveCount(0);
    await expect(this.page.getByText('My Cohorts')).toBeVisible();
    await expect(this.page.getByRole('main')).toContainText('My Cohorts');
  };

  clickOnMenuBar = async () => {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
  };

  visiblecustomizeHomePage = async () => {
    await expect(
      this.page.getByRole('button', { name: 'This button will Customize' })
    ).toBeVisible();
  };

  verifycustomizeHomePage = async () => {
    await expect(this.page.getByRole('main')).toContainText(
      'This button will Customize your home screen by choosing which cohorts you want to display and manage.CUSTOMIZE HOME'
    );
  };

  clickonCustomizeButton = async () => {
    await this.page.getByRole('button', { name: 'This button will Customize' }).click();
  };

  selectCohorts = async () => {
    await this.page.getByLabel('select row 26July').check();
    await this.page.getByLabel('select row 27July').check();
  };

  clickonSaveButton = async () => {
    await this.page.getByRole('button', { name: 'This button saves the' }).click();
  };

  clickonViewDashboard = async () => {
    await this.page.getByRole('button', { name: 'This button will take you to' }).click();
  };

  Visibilityofaddbtn = async () => {
    await expect(this.page.getByRole('button', { name: 'This button will add or' })).toBeVisible();
  };

  verifyButton = async () => {
    await expect(this.page.getByRole('main')).toContainText(
      'This button will add or remove the cohorts ADD / REMOVE COHORTS'
    );
  };

  clickonCatalog = async () => {
    await this.page.locator('//a[text()="My Catalog "]').click();
  };

  /*clickOnproducts = async () => {
    await this.page.getByRole('button', { name: 'Products' }).click();
  };
 
  clickOnProductsTab = async () => {
    await this.page.locator('//a[@href="/faculty/product/highlights"]').click();
  }
 
  clickOnFirstAssessment = async () => {
    await this.page.locator('((//div[@class="home-container assessments-two-per-row"])[1]/div/div/mat-card)[1]').click();
  }
 
  checkToggle = async () => {
    // Define the toggle locators
    const toggleOnLocator = this.page.locator('//*[local-name()="svg" and @class="mdc-switch__icon mdc-switch__icon--on"]');
    const toggleOffLocator = this.page.locator('//*[local-name()="svg" and @class="mdc-switch__icon mdc-switch__icon--off"]');
   
    // Wait for either toggle state to be visible
    await this.page.waitForSelector('//*[local-name()="svg" and (@class="mdc-switch__icon mdc-switch__icon--on" or @class="mdc-switch__icon mdc-switch__icon--off")]');
   
    if (await toggleOnLocator.isVisible()) {
        this.logger?.info('Toggle is currently ON - no action needed');
        // Toggle is already on, do nothing or perform actions for "on" state
    } else if (await toggleOffLocator.isVisible()) {
        this.logger?.step('Toggle is currently OFF - turning it ON');
        // Toggle is off, click to turn it on
        await this.page.locator('//button[contains(@class, "mdc-switch")]').click();
        await this.page.waitForTimeout(2000);
        this.logger?.success('Toggle has been turned ON');
    } else {
        this.logger?.info('Toggle state could not be determined');
    }
}
 
      fetchAssessmentID = async () => {
   
    const fullText = await this.page.locator("//span[contains(., 'ID:') and contains(., '24859484')]").textContent();
    this.logger?.debug('Full text:', fullText);
 
    // Extract the ID number using regex
    const idMatch = fullText?.match(/ID:\s*(\d+)/);
    const idNumber = idMatch ? idMatch[1] : null;
    this.logger?.debug('Extracted ID:', idNumber);
    this.assessmentID = idNumber;
    return idNumber;
   
}*/

  clickOnProctorTab = async () => {
    await this.page.locator('[]]').click();
  };

  closeGuidePage = async () => {
    await this.page.locator('//button[@class="_pendo-close-guide"]').click();
  };

  fillAssessmentID = async () => {
    await this.page.locator('//input[@type="text"]').fill('25278955');
    await this.page.keyboard.press('Enter');
    await this.page.locator('//input[@class="mdc-checkbox__native-control"]').click();
    await this.page.locator('//div[@class="fab-style-button-container-old"]/button').click();
  };

  proctorAggrementPage = async () => {
    /*await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('(//input[@class="mdc-checkbox__native-control"])[1]').click();
     await this.page.waitForTimeout(5000);
     await this.page.locator('//label[@for="signature"]').fill('Ashish');
     await this.page.locator('//button[@role="button"]').click();*/
    await this.page.locator('(//button[@role="button"]/span)[2]').click();
  };

  checkInStudents = async () => {
    await this.page
      .locator(
        '(//div[@class="flex flex-col"]/div[@class="ng-star-inserted"])[1]/div/div/mat-checkbox'
      )
      .click();
    await this.page.locator('//div[@class="header-message-container"]/button').click();
  };

  startProctoring = async () => {
    await this.page
      .locator('//div[@class="flex flex-row justify-center items-stretch"]/button')
      .click();
  };

  clickOnAssessments = async () => {
    await this.page.locator('//div[@id="mat-tab-label-0-2"]/span[2]').click();
  };

  handleStudentInNewBrowser = async () => {
    // Add a new tab for the student Login

    const studentTab = await this.page.context().newPage();
    await studentTab.goto(process.env.baseUrl); // Use your environment URL
    await studentTab.waitForLoadState();

    // Use your page object with the new studentTab
    const studentLoginPage = new LoginPage(studentTab);
    await studentLoginPage.fillStuUserName(process.env.stuUsernamezzcab);
    await studentLoginPage.fillStuPassword(process.env.stuPasswordzzcab);
    await studentLoginPage.clickLogin();
    this.logger?.success('Student Login in New Browser Completed');
    const studentati = new MyATIPage(studentTab);
    await studentati.clickOnMyATITab();
    await studentati.clickOnAssessmentsTab();
    await studentati.clickOnAddProduct();
    if (this.assessmentID) {
      await studentati.enterAssessmentID(this.assessmentID);
    }
    return studentTab;
  };

  handleAttestationPage = async () => {
    await this.page.locator('//input[@data-bind="textInput: fullName1"]').fill('test');
    await this.page.locator('#initial1').click();
    await this.page.locator('#initial1').fill('test');
    await this.page.locator('#initial2').click();
    await this.page.locator('#initial2').fill('test');
    await this.page.locator('#initial3').click();
    await this.page.locator('#initial3').fill('test');
    await this.page.locator('#fullName2').click();
    await this.page.locator('#fullName2').fill('test');
    await this.page.locator('#newAttestationAgreeLabel span.stu-mat-checkbox').click();
  };

  approveByProctor = async () => {
    await this.page.locator('//span[text()="APPROVE" or text()="RESUME"]').click();
  };

  startTest = async () => {
    await this.page.locator('(//button[@aria-label="Start or Resume Assessment"])[1]').click();
    await this.page.locator('//button[@onclick="closeEnterFullscreenDialog()"]').click();
  };

  clickonAddProduct = async () => {
    //await this.page.getByText('addAdd a Product').hover();
    //await expect(this.page.getByText('addAdd a Product')).toBeVisible();
    await this.page.locator("//div[@class='home-add-product']").click();
  };

  verifyModuleName = async () => {
    await expect(this.page.getByRole('alert')).toContainText('Modules:');
  };

  clickOnFilter = async () => {
    await this.page.getByRole('button', { name: 'Filter' }).click();
  };

  clickonContinue = async () => {
    await this.page.getByRole('button', { name: 'CONTINUE' }).click();
  };

  InstitutionDropdownNotDisplayed = async () => {
    await expect(this.page.getByRole('button', { name: 'Institution' })).toBeHidden();
  };

  logoutFaculty = async (): Promise<void> => {
    this.logger?.step('Logging out faculty');
    await this.page.goto(process.env.baseUrl + '/logout', { waitUntil: 'load' });
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(3000);
    this.logger?.success('Faculty logged out successfully');
  };
}