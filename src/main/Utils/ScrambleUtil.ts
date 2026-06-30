/**
 * Scramble Validation Utility
 * Captures question stems and option order from an assessment iframe
 * to validate scramble configuration across multiple students.
 */

import { expect, FrameLocator, Page } from '@playwright/test';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { Logger } from './Logger';

export interface QuestionSnapshot {
  index: number;
  stem: string;
  options: string[];
}

export class ScrambleUtil {
  private page: Page;
  private logger?: Logger;

  constructor(page: Page) {
    this.page = page;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  private normalizeText(value: string | null | undefined): string {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  private async getQuestionStem(
    frame: FrameLocator,
    locators: StudentFacingPageLocators,
    qIndex: number
  ): Promise<string> {
    const selectors = [
      locators.getQuestionTextSelector1(),
      locators.getQuestionTextSelector2(),
      locators.getQuestionTextSelector3(),
      locators.getQuestionTextSelector4(),
      locators.getQuestionTextSelector5(),
      locators.getQuestionTextSelector6(),
    ];

    for (const selector of selectors) {
      const isVisible = await selector.first().isVisible({ timeout: 2500 }).catch(() => false);
      if (!isVisible) continue;

      const text = this.normalizeText(await selector.first().textContent());
      if (text) return text;
    }

    throw new Error(`Unable to capture question stem for question index ${qIndex}`);
  }

  private async getOptionTexts(frame: FrameLocator): Promise<string[]> {
    const optionSets = [
      frame.locator('div.ie-choice-interaction'),
      frame.locator('mat-radio-button .mdc-label'),
      frame.locator('label.mat-radio-label'),
      frame.locator('input[type="radio"] + span, input[type="checkbox"] + span'),
    ];

    for (const set of optionSets) {
      const count = await set.count().catch(() => 0);
      if (!count) continue;

      const values: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = this.normalizeText(await set.nth(i).textContent());
        if (text) values.push(text);
      }

      if (values.length > 1) return values;
    }

    return [];
  }

  private async selectFirstOption(frame: FrameLocator): Promise<void> {
    const clickableOption = frame
      .locator('div.ie-choice-interaction mat-radio-button, mat-radio-button, input[type="radio"], input[type="checkbox"]')
      .first();

    const visible = await clickableOption.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      throw new Error('No selectable option found before Continue');
    }

    await clickableOption.click({ timeout: 10000, force: true });
  }

  private async clickContinueToNext(frame: FrameLocator): Promise<void> {
    const continueButton = frame
      .locator('#moveNext, button:has-text("Continue To Next Question"), .move-to-next-content-active')
      .first();

    await continueButton.waitFor({ state: 'visible', timeout: 10000 });
    await continueButton.click({ timeout: 10000, force: true });
  }

  /**
   * Captures the question stem and option order for N questions from the assessment iframe.
   * Navigates through questions by selecting the first option and clicking Continue.
   */
  async captureQuestionSequence(
    locators: StudentFacingPageLocators,
    totalToCapture: number
  ): Promise<QuestionSnapshot[]> {
    await this.page.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(5000);

    const frame = locators.getAssessmentFrameLocator();
    const snapshots: QuestionSnapshot[] = [];
    let previousStem = '';

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector(locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 60000,
    });

    for (let i = 0; i < totalToCapture; i++) {
      const stem = await this.getQuestionStem(frame, locators, i + 1);
      const options = await this.getOptionTexts(frame);
      snapshots.push({ index: i + 1, stem, options });

      this.logger?.info(`Q${i + 1} stem: ${stem.substring(0, 60)}...`);

      if (i === totalToCapture - 1) break;

      await this.selectFirstOption(frame);
      await this.clickContinueToNext(frame);

      await this.page.waitForFunction(
        ([selector, prev]) => {
          const iframe = document.querySelector(selector) as HTMLIFrameElement | null;
          const doc = iframe?.contentDocument;
          const root = doc?.querySelector('.stem-text.read-area p, .stem-text.read-area, .stem-text p, .stem-text, #highlightWordsText, .question-stem');
          const current = (root?.textContent || '').replace(/\s+/g, ' ').trim();
          return !!current && current !== prev;
        },
        [locators.assessmentFrameSelector, previousStem],
        { timeout: 15000 }
      ).catch(() => {});

      await expect
        .poll(
          async () => {
            try {
              return await this.getQuestionStem(frame, locators, i + 2);
            } catch {
              return '';
            }
          },
          { timeout: 15000, intervals: [300, 500, 800] }
        )
        .not.toBe(previousStem);

      previousStem = stem;
      await this.page.waitForTimeout(800);
    }

    return snapshots;
  }
}
