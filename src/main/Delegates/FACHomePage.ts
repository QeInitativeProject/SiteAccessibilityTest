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
    await this.page.locator('//a[@href="/faculty/proctor"]').click();
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
    await this.page.locator('//span[text()="APPROVE"]').click();
  };

  startTest = async () => {
    await this.page.locator('//span[text()="START TEST"]').click();
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
}
