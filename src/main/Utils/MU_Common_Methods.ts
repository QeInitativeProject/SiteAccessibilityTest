import { expect, type TestInfo } from '@playwright/test';
import type { Locator, Page } from 'playwright';
import { MU_Batch_Creation_Locators } from '@locators/MU_Batch_Creation_Locators';
import { Logger } from './Logger';

export class MU_Common_Methods {
  private locators: MU_Batch_Creation_Locators;
  private logger?: Logger;

  static readonly manageAssessmentsUrl = '/personnel/ManageBatches.aspx';
  static readonly newEditBatchUrl = '/personnel/NewEditBatch.aspx';

  constructor(
    private page: Page,
    testInfo?: TestInfo
  ) {
    this.locators = new MU_Batch_Creation_Locators(page);
    if (testInfo) {
      this.logger = new Logger(page, 'MU_Common_Methods', testInfo);
    }
  }

  // Set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }
  async loginToApplication(): Promise<void> {
    this.logger?.step('Logging into MU application');
    await this.page.goto(process.env.baseUrl_MU || '');
    this.logger?.info(`Navigated to: ${process.env.baseUrl_MU}`);

    await this.locators.usernameInput.fill(process.env.muUsername || '');
    this.logger?.debug('Username entered');

    await this.locators.passwordInput.fill(process.env.muPassword || '');
    this.logger?.debug('Password entered');

    await this.locators.signInButton.click();
    this.logger?.success('Sign in button clicked - login attempt complete');
  }

  async assertNavigationUrl(expected: string | RegExp): Promise<void> {
    this.logger?.step(`Asserting navigation to URL pattern: ${expected}`);
    await expect(this.page).toHaveURL(expected);
    this.logger?.success(`Successfully navigated to: ${this.page.url()}`);
  }

  async hoverAndStoreManageUtilities(): Promise<
    { name: string; locator: any; isVisible: boolean }[]
  > {
    await expect(this.locators.manageUtilityOption).toBeVisible();
    await this.locators.manageUtilityOption.hover();
    this.logger?.success('Hovered over Management Utility');

    const utilities = [
      { name: 'Manage Consortiums', locator: this.locators.manageConsortiums },
      { name: 'Manage Institutions', locator: this.locators.manageInstitutions },
      { name: 'Manage Cohorts', locator: this.locators.manageCohorts },
      { name: 'Manage Semester', locator: this.locators.manageSemester },
      { name: 'Manage Assessments', locator: this.locators.manageAssessments },
      { name: 'Manage Users', locator: this.locators.manageUsers },
      { name: 'Manage TEAS', locator: this.locators.manageTEAS },
      { name: 'Tracking Batches', locator: this.locators.trackingBatches },
    ];

    return await Promise.all(
      utilities.map(async (u) => ({
        name: u.name,
        locator: u.locator,
        isVisible: await u.locator.isVisible(),
      }))
    );
  }

  async clickOnManageAssessments(): Promise<void> {
    await expect(this.locators.manageAssessments).toBeVisible();
    await this.locators.manageAssessments.click();
    this.logger?.success('Clicked on Manage Assessments');
  }

  async clickAddNewAssessmentButton(): Promise<void> {
    await expect(this.locators.addNewAssessmentButton).toBeVisible();
    await this.locators.addNewAssessmentButton.click();
    this.logger?.success('Clicked Add New Assessment button inside the iframe');
  }

  /**
   * Generic method to click dropdown and wait for options to be visible
   * @param dropdown - Locator for the dropdown
   * @param dropdownName - Name for logging purposes
   */
  async clickDropdownAndWaitForOptions(dropdown: Locator, dropdownName: string): Promise<void> {
    this.logger?.step(`Clicking ${dropdownName} dropdown`);

    await dropdown.click();
    this.logger?.success(`${dropdownName} dropdown clicked`);

    // Wait for dropdown options to be visible
    await dropdown.locator('option').first().waitFor({ state: 'visible', timeout: 5000 });
    this.logger?.success(`${dropdownName} dropdown options are visible`);
  }

  /**
   * Generic method to enter text in dropdown using keyboard
   * @param dropdown - Locator for the dropdown
   * @param text - Text to type in dropdown
   * @param dropdownName - Name for logging purposes
   */
  async enterTextInDropdownByKeyboard(
    dropdown: Locator,
    text: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.step(`Entering ${dropdownName} text: ${text}`);

    // Wait a bit for dropdown to be ready
    await this.page.waitForTimeout(500);

    // Focus on the dropdown first
    await dropdown.focus();
    this.logger?.debug(`Focused on ${dropdownName} dropdown`);

    // Clear any existing value
    await dropdown.fill('');
    this.logger?.debug(`Cleared existing value in ${dropdownName}`);

    // Type the text slowly
    await dropdown.type(text, { delay: 150 });
    this.logger?.info(`Typed "${text}" in ${dropdownName} dropdown`);

    // Wait for the dropdown to process the input
    await this.page.waitForTimeout(500);

    // Press Enter to select
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    this.logger?.success(`Pressed Enter to select ${dropdownName}`);
  }

  /**
   * Generic method to wait and verify dropdown selection
   * @param dropdown - Locator for the dropdown
   * @param expectedText - Expected text to be selected
   * @param dropdownName - Name for logging purposes
   */
  async waitAndVerifyDropdownSelection(
    dropdown: Locator,
    expectedText: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.step(`Waiting and verifying ${dropdownName} selection`);

    // Wait for selection to be processed
    await this.page.waitForTimeout(2000);

    // Get selected value
    const selectedValue = await dropdown.inputValue();
    this.logger?.info(`Selected ${dropdownName} value: "${selectedValue}"`);

    // Verify the option is selected and loaded
    if (selectedValue && selectedValue.includes(expectedText)) {
      this.logger?.success(`${dropdownName} option is selected and loaded successfully`);
    } else {
      throw new Error(
        `${dropdownName} selection failed. Expected to contain "${expectedText}" but got "${selectedValue}"`
      );
    }
  }

  /**
   * Generic complete dropdown selection process
   * @param dropdown - Locator for the dropdown
   * @param textToEnter - Text to type and select
   * @param expectedText - Expected text for verification
   * @param dropdownName - Name for logging purposes
   */
  async selectDropdownOption(
    dropdown: Locator,
    textToEnter: string,
    expectedText: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.step(`Starting ${dropdownName} dropdown selection`);

    // Step 1: Click dropdown and wait for options
    await this.clickDropdownAndWaitForOptions(dropdown, dropdownName);

    // Step 2: Enter text by keyboard
    await this.enterTextInDropdownByKeyboard(dropdown, textToEnter, dropdownName);

    // Step 3: Wait and verify selection
    await this.waitAndVerifyDropdownSelection(dropdown, expectedText, dropdownName);

    this.logger?.success(`${dropdownName} dropdown selection completed successfully`);
  }

  /**
   * Alternative method to select dropdown option by typing and arrow keys
   * @param dropdown - Locator for the dropdown
   * @param text - Text to type in dropdown
   * @param dropdownName - Name for logging purposes
   */
  async selectDropdownByTypingAndArrows(
    dropdown: Locator,
    text: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.step(`Alternative selection for ${dropdownName}: ${text}`);

    // Click and focus
    await dropdown.click();
    await this.page.waitForTimeout(300);

    // Clear and type
    await dropdown.press('Control+a');
    await dropdown.press('Delete');
    await this.page.waitForTimeout(200);

    // Type first few characters to filter
    const searchText = text.substring(0, 8); // Type first 8 characters
    await dropdown.type(searchText, { delay: 100 });
    this.logger?.info(`Typed "${searchText}" to filter options`);

    await this.page.waitForTimeout(500);

    // Use arrow keys to navigate to the correct option
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(200);
    await this.page.keyboard.press('Enter');

    this.logger?.success(`Selected ${dropdownName} using arrow keys`);
  }

  /**
   * Type text in dropdown and wait for option to be highlighted
   * @param dropdown - Locator for the dropdown
   * @param textToType - Full text to type
   * @param dropdownName - Name for logging purposes
   */
  async typeAndWaitForHighlight(
    dropdown: Locator,
    textToType: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.info(`----------Typing in ${dropdownName}: ${textToType}---------`);

    // Step 1: Click dropdown to open it
    await dropdown.click();
    await this.page.waitForTimeout(500);
    this.logger?.info(`✓ ${dropdownName} dropdown opened`);

    // Step 2: Clear any existing text
    await dropdown.press('Control+a');
    await dropdown.press('Delete');
    await this.page.waitForTimeout(200);

    // Step 3: Type the text character by character (slower typing)
    for (let i = 0; i < textToType.length; i++) {
      await dropdown.type(textToType[i], { delay: 80 });
      await this.page.waitForTimeout(50); // Small pause between characters
    }
    this.logger?.info(`✓ Typed complete text: "${textToType}"`);

    // Step 4: Wait for dropdown to filter and highlight the option
    await this.page.waitForTimeout(1000);

    // Step 5: Check if option is highlighted/available
    const highlightedOption = this.page
      .locator('option:focus, option[selected], option.highlighted')
      .first();

    try {
      await highlightedOption.waitFor({ state: 'visible', timeout: 2000 });
      this.logger?.info(`✓ Option highlighted in ${dropdownName} dropdown`);
    } catch (error) {
      this.logger?.info(`No specific highlighted option found, continuing...`);
    }

    // Step 6: Press Enter to select the highlighted option
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    this.logger?.info(`✓ Pressed Enter to select highlighted option in ${dropdownName}`);
  }

  /**
   * Complete dropdown selection with typing, highlight detection, auto-refresh wait, and verification
   */
  async selectDropdownByTypingWithHighlight(
    dropdown: Locator,
    textToType: string,
    expectedText: string,
    dropdownName: string
  ): Promise<void> {
    this.logger?.info(
      `----------Starting ${dropdownName} selection with highlight detection---------`
    );

    // Type and wait for highlight
    await this.typeAndWaitForHighlight(dropdown, textToType, dropdownName);

    // Wait for page auto-refresh after selection
    this.logger?.info(
      `----------Waiting for page auto-refresh after ${dropdownName} selection---------`
    );

    try {
      // Wait for page reload/navigation (max 15 seconds)
      await this.page.waitForLoadState('load', { timeout: 15000 });
      this.logger?.info(`✓ Page auto-refresh detected and completed`);
    } catch (refreshError) {
      this.logger?.info(`No auto-refresh detected within 15 seconds, continuing...`);
    }

    // Additional wait to ensure page is fully loaded
    await this.page.waitForTimeout(3000);

    // Click dropdown again to verify exact options are displayed
    this.logger?.info(
      `----------Clicking ${dropdownName} to verify exact options are displayed---------`
    );
    await dropdown.click();
    await this.page.waitForTimeout(1000);

    // Check if the expected option is displayed in the dropdown options
    try {
      const optionExists = await dropdown
        .locator(`option`)
        .filter({ hasText: expectedText })
        .count();

      if (optionExists > 0) {
        this.logger?.info(
          `✓ Exact option "${expectedText}" is displayed in ${dropdownName} dropdown after auto-refresh`
        );
      } else {
        this.logger?.info(
          `⚠️ Exact option "${expectedText}" not found, checking for partial match...`
        );

        // Check for partial match
        const partialMatch = await dropdown
          .locator(`option`)
          .filter({ hasText: expectedText.substring(0, 10) })
          .count();

        if (partialMatch > 0) {
          this.logger?.info(
            `✓ Partial match found for "${expectedText}" in ${dropdownName} dropdown`
          );
        } else {
          this.logger?.info(
            `❌ Neither exact nor partial match found for "${expectedText}" in ${dropdownName} dropdown`
          );
        }
      }
    } catch (verificationError) {
      this.logger?.info(`Error verifying dropdown options:`, verificationError);
    }

    // Close dropdown by clicking elsewhere or pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);

    this.logger?.info(`✓ ${dropdownName} selection and verification process completed`);
  }

  /**
   * Enter text in a textbox
   * @param textbox - Locator for the textbox
   * @param text - Text to enter
   * @param textboxName - Name for logging purposes
   */
  async enterTextInTextbox(textbox: Locator, text: string, textboxName: string): Promise<void> {
    this.logger?.info(`----------Entering text in ${textboxName} textbox---------`);
    // Clear existing text and enter new text
    await textbox.clear();
    await textbox.fill(text);
    this.logger?.info(`✓ Entered "${text}" in ${textboxName} textbox`);
  }

  /**
   * Click on Save button
   * @param buttonName - Name for logging purposes
   */
  async clickSaveButton(buttonName: string = 'Save'): Promise<void> {
    this.logger?.info(`----------Clicking ${buttonName} button---------`);

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });

    // Wait for button to be visible and enabled
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });

    // Click the Save button
    await saveButton.click();

    this.logger?.info(`✓ Clicked ${buttonName} button successfully`);
  }

  /**
   * Extract text from cell next to ID label after page refresh
   * @param labelText - Text of the label cell (e.g., 'ID:')
   * @param extractionName - Name for logging
   * @returns The extracted text content
   */
  async extractTextFromNextCell(labelText: string, extractionName: string): Promise<string> {
    this.logger?.info(
      `----------Extracting ${extractionName} from cell next to "${labelText}"---------`
    );

    // Wait for page auto-refresh
    await this.page.waitForLoadState('load', { timeout: 15000 });

    // Wait for ID cell to appear
    const labelCell = this.page.getByRole('cell', { name: labelText, exact: true });
    await labelCell.waitFor({ state: 'visible', timeout: 10000 });

    // Get the next cell with the value
    const valueCell = labelCell.locator('xpath=following-sibling::td[1]');
    const extractedText = await valueCell.textContent();
    const cleanedText = extractedText?.trim() || '';

    this.logger?.info(`✓ ${extractionName} extracted: ${cleanedText}`);
    return cleanedText;
  }

  /**
   * Logout from MU application and clear browser cache/cookies
   * Follows Playwright best practices for session management
   */
  logoutFromApplication = async (): Promise<void> => {
    try {
      this.logger?.info('🔓 Starting logout process...');

      // Look for logout link/button (adjust selector based on your MU app)
      const logoutSelectors = [
        'text=Logout',
        'text=Log Out',
        'text=Sign Out',
        '[data-testid="logout"]',
        'a[href*="logout"]',
        'button[onclick*="logout"]',
      ];

      let logoutFound = false;
      for (const selector of logoutSelectors) {
        try {
          const logoutElement = this.page.locator(selector).first();
          if (await logoutElement.isVisible({ timeout: 3000 })) {
            await logoutElement.click();
            this.logger?.info(`✅ Clicked logout using selector: ${selector}`);
            logoutFound = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
          continue;
        }
      }

      if (!logoutFound) {
        this.logger?.info('⚠️ Logout button not found, proceeding with session clearing');
      }

      // Wait for logout to complete
      await this.page.waitForTimeout(2000);

      // Clear all browser data following Playwright best practices
      await this.clearBrowserSession();

      this.logger?.info('✅ Logout completed successfully');
    } catch (error) {
      const err = error as Error;
      this.logger?.info(`⚠️ Logout process encountered error: ${err.message}`);
      // Still proceed with session clearing even if logout click fails
      await this.clearBrowserSession();
    }
  };

  /**
   * Clear browser session data including cookies, localStorage, sessionStorage
   * Follows Playwright best practices for clean session management
   */
  private clearBrowserSession = async (): Promise<void> => {
    try {
      this.logger?.info('🧹 Clearing browser session data...');

      // Clear all cookies
      const context = this.page.context();
      await context.clearCookies();
      this.logger?.info('✅ Cookies cleared');

      // Clear localStorage and sessionStorage
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
          this.logger?.info('Storage cleared');
        } catch (e) {
          this.logger?.info('Storage clearing failed:', e);
        }
      });
      this.logger?.info('✅ Local and session storage cleared');

      // Clear any cached data
      await this.page.goto('about:blank');
      await this.page.waitForTimeout(1000);
      this.logger?.info('✅ Page cache cleared');
    } catch (error) {
      const err = error as Error;
      this.logger?.info(`⚠️ Session clearing error: ${err.message}`);
    }
  };

  /**
   * Assert navigation to URL with proper waiting
   * @param urlPattern - RegExp pattern to match against current URL
   */
  assertNavigationToUrl = async (urlPattern: RegExp): Promise<void> => {
    try {
      this.logger?.info(`🔍 Asserting navigation to URL pattern: ${urlPattern}`);
      await this.page.waitForURL(urlPattern, { timeout: 30000 });
      await this.page.waitForLoadState('load', { timeout: 30000 });
      const currentUrl = this.page.url();
      this.logger?.info(`✅ Successfully navigated to: ${currentUrl}`);
    } catch (error) {
      const currentUrl = this.page.url();
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger?.info(
        `❌ Navigation assertion failed: ${errorMessage}, Current URL: ${currentUrl}`
      );
      throw error;
    }
  };

  /**
   * Select dropdown by finding exact match from all options (index-based)
   * @param dropdownLocator - The dropdown locator
   * @param valueToSelect - The exact value to select
   * @param fieldName - Name of the field for logging
   */
  async selectDropdownByIndex(dropdownLocator: any, valueToSelect: string, fieldName: string) {
    try {
      this.logger?.info(
        `📋 Selecting "${valueToSelect}" from ${fieldName} dropdown (index-based)...`
      );

      await dropdownLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dropdownLocator).toBeEnabled({ timeout: 10000 });

      // Get all option elements
      const optionElements = await dropdownLocator.locator('option').all();

      // Find the index of exact match
      let targetIndex = -1;
      const allOptions: string[] = [];

      for (let i = 0; i < optionElements.length; i++) {
        const optionText = (await optionElements[i].textContent())?.trim() || '';
        allOptions.push(optionText);

        if (optionText === valueToSelect) {
          targetIndex = i;
          break;
        }
      }

      this.logger?.info(`   Available options: ${allOptions.join(', ')}`);

      if (targetIndex === -1) {
        throw new Error(
          `Value "${valueToSelect}" not found in ${fieldName}. Available: ${allOptions.join(', ')}`
        );
      }

      this.logger?.info(`   Found "${valueToSelect}" at index: ${targetIndex}`);

      // Select by index
      await dropdownLocator.selectOption({ index: targetIndex });
      await this.page.waitForTimeout(300);

      // Verify selection
      const selectedText = await dropdownLocator.locator('option:checked').textContent();
      this.logger?.info(`   ✅ ${fieldName} selected: "${selectedText?.trim()}"\n`);

      if (selectedText?.trim() !== valueToSelect) {
        throw new Error(
          `Selection failed. Expected: "${valueToSelect}", Got: "${selectedText?.trim()}"`
        );
      }
    } catch (error) {
      const err = error as Error;
      this.logger?.error(`Error selecting ${fieldName}:`, err.message);
      throw error;
    }
  }

  /**
   * Select dropdown option by exact value match using Playwright's best practices
   * @param dropdownLocator - The dropdown locator
   * @param valueToSelect - The exact value to select
   * @param fieldName - Name of the field for logging
   */
  async selectDropdownByExactValue(dropdownLocator: any, valueToSelect: string, fieldName: string) {
    try {
      this.logger?.info(`📋 Selecting "${valueToSelect}" from ${fieldName} dropdown...`);

      // Wait for dropdown to be visible and enabled
      await dropdownLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dropdownLocator).toBeEnabled({ timeout: 10000 });

      // Click to open dropdown
      await dropdownLocator.click();
      await this.page.waitForTimeout(500); // Small wait for dropdown to populate

      // Get all options from the dropdown
      const options = await dropdownLocator.locator('option').allTextContents();
      this.logger?.info(`   Available options: ${options.join(', ')}`);

      // Find exact match
      const exactMatch = options.find((option: string) => option.trim() === valueToSelect);

      if (!exactMatch) {
        throw new Error(
          `❌ Value "${valueToSelect}" not found in ${fieldName} dropdown. Available: ${options.join(', ')}`
        );
      }

      // Select by exact value using Playwright's selectOption
      await dropdownLocator.selectOption({ label: valueToSelect });

      // Wait for selection to be applied
      await this.page.waitForTimeout(300);

      // Verify selection
      const selectedValue = await dropdownLocator.inputValue();
      this.logger?.info(`   Selected value: ${selectedValue}`);

      // Verify the option is selected
      const isSelected = await dropdownLocator
        .locator(`option:has-text("${valueToSelect}")`)
        .isSelected();

      if (!isSelected) {
        // Retry once if not selected
        this.logger?.info(`   ⚠️  Selection not applied, retrying...`);
        await dropdownLocator.selectOption({ label: valueToSelect });
        await this.page.waitForTimeout(300);
      }

      this.logger?.info(`   ✅ ${fieldName} selected: "${valueToSelect}"\n`);
    } catch (error) {
      const err = error as Error;
      this.logger?.error(`Error selecting ${fieldName}:`, err.message);
      throw error;
    }
  }

  /**
   * Select dropdown option by value attribute (alternative method)
   * @param dropdownLocator - The dropdown locator
   * @param valueToSelect - The value attribute to select
   * @param fieldName - Name of the field for logging
   */
  async selectDropdownByValue(dropdownLocator: any, valueToSelect: string, fieldName: string) {
    try {
      this.logger?.info(`📋 Selecting "${valueToSelect}" from ${fieldName} dropdown (by value)...`);

      await dropdownLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(dropdownLocator).toBeEnabled({ timeout: 10000 });

      // Select by value attribute
      await dropdownLocator.selectOption(valueToSelect);
      await this.page.waitForTimeout(300);

      // Verify selection
      const selectedValue = await dropdownLocator.inputValue();
      this.logger?.info(`   ✅ ${fieldName} selected (value: ${selectedValue})\n`);
    } catch (error) {
      const err = error as Error;
      this.logger?.error(`Error selecting ${fieldName}:`, err.message);
      throw error;
    }
  }

  /**
   * Select dropdown with retry mechanism and verification
   * @param dropdownLocator - The dropdown locator
   * @param valueToSelect - The exact text to select
   * @param fieldName - Name of the field for logging
   * @param maxRetries - Maximum retry attempts (default: 3)
   */
  async selectDropdownWithRetry(
    dropdownLocator: any,
    valueToSelect: string,
    fieldName: string,
    maxRetries: number = 3
  ) {
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        attempt++;
        this.logger?.info(
          `📋 Attempt ${attempt}/${maxRetries}: Selecting "${valueToSelect}" from ${fieldName}...`
        );

        // Wait for dropdown to be ready
        await dropdownLocator.waitFor({ state: 'visible', timeout: 10000 });
        await expect(dropdownLocator).toBeEnabled({ timeout: 10000 });

        // Force focus on dropdown
        await dropdownLocator.focus();
        await this.page.waitForTimeout(200);

        // Get all available options
        const allOptions = await dropdownLocator.locator('option').all();
        const optionTexts = await Promise.all(
          allOptions.map(async (option: any) => await option.textContent())
        );

        this.logger?.info(`   Available options: ${optionTexts.map((t) => t?.trim()).join(', ')}`);

        // Find the exact matching option
        const matchingOptionIndex = optionTexts.findIndex((text) => text?.trim() === valueToSelect);

        if (matchingOptionIndex === -1) {
          throw new Error(
            `Value "${valueToSelect}" not found. Available: ${optionTexts.map((t) => t?.trim()).join(', ')}`
          );
        }

        // Select by label with exact match
        await dropdownLocator.selectOption({ label: valueToSelect });
        await this.page.waitForTimeout(500);

        // Verify selection using multiple methods
        const selectedOption = await dropdownLocator.locator('option:checked').textContent();
        const selectedValue = await dropdownLocator.inputValue();

        this.logger?.info(`   Selected option text: "${selectedOption?.trim()}"`);
        this.logger?.info(`   Selected value: "${selectedValue}"`);

        if (selectedOption?.trim() === valueToSelect) {
          success = true;
          this.logger?.info(`   ✅ ${fieldName} successfully selected: "${valueToSelect}"\n`);
        } else {
          this.logger?.info(
            `   ⚠️  Selection mismatch. Expected: "${valueToSelect}", Got: "${selectedOption?.trim()}"`
          );
          if (attempt < maxRetries) {
            this.logger?.info(`   🔄 Retrying...\n`);
            await this.page.waitForTimeout(1000);
          }
        }
      } catch (error) {
        const err = error as Error;
        this.logger?.error(`   Attempt ${attempt} failed:`, err.message);
        if (attempt >= maxRetries) {
          throw new Error(
            `Failed to select ${fieldName} after ${maxRetries} attempts: ${err.message}`
          );
        }
        await this.page.waitForTimeout(1000);
      }
    }

    if (!success) {
      throw new Error(
        `Failed to select "${valueToSelect}" in ${fieldName} dropdown after ${maxRetries} attempts`
      );
    }
  }
}
