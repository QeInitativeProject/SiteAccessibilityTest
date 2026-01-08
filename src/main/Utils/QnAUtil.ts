import { expect, type TestInfo } from '@playwright/test';
import type { FrameLocator, Page } from 'playwright';
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
}
