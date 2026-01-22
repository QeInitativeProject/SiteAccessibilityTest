import { expect, type TestInfo } from '@playwright/test';
import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { Logger } from '../Utils/Logger';

export class CABPage {
  page: Page;
  private logger?: Logger;
  private loginPage: LoginPage;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.loginPage = new LoginPage(this.page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'CABPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
    this.loginPage.setLogger(logger);
  }

  // Method for navigate From FAC page to CAB page
  navigateCABPage = async () => {
    try {
      this.logger?.step('Navigate CABPage Started');
      //await expect(this.page.getByText('Institution zzDevon. &')).toBeVisible();
      await expect(this.page.locator('#mainToolbar a')).toBeVisible();

      await this.page.getByRole('button', { name: 'Open Menu' }).click();
      const assessment_builder_button = this.page.getByRole('button', {
        name: 'Assessment Builder',
      });
      await assessment_builder_button.waitFor({ state: 'visible', timeout: 30000 });
      this.logger?.success('CAB Button is visible.');

      // await assessment_builder_button.getByRole('button', { name: 'Assessment Builder' }).click();
      await this.page.locator('.mdc-list-item__content').nth(3).click();
      await this.page.waitForLoadState('load');

      await this.loginPage.HandlePopup();
      await this.loginPage.HandlePopup();

      // await this.page.goto('https://cab.stg.atitesting.com/index.html#/Assessments/app?InstitutionID=7717');
      await expect(
        this.page.getByRole('heading', { name: 'Custom Assessment Builder' })
      ).toBeVisible();
      await expect(this.page.getByRole('tab', { name: 'Assessments' }).locator('a')).toBeVisible();
    } catch (error) {
      this.logger?.error('Error navigating to CAB Page:', error);
      throw error;
    }
    this.logger?.success('Navigate CABPage Ends');
  };

  // Method for Searching the reated Assessment
  searchAssessment = async (assessmentName: string) => {
    try {
      this.logger?.step('Search Assessment Started');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await expect(this.page.getByLabel('Assessment Name:')).toBeVisible();
      await this.page.getByLabel('Assessment Name:').click();
      await this.page.getByLabel('Assessment Name:').fill(assessmentName);
    } catch (error) {
      this.logger?.error('Error Search in the assessment:', error);
      throw error;
    }
    this.logger?.success('Search Assessment Ends');
  };

  // Method to click on the Apply filter from the CAB search page
  ApplyFilter = async () => {
    try {
      this.logger?.step('Apply filter start');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await expect(this.page.getByText('Apply Filter')).toBeVisible();
      await this.page.getByText('Apply Filter').click();
    } catch (error) {
      this.logger?.error('Error in Applying filter:', error);
      throw error;
    }
    this.logger?.success('Apply filter Ends');
  };

  // Method to click on the Actions button from the CAB search page
  clickActions = async () => {
    try {
      this.logger?.step('click Actions start');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.page.getByRole('link', { name: 'Actions' }).nth(0).click();
    } catch (error) {
      this.logger?.error('Error in clicking Action button:', error);
      throw error;
    }
    this.logger?.success('click Actions ends');
  };

  // Method to click on edit button from the CAB search page
  clickEdit = async () => {
    try {
      this.logger?.step('click clickEdit start');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.page.getByRole('link', { name: 'Edit' }).nth(0).click();
    } catch (error) {
      this.logger?.error('Error in clicking clickEdit button:', error);
      throw error;
    }
    this.logger?.success('click clickEdit ends');
  };

  // Method to click on the Continue button Access and Question tabs
  clickcontinue = async () => {
    try {
      this.logger?.step('click Continue start');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.page.getByRole('link', { name: "Continue ''" }).click();
    } catch (error) {
      this.logger?.error('Error in clicking Continue button:', error);
      throw error;
    }
    this.logger?.success('click Continue ends');
  };

  // Method to click on the Action and delete the assessment
  deleteAssessment = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      this.logger?.step('delete assessment start');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await expect(this.page.locator('a').filter({ hasText: 'Delete' })).toBeVisible();
      await this.page.locator('a').filter({ hasText: 'Delete' }).click();
      await expect(this.page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
      await expect(this.page.getByRole('button', { name: 'Yes' })).toBeVisible();
      await this.page.getByRole('button', { name: 'Yes' }).click();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      this.logger?.error('Error in clicking delete button:', error);
      throw error;
    }
    this.logger?.success('delete button ends');
  };

  searchAssessment1 = async (page: Page) => {
    this.logger?.step('Search Assessment1 Started');
    await expect(page.getByText('Search Assessment Name or')).toBeVisible();
    await expect(page.getByPlaceholder('Enter at least 3 characters')).toBeVisible();
    await page.getByPlaceholder('Enter at least 3 characters').click();
    await page.getByPlaceholder('Enter at least 3 characters').fill('qwer');
    await page.getByPlaceholder('Enter at least 3 characters').press('Enter');
    await expect(page.getByRole('rowgroup').nth(1)).toBeVisible();
    await expect(page.getByText('Assessments: 0')).toBeVisible();
    this.logger?.success('Search Assessment1 Ends');
  };

  clickFilter = async () => {
    this.logger?.step('Click Filter Started');
    await expect(this.page.getByRole('button', { name: "'' Manage" })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Filter' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Filter' }).click();
    await this.page.locator('#ag-70-input').click();
    await this.page.locator('#ag-70-input').fill('assess');
    await this.page.locator('#ag-70-input').press('Enter');
    //await expect(page.getByText('No matches.').first()).toBeVisible();
    await this.page.getByRole('button', { name: 'Reset' }).first().click();
    await expect(this.page.getByRole('button', { name: ' Content Areas' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: ' Type' })).toBeVisible();
  };
}
