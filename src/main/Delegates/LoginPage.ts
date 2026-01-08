import { expect, type TestInfo } from '@playwright/test';
import type { Page } from 'playwright';
import { Logger } from '../Utils/Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

export class LoginPage {
  page: Page;
  private logger?: Logger;
  private locators: StudentFacingPageLocators;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.locators = new StudentFacingPageLocators(page);
    if (testInfo) {
      this.logger = new Logger(page, 'LoginPage', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  //   //  launchApplication = async () => {
  //         console.log("process.env.baseUrl: ", process.env.baseUrl);
  //         await this.page.goto(process.env.baseUrl, { waitUntil: 'load' });
  //          await this.page.getByRole('img', { name: 'Student', exact: true }).click();
  //         this.page.on('dialog', async dialog => {
  //          console.log(`Unhandled dialog detected: ${dialog.message()}`);
  //              await dialog.dismiss(); // This dismisses the dialog. Use dialog.accept() to accept.
  //           });
  //          await this.page.getByRole('link', { name: ' Log In' }).click();
  //     };

  fillStuUserName = async (Username: string) => {
    this.logger?.step(`Entering student username: ${Username}`);
    const usernameField = this.locators.usernameTextbox;
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type(Username);
    this.logger?.success('Student username entered');
  };

  fillfacUserName = async (Username: string) => {
    this.logger?.step(`Entering faculty username: ${Username}`);
    const usernameField = this.locators.usernameTextbox;
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type(Username);
    this.logger?.success('Faculty username entered');
  };

  fillStuPassword = async (Password: string) => {
    this.logger?.step('Entering student password');
    const passwordField = this.locators.passwordTextbox;
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type(Password);
    this.logger?.success('Student password entered');
  };

  fillfacPassword = async (Password: string) => {
    this.logger?.step('Entering faculty password');
    const passwordField = this.locators.passwordTextbox;
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type(Password);
    this.logger?.success('Faculty password entered');
  };

  // Enhanced existing clickLogin method - Designed by Shyan
  clickLogin = async () => {
    this.logger?.step('Clicking login button with dialog handling');
    const loginClickPromise = this.locators.loginButton.click();
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 5000 }).catch(() => null);
    await Promise.race([loginClickPromise, dialogPromise]);
    this.logger?.success('Login button clicked with dialog race handling');
  };

  verifyInstitution = async () => {
    await expect(this.page.getByText('Institution zzDevon. &')).toBeVisible();
  };

  HandlePopup = async () => {
    this.logger?.step('Handling popup Starts');
    try {
      const popup = this.page.locator('button[class="_pendo-close-guide"]');
      const isVisible = await popup.isVisible({ timeout: 20000 });
      if (isVisible) {
        await popup.click();
      } else {
        this.logger?.info('Popup did not appear, continuing without handling popup.');
      }
    } catch (error) {
      this.logger?.error('An error occurred while handling the popup:', error);
    }
    this.logger?.success('Handling popup Ends');
  };
}
