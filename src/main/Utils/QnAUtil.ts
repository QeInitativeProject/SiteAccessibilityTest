import { expect, type TestInfo } from '@playwright/test';
import { FrameLocator, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { Assertions } from './Assertion';


/**
 * QnAUtil - Question and Answer Utility Class
 * This class provides generic methods to answer
 * using predefined Q&A from JSON files
 */
export class QnAUtil {
  readonly page: Page;
  private logger?: Logger;
  private locators: StudentFacingPageLocators;
  private assertions: Assertions;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.locators = new StudentFacingPageLocators(page);
    this.assertions = new Assertions(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'QnAUtil', testInfo);
    }
  }

  // Method to set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  setScenarioName(_scenarioName: string) {
    // stored for future use in logging context
  }

  // Set assertions manually
  setAssertions(assertions: Assertions) {
    this.assertions = assertions;
  }

  /**
   * Generic method to answer assessment questions using Q&A from JSON file
   * @param jsonFileName - Name of the JSON file (e.g., '4_Correct_QnA.json') or full path with alias
   * @param assessmentType - Type folder name (e.g., 'Scoring_QA_STAGE', 'Practice_QA_STAGE', etc.)
   * @returns Promise<void>
   */
  answerAssessmentQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Scoring_QA_STAGE'
  ): Promise<void> => {
    this.logger?.separator('📚 STARTING GENERIC ASSESSMENT ANSWERING METHOD');

    // === LOAD QUESTION & ANSWER MAP FROM JSON FILE ===
    this.logger?.step('Loading questions and answers from JSON file');

    // Support both filename and full path
    let jsonFilePath: string;
    if (jsonFileName.includes('/') || jsonFileName.includes('\\')) {
      // Full path provided (for future path alias support)
      jsonFilePath = path.resolve(jsonFileName);
    } else {
      // Just filename provided - construct path from project root
      // Use __dirname to get current file location and navigate to project root
      const projectRoot = path.resolve(__dirname, '../../../');
      
      // Map assessment type to correct folder name
      let folderName: string;
      if (assessmentType.includes('STAGE')) {
        folderName = 'Question Store_Stage';
      } else if (assessmentType.includes('PROD')) {
        folderName = 'Question Store Prod';
      } else {
        folderName = assessmentType; // Fallback to original value
      }
      
      jsonFilePath = path.join(
        projectRoot,
        `src/test/TestData/${folderName}/${jsonFileName}`
      );
    }

    let questionAnswerData: any;
    try {
      const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
      questionAnswerData = JSON.parse(fileContent);
      this.logger?.success(`Loaded assessment type: ${assessmentType}`);
      this.logger?.info(`Total questions: ${questionAnswerData.totalQuestions}`);
    } catch (err) {
      const error = err as Error;
      await this.logger?.error(`Failed to load Q&A file: ${jsonFilePath}`, err);
      throw new Error(`❌ Failed to load Q&A file: ${jsonFilePath}\nError: ${error.message}`);
    }

    // Convert JSON object to Map
    const questionAnswerMap = new Map<string, string>(Object.entries(questionAnswerData.questions));
    this.logger?.debug(`Converted ${questionAnswerMap.size} question-answer pairs to Map`);

    const TOTAL_QUESTIONS = questionAnswerData.totalQuestions;

    // === ASSESSMENT IFRAME SCOPE ===
    const frame = this.locators.getAssessmentFrameLocator();

    // Wait for iframe to be attached first
    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 30000,
    });
    this.logger?.success('Assessment iframe attached');

    // === ANSWER EACH QUESTION ===
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      this.logger?.separator(`📝 Question ${i + 1}/${TOTAL_QUESTIONS}`);

      // 1. Find question text using multiple selector fallbacks
      const questionText = await this.findQuestionText(frame, i);

      // 2. Get answer from map
      const answer = this.getAnswerFromMap(questionText, questionAnswerMap);

      // 3. Select the answer option
      await this.selectAnswerOption(frame, answer, questionText);

      // 4. Click Continue button
      await this.clickContinueButton(frame, i);

      await this.page.waitForTimeout(700); // Wait for UI to update
    }

    this.logger?.separator(`🎉 All ${TOTAL_QUESTIONS} questions answered successfully!`);
  };

  /**
   * Find question text using multiple selector strategies
   * @param frame - FrameLocator for assessment iframe
   * @param questionIndex - Current question number (0-based)
   * @returns Promise<string> - Question text
   */
  private findQuestionText = async (
    frame: FrameLocator,
    questionIndex: number
  ): Promise<string> => {
    const questionSelectors = [
      this.locators.getQuestionTextSelector1(),
      this.locators.getQuestionTextSelector2(),
      this.locators.getQuestionTextSelector3(),
      this.locators.getQuestionTextSelector4(),
      this.locators.getQuestionTextSelector5(),
      this.locators.getQuestionTextSelector6(),
    ];

    let questionText = '';

    for (const selector of questionSelectors) {
      try {
        await selector.first().waitFor({ state: 'visible', timeout: 10000 });
        const text = (await selector.first().textContent())?.trim() || '';
        if (text) {
          questionText = text;
          this.logger?.debug(`Question found with centralized selector`);
          this.logger?.info(`Question: "${questionText}"`);
          break;
        }
      } catch (err) {
        this.logger?.debug(`Selector not visible, trying next...`);
      }
    }

    if (!questionText) {
      this.logger?.error(
        'No question selector worked. Taking screenshot...',
        new Error('Question not found')
      );
      // Save diagnostic screenshot in test-results/screenshots/
      const diagDir = path.join(process.cwd(), 'test-results', 'screenshots');
      if (!fs.existsSync(diagDir)) {
        fs.mkdirSync(diagDir, { recursive: true });
      }
      const diagPath = path.join(diagDir, `question-not-found-q${questionIndex + 1}.png`);
      await this.page.screenshot({
        path: diagPath,
        fullPage: true,
      });

      try {
        const bodyText = await frame.locator('body').textContent();
        this.logger?.debug('Frame body content (first 500 chars):', bodyText?.slice(0, 500));
      } catch (error) {
        this.logger?.debug('Could not read frame body content');
      }

      throw new Error(`No question text found for Q${questionIndex + 1}`);
    }

    return questionText;
  };

  /**
   * Get answer for a question from the map
   * @param questionText - The question text
   * @param map - Map containing question-answer pairs
   * @returns string - The answer
   */
  private getAnswerFromMap = (questionText: string, map: Map<string, string>): string => {
    const answer = map.get(questionText);

    if (!answer) {
      this.logger?.error(
        `Question not found in JSON file: "${questionText}"`,
        new Error('Question not in map')
      );
      this.logger?.debug('Available questions in JSON:');
      map.forEach((value, key) => {
        this.logger?.debug(`  • "${key}"`);
      });
      throw new Error(`No mapped answer for: "${questionText}"`);
    }

    this.logger?.success(`Answer: "${answer}"`);
    return answer;
  };

  /**
   * Select the correct answer option from radio buttons
   * @param frame - FrameLocator for assessment iframe
   * @param answer - The correct answer text
   * @param questionText - The question text (for error reporting)
   */
  private selectAnswerOption = async (
    frame: FrameLocator,
    answer: string,
    questionText: string
  ): Promise<void> => {
    const _radioGroup = this.locators.getRadioGroup();
    const options = this.locators.getAnswerChoices();
    const optionCount = await options.count();
    this.logger?.info(`Found ${optionCount} answer options:`);

    let found = false;
    for (let idx = 0; idx < optionCount; idx++) {
      const optionText = (await options.nth(idx).textContent())?.trim();
      this.logger?.debug(`   ${idx + 1}. "${optionText}"`);

      if (optionText && optionText.includes(answer)) {
        const radioButton = this.locators.getRadioButtonByIndex(idx);
        await radioButton.waitFor({ state: 'visible', timeout: 5000 });
        await radioButton.click();
        this.logger?.success(`Selected answer: "${optionText}"`);

        await this.page.waitForTimeout(500); // Wait for selection to register

        // Verify selection
        const isChecked = await radioButton.getAttribute('class');
        if (isChecked?.includes('mat-radio-checked')) {
          this.logger?.success('Radio button checked successfully');
        }

        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Answer "${answer}" not found for question: "${questionText}"`);
    }
  };

  /**
   * Click the Continue button to move to next question
   * @param frame - FrameLocator for assessment iframe
   * @param questionIndex - Current question number (0-based)
   */
  private clickContinueButton = async (
    frame: FrameLocator,
    questionIndex: number
  ): Promise<void> => {
    this.logger?.step('Clicking Continue button...');
    const continueBtn = this.locators.getContinueButton();

    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.assertions.assertEnabled(continueBtn);
      await continueBtn.click();
      this.logger?.success('Continue button clicked');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger?.error(`Continue button failed: ${errorMessage}`, err);
      await this.page.screenshot({
        path: `continue-error-q${questionIndex + 1}.png`,
        fullPage: true,
      });

      // Debug: show all buttons
      const allButtons = await this.locators.getAllButtonsInFrame().all();
      this.logger?.debug(`Found ${allButtons.length} buttons in frame:`);
      for (let b = 0; b < allButtons.length; b++) {
        const btnText = await allButtons[b].textContent();
        const btnEnabled = await allButtons[b].isEnabled();
        const btnVisible = await allButtons[b].isVisible();
        this.logger?.debug(
          `   ${b + 1}. Text: "${btnText?.trim()}" | Enabled: ${btnEnabled} | Visible: ${btnVisible}`
        );
      }

      throw new Error(`Continue button issue for Q${questionIndex + 1}`);
    }
  };

  /**
   * Finalize assessment and wait for IPP page to load
   * @returns Promise<void>
   */
  finalizeAssessmentAndViewResults = async (): Promise<void> => {
    this.logger?.step('Finalizing assessment...');

    // Wait for the assessment iframe to be attached
    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 15000,
    });
    const frame = this.page.frame({ name: 'assessmentFrame' });
    if (!frame) {
      throw new Error('Assessment iframe not found');
    }

    // Wait for the iframe's DOM to be loaded
    await frame.waitForLoadState('domcontentloaded');

    // Wait for the button to be attached and visible, with retries and debug output
    const finalizeButton = this.locators.getFinalizeButton();
    let found = false;
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await finalizeButton.waitFor({ state: 'attached', timeout: 15000 });
        await finalizeButton.waitFor({ state: 'visible', timeout: 20000 });
        found = true;
        break;
      } catch (err) {
        lastError = err;
        this.logger?.debug(`Attempt ${attempt}: Finalize button not found yet.`);
        // Debug: list all buttons in the frame
        const allButtons = await this.locators.getAllButtonsInFrame().all();
        this.logger?.debug(`Found ${allButtons.length} buttons in frame (Finalize search):`);
        for (let b = 0; b < allButtons.length; b++) {
          const btnText = await allButtons[b].textContent();
          const btnEnabled = await allButtons[b].isEnabled();
          const btnVisible = await allButtons[b].isVisible();
          this.logger?.debug(
            `   ${b + 1}. Text: "${btnText?.trim()}" | Enabled: ${btnEnabled} | Visible: ${btnVisible}`
          );
        }
        await new Promise((res) => setTimeout(res, 2000)); // Wait before retry
      }
    }
    if (!found) {
      throw new Error(
        `Finalize and View Results button not found after retries. Last error: ${lastError}`
      );
    }
    this.logger?.success('Finalize button found');

    await finalizeButton.click();
    this.logger?.success('Clicked Finalize button');

    // Wait for navigation to IPP page
    this.logger?.step('Waiting for IPP page to load...');

    // Wait for URL to contain IPP pattern
    await this.page.waitForURL(/IPPTestResult|ViewResult/i, { timeout: 60000 });
    this.logger?.success('Navigated to IPP URL');

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');
    this.logger?.success('Page load states completed');

    // Wait for IPP page heading to ensure page is fully rendered
    // Using a more flexible approach with multiple possible selectors
    try {
      await this.locators.ippHeading.waitFor({ state: 'visible', timeout: 30000 });
      this.logger?.success('IPP page loaded with all elements visible');
    } catch (error) {
      this.logger?.debug('IPP heading not found with role, trying text selector...');
      await this.locators.ippHeadingText.waitFor({ state: 'visible', timeout: 30000 });
      this.logger?.success('IPP page loaded (via text selector)');
    }

    // Debug: Print all visible text on the IPP page to help identify selectors
    try {
      const allText = await this.page.evaluate(() => {
        function getVisibleText(node: any): string {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            return node.textContent.trim();
          }
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            window.getComputedStyle(node).display !== 'none' &&
            window.getComputedStyle(node).visibility !== 'hidden'
          ) {
            let text = '';
            for (const child of node.childNodes) {
              text += getVisibleText(child) + ' ';
            }
            return text.trim();
          }
          return '';
        }
        return getVisibleText(document.body);
      });
      this.logger?.debug('--- DEBUG: All visible text on IPP page ---');
      this.logger?.debug(allText);
      this.logger?.debug('--- END DEBUG ---');
    } catch (err) {
      this.logger?.debug('Could not extract all visible text from IPP page for debug.');
    }

    const currentUrl = this.page.url();
    this.logger?.info(`IPP URL: ${currentUrl}`);
  };

  /**
   * Extract dynamic test attempt ID from URL
   * Extracts the number after the pattern in URL
   * Example: https://stage-student.atitesting.com/ViewResult/IPPTestResult/308105440
   * Returns: 308105440
   *
   * @param urlPattern - URL pattern before the ID (e.g., '/ViewResult/IPPTestResult/')
   * @returns Promise<string> - Returns the dynamic test attempt ID
   */
  extractTestAttemptId = async (urlPattern: string): Promise<string> => {
    const currentUrl = this.page.url();
    this.logger?.step('Extracting dynamic test attempt ID from URL...');
    this.logger?.info(`Current URL: ${currentUrl}`);
    this.logger?.info(`Pattern to match: ${urlPattern}`);

    // Create regex to extract numbers after the pattern
    const regex = new RegExp(`${urlPattern.replace(/\//g, '\\/')}(\\d+)`);
    const match = currentUrl.match(regex);

    if (!match || !match[1]) {
      this.logger?.error('Failed to extract test attempt ID', new Error('No match found'));
      await this.page.screenshot({ path: 'test-attempt-id-extraction-failed.png', fullPage: true });
      throw new Error(
        `Failed to extract test attempt ID from URL: ${currentUrl}\nExpected pattern: ${urlPattern}[digits]`
      );
    }

    const testAttemptId = match[1];
    this.logger?.success(`Dynamic test attempt ID extracted: ${testAttemptId}`);
    this.logger?.info(`Test attempt ID is ${testAttemptId.length} digits long`);

    return testAttemptId;
  };

  /**
   * Generic method to verify element by role and name
   * @param role - Element role (e.g., 'heading', 'button', 'textbox')
   * @param name - Element name/text to find
   * @param elementDescription - Description for logging (e.g., 'IPP Heading')
   * @returns Promise<void>
   */
  verifyElementByRole = async (
    role: string,
    name: string,
    elementDescription: string
  ): Promise<void> => {
    this.logger?.step(`Verifying ${elementDescription}...`);
    // Use centralized locator for IPP heading if applicable
    const element =
      role === 'heading' && name === 'Individual Performance Profile'
        ? this.locators.ippHeading
        : this.page.getByRole(role as any, { name: name });

    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await this.assertions.assertVisible(element);
      this.logger?.success(`"${name}" ${elementDescription} is visible`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger?.error(`${elementDescription} verification failed: ${errorMessage}`, err);
      await this.page.screenshot({
        path: `${elementDescription.replace(/\s+/g, '-').toLowerCase()}-error.png`,
        fullPage: true,
      });
      throw new Error(`"${name}" ${elementDescription} not visible`);
    }
  };

  /**
   * Generic method to verify and extract text content
   * @param selector - Text to find or selector
   * @param elementDescription - Description for logging (e.g., 'Test Completed Date')
   * @param isLabel - If true, uses getByLabel instead of getByText
   * @returns Promise<string> - Returns the extracted text
   */
  verifyAndExtractText = async (
    selector: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    this.logger?.step(`Verifying ${elementDescription}...`);
    const element = isLabel ? this.page.getByLabel(selector) : this.page.getByText(selector);

    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await this.assertions.assertVisible(element);
      this.logger?.success(`"${selector}" ${elementDescription} is visible`);

      const textContent = await element.textContent();
      const extractedText = textContent?.trim() || '';
      this.logger?.success(`${elementDescription} extracted: "${extractedText}"`);

      this.assertions.assertTruthy(extractedText);
      this.assertions.assertGreaterThan(extractedText.length, 0);

      return extractedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger?.error(`${elementDescription} verification failed: ${errorMessage}`, err);
      await this.page.screenshot({
        path: `${elementDescription.replace(/\s+/g, '-').toLowerCase()}-error.png`,
        fullPage: true,
      });
      throw new Error(`${elementDescription} verification error: ${errorMessage}`);
    }
  };

  /**
   * Generic method to verify text value matches expected value
   * @param selector - Text to find or selector
   * @param expectedValue - Expected value to match
   * @param elementDescription - Description for logging (e.g., 'Percentage')
   * @param isLabel - If true, uses getByLabel instead of getByText
   * @returns Promise<string> - Returns the actual text value
   */
  verifyTextValue = async (
    selector: string,
    expectedValue: string,
    elementDescription: string,
    isLabel: boolean = false
  ): Promise<string> => {
    this.logger?.step(`Verifying ${elementDescription}...`);
    const element = isLabel
      ? this.page.getByLabel(selector)
      : this.page.getByText(selector).first();

    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await this.assertions.assertVisible(element);
      this.logger?.success(`${elementDescription} element is visible`);

      const textContent = await element.textContent();
      const actualValue = textContent?.trim() || '';
      this.logger?.success(`${elementDescription} extracted: "${actualValue}"`);

      this.assertions.assertTruthy(actualValue);

      // Validate expected value
      if (actualValue === expectedValue || actualValue.includes(expectedValue)) {
        this.logger?.success(`${elementDescription} matches expected value: "${expectedValue}"`);
      } else {
        this.logger?.error(
          `${elementDescription} mismatch! Expected: "${expectedValue}", Actual: "${actualValue}"`,
          new Error('Value mismatch')
        );
        await this.page.screenshot({
          path: `${elementDescription.replace(/\s+/g, '-').toLowerCase()}-mismatch-error.png`,
          fullPage: true,
        });
        throw new Error(
          `${elementDescription} validation failed. Expected: "${expectedValue}", Actual: "${actualValue}"`
        );
      }

      return actualValue;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger?.error(`${elementDescription} verification failed: ${errorMessage}`, err);
      await this.page.screenshot({
        path: `${elementDescription.replace(/\s+/g, '-').toLowerCase()}-error.png`,
        fullPage: true,
      });
      throw new Error(`${elementDescription} verification error: ${errorMessage}`);
    }
  };

  /**
   * Full flow: Flag -> Continue -> Previous -> Unflag -> Assert Flag visible
   * Uses hard assertions and proper error handling. Throws if any step fails.
   */
  async flagContinuePreviousUnflagFlow(assertions: any, timeoutMs: number = 30000): Promise<void> {
    try {
      // CRITICAL: Wait for assessment iframe and content to be fully loaded before any action
      this.logger?.info('⏳ Waiting for assessment iframe to load completely...');
      
      // 1. Wait for iframe to be attached to DOM
      await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
        state: 'attached',
        timeout: timeoutMs,
      });
      this.logger?.debug('✓ Assessment iframe attached to DOM');
      
      // 2. Wait for page load states
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
      this.logger?.debug('✓ Page load states complete');
      
      // 3. Wait for iframe body to be visible
      await this.locators.getAssessmentFrameBody().waitFor({ state: 'visible', timeout: timeoutMs });
      this.logger?.debug('✓ Assessment frame body visible');
      
      // 4. Additional buffer to ensure content is rendered
      await new Promise((resolve) => setTimeout(resolve, 3000));
      this.logger?.success('✅ Assessment content fully loaded, proceeding with flag flow');
      
      // Locate and assert Flag button
      const flagButton = this.locators.getFlagButton();
      await assertions.assertVisible(flagButton, timeoutMs);
      await assertions.assertEnabled(flagButton, timeoutMs);
      // Click Flag button
      await flagButton.click();
      this.logger?.success('Flag button clicked.');
      // Wait 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));
      // Locate and assert Continue button
      const continueButton = this.locators.getContinueButton();
      await assertions.assertVisible(continueButton, timeoutMs);
      await assertions.assertEnabled(continueButton, timeoutMs);
      // Click Continue button
      await continueButton.click();
      this.logger?.success('Continue button clicked.');
      
      // CRITICAL: Wait for next question to load completely after Continue
      this.logger?.info('⏳ Waiting for next question to load...');
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
      
      // Wait for iframe body to be stable after navigation
      await this.locators.getAssessmentFrameBody().waitFor({ state: 'visible', timeout: timeoutMs });
      
      // Additional buffer for content to render
      await new Promise((resolve) => setTimeout(resolve, 3000));
      this.logger?.success('✅ Next question loaded');
      
      // Locate and assert Previous button
      const previousButton = this.locators.getPreviousButton();
      await assertions.assertVisible(previousButton, timeoutMs);
      await assertions.assertEnabled(previousButton, timeoutMs);
      // Wait 10 seconds before clicking Previous button
      await new Promise((resolve) => setTimeout(resolve, 10000));
      // Click Previous button
      await previousButton.click();
      this.logger?.success('Previous button clicked.');
      // Wait for load state (frame navigation)
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
      // Wait for DOM to be ready and a short buffer before searching for Unflag
      await this.locators.getAssessmentFrameBody().waitFor({ state: 'visible', timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // --- Robust Unflag button search ---
      let unflagButton = null;
      // Try inside frame using centralized locators
      try {
        const candidate1 = this.locators.getUnflagButton();
        await assertions.assertVisible(candidate1, 5000); // quick check
        unflagButton = candidate1;
      } catch (_error) {
        // Continue to next candidate
      }

      if (!unflagButton) {
        try {
          const candidate2 = this.locators.getUnflagButtonForReview();
          await assertions.assertVisible(candidate2, 5000);
          unflagButton = candidate2;
        } catch (_error) {
          // Continue to next candidate
        }
      }

      // If not found in frame, try on main page
      if (!unflagButton) {
        const unflagNames = ['Unflag', 'Unflag this question for Review'];
        for (const name of unflagNames) {
          const candidate = this.page.getByRole('button', { name });
          try {
            await assertions.assertVisible(candidate, 5000);
            unflagButton = candidate;
            break;
          } catch (_error) {
            // Continue to next candidate
          }
        }
      }
      if (!unflagButton) {
        throw new Error('Unflag button not found in frame or main page after Previous navigation.');
      }
      await assertions.assertEnabled(unflagButton, timeoutMs);
      await unflagButton.click();
      this.logger?.success('Unflag button clicked.');
      // Assert Flag button is visible again
      await assertions.assertVisible(flagButton, timeoutMs);
      this.logger?.success('Flag button visible after unflag.');
    } catch (err) {
      this.logger?.error('Flag-Continue-Previous-Unflag flow failed:', err);
      throw err;
    }
  }

  /**
   * Verifies blue banner is visible with correct background color in practice assessment
   * Tests that the practice header banner is visible and has the expected background color
   * @param expectedColor - Expected CSS color value (default: '#d7eef4')
   */
  async verifyBlueBannerVisibility(expectedColor: string = '#d7eef4'): Promise<void> {
    try {
      const blueBanner = this.locators.getBlueBannerHeader();

      // Verify banner is visible
      try {
        await expect(blueBanner).toBeVisible({ timeout: 10000 });
        this.logger?.success('Blue banner is visible');
      } catch (error) {
        throw new Error(
          'FAILED: Blue banner (practice header) is not visible within 10 seconds. Assessment may not have loaded properly.'
        );
      }

      // Verify background color - Get CSS variable value
      let headerBackground: string;
      try {
        headerBackground = await blueBanner.evaluate((el) => {
          return getComputedStyle(el).getPropertyValue('--header-background');
        });
      } catch (error) {
        throw new Error(
          'FAILED: Could not retrieve blue banner background color. Element may not be accessible.'
        );
      }

      // Assert the color value
      try {
        expect(headerBackground.trim()).toBe(expectedColor);
        this.logger?.success(`Blue banner background color verified: ${expectedColor}`);
      } catch (error) {
        throw new Error(
          `FAILED: Blue banner background color mismatch. Expected: ${expectedColor}, but got: ${headerBackground.trim()}`
        );
      }
    } catch (error) {
      this.logger?.error('Blue Banner Visibility Test Failed', error);
      throw error;
    }
  }

  /**
   * Verifies close assessment dialog functionality
   * Tests clicking CLOSE button, verifying Yes/No dialog, and clicking No to cancel
   */
  async verifyCloseDialogFunctionality(): Promise<void> {
    try {
      const assessmentFrame = this.page
        .locator(this.locators.assessmentFrameSelector)
        .contentFrame();

      if (!assessmentFrame) {
        throw new Error(
          'FAILED: Assessment iframe not found. Cannot proceed with close dialog test.'
        );
      }

      // Verify and click CLOSE button
      const closeButton = this.locators.getCloseButtonAssessment();
      try {
        await expect(closeButton).toBeVisible({ timeout: 10000 });
        this.logger?.success('CLOSE button is visible');
      } catch (error) {
        throw new Error('FAILED: CLOSE button is not visible within 10 seconds.');
      }

      try {
        await expect(closeButton).toBeEnabled({ timeout: 5000 });
        this.logger?.success('CLOSE button is clickable');
      } catch (error) {
        throw new Error('FAILED: CLOSE button is visible but not enabled/clickable.');
      }

      try {
        await closeButton.click();
        this.logger?.success('Clicked on CLOSE button');
      } catch (error) {
        throw new Error('FAILED: Could not click on CLOSE button.');
      }

      // Verify dialog appears with Yes/No options
      const yesButton = this.locators.getYesButton();
      const noButton = this.locators.getNoButton();

      try {
        await expect(yesButton).toBeVisible({ timeout: 10000 });
        await expect(noButton).toBeVisible({ timeout: 10000 });
        this.logger?.success('Close confirmation dialog appeared with Yes and No buttons');
      } catch (error) {
        throw new Error(
          'FAILED: Close confirmation dialog did not appear with Yes/No buttons within 10 seconds.'
        );
      }

      // Verify No button is clickable
      try {
        await expect(noButton).toBeEnabled({ timeout: 5000 });
        this.logger?.success('No button is clickable');
      } catch (error) {
        throw new Error('FAILED: No button in close dialog is not enabled/clickable.');
      }

      // Click on No button
      try {
        await noButton.click();
        this.logger?.success('Clicked on "No" button');
      } catch (error) {
        throw new Error('FAILED: Could not click on No button in close dialog.');
      }

      // Verify dialog is closed (Yes/No buttons should not be visible)
      try {
        await expect(yesButton).not.toBeVisible({ timeout: 5000 });
        await expect(noButton).not.toBeVisible({ timeout: 5000 });
        this.logger?.success('Close dialog is closed - Assessment continues');
      } catch (error) {
        throw new Error(
          'FAILED: Close dialog did not close after clicking No. Yes/No buttons are still visible.'
        );
      }
    } catch (error) {
      this.logger?.error('Close Dialog Functionality Test Failed', error);
      throw error;
    }
  }

  /**
   * Captures failure screenshot and saves to test-results folder
   * @param testCaseName - Name of the test case that failed
   * @param stepName - Name of the step that failed
   */
  private async captureFailureScreenshot(testCaseName: string, stepName: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotDir = path.join(
        process.cwd(),
        'test-results',
        'failure-screenshots',
        testCaseName
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const screenshotPath = path.join(screenshotDir, `${stepName}_${timestamp}.png`);

      // Take full page screenshot
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger?.info(`Failure screenshot saved: ${screenshotPath}`);
    } catch (error) {
      this.logger?.error(
        `Failed to capture failure screenshot: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * Takes screenshot and saves it with scenario name and test attempt ID
   * Used for IPP page and other success scenarios
   * @param scenarioName - Name of the scenario (e.g., 'TC12_Complete_Assessment')
   * @param testAttemptId - Test attempt identifier (e.g., batch ID)
   */
  async takeScreenshot(scenarioName: string, testAttemptId?: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const attemptInfo = testAttemptId ? `_AttemptID_${testAttemptId}` : '';
      const screenshotDir = path.join(
        process.cwd(),
        'test-results',
        'success-screenshots',
        scenarioName
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const fileName = `${scenarioName}${attemptInfo}_${timestamp}.png`;
      const screenshotPath = path.join(screenshotDir, fileName);

      // Take full page screenshot
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger?.info(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger?.error(`Failed to take screenshot: ${errorMessage}`, error);
      // Fallback to root directory if folder creation fails
      const fallbackPath = `${scenarioName}_${testAttemptId || 'unknown'}_fallback.png`;
      await this.page.screenshot({ path: fallbackPath, fullPage: true });
      this.logger?.info(`Screenshot saved to fallback location: ${fallbackPath}`);
    }
  }

  /**
   * Clicks the Flag button and asserts that the Continue button becomes enabled.
   * Hard assertion is delegated to the Assertions utility.
   */
  async flagEnablesContinue(assertions: any): Promise<void> {
    // Wait for assessment frame
    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 30000,
    });

    // Step 1: Locate and click Flag button
    const flagButton = this.locators.getFlagButtonForReview();
    await assertions.assertVisible(flagButton, 30000);
    await assertions.assertEnabled(flagButton, 10000);
    await flagButton.click();
    this.logger?.success('Flag button clicked');

    // Wait for 10 seconds after clicking flag
    await this.page.waitForTimeout(10000);

    // Step 2: Wait for Continue button to become enabled and click it using clickContinueButton
    await this.clickContinueButton(this.locators.getAssessmentFrameLocator(), 0);
    this.logger?.success('Continue button clicked after flagging.');
  }

  /**
   * Verifies calculator functionality in assessment
   * Tests opening calculator, performing operation, and closing it
   * @param operation - Optional operation string (default: '2+2=4')
   */
  async verifyCalculatorFunctionality(_operation: string = '2+2'): Promise<void> {
    const _assessmentFrame = this.page
      .locator(this.locators.assessmentFrameSelector)
      .contentFrame();

    // Verify calculator toggle button is visible and clickable
    const calculatorToggle = this.locators.getCalculatorToggleButton();
    await expect(calculatorToggle).toBeVisible();
    this.logger?.success('Calculator toggle button is visible');

    await expect(calculatorToggle).toBeEnabled();
    this.logger?.success('Calculator toggle button is clickable');

    // Click to open calculator
    await calculatorToggle.click();
    this.logger?.success('Calculator opened');

    // Verify calculator is opened by checking if calculator buttons are visible
    const calculatorButton2 = this.locators.getCalculatorButton2();
    await expect(calculatorButton2).toBeVisible({ timeout: 5000 });
    this.logger?.success('Calculator verified to be open');

    // Perform calculator operation: 2 + 2
    await calculatorButton2.click();
    this.logger?.info('Clicked button: 2');

    const plusButton = this.locators.getCalculatorPlusButton();
    await expect(plusButton).toBeVisible();
    await plusButton.click();
    this.logger?.info('Clicked button: Plus');

    await calculatorButton2.click();
    this.logger?.info('Clicked button: 2 (result: 2 + 2)');

    const equalsButton = this.locators.getCalculatorEqualsButton();
    await expect(equalsButton).toBeVisible();
    await equalsButton.click();
    this.logger?.info('Clicked button: Equals');

    // Verify the result is 4
    const calculatorDisplay = this.locators.getCalculatorDisplay();
    await expect(calculatorDisplay).toHaveValue('4');
    this.logger?.success('Calculator result verified: 4');

    // Find and click the close button with scrolling if needed
    const closeButton = this.locators.getCalculatorCloseButton();

    // Verify close button exists
    await expect(closeButton).toBeAttached({ timeout: 5000 });
    this.logger?.success('Close button is present');

    // Find the calculator container to scroll within it
    const calculatorContainer = this.locators.getCalculatorContainer();

    // Scroll the calculator container to top to reveal CLOSE button
    this.logger?.info('Scrolling calculator to top to reveal CLOSE button...');
    await calculatorContainer
      .evaluate((el) => {
        el.scrollTop = 0;
      })
      .catch(() => {
        this.logger?.debug('Could not scroll calculator container, trying alternative method...');
      });

    // Wait for close button to become visible after scroll
    await expect(closeButton).toBeVisible({ timeout: 10000 });

    // If still not visible, try alternative scroll methods
    const isCloseButtonVisible = await closeButton.isVisible().catch(() => false);

    if (!isCloseButtonVisible) {
      this.logger?.debug('Close button still not visible, trying scroll into view...');
      try {
        await closeButton.scrollIntoViewIfNeeded({ timeout: 5000 });
        await expect(closeButton).toBeVisible({ timeout: 5000 });
      } catch (scrollError) {
        this.logger?.debug('scrollIntoViewIfNeeded failed, trying keyboard navigation...');
        await calculatorDisplay.press('Home');
        await expect(closeButton).toBeVisible({ timeout: 5000 });
      }
    }

    this.logger?.success('Close button is now visible');

    await closeButton.click();
    this.logger?.success('Calculator closed');

    // Verify calculator is closed by checking if calculator buttons are no longer visible
    await expect(calculatorButton2).not.toBeVisible({ timeout: 5000 });
    this.logger?.success('Calculator verified to be closed');
  }

  /**
   * Verifies pause and resume functionality in assessment
   * Tests pausing assessment and resuming it
   */
  async verifyPauseAndResumeFunctionality(): Promise<void> {
    const _assessmentFrame = this.page
      .locator(this.locators.assessmentFrameSelector)
      .contentFrame();

    // Verify pause button is visible
    const pauseButton = this.locators.getPauseButton();
    await expect(pauseButton).toBeVisible();
    this.logger?.success('Pause button is visible');

    // Verify pause button is clickable
    await expect(pauseButton).toBeEnabled();
    this.logger?.success('Pause button is clickable');

    // Click on pause button
    await pauseButton.click();
    this.logger?.success('Clicked on "Pause this assessment" button');

    // Verify pause window opened and Resume assessment button is showing
    const resumeButton = this.locators.getResumeButton();
    await expect(resumeButton).toBeVisible();
    this.logger?.success('Pause window opened - "Resume assessment" button is showing');

    // Verify Resume assessment button is clickable
    await expect(resumeButton).toBeEnabled();
    this.logger?.success('Resume assessment button is clickable');

    // Click on Resume assessment button
    await resumeButton.click();
    this.logger?.success('Clicked on "Resume assessment" button');

    // Verify that pause window is closed (Resume button should not be visible)
    await expect(resumeButton).toBeHidden();
    this.logger?.success('Pause window is closed');

    // Verify that Pause button is visible again (assessment resumed)
    await expect(pauseButton).toBeVisible();
    this.logger?.success('Assessment resumed - Pause button is visible again');
  }

  
  // Ashok Added
  // ============================================
  // MULTI-SELECT ASSESSMENT METHODS
  // ============================================

  /**
   * Generic method to answer MULTI-SELECT assessment questions using Q&A from JSON file
   * This method handles checkboxes for multi-select questions
   * @param jsonFileName - Name of the JSON file (e.g., 'MultiSelect_QnA.json')
   * @param assessmentType - Type folder name (e.g., 'Question Store_Stage')
   * @returns Promise<void>
   */
  answerMultiSelectAssessmentQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage',
    scenarioName?: string
  ): Promise<void> => {
    this.logger?.separator('📚 STARTING MULTI-SELECT ASSESSMENT ANSWERING METHOD');

    // === LOAD QUESTION & ANSWER DATA FROM JSON FILE ===
    this.logger?.step('Loading multi-select questions and answers from JSON file');

    // Support both filename and full path
    let jsonFilePath: string;
    if (jsonFileName.includes('/') || jsonFileName.includes('\\')) {
      jsonFilePath = path.resolve(jsonFileName);
    } else {
      const projectRoot = path.resolve(__dirname, '../../../');
      
      let folderName: string;
      if (assessmentType.includes('STAGE') || assessmentType.includes('Stage')) {
        folderName = 'Question Store_Stage';
      } else if (assessmentType.includes('PROD') || assessmentType.includes('Prod')) {
        folderName = 'Question Store Prod';
      } else {
        folderName = assessmentType;
      }
      
      jsonFilePath = path.join(
        projectRoot,
        `src/test/TestData/${folderName}/${jsonFileName}`
      );
    }

    let questionAnswerData: any;
    try {
      const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      // Check if data is nested by assessments (new structure)
      if (jsonData.assessments && scenarioName) {
        questionAnswerData = jsonData.assessments[scenarioName];
        if (!questionAnswerData) {
          throw new Error(`Assessment '${scenarioName}' not found in JSON`);
        }
        this.logger?.success(`Loaded assessment scenario: ${scenarioName}`);
      } else {
        questionAnswerData = jsonData;
      }
      
      this.logger?.success(`Loaded multi-select assessment type: ${assessmentType}`);
      
      // Calculate totalQuestions from array length if not provided
      const totalQuestions = questionAnswerData.totalQuestions ?? 
        (Array.isArray(questionAnswerData.questions) 
          ? questionAnswerData.questions.length 
          : 1);
      questionAnswerData.totalQuestions = totalQuestions;
      
      this.logger?.info(`Total questions: ${totalQuestions}`);
    } catch (err) {
      const error = err as Error;
      await this.logger?.error(`Failed to load Q&A file: ${jsonFilePath}`, err);
      throw new Error(`❌ Failed to load Q&A file: ${jsonFilePath}\nError: ${error.message}`);
    }

    const questionsArray: any[] = Array.isArray(questionAnswerData.questions) 
      ? questionAnswerData.questions 
      : [];
    
    if (questionsArray.length === 0) {
      throw new Error('❌ No questions found in JSON file. Expected array format with answerOptions.');
    }
    
    this.logger?.debug(`Loaded ${questionsArray.length} multi-select questions`);

    const TOTAL_QUESTIONS = questionAnswerData.totalQuestions;

    const frame = this.locators.getAssessmentFrameLocator();

    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 30000,
    });
    this.logger?.success('Assessment iframe attached');

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      this.logger?.separator(`📝 Multi-Select Question ${i + 1}/${TOTAL_QUESTIONS}`);

      const questionData = questionsArray[i];
      const answerOptions: string[] = questionData.answerOptions || [];
      
      this.logger?.info(`Answers to select: ${answerOptions.join(', ')}`);

      await this.selectMultipleCheckboxOptions(frame, answerOptions);

      await this.clickMultiSelectContinueButton(frame, i);

      await this.page.waitForTimeout(700); // Wait for UI to update
    }

    this.logger?.separator(`🎉 All ${TOTAL_QUESTIONS} multi-select questions answered successfully!`);
  };

  /**
   * Select multiple checkbox options for multi-select questions
   * @param frame - FrameLocator for assessment iframe
   * @param answerOptions - Array of answer options to select (e.g., ["10", "20"])
   */
  private selectMultipleCheckboxOptions = async (
    frame: FrameLocator,
    answerOptions: string[]
  ): Promise<void> => {
    this.logger?.info(`🔲 Selecting ${answerOptions.length} checkbox options: ${answerOptions.join(', ')}`);

    for (const answer of answerOptions) {
      let found = false;
  
      if (!found) {
        try {
          const answerChoices = this.locators.getAnswerChoices();
          const choiceCount = await answerChoices.count();
          
          for (let idx = 0; idx < choiceCount; idx++) {
            const choiceContainer = answerChoices.nth(idx);
            const choiceText = await choiceContainer.textContent();
            
            if (choiceText && choiceText.includes(answer)) {
              // Try Angular Material checkbox first (most common in this app)
              const matCheckbox = choiceContainer.locator('mat-checkbox, .mat-checkbox-inner-container, .mat-checkbox-label');
              if (await matCheckbox.count() > 0) {
                await matCheckbox.first().click({ timeout: 3000 });
                found = true;
                this.logger?.success(`✅ Clicked mat-checkbox for: "${answer}"`);
                break;
              }
              
              // Fallback: Try native checkbox with click (not check)
              const checkbox = choiceContainer.locator('input[type="checkbox"]');
              if (await checkbox.count() > 0) {
                await checkbox.first().click({ timeout: 3000 });
                found = true;
                this.logger?.success(`✅ Clicked checkbox via container: "${answer}"`);
                break;
              }
            }
          }
        } catch (e) {
          this.logger?.debug(`Container strategy failed for "${answer}": ${e}`);
        }
      }

      // Strategy 3: Find by exact text match and click
      if (!found) {
        try {
          const textElement = frame.getByText(answer, { exact: false });
          if (await textElement.count() > 0) {
            // Look for nearby checkbox
            const parent = textElement.locator('xpath=ancestor::label | ancestor::mat-checkbox | ancestor::div[contains(@class, "checkbox")]').first();
            if (await parent.count() > 0) {
              await parent.click({ timeout: 3000 });
              found = true;
              this.logger?.success(`✅ Clicked parent element for: "${answer}"`);
            } else {
              await textElement.first().click({ timeout: 3000 });
              found = true;
              this.logger?.success(`✅ Clicked text directly: "${answer}"`);
            }
          }
        } catch (e) {
          this.logger?.debug(`Text strategy failed for "${answer}": ${e}`);
        }
      }

      if (!found) {
        this.logger?.info(`⚠️ Could not find checkbox for answer: "${answer}"`);
      }

      // Small delay between selections
      await this.page.waitForTimeout(300);
    }
  };

  /**
   * Click the Continue button for multi-select questions
   * @param frame - FrameLocator for assessment iframe
   * @param questionIndex - Current question number (0-based)
   */
  private clickMultiSelectContinueButton = async (
    frame: FrameLocator,
    questionIndex: number
  ): Promise<void> => {
    this.logger?.step('Clicking Continue button for multi-select...');
    const continueBtn = this.locators.getContinueButton();

    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.assertions.assertEnabled(continueBtn);
      await continueBtn.click();
      this.logger?.success('Continue button clicked (first click)');
      
      await this.page.waitForTimeout(5000);
      
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click();
      this.logger?.success('Continue button clicked (second click)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger?.error(`Continue button failed: ${errorMessage}`, err);
      await this.page.screenshot({
        path: `multiselect-continue-error-q${questionIndex + 1}.png`,
        fullPage: true,
      });

      // Debug: show all buttons
      const allButtons = await this.locators.getAllButtonsInFrame().all();
      this.logger?.debug(`Found ${allButtons.length} buttons in frame:`);
      for (let b = 0; b < allButtons.length; b++) {
        const btnText = await allButtons[b].textContent();
        const btnEnabled = await allButtons[b].isEnabled();
        const btnVisible = await allButtons[b].isVisible();
        this.logger?.debug(
          `   ${b + 1}. Text: "${btnText?.trim()}" | Enabled: ${btnEnabled} | Visible: ${btnVisible}`
        );
      }

      throw new Error(`Continue button issue for multi-select Q${questionIndex + 1}`);
    }
  };

  /**
   * Answer Angular Material mat-select dropdown questions from JSON file
   * @param jsonFileName - Name of the JSON file containing dropdownQuestions
   * @param assessmentType - Type folder name (e.g., 'Question Store_Stage')
   * @returns Promise<void>
   */
  /**
   * Extract question text from current assessment question
   * Supports multiple selector strategies
   */
  private extractQuestionTextFromUI = async (questionFrame: FrameLocator): Promise<string> => {
    this.logger?.step('🔍 Extracting question text from UI...');
    
    // Wait for frame content to stabilize - increased wait time
    await this.page.waitForTimeout(3000);
    
    // Wait for any question content to be visible
    const questionSelectors = [
      '.stem-text p',
      '.stem-text',
      '.question-stem',
      '#highlightWordsText',
      '.ie-richtext',
      '.read-area',
      '.question-text',
      '[class*="question"] p',
      '.item-stem',
      '.stimulus-text'
    ];
    
    // Try each selector
    for (const selector of questionSelectors) {
      try {
        const elements = questionFrame.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          // For selectors with p, check each paragraph
          for (let i = 0; i < count; i++) {
            const text = (await elements.nth(i).textContent() || '').trim();
            if (text.length > 5) {
              this.logger?.success(`✓ Extracted from ${selector}: "${text}"`);
              return text;
            }
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Debug: Log what's visible in the frame
    this.logger?.info('⚠️ No question text found with standard selectors. Checking frame content...');
    try {
      const allText = await questionFrame.locator('body').textContent();
      this.logger?.debug(`Frame body text (first 500 chars): ${allText?.substring(0, 500)}`);
    } catch (e) {
      this.logger?.debug('Could not get frame body text');
    }

    throw new Error('Could not extract question text - .stem-text not found');
  };

  /**
   * Find matching question in JSON by text (uses multi-tier matching strategy)
   */
  private findQuestionInJSON = (
    questions: any[],
    questionTextFromUI: string
  ): any => {
    this.logger?.step('🔎 Finding matching question in JSON...');
    
    this.logger?.info(`UI text: "${questionTextFromUI}"`);
    this.logger?.info(`Available ${questions.length} questions in JSON`);
    
    for (let q = 0; q < questions.length; q++) {
      const question = questions[q];
      if (!question.questionText || !question.questionText.trim()) continue;
      
      const jsonText = question.questionText.toLowerCase().trim();
      const uiText = questionTextFromUI.toLowerCase().trim();
      
      this.logger?.debug(`Checking Q${q + 1}: "${question.questionText.substring(0, 50)}..."`);
      
      // Tier 1: Exact match
      if (jsonText === uiText) {
        this.logger?.success(`✓ Tier 1 MATCH (exact): "${question.questionText}"`);
        return question;
      }
      
      // Tier 2: Contains match
      if (uiText.includes(jsonText) || jsonText.includes(uiText)) {
        this.logger?.success(`✓ Tier 2 MATCH (contains): "${question.questionText}"`);
        return question;
      }
      
      // Tier 3: Key word matching - compare significant words
      const jsonWords = jsonText.split(/\s+/).filter(w => w.length > 3);
      const uiWords = uiText.split(/\s+/).filter(w => w.length > 3);
      
      let matchCount = 0;
      for (const jWord of jsonWords) {
        for (const uWord of uiWords) {
          // Exact word match OR word contains (for partial matches like "heart" in "heartrate")
          if (jWord === uWord || 
              (jWord.length > 5 && uWord.length > 5 && 
               (jWord.includes(uWord) || uWord.includes(jWord)))) {
            matchCount++;
            break;
          }
        }
      }
      
      const matchPercentage = (matchCount / jsonWords.length) * 100;
      this.logger?.debug(`   Keywords matched: ${matchCount}/${jsonWords.length} (${matchPercentage.toFixed(0)}%)`);
      
      // Tier 3: At least 40% of JSON words should match
      if (jsonWords.length > 0 && matchPercentage >= 40) {
        this.logger?.success(`✓ Tier 3 MATCH (${matchPercentage.toFixed(0)}% keywords): "${question.questionText}"`);
        return question;
      }
    }
    
    // If no match found, log all available questions for debugging
    this.logger?.error('No matching question found!');
    this.logger?.error(`UI text was: "${questionTextFromUI}"`);
    this.logger?.error('Available questions in JSON:');
    questions.forEach((q, idx) => {
      this.logger?.error(`  ${idx + 1}. "${q.questionText}"`);
    });
    
    throw new Error(
      `No matching question found for UI text: "${questionTextFromUI}"`
    );
  };

  answerMultiSelectDropdownQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage',
    scenarioName?: string
  ): Promise<void> => {
    this.logger?.separator('📋 STARTING MULTISELECT DROPDOWN ANSWERING (TEXT-BASED MATCHING)');

    // Load answers from JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      `src/test/TestData/${assessmentType}/${jsonFileName}`
    );
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Check if data is nested by assessments (new structure)
    let questionData = jsonData;
    if (jsonData.assessments && scenarioName) {
      questionData = jsonData.assessments[scenarioName];
      if (!questionData) {
        throw new Error(`Assessment '${scenarioName}' not found in JSON`);
      }
    }

    // Get assessment iframe
    const questionFrame = this.page.frameLocator('#assessmentFrame');
    
    // CRITICAL: Wait for assessment frame to load first
    this.logger?.step('⏳ Waiting for assessment frame to load...');
    await this.page.waitForSelector('#assessmentFrame', { state: 'attached', timeout: 30000 });
    
    // Wait for frame body to be visible
    await questionFrame.locator('body').waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(3000); // Additional wait for frame content to render
    
    this.logger?.success('✓ Assessment frame loaded');

    // Extract question text from UI
    const questionTextFromUI = await this.extractQuestionTextFromUI(questionFrame);
    
    // Find matching question in JSON
    const matchedQuestion = this.findQuestionInJSON(questionData.questions, questionTextFromUI);
    
    // Check if this question should be flagged and skipped
    if (matchedQuestion.shouldFlag === true) {
      this.logger?.info(`🚩 This question should be flagged and skipped: "${questionTextFromUI}"`);
      const flagBtn = questionFrame.getByRole('button', { name: /flag/i });
      try {
        await flagBtn.waitFor({ state: 'visible', timeout: 3000 });
        await flagBtn.click();
        this.logger?.success('✅ Question FLAGGED');
        await this.page.waitForTimeout(500);
      } catch (e) {
        this.logger?.info('Flag button not found or already flagged');
      }
      
      // Click Continue to skip to next question (without answering)
      const continueBtn = questionFrame.locator('#moveNext');
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click();
      this.logger?.success('✅ Skipped to next question (flagged question not answered)');
      await this.page.waitForTimeout(2000);
  
      this.logger?.separator('📋 FLAGGED QUESTION SKIPPED - MOVING TO NEXT');
      return; // Exit the method, skip answering this question
    }

    const dropdownAnswers: string[] = matchedQuestion.dropdownAnswers;
    
    this.logger?.info(`Loaded ${dropdownAnswers.length} dropdown answers: ${dropdownAnswers.join(', ')}`);

    // Find all Angular Material mat-select dropdowns
    const matSelectDropdowns = questionFrame.locator('mat-select[role="combobox"]');
    const dropdownCount = await matSelectDropdowns.count();
    this.logger?.info(`Found ${dropdownCount} mat-select dropdowns on the page`);

    // Select value for each dropdown
    for (let i = 0; i < dropdownCount && i < dropdownAnswers.length; i++) {
      const dropdown = matSelectDropdowns.nth(i);
      const answerToSelect = dropdownAnswers[i];

      try {
        // Wait for dropdown to be visible
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });

        // Click to open the dropdown panel
        await dropdown.click();
        this.logger?.info(`Clicked dropdown ${i + 1} to open panel`);

        // Wait for dropdown panel to appear
        await this.page.waitForTimeout(500);

        // Find mat-options and select by EXACT text match
        const allOptions = questionFrame.locator('mat-option');
        const optionCount = await allOptions.count();
        let optionClicked = false;

        for (let j = 0; j < optionCount; j++) {
          const optionElement = allOptions.nth(j);
          const optionText = await optionElement.textContent();
          const trimmedText = optionText?.trim();

          if (trimmedText === answerToSelect) {
            await optionElement.click();
            optionClicked = true;
            this.logger?.success(`✅ Dropdown ${i + 1}: Selected "${answerToSelect}" (exact match)`);
            break;
          }
        }

        if (!optionClicked) {
          this.logger?.info(`⚠️ Option "${answerToSelect}" not found in dropdown ${i + 1}`);
        }
      } catch (e) {
        this.logger?.error(`Failed to select dropdown ${i + 1}: ${e}`);
      }

      await this.page.waitForTimeout(300);
    }

    this.logger?.success(`✓ Processed all ${dropdownCount} dropdowns`);

    // Click Continue button
    const continueBtn = questionFrame.locator('#moveNext');
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue');
  await this.page.waitForTimeout(3000); 

     await continueBtn.click();
    this.logger?.separator('📋 MULTISELECT DROPDOWN ANSWERING COMPLETE');
  };

  /**
   * Answer Cloze Dropdown questions (complete sentence using dropdowns)
   * @param jsonFileName - Name of the JSON file containing clozeDropdownQuestions
   * @param assessmentType - Type folder name (e.g., 'Question Store_Stage')
   * @returns Promise<void>
   */
  answerClozeDropdownQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage'
  ): Promise<void> => {
    this.logger?.separator('📋 STARTING CLOZE DROPDOWN ANSWERING');

    // Load answers from JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      `src/test/TestData/${assessmentType}/${jsonFileName}`
    );
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const questionData = JSON.parse(fileContent);

    // Get cloze dropdown answers from JSON
    const clozeAnswers: string[] = questionData.clozeDropdownQuestions[0].dropdownAnswers;
    this.logger?.info(`Loaded ${clozeAnswers.length} cloze dropdown answers: ${clozeAnswers.join(', ')}`);

    // Get assessment iframe
    const questionFrame = this.page.frameLocator('#assessmentFrame');

    // Wait for dropdowns to load
    await this.page.waitForTimeout(2000);

    // Find all Angular Material mat-select dropdowns for cloze question
    const matSelectDropdowns = questionFrame.locator('mat-select[role="combobox"]');
    const dropdownCount = await matSelectDropdowns.count();
    this.logger?.info(`Found ${dropdownCount} cloze dropdowns on the page`);

    // Select value for each dropdown
    for (let i = 0; i < dropdownCount && i < clozeAnswers.length; i++) {
      const dropdown = matSelectDropdowns.nth(i);
      const answerToSelect = clozeAnswers[i];

      try {
        // Wait for dropdown to be visible
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });

        // Click to open the dropdown panel
        await dropdown.click();
        this.logger?.info(`Clicked cloze dropdown ${i + 1} to open panel`);

        // Wait for dropdown panel to appear
        await this.page.waitForTimeout(500);

        // Find mat-options and select by exact text match
        const allOptions = questionFrame.locator('mat-option');
        const optionCount = await allOptions.count();
        let optionClicked = false;

        for (let j = 0; j < optionCount; j++) {
          const optionElement = allOptions.nth(j);
          const optionText = await optionElement.textContent();
          const trimmedText = optionText?.trim();

          if (trimmedText === answerToSelect) {
            await optionElement.click();
            optionClicked = true;
            this.logger?.success(`✅ Cloze Dropdown ${i + 1}: Selected "${answerToSelect}"`);
            break;
          }
        }

        if (!optionClicked) {
          this.logger?.info(`⚠️ Option "${answerToSelect}" not found in cloze dropdown ${i + 1}`);
        }
      } catch (e) {
        this.logger?.error(`Failed to select cloze dropdown ${i + 1}: ${e}`);
      }

      await this.page.waitForTimeout(300);
    }

    this.logger?.success(`✓ Processed all ${dropdownCount} cloze dropdowns`);

    // Click Continue button to submit answer and proceed
    const continueBtn = questionFrame.getByRole('button', { name: /continue/i });
    
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue (submit cloze answer)');

    await this.page.waitForTimeout(1000);

    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue (proceed to next question)');

    this.logger?.separator('📋 CLOZE DROPDOWN ANSWERING COMPLETE');
  };

  /**
   * Flag current question and proceed to next
   * @returns Promise<void>
   */
  flagQuestionAndProceed = async (): Promise<void> => {
    this.logger?.separator('🚩 FLAGGING QUESTION');

    const questionFrame = this.page.frameLocator('#assessmentFrame');

    // Click Flag button
    const flagButton = questionFrame.getByRole('button', { name: /flag/i });
    await flagButton.waitFor({ state: 'visible', timeout: 5000 });
    await flagButton.click();
    this.logger?.success('✓ Clicked Flag button');

    await this.page.waitForTimeout(1000);

    // Click Continue to go to next question
    const continueBtn = questionFrame.getByRole('button', { name: /continue/i });
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue after flagging');

    this.logger?.separator('🚩 QUESTION FLAGGED');
  };

  /**
   * Check if current question contains specific text and flag it if found
   * Used when questions are shuffled and cannot rely on question number
   * @param questionTextToMatch - Partial text to match in the question (case-insensitive)
   * @returns Promise<boolean> - Returns true if question was found and flagged
   */
  flagQuestionByText = async (questionTextToMatch: string): Promise<boolean> => {
    this.logger?.info(`🔍 Looking for question containing: "${questionTextToMatch}"`);

    const questionFrame = this.page.frameLocator('#assessmentFrame');

    // Wait for question content to load
    await this.page.waitForTimeout(1000);

    // Try to find question text using multiple selectors
    const questionSelectors = [
      '.stem-text',
      '.question-text',
      '.ie-richtext',
      '.read-area',
      '[class*="question"]',
      'p'
    ];

    let currentQuestionText = '';
    for (const selector of questionSelectors) {
      try {
        const element = questionFrame.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
          if (text && text.trim().length > 10) {
            currentQuestionText = text.trim();
            this.logger?.debug(`Found question text using selector "${selector}": ${currentQuestionText.substring(0, 50)}...`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!currentQuestionText) {
      this.logger?.info('Could not find question text on current page');
      return false;
    }

    // Check if the question contains the target text (case-insensitive)
    const matches = currentQuestionText.toLowerCase().includes(questionTextToMatch.toLowerCase());
    
    if (matches) {
      this.logger?.success(`✅ Found matching question: "${currentQuestionText.substring(0, 60)}..."`);
      
      // Flag this question
      const flagButton = questionFrame.getByRole('button', { name: /flag/i });
      await flagButton.waitFor({ state: 'visible', timeout: 5000 });
      await flagButton.click();
      this.logger?.success('✓ Question FLAGGED based on text match');
      
      await this.page.waitForTimeout(500);
      return true;
    } else {
      this.logger?.info(`Current question does not match. Found: "${currentQuestionText.substring(0, 60)}..."`);
      return false;
    }
  };

  /**
   * Answer cloze dropdown and flag specific question by text
   * Combines answering dropdowns with conditional flagging based on question text
   * @param jsonFileName - Name of the JSON file
   * @param assessmentType - Type folder name
   * @returns Promise<void>
   */
  answerClozeAndFlagByText = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage',
    scenarioName?: string
  ): Promise<void> => {
    this.logger?.separator('📋 STARTING CLOZE DROPDOWN WITH TEXT-BASED MATCHING & CONDITIONAL FLAGGING');

    // Load answers from JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      `src/test/TestData/${assessmentType}/${jsonFileName}`
    );
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Check if data is nested by assessments (new structure)
    let questionData = jsonData;
    if (jsonData.assessments && scenarioName) {
      questionData = jsonData.assessments[scenarioName];
      if (!questionData) {
        throw new Error(`Assessment '${scenarioName}' not found in JSON`);
      }
    }

    // Get assessment iframe
    const questionFrame = this.page.frameLocator('#assessmentFrame');
    
    // CRITICAL: Wait for assessment frame to load first
    this.logger?.step('⏳ Waiting for assessment frame to load...');
    await this.page.waitForSelector('#assessmentFrame', { state: 'attached', timeout: 30000 });
    
    // Wait for frame body to be visible
    await questionFrame.locator('body').waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(3000); // Additional wait for frame content to render
    
    this.logger?.success('✓ Assessment frame loaded');

    // Extract question text from UI
    const questionTextFromUI = await this.extractQuestionTextFromUI(questionFrame);
    
    // Find matching question in JSON
    const matchedQuestion = this.findQuestionInJSON(questionData.questions, questionTextFromUI);
    const clozeAnswers: string[] = matchedQuestion.dropdownAnswers;
    
    this.logger?.info(`Loaded ${clozeAnswers.length} cloze dropdown answers`);

    // Check if current question should be flagged (simple boolean check)
    let wasFlagged = false;
    if (matchedQuestion.shouldFlag === true) {
      this.logger?.info('🚩 Flagging question (shouldFlag: true)');
      const flagBtn = questionFrame.getByRole('button', { name: /flag/i });
      if (await flagBtn.isVisible()) {
        await flagBtn.click();
        wasFlagged = true;
        this.logger?.success('✅ Question flagged successfully');
      }
    }

    // Find and fill dropdowns
    const matSelectDropdowns = questionFrame.locator('mat-select[role="combobox"]');
    const dropdownCount = await matSelectDropdowns.count();
    this.logger?.info(`Found ${dropdownCount} cloze dropdowns`);

    for (let i = 0; i < dropdownCount && i < clozeAnswers.length; i++) {
      const dropdown = matSelectDropdowns.nth(i);
      const answerToSelect = clozeAnswers[i];

      try {
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });
        await dropdown.click();
        this.logger?.info(`Clicked dropdown ${i + 1}`);

        await this.page.waitForTimeout(500);

        const allOptions = questionFrame.locator('mat-option');
        const optionCount = await allOptions.count();

        for (let j = 0; j < optionCount; j++) {
          const optionElement = allOptions.nth(j);
          const optionText = await optionElement.textContent();
          if (optionText?.trim() === answerToSelect) {
            await optionElement.click();
            this.logger?.success(`✅ Dropdown ${i + 1}: Selected "${answerToSelect}"`);
            break;
          }
        }
      } catch (e) {
        this.logger?.error(`Failed dropdown ${i + 1}: ${e}`);
      }

      await this.page.waitForTimeout(300);
    }

    // Click Continue
    const continueBtn = questionFrame.locator('#moveNext');
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue');

    if (wasFlagged) {
      this.logger?.separator('📋 CLOZE COMPLETED - QUESTION WAS FLAGGED');
    } else {
      this.logger?.separator('📋 CLOZE COMPLETED');
    }
  };

  /**
   * Navigate to previous question
   * @returns Promise<void>
   */
  goToPreviousQuestion = async (): Promise<void> => {
    this.logger?.info('⬅️ Navigating to previous question');

    const questionFrame = this.page.frameLocator('#assessmentFrame');

    const previousBtn = questionFrame.getByRole('button', { name: /previous/i });
    await previousBtn.waitFor({ state: 'visible', timeout: 5000 });
    await previousBtn.click();
    this.logger?.success('✓ Clicked Previous button');

    await this.page.waitForTimeout(1000);
  };

  /**
   * Navigate to next question (using Continue)
   * @returns Promise<void>
   */
  goToNextQuestion = async (): Promise<void> => {
    this.logger?.info('➡️ Navigating to next question');

    const questionFrame = this.page.frameLocator('#assessmentFrame');

    const continueBtn = questionFrame.getByRole('button', { name: /continue/i });
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue button');

    await this.page.waitForTimeout(1000);
  };

  /**
   * Answer Drag-and-Drop Dyad questions by dragging K values to target drop zones
   * 
   * HTML Structure:
   * - Target zones: span.cdk-drop-list.target (e.g., id="target-list-{uuid}")
   * - Source lists: div.cdk-drop-list.option-list (e.g., id="options-list-{uuid}")
   * - Draggable items: div[cdkdrag].cdk-drag.option-list-item
   * - K/NK text inside: .option-list-content p
   * 
   * @param jsonFileName - Name of the JSON file containing dragDropQuestions
   * @param assessmentType - Type folder name (e.g., 'Question Store_Stage')
   * @returns Promise<void>
   */
  answerDragAndDropQuestions = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage'
  ): Promise<void> => {
    this.logger?.separator('🎯 STARTING DRAG-AND-DROP DYAD ANSWERING');

    // Load answers from JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      `src/test/TestData/${assessmentType}/${jsonFileName}`
    );
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const questionData = JSON.parse(fileContent);

    // Get drag-drop answers from JSON (e.g., ["K", "K"])
    const dragDropAnswers: string[] = questionData.dragDropQuestions[0].dropdownAnswers;
    this.logger?.info(`Loaded ${dragDropAnswers.length} drag-drop answers: ${dragDropAnswers.join(', ')}`);

    // Get assessment iframe
    const questionFrame = this.page.frameLocator('#assessmentFrame');

    // Wait for the drag-drop interface to load
    await this.page.waitForTimeout(2000);

    // Find all target drop zones using ie-target-delivery > span selector
    // Target structure: ie-target-delivery > span.cdk-drop-list.target[id^="target-list-"]
    const targetZones = questionFrame.locator('ie-target-delivery span.cdk-drop-list.target');
    const targetCount = await targetZones.count();
    this.logger?.info(`Found ${targetCount} target drop zones`);

    if (targetCount === 0) {
      // Fallback: try direct span selector
      const fallbackTargets = questionFrame.locator('span.target-number-0, span.target-number-1');
      const fallbackCount = await fallbackTargets.count();
      this.logger?.info(`Fallback found ${fallbackCount} targets`);
    }

    // Process each target zone
    for (let i = 0; i < targetCount && i < dragDropAnswers.length; i++) {
      const answerToPlace = dragDropAnswers[i];
      
      if (answerToPlace !== 'K') {
        this.logger?.info(`Skipping target ${i + 1} - answer is "${answerToPlace}", not K`);
        continue;
      }

      try {
        // Get the target zone and extract its UUID from the id attribute
        const targetZone = targetZones.nth(i);
        const targetId = await targetZone.getAttribute('id');
        this.logger?.info(`Target ${i + 1} ID: ${targetId}`);

        if (!targetId) {
          this.logger?.error(`Target ${i + 1} has no ID attribute`);
          continue;
        }

        // Extract UUID from target-list-{uuid}
        const uuid = targetId.replace('target-list-', '');
        this.logger?.info(`Extracted UUID: ${uuid}`);

        // Find the corresponding source option list with matching UUID
        const sourceListId = `options-list-${uuid}`;
        // Use ie-gap-match-interaction-delivery > div[id] selector
        let sourceList = questionFrame.locator(`ie-gap-match-interaction-delivery div.option-list[id="${sourceListId}"]`);
        
        if (await sourceList.count() === 0) {
          // Fallback to simpler selector
          sourceList = questionFrame.locator(`[id="${sourceListId}"]`);
          if (await sourceList.count() === 0) {
            this.logger?.error(`Source list not found for UUID: ${uuid}`);
            continue;
          }
        }
        this.logger?.info(`Found source list: ${sourceListId}`);

        // Find the K option within this source list
        // Look for option-list-item that contains a p tag with exact text "K"
        const allOptionsInList = sourceList.locator('.option-list-item');
        const optionCount = await allOptionsInList.count();
        this.logger?.info(`Found ${optionCount} options in source list ${i + 1}`);

        let kOptionFound = false;
        for (let j = 0; j < optionCount; j++) {
          const option = allOptionsInList.nth(j);
          const optionContent = option.locator('.option-list-content p');
          const optionText = await optionContent.textContent();
          
          this.logger?.debug(`Option ${j + 1} text: "${optionText?.trim()}"`);

          // Exact match for "K" (not "NK")
          if (optionText?.trim() === 'K') {
            this.logger?.info(`Found K option at index ${j} in source list ${i + 1}`);

            // Use hover method for Angular CDK drag-drop
            // The cdkdrag div is the draggable element
            const elementToDrag = option;
            
            // Perform drag using hover + mouse methods (works better with Angular CDK)
            await elementToDrag.hover();
            await this.page.mouse.down();
            await targetZone.hover();
            await this.page.mouse.up();
            
            this.logger?.success(`✅ Dragged K from source list ${i + 1} to target ${i + 1}`);
            kOptionFound = true;
            break;
          }
        }

        if (!kOptionFound) {
          this.logger?.info(`⚠️ No K option found in source list ${i + 1}`);
        }

      } catch (e) {
        this.logger?.error(`Failed to process target ${i + 1}: ${e}`);
      }

      await this.page.waitForTimeout(500);
    }

    this.logger?.success('✓ Completed drag-and-drop operations');

    // Click Submit/Continue button to submit the answer
    const submitBtn = questionFrame.getByRole('button', { name: /submit|continue/i });
    
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();
    this.logger?.success('✓ Clicked Submit/Continue (first click - submit answer)');

    await this.page.waitForTimeout(1000);

    // Click Continue again to proceed to next question or finalize
    const continueBtn = questionFrame.getByRole('button', { name: /continue/i });
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    this.logger?.success('✓ Clicked Continue (second click - proceed)');

    this.logger?.separator('🎯 DRAG-AND-DROP DYAD ANSWERING COMPLETE');
  };

  // ============================================
  // SMART AUTO-DETECT ASSESSMENT ANSWERER
  // ============================================

  /**
   * Load question data from a JSON file using the unified schema.
   * Supports both the legacy per-type schema and the new unified schema.
   */
  private loadUnifiedJson(jsonFileName: string, assessmentType: string): any {
    let jsonFilePath: string;
    if (jsonFileName.includes('/') || jsonFileName.includes('\\')) {
      jsonFilePath = path.resolve(jsonFileName);
    } else {
      const projectRoot = path.resolve(__dirname, '../../../');
      const folderName =
        assessmentType.includes('STAGE') || assessmentType.includes('Stage')
          ? 'Question Store_Stage'
          : assessmentType.includes('PROD') || assessmentType.includes('Prod')
          ? 'Question Store Prod'
          : assessmentType;
      jsonFilePath = path.join(
        projectRoot,
        `src/test/TestData/${folderName}/${jsonFileName}`
      );
    }
    const content = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * smartAnswerAssessment
   *
   * Loops through every question in the assessment, auto-detects its type from
   * the live DOM, picks the matching answer(s) from the JSON file, and executes
   * the appropriate answering strategy.
   *
   * JSON schema (unified format):
   * {
   *   "totalQuestions": 5,
   *   "expectedPercentage": "80.0%",
   *   "questions": [
   *     { "questionNumber": 1, "questionType": "multipleChoice",       "answers": ["Option A"] },
   *     { "questionNumber": 2, "questionType": "multipleSelect",       "answers": ["A","C"] },
   *     { "questionNumber": 3, "questionType": "dropdown",             "answers": ["K","NK","K"] },
   *     { "questionNumber": 4, "questionType": "clozeDropdown",        "answers": ["Correct","Incorrect"] },
   *     { "questionNumber": 5, "questionType": "dragAndDrop",          "answers": ["K","K"] },
   *     { "questionNumber": 6, "questionType": "bowtie",               "answers": { "left":["A"],"center":["B"],"right":["C"] } },
   *     { "questionNumber": 7, "questionType": "fillInBlankAlpha",     "answers": ["cardiac output"] },
   *     { "questionNumber": 8, "questionType": "fillInBlankNumeric",   "answers": ["120"] },
   *     { "questionNumber": 9, "questionType": "freeFormEasy",         "answers": ["The patient should..."] },
   *     { "questionNumber": 10,"questionType": "highlightText",        "answers": ["word1","phrase2"] },
   *     { "questionNumber": 11,"questionType": "highlightTable",       "answers": [{"row":0,"col":1}] },
   *     { "questionNumber": 12,"questionType": "hotspotHybrid",        "answers": [{"x":100,"y":150}] },
   *     { "questionNumber": 13,"questionType": "likert",               "answers": ["Agree"] },
   *     { "questionNumber": 14,"questionType": "matrixMultipleChoice", "answers": [{"row":"Med A","col":"Appropriate"}] },
   *     { "questionNumber": 15,"questionType": "matrixMultipleResponse","answers": [{"row":"F1","col":"Action A"}] },
   *     { "questionNumber": 16,"questionType": "orderedResponse",      "answers": ["Step 3","Step 1","Step 2"] },
   *     { "questionNumber": 17,"questionType": "exhibit",              "answers": ["Option B"], "exhibitUnderlyingType": "multipleChoice" }
   *   ]
   * }
   *
   * @param jsonFileName   - JSON file name under TestData/<assessmentType>/
   * @param assessmentType - Folder name / type key (e.g. 'Question Store_Stage')
   */
  smartAnswerAssessment = async (
    jsonFileName: string,
    assessmentType: string = 'Question Store_Stage'
  ): Promise<void> => {
    this.logger?.separator('🤖 STARTING SMART AUTO-DETECT ASSESSMENT ANSWERER');

    const data = this.loadUnifiedJson(jsonFileName, assessmentType);
    const questions: any[] = Array.isArray(data.questions) ? data.questions : [];
    const totalQuestions: number = data.totalQuestions ?? questions.length;

    this.logger?.info(`Total questions to answer: ${totalQuestions}`);

    const detector = new QuestionTypeDetector(this.logger);
    const frame = this.locators.getAssessmentFrameLocator();

    // Wait for the iframe to be ready
    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 30000,
    });
    this.logger?.success('Assessment iframe ready');

    for (let i = 0; i < totalQuestions; i++) {
      this.logger?.separator(`📝 Smart Question ${i + 1}/${totalQuestions}`);

      // Small buffer for question to render
      await this.page.waitForTimeout(800);

      const questionData = questions[i] ?? {};
      const jsonHint: QuestionType | undefined = questionData.questionType as QuestionType;
      const answers = questionData.answers;

      // Detect from DOM (or trust JSON hint if provided)
      let detectedType: QuestionType;
      if (jsonHint && jsonHint !== 'unknown') {
        detectedType = jsonHint;
        this.logger?.info(`Using JSON-specified type: ${detectedType}`);
      } else {
        detectedType = await detector.detect(frame);
      }

      this.logger?.info(`Answering question ${i + 1} as type: ${detectedType}`);

      // Check if question should be flagged
      if (questionData.flag === true) {
        await this.flagCurrentQuestion(frame);
      }

      // Open exhibit if present
      if (detectedType === 'exhibit') {
        await this.openExhibitIfPresent(frame);
        // After opening exhibit, detect underlying type or use hint
        const underlyingType: QuestionType =
          questionData.exhibitUnderlyingType ?? (await detector.detect(frame));
        await this.executeAnswerStrategy(frame, underlyingType, answers, i);
      } else {
        await this.executeAnswerStrategy(frame, detectedType, answers, i);
      }

      await this.page.waitForTimeout(500);
    }

    this.logger?.separator(`🎉 Smart assessment answering complete for ${totalQuestions} questions`);
  };

  /**
   * Route to the correct answering handler based on detected question type.
   */
  private executeAnswerStrategy = async (
    frame: FrameLocator,
    type: QuestionType,
    answers: any,
    questionIndex: number
  ): Promise<void> => {
    switch (type) {
      case 'multipleChoice':
        await this.answerMultipleChoiceQuestion(frame, answers, questionIndex);
        break;
      case 'multipleSelect':
        await this.answerMultipleSelectQuestion(frame, answers, questionIndex);
        break;
      case 'dropdown':
        await this.answerDropdownQuestion(frame, answers);
        break;
      case 'clozeDropdown':
        await this.answerClozeDropdownQuestion(frame, answers);
        break;
      case 'dragAndDrop':
        await this.answerDragAndDropQuestion(frame, answers);
        break;
      case 'bowtie':
        await this.answerBowtieQuestion(frame, answers);
        break;
      case 'fillInBlankAlpha':
        await this.answerFillInBlankAlphaQuestion(frame, answers);
        break;
      case 'fillInBlankNumeric':
        await this.answerFillInBlankNumericQuestion(frame, answers);
        break;
      case 'freeFormEasy':
        await this.answerFreeFormEasyQuestion(frame, answers);
        break;
      case 'highlightText':
        await this.answerHighlightTextQuestion(frame, answers);
        break;
      case 'highlightTable':
        await this.answerHighlightTableQuestion(frame, answers);
        break;
      case 'hotspotHybrid':
        await this.answerHotspotHybridQuestion(frame, answers);
        break;
      case 'likert':
        await this.answerLikertQuestion(frame, answers);
        break;
      case 'matrixMultipleChoice':
        await this.answerMatrixMultipleChoiceQuestion(frame, answers);
        break;
      case 'matrixMultipleResponse':
        await this.answerMatrixMultipleResponseQuestion(frame, answers);
        break;
      case 'orderedResponse':
        await this.answerOrderedResponseQuestion(frame, answers);
        break;
      default:
        this.logger?.info(`⚠️ Unknown question type: '${type}'. Attempting generic continue.`);
        await this.clickContinueButton(frame, questionIndex);
        return;
    }
    // Always click Continue after answering
    await this.clickContinueButton(frame, questionIndex);
  };

  // ============================================
  // INDIVIDUAL QUESTION TYPE HANDLERS
  // (used by smartAnswerAssessment and directly)
  // ============================================

  /**
   * Answer a standard single-answer radio-button (Multiple Choice) question.
   * answers: string[]  e.g. ["Option A"]
   */
  private answerMultipleChoiceQuestion = async (
    frame: FrameLocator,
    answers: string[],
    questionIndex: number
  ): Promise<void> => {
    if (!answers || answers.length === 0) {
      this.logger?.info('⚠️ No answers provided for multiple-choice question');
      return;
    }
    const answer = answers[0];
    await this.selectAnswerOption(frame, answer, `Q${questionIndex + 1}`);
  };

  /**
   * Answer a multi-select checkbox question.
   * answers: string[]  e.g. ["Option A", "Option C"]
   */
  private answerMultipleSelectQuestion = async (
    frame: FrameLocator,
    answers: string[],
    _questionIndex: number
  ): Promise<void> => {
    if (!answers || answers.length === 0) {
      this.logger?.info('⚠️ No answers provided for multi-select question');
      return;
    }
    await this.selectMultipleCheckboxOptions(frame, answers);
  };

  /**
   * Answer a standalone Angular-Material mat-select dropdown question.
   * answers: string[]  e.g. ["K", "NK", "K"]
   */
  private answerDropdownQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    if (!answers || answers.length === 0) {
      this.logger?.info('⚠️ No answers provided for dropdown question');
      return;
    }
    const dropdowns = frame.locator('mat-select[role="combobox"]');
    const count = await dropdowns.count();
    this.logger?.info(`Found ${count} dropdowns, ${answers.length} answers provided`);

    for (let i = 0; i < count && i < answers.length; i++) {
      try {
        const dropdown = dropdowns.nth(i);
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });
        await dropdown.click();
        await this.page.waitForTimeout(400);

        const allOpts = frame.locator('mat-option');
        const optCount = await allOpts.count();
        for (let j = 0; j < optCount; j++) {
          const text = (await allOpts.nth(j).textContent())?.trim();
          if (text === answers[i]) {
            await allOpts.nth(j).click();
            this.logger?.success(`✅ Dropdown ${i + 1}: selected "${answers[i]}"`);
            break;
          }
        }
      } catch (e) {
        this.logger?.error(`Dropdown ${i + 1} failed: ${e}`);
      }
      await this.page.waitForTimeout(300);
    }
  };

  /**
   * Answer an inline cloze (fill-in-the-blank) dropdown question.
   * answers: string[]  e.g. ["Correct", "Incorrect"]
   */
  private answerClozeDropdownQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    // Reuse the same logic as standalone dropdown – the DOM structure is identical
    await this.answerDropdownQuestion(frame, answers);
  };

  /**
   * Answer a CDK drag-and-drop (Dyad / Gap-Match) question.
   * answers: string[]  e.g. ["K", "K"]  – values to place in each target zone
   */
  private answerDragAndDropQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    if (!answers || answers.length === 0) return;

    await this.page.waitForTimeout(1500);
    const targetZones = frame.locator('ie-target-delivery span.cdk-drop-list.target');
    const targetCount = await targetZones.count();
    this.logger?.info(`Found ${targetCount} target zones`);

    for (let i = 0; i < targetCount && i < answers.length; i++) {
      const answerToPlace = answers[i];
      try {
        const targetZone = targetZones.nth(i);
        const targetId = await targetZone.getAttribute('id');
        if (!targetId) continue;

        const uuid = targetId.replace('target-list-', '');
        const sourceList = frame.locator(
          `[id="options-list-${uuid}"], ie-gap-match-interaction-delivery div.option-list[id="options-list-${uuid}"]`
        );
        if ((await sourceList.count()) === 0) continue;

        const options = sourceList.locator('.option-list-item');
        for (let j = 0; j < (await options.count()); j++) {
          const optText = (await options.nth(j).locator('.option-list-content p').textContent())?.trim();
          if (optText === answerToPlace) {
            await options.nth(j).hover();
            await this.page.mouse.down();
            await targetZone.hover();
            await this.page.mouse.up();
            this.logger?.success(`✅ Dragged "${answerToPlace}" to target ${i + 1}`);
            break;
          }
        }
      } catch (e) {
        this.logger?.error(`Drag-drop target ${i + 1} failed: ${e}`);
      }
      await this.page.waitForTimeout(400);
    }
  };

  /**
   * Answer a Bowtie (3-panel concept-map) question.
   * answers: { left: string[], center: string[], right: string[] }
   *   Each array lists the label text of the options to select in that panel.
   */
  answerBowtieQuestion = async (
    frame: FrameLocator,
    answers: { left?: string[]; center?: string[]; right?: string[] }
  ): Promise<void> => {
    this.logger?.separator('🎯 ANSWERING BOWTIE QUESTION');

    if (!answers) {
      this.logger?.info('⚠️ No answers provided for bowtie question');
      return;
    }

    const panelSelectors = [
      {
        key: 'left',
        values: answers.left ?? [],
        selector:
          '[class*="bowtie"] .left-panel, [class*="bow-tie"] .left-panel, ie-bowtie-interaction-delivery .left-column, .bowtie-left',
      },
      {
        key: 'center',
        values: answers.center ?? [],
        selector:
          '[class*="bowtie"] .center-panel, [class*="bow-tie"] .center-panel, ie-bowtie-interaction-delivery .center-column, .bowtie-center',
      },
      {
        key: 'right',
        values: answers.right ?? [],
        selector:
          '[class*="bowtie"] .right-panel, [class*="bow-tie"] .right-panel, ie-bowtie-interaction-delivery .right-column, .bowtie-right',
      },
    ];

    for (const panel of panelSelectors) {
      if (panel.values.length === 0) continue;

      // Try to locate the panel container first
      let panelLocator = frame.locator(panel.selector);
      if ((await panelLocator.count()) === 0) {
        // Fallback: search entire frame for the option labels
        panelLocator = frame.locator('body');
      }

      for (const value of panel.values) {
        try {
          // Find a checkbox/radio near a label that contains the target text
          const option = panelLocator
            .locator(`mat-checkbox, mat-radio-button, input[type="checkbox"], input[type="radio"]`)
            .filter({ hasText: value });

          if ((await option.count()) > 0) {
            await option.first().click();
            this.logger?.success(`✅ Bowtie ${panel.key}: selected "${value}"`);
          } else {
            // Fallback: click the label text and let the parent handle it
            const label = panelLocator.getByText(value, { exact: false }).first();
            if ((await label.count()) > 0) {
              await label.click();
              this.logger?.success(`✅ Bowtie ${panel.key}: clicked label "${value}"`);
            } else {
              this.logger?.info(`⚠️ Bowtie ${panel.key}: option "${value}" not found`);
            }
          }
          await this.page.waitForTimeout(300);
        } catch (e) {
          this.logger?.error(`Bowtie ${panel.key} panel selection failed: ${e}`);
        }
      }
    }

    this.logger?.success('Bowtie question answered');
  };

  /**
   * Answer a Fill-in-the-Blank Alpha (text entry) question.
   * answers: string[]  e.g. ["cardiac output"]
   *   One string per input field on the question.
   */
  answerFillInBlankAlphaQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('✏️ ANSWERING FILL-IN-THE-BLANK (ALPHA)');

    if (!answers || answers.length === 0) return;

    const inputs = frame.locator(
      'ie-text-entry-delivery input[type="text"], input.fill-blank, .text-entry input[type="text"]'
    );
    const count = await inputs.count();
    this.logger?.info(`Found ${count} alpha input(s)`);

    for (let i = 0; i < count && i < answers.length; i++) {
      try {
        const input = inputs.nth(i);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.clear();
        await input.fill(answers[i]);
        this.logger?.success(`✅ Input ${i + 1}: typed "${answers[i]}"`);
      } catch (e) {
        this.logger?.error(`Fill-blank alpha input ${i + 1} failed: ${e}`);
      }
      await this.page.waitForTimeout(200);
    }
  };

  /**
   * Answer a Fill-in-the-Blank Numeric question.
   * answers: string[]  e.g. ["120"]
   */
  answerFillInBlankNumericQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('🔢 ANSWERING FILL-IN-THE-BLANK (NUMERIC)');

    if (!answers || answers.length === 0) return;

    const inputs = frame.locator(
      'input[type="number"], ie-text-entry-delivery input[inputmode="numeric"], ie-text-entry-delivery input[inputmode="decimal"], .numeric-entry input'
    );
    const count = await inputs.count();
    this.logger?.info(`Found ${count} numeric input(s)`);

    for (let i = 0; i < count && i < answers.length; i++) {
      try {
        const input = inputs.nth(i);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.clear();
        await input.fill(answers[i]);
        this.logger?.success(`✅ Numeric input ${i + 1}: typed "${answers[i]}"`);
      } catch (e) {
        this.logger?.error(`Fill-blank numeric input ${i + 1} failed: ${e}`);
      }
      await this.page.waitForTimeout(200);
    }
  };

  /**
   * Answer a Free-Form Easy (essay / open-ended) question.
   * answers: string[]  e.g. ["The patient should be placed in semi-Fowler's."]
   */
  answerFreeFormEasyQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('📝 ANSWERING FREE-FORM EASY QUESTION');

    if (!answers || answers.length === 0) return;

    const textarea = frame.locator(
      'ie-extended-text-delivery textarea, textarea.free-text-entry, .essay-response textarea, textarea'
    );

    try {
      await textarea.first().waitFor({ state: 'visible', timeout: 5000 });
      await textarea.first().clear();
      await textarea.first().fill(answers[0]);
      this.logger?.success(`✅ Free-form answer entered: "${answers[0].substring(0, 60)}..."`);
    } catch (e) {
      this.logger?.error(`Free-form textarea fill failed: ${e}`);
    }
  };

  /**
   * Answer a Highlight Text question by clicking on target words/phrases.
   * answers: string[]  e.g. ["word1", "target phrase"]
   */
  answerHighlightTextQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('🖍️ ANSWERING HIGHLIGHT TEXT QUESTION');

    if (!answers || answers.length === 0) return;

    for (const target of answers) {
      try {
        // Strategy 1: find span that exactly matches the word/phrase
        const span = frame.locator(
          `#highlightWordsText span, .highlightable-word, [class*="highlight-word"], .highlight-words span`
        ).filter({ hasText: new RegExp(`^${target}$`, 'i') });

        if ((await span.count()) > 0) {
          await span.first().click();
          this.logger?.success(`✅ Highlighted text: "${target}"`);
        } else {
          // Strategy 2: partial text match
          const partial = frame.getByText(target, { exact: false }).first();
          if ((await partial.count()) > 0) {
            await partial.click();
            this.logger?.success(`✅ Clicked text (partial match): "${target}"`);
          } else {
            this.logger?.info(`⚠️ Highlight text target not found: "${target}"`);
          }
        }
        await this.page.waitForTimeout(300);
      } catch (e) {
        this.logger?.error(`Highlight text "${target}" failed: ${e}`);
      }
    }
  };

  /**
   * Answer a Highlight Table question by clicking specific cells.
   * answers: Array<{row: number, col: number}>  (0-based indices)
   *   e.g. [{"row": 0, "col": 1}, {"row": 2, "col": 0}]
   */
  answerHighlightTableQuestion = async (
    frame: FrameLocator,
    answers: Array<{ row: number; col: number }>
  ): Promise<void> => {
    this.logger?.separator('📊 ANSWERING HIGHLIGHT TABLE QUESTION');

    if (!answers || answers.length === 0) return;

    const table = frame.locator(
      'ie-table-highlight-delivery table, .highlight-table, table.selectable-table, table'
    ).first();

    try {
      await table.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      this.logger?.info('⚠️ Highlight table not found within timeout');
      return;
    }

    for (const cell of answers) {
      try {
        const rows = table.locator('tbody tr, tr');
        const targetRow = rows.nth(cell.row);
        const targetCell = targetRow.locator('td').nth(cell.col);

        if ((await targetCell.count()) > 0) {
          await targetCell.click();
          this.logger?.success(`✅ Clicked table cell [row ${cell.row}, col ${cell.col}]`);
        } else {
          this.logger?.info(`⚠️ Cell [row ${cell.row}, col ${cell.col}] not found`);
        }
        await this.page.waitForTimeout(300);
      } catch (e) {
        this.logger?.error(`Highlight table cell click failed: ${e}`);
      }
    }
  };

  /**
   * Answer a Hotspot Hybrid question by clicking at specific coordinates or
   * by clicking named hotspot regions.
   *
   * answers: Array<{x?: number, y?: number, label?: string}>
   *   Coordinate-based:  [{"x": 100, "y": 150}]
   *   Label-based:       [{"label": "Left ventricle"}]
   */
  answerHotspotHybridQuestion = async (
    frame: FrameLocator,
    answers: Array<{ x?: number; y?: number; label?: string }>
  ): Promise<void> => {
    this.logger?.separator('🎯 ANSWERING HOTSPOT HYBRID QUESTION');

    if (!answers || answers.length === 0) return;

    for (const target of answers) {
      try {
        if (target.label) {
          // Label-based: find region by aria-label or data attribute
          const region = frame.locator(
            `[aria-label="${target.label}"], [data-label="${target.label}"], .hotspot-region[title="${target.label}"]`
          );
          if ((await region.count()) > 0) {
            await region.first().click();
            this.logger?.success(`✅ Clicked hotspot region: "${target.label}"`);
          } else {
            this.logger?.info(`⚠️ Hotspot region "${target.label}" not found`);
          }
        } else if (target.x !== undefined && target.y !== undefined) {
          // Coordinate-based: click at (x, y) relative to the hotspot container
          const container = frame
            .locator(
              'ie-select-point-delivery, .hotspot-interaction, .hotspot-image-wrapper, [class*="hotspot"]'
            )
            .first();
          await container.waitFor({ state: 'visible', timeout: 5000 });
          await container.click({ position: { x: target.x, y: target.y } });
          this.logger?.success(`✅ Clicked hotspot at (${target.x}, ${target.y})`);
        }
        await this.page.waitForTimeout(300);
      } catch (e) {
        this.logger?.error(`Hotspot click failed: ${e}`);
      }
    }
  };

  /**
   * Answer a Likert scale question.
   * answers: string[]  e.g. ["Agree"] or ["3"]
   *   Matches the text label or the numeric position (1-based) of the scale option.
   */
  answerLikertQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('📏 ANSWERING LIKERT SCALE QUESTION');

    if (!answers || answers.length === 0) return;

    const target = answers[0];
    const isNumeric = /^\d+$/.test(target.trim());

    const options = frame.locator(
      'ie-likert-delivery mat-radio-button, .likert-scale mat-radio-button, .rating-scale mat-radio-button, [class*="likert"] mat-radio-button, .likert-row mat-radio-button, mat-radio-group mat-radio-button'
    );
    const count = await options.count();
    this.logger?.info(`Found ${count} Likert options`);

    if (isNumeric) {
      const idx = parseInt(target, 10) - 1; // 1-based → 0-based
      if (idx >= 0 && idx < count) {
        await options.nth(idx).click();
        this.logger?.success(`✅ Likert: selected option ${target} (index ${idx})`);
      }
    } else {
      // Text match
      for (let i = 0; i < count; i++) {
        const text = (await options.nth(i).textContent())?.trim();
        if (text && text.toLowerCase().includes(target.toLowerCase())) {
          await options.nth(i).click();
          this.logger?.success(`✅ Likert: selected "${text}"`);
          break;
        }
      }
    }
  };

  /**
   * Answer a Matrix Multiple Choice question (one radio per row).
   * answers: Array<{row: string, col: string}>
   *   e.g. [{"row": "Medication A", "col": "Appropriate"},
   *          {"row": "Medication B", "col": "Contraindicated"}]
   *
   * Also supports index-based: Array<{rowIndex: number, colIndex: number}>
   */
  answerMatrixMultipleChoiceQuestion = async (
    frame: FrameLocator,
    answers: Array<{ row?: string; col?: string; rowIndex?: number; colIndex?: number }>
  ): Promise<void> => {
    this.logger?.separator('📋 ANSWERING MATRIX MULTIPLE CHOICE');

    if (!answers || answers.length === 0) return;

    const table = frame
      .locator('table.matrix-table, .matrix-interaction table, ie-match-interaction-delivery table, table')
      .first();

    try {
      await table.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      this.logger?.info('⚠️ Matrix table not found');
      return;
    }

    const headerCells = table.locator('thead th, tr:first-child th');
    const headerTexts: string[] = [];
    for (let h = 0; h < (await headerCells.count()); h++) {
      headerTexts.push(((await headerCells.nth(h).textContent()) ?? '').trim());
    }
    this.logger?.info(`Matrix column headers: ${headerTexts.join(' | ')}`);

    const rows = table.locator('tbody tr, tr:not(:first-child)');

    for (const answer of answers) {
      try {
        let rowIndex = answer.rowIndex ?? -1;
        let colIndex = answer.colIndex ?? -1;

        if (answer.row && rowIndex === -1) {
          // Find row by text
          for (let r = 0; r < (await rows.count()); r++) {
            const rowText = ((await rows.nth(r).locator('th, td:first-child').textContent()) ?? '').trim();
            if (rowText.toLowerCase().includes(answer.row.toLowerCase())) {
              rowIndex = r;
              break;
            }
          }
        }

        if (answer.col && colIndex === -1) {
          // Find column by header text (offset by 1 for the row-label column)
          for (let c = 0; c < headerTexts.length; c++) {
            if (headerTexts[c].toLowerCase().includes(answer.col.toLowerCase())) {
              colIndex = c - 1; // subtract row-header column
              break;
            }
          }
        }

        if (rowIndex === -1 || colIndex === -1) {
          this.logger?.info(`⚠️ Matrix MC: could not resolve row/col for ${JSON.stringify(answer)}`);
          continue;
        }

        const targetCell = rows.nth(rowIndex).locator('td').nth(colIndex);
        const radio = targetCell.locator('mat-radio-button, input[type="radio"]').first();
        await radio.click();
        this.logger?.success(`✅ Matrix MC: row ${rowIndex}, col ${colIndex} selected`);
        await this.page.waitForTimeout(200);
      } catch (e) {
        this.logger?.error(`Matrix MC selection failed: ${e}`);
      }
    }
  };

  /**
   * Answer a Matrix Multiple Response question (checkboxes per row).
   * answers: Array<{row: string, col: string}>
   *   e.g. [{"row": "Finding 1", "col": "Action A"},
   *          {"row": "Finding 1", "col": "Action C"}]
   *
   * Also supports index-based: Array<{rowIndex: number, colIndex: number}>
   */
  answerMatrixMultipleResponseQuestion = async (
    frame: FrameLocator,
    answers: Array<{ row?: string; col?: string; rowIndex?: number; colIndex?: number }>
  ): Promise<void> => {
    this.logger?.separator('📋 ANSWERING MATRIX MULTIPLE RESPONSE');

    if (!answers || answers.length === 0) return;

    const table = frame
      .locator('table.matrix-table, .matrix-interaction table, ie-match-interaction-delivery table, table')
      .first();

    try {
      await table.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      this.logger?.info('⚠️ Matrix table not found');
      return;
    }

    const headerCells = table.locator('thead th, tr:first-child th');
    const headerTexts: string[] = [];
    for (let h = 0; h < (await headerCells.count()); h++) {
      headerTexts.push(((await headerCells.nth(h).textContent()) ?? '').trim());
    }

    const rows = table.locator('tbody tr, tr:not(:first-child)');

    for (const answer of answers) {
      try {
        let rowIndex = answer.rowIndex ?? -1;
        let colIndex = answer.colIndex ?? -1;

        if (answer.row && rowIndex === -1) {
          for (let r = 0; r < (await rows.count()); r++) {
            const rowText = ((await rows.nth(r).locator('th, td:first-child').textContent()) ?? '').trim();
            if (rowText.toLowerCase().includes(answer.row.toLowerCase())) {
              rowIndex = r;
              break;
            }
          }
        }

        if (answer.col && colIndex === -1) {
          for (let c = 0; c < headerTexts.length; c++) {
            if (headerTexts[c].toLowerCase().includes(answer.col.toLowerCase())) {
              colIndex = c - 1;
              break;
            }
          }
        }

        if (rowIndex === -1 || colIndex === -1) {
          this.logger?.info(`⚠️ Matrix MR: could not resolve row/col for ${JSON.stringify(answer)}`);
          continue;
        }

        const targetCell = rows.nth(rowIndex).locator('td').nth(colIndex);
        const checkbox = targetCell.locator('mat-checkbox, input[type="checkbox"]').first();
        await checkbox.click();
        this.logger?.success(`✅ Matrix MR: row ${rowIndex}, col ${colIndex} checked`);
        await this.page.waitForTimeout(200);
      } catch (e) {
        this.logger?.error(`Matrix MR selection failed: ${e}`);
      }
    }
  };

  /**
   * Answer an Ordered Response question by dragging items into the correct sequence.
   * answers: string[]  e.g. ["Step 3", "Step 1", "Step 2", "Step 4"]
   *   The array represents the DESIRED final order (top → bottom).
   *   Each string should match the text of an option in the source pool.
   */
  answerOrderedResponseQuestion = async (
    frame: FrameLocator,
    answers: string[]
  ): Promise<void> => {
    this.logger?.separator('🔢 ANSWERING ORDERED RESPONSE QUESTION');

    if (!answers || answers.length === 0) return;

    await this.page.waitForTimeout(1500);

    // Find source items (draggable pool)
    const sourceItems = frame.locator(
      'ie-order-interaction-delivery .source-item, .ordering-interaction .drag-item, .order-source [cdkDrag], .sortable-list .sort-item, .cdk-drag'
    );
    const sourceCount = await sourceItems.count();
    this.logger?.info(`Found ${sourceCount} source items to order`);

    // Find target drop list
    const targetList = frame.locator(
      'ie-order-interaction-delivery .target-list, .ordering-interaction .drop-list, .order-target .cdk-drop-list, .cdk-drop-list.target'
    ).first();

    const hasTarget = (await targetList.count()) > 0;

    for (let i = 0; i < answers.length; i++) {
      const labelToPlace = answers[i];
      try {
        // Find the source item with matching text
        let sourceItem = sourceItems.filter({ hasText: labelToPlace }).first();

        if ((await sourceItem.count()) === 0) {
          this.logger?.info(`⚠️ Source item "${labelToPlace}" not found`);
          continue;
        }

        if (hasTarget) {
          // Drag from source to target drop list
          await sourceItem.hover();
          await this.page.mouse.down();
          await this.page.waitForTimeout(300);
          await targetList.hover();
          await this.page.mouse.up();
          this.logger?.success(`✅ Ordered Response: placed "${labelToPlace}" at position ${i + 1}`);
        } else {
          this.logger?.info(`⚠️ No target list found for ordered response drag`);
        }
        await this.page.waitForTimeout(400);
      } catch (e) {
        this.logger?.error(`Ordered response item "${labelToPlace}" failed: ${e}`);
      }
    }
  };

  /**
   * Open the exhibit panel if the Exhibit button is present on the current question.
   * After opening, the caller is responsible for closing it before answering.
   */
  openExhibitIfPresent = async (frame: FrameLocator): Promise<boolean> => {
    const exhibitBtn = frame.locator(
      'button[aria-label*="Exhibit"], .exhibit-tab, [class*="exhibit"] button, .tab-exhibit'
    );
    if ((await exhibitBtn.count()) > 0) {
      try {
        await exhibitBtn.first().click();
        this.logger?.success('✅ Exhibit opened');
        await this.page.waitForTimeout(800);
        return true;
      } catch (e) {
        this.logger?.error(`Could not open exhibit: ${e}`);
      }
    }
    return false;
  };

  /**
   * Flag the current question (helper used by smartAnswerAssessment).
   */
  private flagCurrentQuestion = async (frame: FrameLocator): Promise<void> => {
    try {
      const flagBtn = frame.getByRole('button', { name: /flag/i });
      if ((await flagBtn.count()) > 0) {
        await flagBtn.waitFor({ state: 'visible', timeout: 3000 });
        await flagBtn.click();
        this.logger?.success('🚩 Question flagged');
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      this.logger?.error(`Flag action failed: ${e}`);
    }
  };
}

