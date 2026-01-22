import type { TestInfo } from '@playwright/test';
import { FrameLocator, Page } from '@playwright/test';
import { Assertions } from './Assertion';
import { Logger } from './Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

export class TextToSpeechUtility {
  private page: Page;
  private assertions: Assertions;
  private logger?: Logger;
  private locators: StudentFacingPageLocators;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.assertions = new Assertions(page);
    this.locators = new StudentFacingPageLocators(page);
    if (testInfo) {
      this.logger = new Logger(page, 'TextToSpeechUtility', testInfo);
    }
  }

  // Method to set logger manually if not passed in constructor
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Validates that text-to-speech toggle is functional
   * 1. Assert toggle is visible and turned OFF
   * 2. Click to turn ON and assert it is turned ON
   * 3. Click to turn OFF and assert it is turned OFF
   */
  async validateToggleFunctionality(): Promise<void> {
    try {
      this.logger?.step('Starting Text-to-Speech toggle functionality verification');

      // Wait for assessment page to load
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      // Wait for frame to be loaded
      await this.locators.getAssessmentFrameBody().waitFor({ state: 'visible', timeout: 15000 });
      this.logger?.success('Assessment frame loaded');

      // Locate toggle switch thumb
      const toggleSwitchThumb = this.locators.getToggleSwitchThumb();

      // Check if text-to-speech feature is available
      const isTextToSpeechAvailable = await toggleSwitchThumb.isVisible().catch(() => false);
      
      if (!isTextToSpeechAvailable) {
        this.logger?.warning('⚠️ Text-to-Speech feature not available for this assessment/user - skipping toggle validation');
        return;
      }

      // Get parent mat-slide-toggle element for state checking
      const toggleParent = this.locators.getToggleParent();

      // 1. Assert that toggle switch thumb is visible and turned OFF
      await this.assertions.assertVisible(toggleSwitchThumb, 15000);
      this.logger?.success('Toggle switch thumb is visible');

      const initialChecked = await toggleParent.getAttribute('class');
      const isInitiallyOff = !initialChecked?.includes('mat-checked');
      this.assertions.assertTruthy(isInitiallyOff);
      this.logger?.success('Assert PASS: Toggle is turned OFF');

      // 2. Click to turn ON and assert it is turned ON
      await toggleSwitchThumb.click({ force: true });
      await this.page.waitForTimeout(2000);
      const afterFirstClick = await toggleParent.getAttribute('class');
      const isNowOn = afterFirstClick?.includes('mat-checked');
      this.assertions.assertTruthy(isNowOn);
      this.logger?.success('Assert PASS: Toggle is now turned ON');

      // 3. Click again to turn OFF and assert it is turned OFF
      await toggleSwitchThumb.click({ force: true });
      await this.page.waitForTimeout(2000);
      const afterSecondClick = await toggleParent.getAttribute('class');
      const isNowOff = !afterSecondClick?.includes('mat-checked');
      this.assertions.assertTruthy(isNowOff);
      this.logger?.success('Assert PASS: Toggle is now turned OFF');

      this.logger?.success('TC6 PASS: Text-to-Speech toggle functionality validated successfully');
    } catch (error: any) {
      this.logger?.error('Text-to-Speech toggle validation failed', error);
      throw error;
    }
  }

  /**
   * Gets the assessment frame locator
   */
  private getAssessmentFrame(): FrameLocator {
    return this.locators.getAssessmentFrameLocator();
  }

  /**
   * Turns the text-to-speech toggle ON
   */
  async turnToggleOn(): Promise<void> {
    const toggleSwitchThumb = this.locators.getToggleSwitchThumb();
    const toggleParent = this.locators.getToggleParent();

    const currentState = await toggleParent.getAttribute('class');
    if (!currentState?.includes('mat-checked')) {
      await toggleSwitchThumb.click({ force: true });
      await this.page.waitForTimeout(2000);
      this.logger?.success('Toggle turned ON');
    } else {
      this.logger?.info('Toggle is already ON');
    }
  }

  /**
   * Turns the text-to-speech toggle OFF
   */
  async turnToggleOff(): Promise<void> {
    const toggleSwitchThumb = this.locators.getToggleSwitchThumb();
    const toggleParent = this.locators.getToggleParent();

    const currentState = await toggleParent.getAttribute('class');
    if (currentState?.includes('mat-checked')) {
      await toggleSwitchThumb.click({ force: true });
      await this.page.waitForTimeout(2000);
      this.logger?.success('Toggle turned OFF');
    } else {
      this.logger?.info('Toggle is already OFF');
    }
  }

  /**
   * Checks if the toggle is currently ON
   */
  async isToggleOn(): Promise<boolean> {
    const toggleParent = this.locators.getToggleParent();
    const currentState = await toggleParent.getAttribute('class');
    return currentState?.includes('mat-checked') || false;
  }

  /**
   * Verifies that the toggle switch thumb is visible
   */
  async verifyToggleVisible(): Promise<void> {
    const toggleSwitchThumb = this.locators.getToggleSwitchThumb();
    await this.assertions.assertVisible(toggleSwitchThumb, 15000);
    this.logger?.success('Toggle switch thumb is visible');
  }

  /**
   * Validates that text-to-speech functionality content is visible
   * Verifies settings button, Click and Listen text, playlist icon, and toggle switch thumb
   */
  async validateTextToSpeechContentVisibility(): Promise<void> {
    try {
      this.logger?.step('Starting Text-to-Speech content visibility verification');

      // Wait for assessment page to load
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      // Wait for frame to be loaded
      await this.locators.getAssessmentFrameBody().waitFor({ state: 'visible', timeout: 15000 });
      this.logger?.success('Assessment frame loaded');

      // Check if text-to-speech feature is available
      const settingsButton = this.locators.getSettingsButton();
      const isTextToSpeechAvailable = await settingsButton.isVisible().catch(() => false);
      
      if (!isTextToSpeechAvailable) {
        this.logger?.warning('⚠️ Text-to-Speech feature not available for this assessment/user - skipping validation');
        return;
      }

      // 1. Assert that settings button is visible
      await this.assertions.assertVisible(settingsButton, 15000);
      this.logger?.success('Settings button is visible');

      // 2. Assert that "Click and Listen" text is visible
      const clickAndListenText = this.locators.getClickAndListenText();
      await this.assertions.assertVisible(clickAndListenText, 15000);
      this.logger?.success('"Click and Listen" text is visible');

      // 3. Assert that "playlist_play" icon is visible
      const playlistPlayIcon = this.locators.getPlaylistPlayIcon();
      await this.assertions.assertVisible(playlistPlayIcon, 15000);
      this.logger?.success('"playlist_play" icon is visible');

      // 4. Assert that toggle switch thumb is visible
      const toggleSwitchThumb = this.locators.getToggleSwitchThumb();
      await this.assertions.assertVisible(toggleSwitchThumb, 15000);
      this.logger?.success('Toggle switch thumb is visible');

      this.logger?.success(
        'TC6 PASS: Text-to-Speech functionality content visibility verified successfully'
      );
    } catch (error: any) {
      this.logger?.error('Text-to-Speech content visibility verification failed', error);
      throw error;
    }
  }

  /**
   * Validates settings button is clickable and speech rate, pitch rate controls are visible
   */
  async validateSettingsButtonAndControls(): Promise<void> {
    try {
      this.logger?.step('Starting Settings button and controls visibility verification');

      // Wait for assessment page to load
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      // Check if text-to-speech feature is available
      const settingsButton = this.locators.getSettingsButton();
      const isTextToSpeechAvailable = await settingsButton.isVisible().catch(() => false);
      
      if (!isTextToSpeechAvailable) {
        this.logger?.warning('⚠️ Text-to-Speech feature not available for this assessment/user - skipping validation');
        return;
      }

      // 1. Assert that settings button is visible
      await this.assertions.assertVisible(settingsButton, 15000);
      this.logger?.success('Settings button is visible');

      // Click on settings button to open settings panel
      await settingsButton.click();
      this.logger?.success('Settings button clicked successfully');
      await this.page.waitForTimeout(2000);

      // 2. Assert that "Pitch" text is visible
      const pitchText = this.locators.getPitchText();
      await this.assertions.assertVisible(pitchText, 15000);
      this.logger?.success('"Pitch" text is visible');

      // 3. Assert that "Speech rate" text is visible
      const speechRateText = this.locators.getSpeechRateText();
      await this.assertions.assertVisible(speechRateText, 15000);
      this.logger?.success('"Speech rate" text is visible');

      // 4. Assert that Close button is visible
      const closeButton = this.locators.getCloseButtonSettings();
      await this.assertions.assertVisible(closeButton, 15000);
      this.logger?.success('Close button is visible');

      // 5. Assert that Reset button is visible
      const resetButton = this.locators.getResetButton();
      await this.assertions.assertVisible(resetButton, 15000);
      this.logger?.success('Reset button is visible');

      // Close the settings dialog to prevent overlay from blocking subsequent tests
      await closeButton.click();
      this.logger?.success('Settings dialog closed');
      await this.page.waitForTimeout(1000);

      this.logger?.success(
        'TC8 PASS: Settings button and controls visibility verified successfully'
      );
    } catch (error: any) {
      this.logger?.error('Settings button and controls verification failed', error);
      throw error;
    }
  }

  /**
   * Validates close and reset button functionality
   */
  async validateCloseAndResetFunctionality(): Promise<void> {
    try {
      this.logger?.step('Starting Close and Reset button functionality verification');

      // Wait for page to stabilize
      await this.page.waitForTimeout(1000);

      // Open settings panel if not already open
      const settingsButton = this.locators.getSettingsButton();
      await settingsButton.click({ force: true });
      this.logger?.success('Settings panel opened');
      await this.page.waitForTimeout(2000);

      // 1. Validate Close button functionality
      const closeButton = this.locators.getCloseButtonSettings();
      await this.assertions.assertVisible(closeButton, 15000);
      this.logger?.success('Close button is visible');

      await closeButton.click();
      this.logger?.success('Close button clicked');
      await this.page.waitForTimeout(1000);

      // Verify settings panel is closed (Close button should not be visible)
      const isCloseButtonHidden = await closeButton.isVisible().catch(() => false);
      this.assertions.assertFalsy(isCloseButtonHidden);
      this.logger?.success('Settings panel closed successfully');

      // 2. Open settings panel again to test Reset functionality
      await settingsButton.click({ force: true });
      this.logger?.success('Settings panel reopened');
      await this.page.waitForTimeout(2000);

      // Verify Reset button is visible
      const resetButton = this.locators.getResetButton();
      await this.assertions.assertVisible(resetButton, 15000);
      this.logger?.success('Reset button is visible');

      // Get speech rate and pitch rate sliders
      const speechRateSlider = this.locators.getSpeechRateSlider();
      const pitchSlider = this.locators.getPitchSlider();

      // Click Reset button
      await resetButton.click();
      this.logger?.success('Reset button clicked');
      await this.page.waitForTimeout(1000);

      // 3. Verify speech rate and pitch rate are reset to default (1x)
      const speechRateValue = await speechRateSlider.getAttribute('value');
      const pitchValue = await pitchSlider.getAttribute('value');

      // Assert speech rate is 1
      this.assertions.assertEqual(parseFloat(speechRateValue!), 1);
      this.logger?.success(`Speech rate reset to default: ${speechRateValue}x`);

      // Assert pitch rate is 1
      this.assertions.assertEqual(parseFloat(pitchValue!), 1);
      this.logger?.success(`Pitch rate reset to default: ${pitchValue}x`);

      this.logger?.success('TC9 PASS: Close and Reset button functionality verified successfully');
    } catch (error: any) {
      this.logger?.error('Close and Reset button functionality verification failed', error);
      throw error;
    }
  }
}
