import { type TestInfo } from '@playwright/test';
import { FrameLocator, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
import { Assertions } from './Assertion';

/**
 * Detected question types
 */
export type QuestionType =
  | 'radioButton'
  | 'multiSelect'
  | 'fillInTheBlank'
  | 'dragAndDrop'
  | 'dropdown'
  | 'orderedResponse'
  | 'hotSpot'
  | 'multipleChoice'
  | 'multipleSelect'
  | 'clozeDropdown'
  | 'exhibit'
  | 'bowtie'
  | 'gapMatch'
  | 'fillInBlankAlpha'
  | 'fillInBlankNumeric'
  | 'freeFormEasy'
  | 'highlightText'
  | 'highlightTable'
  | 'hotspotHybrid'
  | 'likert'
  | 'matrixMultipleChoice'
  | 'matrixMultipleResponse'
  | 'unknown';

/**
 * Config for each question type — defines HOW to answer
 */
export interface TypeConfig {
  answerStrategy: string;
  answerIndex?: number;
  answerIndices?: number[];
  value?: string;
  description?: string;
}

/**
 * JSON file structure — only type configs, no question text
 */
export interface QuestionConfigFile {
  questionTypeConfig: Record<string, TypeConfig>;
}

export class QuestionHandler {
  readonly page: Page;
  private logger?: Logger;
  private locators: StudentFacingPageLocators;
  private assertions: Assertions;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.locators = new StudentFacingPageLocators(page);
    this.assertions = new Assertions(page, testInfo);
    if (testInfo) {
      this.logger = new Logger(page, 'QuestionHandler', testInfo);
    }
  }

  /**
   * Load the config JSON
   */
  private loadConfig(jsonFileName: string, environment: string = 'STAGE'): QuestionConfigFile {
    const projectRoot = path.resolve(__dirname, '../../../');
    const folderName = environment.includes('PROD') ? 'Question Store Prod' : 'Question Store_Stage';
    const jsonFilePath = path.join(projectRoot, `src/test/TestData/${folderName}/${jsonFileName}`);

    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const data: QuestionConfigFile = JSON.parse(fileContent);
    this.logger?.success(`Loaded config: ${Object.keys(data.questionTypeConfig).length} type strategies`);
    return data;
  }

  async answerAllQuestions(jsonFileName: string, environment: string = 'STAGE'): Promise<void> {
    this.logger?.separator('QUESTION HANDLER - Auto Detect & Answer');

    const config = this.loadConfig(jsonFileName, environment);
    const frame = this.locators.getAssessmentFrameLocator();

    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 30000,
    });
    this.logger?.success('Assessment iframe attached');

    let isLastQuestion = false;
    let previousQuestion = 0;

    while (!isLastQuestion) {
      // Read "Question: X of Y" from screen each iteration
      const { current, total } = await this.getQuestionProgress(frame);
      this.logger?.separator(`Question ${current}/${total}`);

      // Safety check: if question didn't advance after Continue, break to avoid infinite loop
      if (current === previousQuestion) {
        throw new Error(`Question did not advance from Q${current}. Detection or answer may be incorrect.`);
      }
      previousQuestion = current;

      // Wait for question to load
      await this.waitForQuestionToLoad(frame);

      // STEP 1: Detect question type from UI (retry up to 15s for question to fully render)
      let detectedType: QuestionType = 'unknown';
      for (let attempt = 0; attempt < 3; attempt++) {
        detectedType = await this.detectQuestionType(frame);
        if (detectedType !== 'unknown') break;
        this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting for question to load...`);
        await this.page.waitForTimeout(1500);
      }
      this.logger?.info(`Detected: ${detectedType}`);

      if (detectedType === 'unknown') {
        // Can't identify question type — flag it and move on
        this.logger?.info(`Q${current}: Unknown type — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 2: Get the config/strategy for this type
      const typeConfig = config.questionTypeConfig[detectedType];
      if (!typeConfig) {
        // No config for this type — flag it and move on
        this.logger?.info(`Q${current}: No config for "${detectedType}" — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 3: Execute the answer strategy
      await this.executeStrategy(frame, detectedType, typeConfig);

      // STEP 4: Check if last question, if not click continue
      isLastQuestion = current === total;
      if (!isLastQuestion) {
        await this.clickContinue(frame, current - 1);
      }
    }

    const { total } = await this.getQuestionProgress(frame);
    this.logger?.separator(`All ${total} questions answered!`);
  }

  // ===========================
  // DETECTION - Checks UI elements to identify question type
  // ===========================

  async detectQuestionType(frame: FrameLocator): Promise<QuestionType> {
    // 1. Drag and drop / ordered response
    // 1. Hot Spot (image click areas) — check early since it's unique
    const hotSpot = frame.locator('comp-hotspot, .hot-spot-question-container');
    if (await this.isVisible(hotSpot)) {
      return 'hotSpot';
    }

    // 2. Ordered Response (comp-draganddrop with left/right boxes OR ie-order-interaction with click-to-move)
    const orderedDragDrop = frame.locator('comp-draganddrop, .order-response, #sortable-container, ie-order-interaction, ie-order-interaction-delivery');
    if (await this.isVisible(orderedDragDrop)) {
      return 'orderedResponse';
    }

    // 3. Bowtie (drag items into A/B/C columns)
    const bowtie = frame.locator('ie-bowtie-html-delivery, div.bowtie');
    if (await this.isVisible(bowtie)) {
      return 'bowtie';
    }

    // 3b. Cloze Drag-Drop / Triad (inline targets with option lists)
    const clozeDD = frame.locator('ie-drag-drop-triad-html-delivery, app-drag-drop-triad-html, ie-drag-drop-html-delivery, app-drag-drop-html');
    if (await this.isVisible(clozeDD)) {
      return 'clozeDropdown';
    }

    // 3c. Gap Match (option lists with Move option buttons)
    const gapMatch = frame.locator('ie-gap-match-interaction-delivery .option-list');
    if (await this.isVisible(gapMatch)) {
      return 'gapMatch';
    }

    // 4. Drag and drop / generic ordered response
    const dragItems = frame.locator('[cdkDrag], [draggable="true"], .cdk-drag, .drag-item');
    if (await this.isVisible(dragItems)) {
      const dropZones = frame.locator('[cdkDropList], .cdk-drop-list, .drop-zone, .drop-target');
      const dropCount = await dropZones.count().catch(() => 0);
      return dropCount > 1 ? 'dragAndDrop' : 'orderedResponse';
    }

    // 4a. Highlight Text (clickable highlighted words in paragraphs)
    const highlightText = frame.locator('app-highlight-display, ie-highlight-display-delivery');
    if (await this.isVisible(highlightText)) {
      return 'highlightText';
    }

    // 4b. Table-based questions: could be highlight table, dropdown table, or checkbox table
    const tableControl = frame.locator('ie-table-control-delivery, table.highlight-table');
    if (await this.isVisible(tableControl)) {
      // Check if it contains mat-select (dropdown table), mat-checkbox (checkbox table), or hot-text buttons (highlight table)
      const hasDropdowns = await this.isVisible(tableControl.locator('mat-select'));
      if (hasDropdowns) {
        return 'dropdown';
      }
      const hasCheckboxes = await this.isVisible(tableControl.locator('mat-checkbox'));
      if (hasCheckboxes) {
        return 'matrixMultipleResponse';
      }
      return 'highlightTable';
    }

    // 5. Multi-select (checkboxes)
    const checkboxes = frame.locator('mat-checkbox');
    if (await this.isVisible(checkboxes)) {
      return 'multiSelect';
    }

    // 6. Matrix Multiple Choice (table with radio per row)
    const matrixTable = frame.locator('ie-match-interaction-delivery, table.matrix-table');
    if (await this.isVisible(matrixTable)) {
      return 'matrixMultipleChoice';
    }

    // 7a. Native Multiple Choice (comp-multiplechoice with native input[type="radio"])
    const nativeRadio = frame.locator('comp-multiplechoice');
    if (await this.isVisible(nativeRadio)) {
      return 'multipleChoice';
    }

    // 7b. Angular Material Radio button (ie-choice-interaction with mat-radio-button)
    const radioButtons = frame.locator('ie-choice-interaction-delivery mat-radio-group, div.ie-choice-interaction mat-radio-button');
    if (await this.isVisible(radioButtons)) {
      return 'radioButton';
    }

    // 7c. Fallback: any form radio button
    const formRadio = frame.locator('form mat-radio-group, form mat-radio-button, form [role="radiogroup"], form input[type="radio"]');
    if (await this.isVisible(formRadio)) {
      // Check if it's native (comp-multiplechoice pattern) or mat-radio
      const hasMat = await this.isVisible(frame.locator('mat-radio-button'));
      return hasMat ? 'radioButton' : 'multipleChoice';
    }

    // 4. Dropdown
    const dropdowns = frame.locator('mat-select, select, .cloze-dropdown, .mat-select');
    if (await this.isVisible(dropdowns)) {
      return 'dropdown';
    }

    // 5. Fill in the blank (text input) — only within the question/form area
    const formArea = frame.locator('form, .question-area, .mainContent');
    const textInputs = formArea.locator('input[type="text"]:not([readonly]):not(.calculator-display), textarea, .cloze-text-input, input.fill-blank');
    if (await this.isVisible(textInputs)) {
      return 'fillInTheBlank';
    }

    return 'unknown';
  }

  private async isVisible(locator: ReturnType<FrameLocator['locator']>): Promise<boolean> {
    try {
      const count = await locator.count();
      if (count === 0) return false;
      return await locator.first().isVisible({ timeout: 300 });
    } catch {
      return false;
    }
  }

  // ===========================
  // STRATEGY EXECUTION - Based on detected type + config
  // ===========================

  private async executeStrategy(frame: FrameLocator, type: QuestionType, config: TypeConfig): Promise<void> {
    switch (type) {
      case 'radioButton':
        await this.answerRadioButton(frame, config);
        break;
      case 'multiSelect':
        await this.answerMultiSelect(frame, config);
        break;
      case 'fillInTheBlank':
        await this.answerFillInTheBlank(frame, config);
        break;
      case 'dragAndDrop':
        await this.answerDragAndDrop(frame, config);
        break;
      case 'dropdown':
        await this.answerDropdown(frame, config);
        break;
      case 'orderedResponse':
        await this.answerOrderedResponse(frame, config);
        break;
      case 'hotSpot':
        await this.answerHotSpot(frame, config);
        break;
      case 'highlightText':
        await this.answerHighlightText(frame, config);
        break;
      case 'highlightTable':
        await this.answerHighlightTable(frame, config);
        break;
      case 'matrixMultipleChoice':
        await this.answerMatrixMultipleChoice(frame, config);
        break;
      case 'bowtie':
        await this.answerBowtie(frame, config);
        break;
      case 'clozeDropdown':
        await this.answerClozeDropdown(frame, config);
        break;
      case 'gapMatch':
        await this.answerGapMatch(frame, config);
        break;
      case 'matrixMultipleResponse':
        await this.answerMatrixMultipleResponse(frame, config);
        break;
      case 'multipleChoice':
        await this.answerMultipleChoice(frame, config);
        break;
      default:
        throw new Error(`No handler for type: ${type}`);
    }
  }

  // ===========================
  // ANSWER METHODS
  // ===========================

  /**
   * RADIO BUTTON — select one option by index
   * Targets the native input or label inside the MDC radio button structure:
   *   mat-radio-button > div.mdc-form-field > label[for="mat-radio-X-input"]
   */
  private async answerRadioButton(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const options = frame.locator('div.ie-choice-interaction');
    const count = await options.count();
    this.logger?.info(`Radio (mat): ${count} options, selecting index ${index}`);

    if (count === 0) {
      throw new Error('RadioButton: no ie-choice-interaction elements found');
    }
    if (index >= count) {
      throw new Error(`RadioButton answerIndex ${index} out of range (${count} options available)`);
    }

    const option = options.nth(index);
    const radio = option.locator('mat-radio-button').first();
    await radio.waitFor({ state: 'visible', timeout: 5000 });

    // Scroll into view to ensure it's interactable
    await radio.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);

    // Click the label inside mdc-form-field (most reliable for MDC radio buttons)
    const label = radio.locator('div.mdc-form-field label');
    const labelVisible = await label.isVisible({ timeout: 1000 }).catch(() => false);

    if (labelVisible) {
      await label.click();
    } else {
      // Fallback: click the native input directly
      const nativeInput = radio.locator('input.mdc-radio__native-control');
      const inputExists = await nativeInput.count() > 0;
      if (inputExists) {
        await nativeInput.click({ force: true });
      } else {
        await radio.click({ force: true });
      }
    }

    // Verify selection took effect
    await this.page.waitForTimeout(300);
    const isChecked = await radio.evaluate((el) => {
      return el.classList.contains('mat-mdc-radio-checked') ||
             el.querySelector('input')?.checked === true;
    }).catch(() => false);

    if (!isChecked) {
      this.logger?.debug(`Radio [${index}]: First click may not have registered, retrying with native input...`);
      const nativeInput = radio.locator('input.mdc-radio__native-control');
      await nativeInput.click({ force: true });
      await this.page.waitForTimeout(200);
    }

    const selectedText = (await option.textContent())?.trim();
    this.logger?.success(`Radio selected [${index}]: "${selectedText}"`);
  }

  /**
   * MULTIPLE CHOICE — native radio buttons (comp-multiplechoice with input[type="radio"])
   */
  private async answerMultipleChoice(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const options = frame.locator('comp-multiplechoice .question-option, form .question-option[role="radiogroup"]');
    const count = await options.count();
    this.logger?.info(`MultipleChoice (native): ${count} options, selecting index ${index}`);

    if (count === 0) {
      throw new Error('MultipleChoice: no .question-option elements found');
    }
    if (index >= count) {
      throw new Error(`MultipleChoice answerIndex ${index} out of range (${count} options available)`);
    }

    const option = options.nth(index);
    const label = option.locator('label');
    await label.waitFor({ state: 'visible', timeout: 5000 });
    await label.click();
    const selectedText = (await label.textContent())?.trim();
    this.logger?.success(`MultipleChoice selected [${index}]: "${selectedText}"`);
  }

  /**
   * MULTI-SELECT — check multiple options by indices
   */
  private async answerMultiSelect(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const indices = config.answerIndices ?? [0];
    const checkboxes = frame.locator('mat-checkbox');
    const count = await checkboxes.count();
    this.logger?.info(`MultiSelect: ${count} options, selecting indices [${indices.join(', ')}]`);

    for (const idx of indices) {
      if (idx >= count) {
        throw new Error(`MultiSelect index ${idx} out of range (${count} options available)`);
      }
      await checkboxes.nth(idx).click();
      const text = (await checkboxes.nth(idx).textContent())?.trim();
      this.logger?.success(`Checked [${idx}]: "${text}"`);
    }
  }

  /**
   * MATRIX MULTIPLE RESPONSE — table with checkbox groups per row, select one per row
   */
  private async answerMatrixMultipleResponse(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const groups = frame.locator('ie-choice-interaction-delivery .choice-interaction-checkbox-group');
    const groupCount = await groups.count();
    this.logger?.info(`MatrixMultipleResponse: ${groupCount} row group(s), selecting one checkbox per row`);

    for (let g = 0; g < groupCount; g++) {
      const groupCheckboxes = groups.nth(g).locator('mat-checkbox');
      const cbCount = await groupCheckboxes.count();
      if (cbCount === 0) continue;
      // Use answerIndex from config (same for each row), else pick first
      const idx = config.answerIndex ?? 0;
      const target = idx < cbCount ? groupCheckboxes.nth(idx) : groupCheckboxes.first();
      await target.click();
      const text = (await target.textContent())?.trim();
      this.logger?.success(`Row ${g + 1}: checked [${idx}]: "${text}"`);
    }
  }

  /**
   * FILL IN THE BLANK — type value into input using keyboard events to trigger validation
   */
  private async answerFillInTheBlank(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const value = config.value ?? '';
    if (!value) throw new Error('fillInTheBlank config needs a "value" field');

    const formArea = frame.locator('form, .question-area, .mainContent');
    const inputs = formArea.locator('input[type="text"]:not([readonly]):not(.calculator-display), textarea, .cloze-text-input, input.fill-blank');
    const inputCount = await inputs.count();
    this.logger?.info(`FillInBlank: ${inputCount} input(s) found, typing "${value}"`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      await input.waitFor({ state: 'visible', timeout: 5000 });

      // Focus and clear
      await input.click();
      await input.fill('');

      // Type character by character to trigger keydown/keyup/input events
      await input.pressSequentially(value, { delay: 20 });

      // Dispatch input + change events to trigger Angular/Knockout validation
      await input.dispatchEvent('input');
      await input.dispatchEvent('change');
      await input.dispatchEvent('blur');

      this.logger?.success(`Input [${i + 1}]: typed "${value}" and dispatched events`);
    }

    // Wait briefly for Angular to process and enable Continue
    await this.page.waitForTimeout(300);
  }

  /**
   * DROPDOWN — select first non-placeholder option from each mat-select dropdown
   * Handles both standalone dropdowns and dropdown-table (ie-table-control-delivery with mat-selects)
   */
  private async answerDropdown(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const dropdowns = frame.locator('mat-select');
    const dropdownCount = await dropdowns.count();
    this.logger?.info(`Dropdown: ${dropdownCount} mat-select(s) found`);

    for (let i = 0; i < dropdownCount; i++) {
      const dropdown = dropdowns.nth(i);

      // Click dropdown to open the panel
      await dropdown.click();
      this.logger?.debug(`Dropdown ${i + 1}: clicked to open`);

      // Wait for the overlay panel to appear (inside the iframe's cdk-overlay-container)
      await this.page.waitForTimeout(300);

      // Try finding options inside the frame first (CDK overlay is in frame's body)
      let matOptions = frame.locator('mat-option');
      let optionCount = await matOptions.count();

      // Fallback: check main page if not found in frame
      if (optionCount === 0) {
        matOptions = this.page.locator('mat-option');
        optionCount = await matOptions.count();
      }

      this.logger?.debug(`Dropdown ${i + 1}: ${optionCount} options visible`);

      if (optionCount > 0) {
        // Find first non-placeholder option
        let selectedIdx = -1;
        for (let o = 0; o < optionCount; o++) {
          const text = (await matOptions.nth(o).textContent())?.trim().toLowerCase();
          if (!text || text === 'select...' || text === 'select' || text === '-- select --' || text === '') {
            continue;
          }
          selectedIdx = o;
          break;
        }

        if (selectedIdx === -1) selectedIdx = optionCount - 1; // last option as fallback

        const optText = (await matOptions.nth(selectedIdx).textContent())?.trim();
        await matOptions.nth(selectedIdx).click();
        this.logger?.success(`Dropdown ${i + 1}/${dropdownCount}: selected "${optText}"`);
      } else {
        this.logger?.debug(`Dropdown ${i + 1}: no options found, pressing Escape`);
        await this.page.keyboard.press('Escape');
      }

      // Wait for panel to close before moving to next dropdown
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * DRAG AND DROP — drag items to drop zones in order
   */
  private async answerDragAndDrop(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const sources = frame.locator('[cdkDrag], .drag-item, [draggable="true"]');
    const targets = frame.locator('[cdkDropList], .drop-zone, .drop-target');
    const sourceCount = await sources.count();
    const targetCount = await targets.count();
    this.logger?.info(`DragDrop: ${sourceCount} sources, ${targetCount} targets`);

    const limit = Math.min(sourceCount, targetCount);
    for (let i = 0; i < limit; i++) {
      await sources.nth(i).dragTo(targets.nth(i));
      this.logger?.success(`Dragged item ${i + 1} → target ${i + 1}`);
    }
  }

  /**
   * CLOZE DRAG-DROP — place options into inline targets using Move option menu
   * Only fills as many options as there are targets (e.g., 3 targets → place 3 options)
   * Selects different target slots: 1st option → Target 1, 2nd → Target 2, etc.
   */
  private async answerClozeDropdown(frame: FrameLocator, config: TypeConfig): Promise<void> {
    // Count inline targets in the content area
    const inlineTargets = frame.locator('ie-target-delivery .target');
    const targetCount = await inlineTargets.count();

    const optionLists = frame.locator('ie-gap-match-interaction-delivery .option-list:not(.is-bowtie-item)');
    const listCount = await optionLists.count();
    this.logger?.info(`ClozeDropdown: ${listCount} option list(s), ${targetCount} inline target(s)`);

    for (let listIdx = 0; listIdx < listCount; listIdx++) {
      const list = optionLists.nth(listIdx);
      const listLabel = await list.getAttribute('aria-label') ?? `List${listIdx}`;

      const options = list.locator('.option-list-item');
      const optionCount = await options.count();

      // Only fill as many as there are targets (don't try to place more than available slots)
      const itemsToFill = Math.min(optionCount, targetCount);
      this.logger?.info(`List "${listLabel}": ${optionCount} options, filling ${itemsToFill} target(s)`);

      for (let i = 0; i < itemsToFill; i++) {
        const option = options.nth(i);
        const moveBtn = option.locator('button.contextMenuButton');

        const btnCount = await moveBtn.count();
        if (btnCount === 0) {
          this.logger?.debug(`Option ${i + 1}: no Move button, skipping`);
          continue;
        }

        try {
          await moveBtn.waitFor({ state: 'visible', timeout: 3000 });
        } catch {
          this.logger?.debug(`Option ${i + 1}: Move button not visible, skipping`);
          continue;
        }

        const optText = (await option.locator('.option-list-content').textContent())?.trim();
        await moveBtn.click();
        this.logger?.debug(`Option ${i + 1}/${itemsToFill}: clicked Move for "${optText}"`);

        // Wait for mat-menu overlay to appear (inside iframe)
        await this.page.waitForTimeout(300);
        let menuItems = frame.locator('.cdk-overlay-container .mat-menu-item');
        let menuCount = await menuItems.count();

        // Fallback: check main page if not found in frame
        if (menuCount === 0) {
          menuItems = this.page.locator('.cdk-overlay-container .mat-menu-item, .mat-menu-panel .mat-menu-item');
          menuCount = await menuItems.count();
        }

        if (menuCount > 0) {
          // Select the i-th target slot (Target 1, Target 2, Target 3...)
          const slotIndex = i < menuCount ? i : 0;
          const targetItem = menuItems.nth(slotIndex);
          const targetText = (await targetItem.textContent())?.trim();
          await targetItem.click();
          this.logger?.success(`[${i + 1}/${itemsToFill}]: "${optText}" → "${targetText}"`);
        } else {
          this.logger?.debug(`Option ${i + 1}: no menu items appeared, pressing Escape`);
          await this.page.keyboard.press('Escape');
        }

        await this.page.waitForTimeout(300);
      }

      this.logger?.success(`List "${listLabel}": filled ${itemsToFill} target(s)`);
    }
  }

  /**
   * ORDERED RESPONSE — move all items from options list to answers list
   * Pattern 1: comp-draganddrop with DropZoneOne → DropZoneTwo (drag)
   * Pattern 2: ie-order-interaction-delivery with ordered-source-list → ordered-answer-list (click/space)
   */
  private async answerOrderedResponse(frame: FrameLocator, _config: TypeConfig): Promise<void> {
    // Pattern 1: DropZoneOne / DropZoneTwo (drag-based)
    const leftBox = frame.locator('#DropZoneOne');
    const rightBox = frame.locator('#DropZoneTwo');

    if (await this.isVisible(leftBox)) {
      const items = leftBox.locator('li.draggable-option');
      const count = await items.count();
      this.logger?.info(`OrderedResponse (drag): ${count} items to move from left → right box`);

      for (let i = 0; i < count; i++) {
        const firstItem = leftBox.locator('li.draggable-option').first();
        await firstItem.dragTo(rightBox);
        const itemText = (await firstItem.textContent())?.trim();
        this.logger?.success(`Moved [${i + 1}]: "${itemText}"`);
        await this.page.waitForTimeout(200);
      }
      return;
    }

    // Pattern 2: ie-order-interaction with source/answer lists (click to move)
    const sourceList = frame.locator('.ordered-source-list');
    const answerList = frame.locator('.ordered-answer-list');

    if (await this.isVisible(sourceList)) {
      const items = sourceList.locator('.cdk-drag.row');
      const count = await items.count();
      this.logger?.info(`OrderedResponse (click): ${count} items to click from options → answers`);

      for (let i = 0; i < count; i++) {
        // Always pick the first remaining item (they shift after each move)
        const firstItem = sourceList.locator('.cdk-drag.row').first();
        const choiceEl = firstItem.locator('ie-ordered-simple-choice');
        const itemText = (await choiceEl.textContent())?.trim();

        // Click the option — pressing Space moves it to the answer list
        await choiceEl.focus();
        await choiceEl.press('Space');
        this.logger?.success(`Moved [${i + 1}/${count}]: "${itemText}"`);
        await this.page.waitForTimeout(200);
      }
      return;
    }

    // Fallback: generic cdkDrag ordered response
    const items = frame.locator('[cdkDrag], .ordered-response-item, .drag-item');
    const count = await items.count();
    this.logger?.info(`OrderedResponse: ${count} items — keeping current order`);
    this.logger?.success('Ordered response: no reorder applied (keepOrder strategy)');
  }

  /**
   * HOT SPOT — click on an area in the image map by index
   */
  private async answerHotSpot(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const areas = frame.locator('map[name="imagemap"] area');
    const areaCount = await areas.count();
    this.logger?.info(`HotSpot: ${areaCount} clickable areas, selecting index ${index}`);

    if (areaCount === 0) {
      throw new Error('No hot spot areas found in image map');
    }

    if (index >= areaCount) {
      throw new Error(`HotSpot answerIndex ${index} out of range (${areaCount} areas available)`);
    }

    await areas.nth(index).click({ force: true });
    const areaId = await areas.nth(index).getAttribute('id');
    this.logger?.success(`HotSpot: clicked area [${index}] (id: ${areaId})`);
  }

  /**
   * HIGHLIGHT TABLE — click hot-text buttons in a table by indices
   */
  private async answerHighlightTable(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const indices = config.answerIndices ?? [0];
    const hotTexts = frame.locator('ie-hot-text-interaction-delivery span.hot-text-button');
    const count = await hotTexts.count();
    this.logger?.info(`HighlightTable: ${count} hot-text targets, selecting indices [${indices.join(', ')}]`);

    for (const idx of indices) {
      if (idx >= count) {
        this.logger?.debug(`HighlightTable index ${idx} out of range (${count} available), skipping`);
        continue;
      }
      await hotTexts.nth(idx).click();
      const text = (await hotTexts.nth(idx).textContent())?.trim();
      this.logger?.success(`Highlighted [${idx}]: "${text}"`);
    }
  }

  /**
   * HIGHLIGHT TEXT — click on highlighted words in paragraphs
   * Clicks all span.hot-text-button that contain mark.highlighter.key (correct answers)
   * Falls back to answerIndices from config if specified
   */
  private async answerHighlightText(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const hotTexts = frame.locator('ie-hot-text-interaction-delivery span.hot-text-button');
    const count = await hotTexts.count();
    this.logger?.info(`HighlightText: ${count} clickable word(s) found`);

    if (config.answerIndices) {
      // Click by specific indices from config
      for (const idx of config.answerIndices) {
        if (idx >= count) {
          this.logger?.debug(`HighlightText index ${idx} out of range (${count} available), skipping`);
          continue;
        }
        await hotTexts.nth(idx).click();
        const text = (await hotTexts.nth(idx).textContent())?.trim();
        this.logger?.success(`Clicked word [${idx}]: "${text}"`);
      }
    } else {
      // Default: click the first available highlighted word
      let clicked = 0;
      for (let i = 0; i < count; i++) {
        await hotTexts.nth(i).click();
        const text = (await hotTexts.nth(i).textContent())?.trim();
        this.logger?.success(`Clicked word [${i}]: "${text}"`);
        clicked++;
        if (clicked >= (config.answerIndex ?? 1)) break;
      }
    }

    await this.page.waitForTimeout(300);
  }

  /**
   * MATRIX MULTIPLE CHOICE — select one radio per row (first column by default)
   */
  private async answerMatrixMultipleChoice(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const colIndex = config.answerIndex ?? 0; // which column to select in each row
    const rows = frame.locator('table.matrix-table tbody tr.matrix-row');
    const rowCount = await rows.count();
    this.logger?.info(`MatrixMultipleChoice: ${rowCount} rows, selecting column ${colIndex} for each`);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const radios = row.locator('td.matrix-cell mat-radio-button');
      const radioCount = await radios.count();

      if (colIndex >= radioCount) {
        this.logger?.debug(`Row ${i}: column index ${colIndex} out of range (${radioCount} columns), selecting first`);
        await radios.first().click();
      } else {
        await radios.nth(colIndex).click();
      }

      const rowLabel = (await row.locator('th.matrix-cell').textContent())?.trim();
      this.logger?.success(`Row ${i} ("${rowLabel}"): selected column ${colIndex}`);
    }
  }

  /**
   * BOWTIE — use Move option menu to place options into targets for each column
   * Column A needs 2 answers, Column B needs 1, Column C needs 2 (total 5)
   * Menu shows available target slots — select 1st slot for first option, 2nd for second, etc.
   */
  private async answerBowtie(frame: FrameLocator, config: TypeConfig): Promise<void> {
    const optionLists = frame.locator('ie-gap-match-interaction-delivery .option-list.is-bowtie-item');
    const listCount = await optionLists.count();
    this.logger?.info(`Bowtie: ${listCount} columns to fill`);

    for (let col = 0; col < listCount; col++) {
      const list = optionLists.nth(col);
      const columnLabel = await list.getAttribute('aria-label') ?? `Column${col}`;

      // Find how many targets this column has from the bowtie diagram
      const targets = frame.locator(`.bowtie-column[aria-label="${columnLabel}"] .bowtie-target`);
      const targetCount = await targets.count();
      const options = list.locator('.option-list-item');
      const optionCount = await options.count();

      this.logger?.info(`Column ${columnLabel}: ${targetCount} target(s), ${optionCount} options`);

      // Place N different options into N targets using Move option menu
      const itemsToFill = Math.min(targetCount, optionCount);
      for (let t = 0; t < itemsToFill; t++) {
        // Pick the t-th option (different option for each target)
        const option = list.locator('.option-list-item').nth(t);
        const moveBtn = option.locator('button.contextMenuButton');
        await moveBtn.waitFor({ state: 'visible', timeout: 5000 });

        const optText = (await option.locator('.option-list-content').textContent())?.trim();
        await moveBtn.click();
        this.logger?.debug(`Column "${columnLabel}" option ${t + 1}: clicked Move for "${optText}"`);

        // Wait for mat-menu overlay (rendered inside the iframe's cdk-overlay-container)
        await this.page.waitForTimeout(300);

        // Menu items are inside the iframe — use frame.locator
        const menuItems = frame.locator('.cdk-overlay-container .mat-menu-item');
        const menuCount = await menuItems.count();
        this.logger?.debug(`Menu has ${menuCount} target slot(s)`);

        if (menuCount > 0) {
          // Pick the (t+1)-th menu item for the t-th target slot
          // Menu shows all available slots; pick index t if available, else first
          const slotIndex = t < menuCount ? t : 0;
          const targetItem = menuItems.nth(slotIndex);
          const targetText = (await targetItem.textContent())?.trim();
          await targetItem.click();
          this.logger?.success(`Column ${columnLabel} [${t + 1}/${itemsToFill}]: "${optText}" → "${targetText}"`);
        } else {
          // Fallback: try searching on main page (in case overlay is outside iframe)
          const pageMenuItems = this.page.locator('.cdk-overlay-container .mat-menu-item, .mat-menu-panel .mat-menu-item');
          const pageMenuCount = await pageMenuItems.count();
          if (pageMenuCount > 0) {
            const slotIndex = t < pageMenuCount ? t : 0;
            const targetText = (await pageMenuItems.nth(slotIndex).textContent())?.trim();
            await pageMenuItems.nth(slotIndex).click();
            this.logger?.success(`Column ${columnLabel} [${t + 1}/${itemsToFill}]: "${optText}" → "${targetText}" (page overlay)`);
          } else {
            this.logger?.debug(`No menu items found for column "${columnLabel}" option ${t + 1}, pressing Escape`);
            await this.page.keyboard.press('Escape');
          }
        }

        // Wait for menu to close and DOM to update
        await this.page.waitForTimeout(300);
      }

      this.logger?.success(`Column ${columnLabel}: filled ${itemsToFill} target(s)`);
    }
  }

  /**
   * GAP MATCH — click Move option button for EACH option in EACH list, pick the first menu item
   */
  private async answerGapMatch(frame: FrameLocator, _config: TypeConfig): Promise<void> {
    const optionLists = frame.locator('ie-gap-match-interaction-delivery .option-list');
    const listCount = await optionLists.count();
    this.logger?.info(`GapMatch: ${listCount} option list(s) found`);

    for (let listIdx = 0; listIdx < listCount; listIdx++) {
      const list = optionLists.nth(listIdx);
      const listLabel = await list.getAttribute('aria-label') ?? `List${listIdx}`;

      // Get ALL option items in this list
      const options = list.locator('.option-list-item');
      const optionCount = await options.count();
      this.logger?.info(`List "${listLabel}": ${optionCount} options to process`);

      // Iterate through EVERY option by index
      for (let i = 0; i < optionCount; i++) {
        const option = options.nth(i);
        const moveBtn = option.locator('button.contextMenuButton');

        // Check if Move button exists and is visible for this option
        const btnCount = await moveBtn.count();
        if (btnCount === 0) {
          this.logger?.debug(`Option ${i + 1}: no Move button, skipping`);
          continue;
        }

        try {
          await moveBtn.waitFor({ state: 'visible', timeout: 3000 });
        } catch {
          this.logger?.debug(`Option ${i + 1}: Move button not visible, skipping`);
          continue;
        }

        // Click the Move option button
        await moveBtn.click();
        this.logger?.debug(`Option ${i + 1}/${optionCount}: clicked Move button`);

        // Wait for mat-menu overlay to appear (inside iframe)
        await this.page.waitForTimeout(300);
        let menuItems = frame.locator('.cdk-overlay-container .mat-menu-item');
        let menuCount = await menuItems.count();

        // Fallback: check main page if not found in frame
        if (menuCount === 0) {
          menuItems = this.page.locator('.cdk-overlay-container .mat-menu-item, .mat-menu-panel .mat-menu-item');
          menuCount = await menuItems.count();
        }

        if (menuCount > 0) {
          const targetText = (await menuItems.first().textContent())?.trim();
          await menuItems.first().click();
          const optText = (await option.locator('.option-list-content').textContent())?.trim();
          this.logger?.success(`List "${listLabel}" [${i + 1}/${optionCount}]: "${optText}" → "${targetText}"`);
        } else {
          this.logger?.debug(`Option ${i + 1}: no menu items appeared, pressing Escape`);
          await this.page.keyboard.press('Escape');
        }

        // Wait for menu to fully close before processing next option
        await this.page.waitForTimeout(300);
      }

      this.logger?.success(`List "${listLabel}": all ${optionCount} options processed`);
    }
  }

  // ===========================
  // HELPERS
  // ===========================

  /**
   * Reads "Question: X of Y" from the header and returns both current and total
   */
  private async getQuestionProgress(frame: FrameLocator): Promise<{ current: number; total: number }> {
    const header = frame.locator('.question-position h1');
    await header.waitFor({ state: 'visible', timeout: 30000 });
    const text = await header.textContent();
    // "Question: 6 of 60" → current=6, total=60
    const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of\s+(\d+)/);
    if (!match) {
      throw new Error(`Could not parse question progress from header: "${text}"`);
    }
    return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) };
  }

  private async waitForQuestionToLoad(frame: FrameLocator): Promise<void> {
    // Combined selector — checks all at once instead of sequential 3s timeouts
    const combined = frame.locator('div.stem-text.read-area, .stem-text, .question-stem, #highlightWordsText');
    try {
      await combined.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // If no question text found, still proceed — some types may not have stem text
      this.logger?.debug('No question stem found, proceeding with detection');
    }
  }

  /**
   * Flag the current question and click Continue — used when question type is unknown or no config exists
   */
  private async flagAndContinue(frame: FrameLocator, questionNumber: number, isLast: boolean = false): Promise<void> {
    // Click the Flag button
    const flagBtn = frame.locator('button[aria-label="Flag this question for Review"]');
    try {
      await flagBtn.waitFor({ state: 'visible', timeout: 5000 });
      await flagBtn.click();
      this.logger?.success(`Q${questionNumber}: Flagged for review`);
    } catch {
      this.logger?.debug(`Q${questionNumber}: Flag button not found, skipping flag`);
    }

    // Click Continue if not the last question
    if (!isLast) {
      const continueBtn = frame.locator('button.move-to-next-content');
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click({ force: true });
      this.logger?.success(`Q${questionNumber}: Clicked Continue (skipped)`);
      await this.page.waitForTimeout(500);
    }
  }

  private async clickContinue(frame: FrameLocator, questionIndex: number): Promise<void> {
    const continueBtn = frame.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for Continue button to become active (has 'move-to-next-content-active' class)
      for (let attempt = 0; attempt < 25; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Continue button not active yet, waiting... (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(200);
      }

      await continueBtn.click();
      this.logger?.success('Continue clicked');

      // Wait for question to actually advance (header text changes)
      await this.page.waitForTimeout(200);
      const header = frame.locator('.question-position h1');
      
      // Wait up to 4s for the question number to change
      for (let attempt = 0; attempt < 16; attempt++) {
        const text = await header.textContent();
        const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of/);
        if (match && parseInt(match[1], 10) !== questionIndex + 1) {
          this.logger?.debug(`Question advanced to Q${match[1]}`);
          break; // Question advanced
        }
        await this.page.waitForTimeout(200);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Continue button issue at Q${questionIndex + 1}: ${msg}`);
    }
  }

  // ===========================
  // FEEDBACK MODE — Answer with correct/incorrect feedback + 4 sections
  // ===========================

  /**
   * Answer all questions across multiple sections with feedback (correct/incorrect) after each answer.
   * Flow per question:
   *   1. Detect type & answer
   *   2. Click Continue (submit answer)
   *   3. Wait for correct/incorrect feedback
   *   4. Click Continue again (proceed to next question)
   * After the last question in each section, a popup appears — handle it and proceed to next section.
   *
   * @param jsonFileName - config JSON with type strategies
   * @param environment - 'STAGE' or 'PROD'
   * @param totalSections - number of sections (default 4)
   */
  async answerAllQuestionsWithFeedback(
    jsonFileName: string,
    environment: string = 'STAGE',
    totalSections: number = 4
  ): Promise<void> {
    this.logger?.separator('QUESTION HANDLER - Feedback Mode (Multi-Section)');

    const config = this.loadConfig(jsonFileName, environment);

    for (let section = 1; section <= totalSections; section++) {
      this.logger?.separator(`=== SECTION ${section} of ${totalSections} ===`);

      const frame = this.locators.getAssessmentFrameLocator();

      await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
        state: 'attached',
        timeout: 30000,
      });
      this.logger?.success(`Section ${section}: Assessment iframe attached`);

      await this.answerSectionQuestions(frame, config, section);

      // After the last question in a section, handle the popup
      if (section < totalSections) {
        await this.handleSectionCompletePopup(frame, section);
        this.logger?.success(`Section ${section}: Popup handled, moving to section ${section + 1}`);
        // Wait for next section to load
        await this.page.waitForTimeout(1500);
      } else {
        // Last section — handle final popup
        await this.handleSectionCompletePopup(frame, section);
        this.logger?.success(`Section ${section}: Final section popup handled`);
      }
    }

    this.logger?.separator(`All ${totalSections} sections completed!`);
  }

  /**
   * Answer all questions within a single section (with feedback double-continue)
   */
  private async answerSectionQuestions(
    frame: FrameLocator,
    config: QuestionConfigFile,
    sectionNumber: number
  ): Promise<void> {
    let isLastQuestion = false;
    let previousQuestion = 0;

    while (!isLastQuestion) {
      const { current, total } = await this.getQuestionProgress(frame);
      this.logger?.separator(`Section ${sectionNumber} — Question ${current}/${total}`);

      // Safety check: if question didn't advance after Continue, break to avoid infinite loop
      if (current === previousQuestion) {
        throw new Error(
          `Section ${sectionNumber}: Question did not advance from Q${current}. Detection or answer may be incorrect.`
        );
      }
      previousQuestion = current;

      // Wait for question to load
      await this.waitForQuestionToLoad(frame);

      // STEP 1: Detect question type
      let detectedType: QuestionType = 'unknown';
      for (let attempt = 0; attempt < 5; attempt++) {
        detectedType = await this.detectQuestionType(frame);
        if (detectedType !== 'unknown') break;
        this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting...`);
        await this.page.waitForTimeout(1500);
      }
      this.logger?.info(`Detected: ${detectedType}`);

      if (detectedType === 'unknown') {
        this.logger?.info(`Q${current}: Unknown type — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 2: Get strategy config
      const typeConfig = config.questionTypeConfig[detectedType];
      if (!typeConfig) {
        this.logger?.info(`Q${current}: No config for "${detectedType}" — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 3: Answer the question
      await this.executeStrategy(frame, detectedType, typeConfig);

      // STEP 4: First Continue click — submit the answer
      await this.clickContinueForFeedback(frame, current);

      // STEP 5: Wait for correct/incorrect feedback to appear
      await this.waitForFeedback(frame, current);

      // STEP 6: Check if last question
      isLastQuestion = current === total;

      // STEP 7: Second Continue click — proceed to next question (or end of section)
      await this.clickContinueAfterFeedback(frame, current, isLastQuestion);
    }
  }

  /**
   * First Continue click — submits the answer (before feedback is shown)
   */
  private async clickContinueForFeedback(frame: FrameLocator, questionNumber: number): Promise<void> {
    const continueBtn = frame.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for Continue button to become active
      for (let attempt = 0; attempt < 25; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Q${questionNumber}: Continue not active yet (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(200);
      }

      await continueBtn.click();
      this.logger?.success(`Q${questionNumber}: First Continue clicked (submit answer)`);
      await this.page.waitForTimeout(200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Q${questionNumber}: First Continue click failed: ${msg}`);
    }
  }

  /**
   * Wait for correct/incorrect feedback to appear after submitting answer
   */
  private async waitForFeedback(frame: FrameLocator, questionNumber: number): Promise<void> {
    this.logger?.debug(`Q${questionNumber}: Waiting for correct/incorrect feedback...`);

    // Try multiple possible feedback selectors
    const feedbackSelectors = [
      frame.locator('.correct-answer, .incorrect-answer'),
      frame.locator('.answer-feedback'),
      frame.locator('.feedback-container'),
      frame.locator('.result-indicator'),
      frame.locator('[class*="correct"], [class*="incorrect"]'),
      frame.locator('.rationale, .explanation'),
    ];

    let feedbackFound = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      for (const selector of feedbackSelectors) {
        try {
          const count = await selector.count();
          if (count > 0 && await selector.first().isVisible({ timeout: 300 })) {
            const feedbackText = (await selector.first().textContent())?.trim().substring(0, 80);
            this.logger?.success(`Q${questionNumber}: Feedback shown: "${feedbackText}..."`);
            feedbackFound = true;
            break;
          }
        } catch {
          // try next selector
        }
      }
      if (feedbackFound) break;

      // Also check if Continue button became active again (feedback may not have distinct element)
      const continueBtn = frame.locator('button.move-to-next-content');
      const classes = await continueBtn.getAttribute('class').catch(() => '');
      if (classes?.includes('move-to-next-content-active')) {
        this.logger?.success(`Q${questionNumber}: Continue re-enabled (feedback acknowledged)`);
        feedbackFound = true;
        break;
      }

      await this.page.waitForTimeout(300);
    }

    if (!feedbackFound) {
      this.logger?.debug(`Q${questionNumber}: Feedback not explicitly detected, proceeding anyway`);
    }
  }

  /**
   * Second Continue click — proceeds to the next question after feedback is shown
   */
  private async clickContinueAfterFeedback(
    frame: FrameLocator,
    questionNumber: number,
    isLastQuestion: boolean
  ): Promise<void> {
    const continueBtn = frame.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for Continue button to become active again after feedback
      for (let attempt = 0; attempt < 25; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Q${questionNumber}: Continue not active after feedback (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(200);
      }

      await continueBtn.click();
      this.logger?.success(`Q${questionNumber}: Second Continue clicked (after feedback)`);
      await this.page.waitForTimeout(200);

      if (!isLastQuestion) {
        // Wait for next question to load
        const header = frame.locator('.question-position h1');
        for (let attempt = 0; attempt < 16; attempt++) {
          const text = await header.textContent();
          const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of/);
          if (match && parseInt(match[1], 10) !== questionNumber) {
            this.logger?.debug(`Question advanced to Q${match[1]}`);
            break;
          }
          await this.page.waitForTimeout(200);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Q${questionNumber}: Second Continue click failed: ${msg}`);
    }
  }

  /**
   * Handle the popup that appears after completing all questions in a section.
   * Looks for common popup/dialog/modal patterns and clicks the appropriate button to proceed.
   */
  private async handleSectionCompletePopup(frame: FrameLocator, sectionNumber: number): Promise<void> {
    this.logger?.debug(`Section ${sectionNumber}: Waiting for section-complete popup...`);
    await this.page.waitForTimeout(1000);

    // Try multiple popup/dialog selectors — check both inside the iframe and on the main page
    const popupHandled = await this.tryHandlePopup(frame, sectionNumber);

    if (!popupHandled) {
      // Fallback: check on the main page (popup might be outside iframe)
      const mainPagePopupHandled = await this.tryHandleMainPagePopup(sectionNumber);
      if (!mainPagePopupHandled) {
        this.logger?.debug(`Section ${sectionNumber}: No popup detected, proceeding`);
      }
    }
  }

  /**
   * Try to handle popup inside the assessment iframe
   */
  private async tryHandlePopup(frame: FrameLocator, sectionNumber: number): Promise<boolean> {
    // The complete-assessment dialog structure is used for:
    // 1. "Proceed to Next Section" (between sections)
    // 2. "Complete Survey" (survey step)
    // 3. "Finalize and View Results" (final step)
    const popupButtonSelectors = [
      // Exact match for section-complete dialog — always click the primary button
      frame.locator('complete-assessment button.primary-button'),
      frame.locator('.complete-assessment-dialog button.primary-button'),
      frame.locator('mat-dialog-container button.primary-button'),
      frame.locator('.cdk-overlay-container button.primary-button'),
      // Text-based matches as fallback
      frame.locator('button:has-text("Proceed to Next Section")'),
      frame.locator('button:has-text("Proceed To Next Section")'),
      frame.locator('button:has-text("Next Section")'),
      frame.locator('button:has-text("Complete Survey")'),
      frame.locator('button:has-text("Finalize and View Results")'),
      frame.locator('button:has-text("Finalize Answers")'),
      frame.locator('button:has-text("View Results")'),
      frame.locator('button:has-text("Finalize")'),
      frame.locator('button:has-text("Submit")'),
      frame.locator('.cdk-overlay-container button:has-text("Proceed")'),
      frame.locator('.cdk-overlay-container button:has-text("OK")'),
      frame.locator('.cdk-overlay-container button:has-text("Yes")'),
      frame.locator('.cdk-overlay-container button:has-text("Continue")'),
      frame.locator('.cdk-overlay-container button:has-text("Next")'),
      frame.locator('mat-dialog-actions button'),
    ];

    for (const btnLocator of popupButtonSelectors) {
      try {
        const count = await btnLocator.count();
        if (count > 0) {
          const btn = btnLocator.first();
          if (await btn.isVisible({ timeout: 1000 })) {
            const btnText = (await btn.textContent())?.trim();
            // Skip the regular Continue/navigation button (not a popup)
            if (btnText === '' || btnText === 'Continue To Next Question') continue;
            await btn.click();
            this.logger?.success(`Section ${sectionNumber}: Popup button clicked: "${btnText}"`);
            await this.page.waitForTimeout(1000);
            return true;
          }
        }
      } catch {
        // try next selector
      }
    }

    return false;
  }

  /**
   * Try to handle popup on the main page (outside iframe)
   * Same complete-assessment dialog used for: Next Section, Complete Survey, Finalize Results
   */
  private async tryHandleMainPagePopup(sectionNumber: number): Promise<boolean> {
    const mainPopupSelectors = [
      // Exact match for complete-assessment dialog — always click the primary button
      this.page.locator('complete-assessment button.primary-button'),
      this.page.locator('.complete-assessment-dialog button.primary-button'),
      this.page.locator('mat-dialog-container button.primary-button'),
      this.page.locator('.cdk-overlay-container button.primary-button'),
      // Text-based matches as fallback
      this.page.locator('button:has-text("Proceed to Next Section")'),
      this.page.locator('button:has-text("Proceed To Next Section")'),
      this.page.locator('button:has-text("Next Section")'),
      this.page.locator('button:has-text("Complete Survey")'),
      this.page.locator('button:has-text("Finalize and View Results")'),
      this.page.locator('button:has-text("Finalize Answers")'),
      this.page.locator('button:has-text("View Results")'),
      this.page.locator('button:has-text("Finalize")'),
      this.page.locator('button:has-text("Submit")'),
      this.page.locator('.cdk-overlay-container button:has-text("Proceed")'),
      this.page.locator('.cdk-overlay-container button:has-text("Continue")'),
      this.page.locator('.cdk-overlay-container button:has-text("OK")'),
      this.page.locator('mat-dialog-container button:has-text("Proceed")'),
      this.page.locator('mat-dialog-container button:has-text("Continue")'),
      this.page.locator('mat-dialog-container button:has-text("OK")'),
      this.page.locator('.popup button, .dialog-actions button'),
      this.page.locator('button.confirm-btn, button.proceed-btn'),
    ];

    for (const btnLocator of mainPopupSelectors) {
      try {
        const count = await btnLocator.count();
        if (count > 0) {
          const btn = btnLocator.first();
          if (await btn.isVisible({ timeout: 1000 })) {
            const btnText = (await btn.textContent())?.trim();
            await btn.click();
            this.logger?.success(`Section ${sectionNumber}: Main page popup clicked: "${btnText}"`);
            await this.page.waitForTimeout(1000);
            return true;
          }
        }
      } catch {
        // try next selector
      }
    }

    return false;
  }

  /**
   * Handle section-complete popup if it appears (non-blocking).
   * Returns true if a popup was found and clicked, false otherwise.
   */
  private async handleSectionCompletePopupIfPresent(frame: FrameLocator, sectionNumber: number): Promise<boolean> {
    this.logger?.debug(`Section ${sectionNumber}: Checking for section-complete popup...`);

    // Wait for popup to appear — CDK dialog animation takes time
    await this.page.waitForTimeout(2000);

    // Try multiple times since popup might have animation delay
    for (let attempt = 1; attempt <= 3; attempt++) {
      const popupHandled = await this.tryHandlePopup(frame, sectionNumber);
      if (popupHandled) return true;

      const mainPagePopupHandled = await this.tryHandleMainPagePopup(sectionNumber);
      if (mainPagePopupHandled) return true;

      if (attempt < 3) {
        this.logger?.debug(`Section ${sectionNumber}: Popup not found yet (attempt ${attempt}), waiting...`);
        await this.page.waitForTimeout(2000);
      }
    }

    return false;
  }

  /**
   * Quick check if a section-complete popup is visible (inside iframe or main page).
   * Same dialog used for: Next Section, Complete Survey, Finalize Results.
   * Does NOT click it — just detects presence.
   */
  private async checkForSectionPopup(frame: FrameLocator): Promise<boolean> {
    const popupSelectors = [
      // Exact structure-based selectors
      frame.locator('complete-assessment'),
      frame.locator('.complete-assessment-dialog'),
      frame.locator('mat-dialog-container button.primary-button'),
      frame.locator('.cdk-overlay-container button.primary-button'),
      // Text-based selectors
      frame.locator('button:has-text("Proceed to Next Section")'),
      frame.locator('button:has-text("Complete Survey")'),
      frame.locator('button:has-text("Finalize and View Results")'),
      frame.locator('button:has-text("Finalize Answers")'),
      frame.locator('button:has-text("Finalize")'),
      // Main page selectors
      this.page.locator('complete-assessment'),
      this.page.locator('.complete-assessment-dialog'),
      this.page.locator('mat-dialog-container button.primary-button'),
      this.page.locator('button:has-text("Proceed to Next Section")'),
      this.page.locator('button:has-text("Complete Survey")'),
      this.page.locator('button:has-text("Finalize and View Results")'),
      this.page.locator('button:has-text("Finalize Answers")'),
    ];

    for (const selector of popupSelectors) {
      try {
        const count = await selector.count();
        if (count > 0 && await selector.first().isVisible({ timeout: 500 })) {
          return true;
        }
      } catch { /* try next */ }
    }

    return false;
  }

  // ===========================
  // DIRECT PAGE MODE — No iframe, questions rendered directly on page
  // ===========================

  /**
   * Answer only the first question in the assessment and click Continue.
   * After clicking Continue on Q1, the popup with "Go back to the last question" appears.
   * This method stops after clicking Continue — it does NOT click the popup.
   */
  async answerFirstQuestionProctor(
    jsonFileName: string,
    environment: string = 'STAGE'
  ): Promise<void> {
    this.logger?.separator('QUESTION HANDLER - Answer First Question Only');

    const config = this.loadConfig(jsonFileName, environment);
    const frame = this.locators.getAssessmentFrameLocator();

    // Wait for assessment iframe
    await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
      state: 'attached',
      timeout: 60000,
    });
    this.logger?.success('Assessment iframe attached');

    // Wait for the first question header to appear
    const headerLocator = frame.locator('.question-position h1');
    await headerLocator.waitFor({ state: 'visible', timeout: 30000 });

    const { current, total } = await this.getQuestionProgress(frame);
    this.logger?.separator(`Answering Question ${current}/${total}`);

    await this.waitForQuestionToLoad(frame);

    // Detect question type
    let detectedType: QuestionType = 'unknown';
    for (let attempt = 0; attempt < 5; attempt++) {
      detectedType = await this.detectQuestionType(frame);
      if (detectedType !== 'unknown') break;
      this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting...`);
      await this.page.waitForTimeout(1500);
    }
    this.logger?.info(`Detected: ${detectedType}`);

    if (detectedType === 'unknown') {
      this.logger?.info(`Q${current}: Unknown type — flagging and clicking Continue`);
      await this.flagAndContinue(frame, current, current === total);
    } else {
      // Get strategy and answer
      const typeConfig = config.questionTypeConfig[detectedType];
      if (typeConfig) {
        await this.executeStrategy(frame, detectedType, typeConfig);
      }
      // Click Continue
      await this.clickContinueProctor(frame, current, current === total);
    }

    this.logger?.success(`Q${current}: Answered and clicked Continue — waiting for popup`);
    await this.page.waitForTimeout(3000);
  }

  /**
   * Answer all questions with feedback — Proctor mode.
   * Same as answerAllQuestionsWithFeedback but with a more robust initial wait
   * for the assessment iframe to load (proctored assessments may take longer).
   *
   * @param jsonFileName - config JSON with type strategies
   * @param environment - 'STAGE' or 'PROD'
   * @param totalSections - number of sections (default 4)
   */
  async answerAllQuestionsWithFeedbackProctor(
    jsonFileName: string,
    environment: string = 'STAGE',
    totalSections: number = 4,
    skipLastPopup: boolean = false
  ): Promise<void> {
    this.logger?.separator('QUESTION HANDLER - Proctor Mode (Multi-Section)');

    const config = this.loadConfig(jsonFileName, environment);
    let sectionsCompleted = 0;

    for (let section = 1; section <= totalSections; section++) {
      this.logger?.separator(`=== SECTION ${section} of ${totalSections} ===`);

      const frame = this.locators.getAssessmentFrameLocator();

      // Wait for assessment iframe to be attached (longer timeout for proctored flow)
      await this.page.waitForSelector(this.locators.assessmentFrameSelector, {
        state: 'attached',
        timeout: 60000,
      });
      this.logger?.success(`Section ${section}: Assessment iframe attached`);

      await this.answerSectionQuestionsProctor(frame, config, section);
      sectionsCompleted++;

      // After the last question in a section, wait and handle the popup
      this.logger?.debug(`Section ${section}: Waiting for section-complete popup...`);
      await this.page.waitForTimeout(3000);

      // If skipLastPopup is true and this is the last section, stop before clicking the popup
      if (skipLastPopup && section === totalSections) {
        this.logger?.info(`Section ${section}: Skipping last popup click (skipLastPopup=true)`);
        break;
      }

      const popupResult = await this.clickSectionPopupPrimaryButton(frame, section);
      if (popupResult) {
        this.logger?.success(`Section ${section}: Popup handled — "${popupResult}"`);
        await this.page.waitForTimeout(2000);

        // If we clicked "Complete Survey", handle the survey page
        if (popupResult.toLowerCase().includes('survey')) {
          await this.handleSurveyPage(frame);
          // After survey, another popup may appear (Finalize / Next Section)
          await this.page.waitForTimeout(2000);
          const nextPopup = await this.clickSectionPopupPrimaryButton(frame, section);
          if (nextPopup) {
            this.logger?.success(`Section ${section}: Post-survey popup handled — "${nextPopup}"`);
            await this.page.waitForTimeout(2000);
          }
        }
      } else {
        this.logger?.debug(`Section ${section}: No popup appeared after last question`);
      }
    }

    this.logger?.separator(`All ${sectionsCompleted} sections completed!`);
  }

  /**
   * Answer all questions within a single section — Proctor mode (no feedback).
   * Simple flow: detect type → answer → click Continue → next question.
   */
  private async answerSectionQuestionsProctor(
    frame: FrameLocator,
    config: QuestionConfigFile,
    sectionNumber: number
  ): Promise<void> {
    let isLastQuestion = false;
    let previousQuestion = 0;

    while (!isLastQuestion) {
      const headerLocator = frame.locator('.question-position h1');

      if (previousQuestion === 0) {
        // First question — wait for iframe content to render
        try {
          await headerLocator.waitFor({ state: 'visible', timeout: 30000 });
        } catch {
          this.logger?.debug(`Section ${sectionNumber}: Question header never appeared — section may be empty`);
          break;
        }
      } else {
        // Subsequent questions — check if header is still visible or popup appeared
        await this.page.waitForTimeout(500);
        const progressVisible = await headerLocator.isVisible({ timeout: 5000 }).catch(() => false);
        if (!progressVisible) {
          this.logger?.debug(`Section ${sectionNumber}: Question header gone — section ended`);
          break;
        }
      }

      const { current, total } = await this.getQuestionProgress(frame);
      this.logger?.separator(`Section ${sectionNumber} — Question ${current}/${total}`);

      if (current === previousQuestion) {
        this.logger?.debug(`Section ${sectionNumber}: Question stuck at Q${current}, checking for popup`);
        break;
      }
      previousQuestion = current;

      await this.waitForQuestionToLoad(frame);

      // STEP 1: Detect question type
      let detectedType: QuestionType = 'unknown';
      for (let attempt = 0; attempt < 5; attempt++) {
        detectedType = await this.detectQuestionType(frame);
        if (detectedType !== 'unknown') break;
        this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting...`);
        await this.page.waitForTimeout(1500);
      }
      this.logger?.info(`Detected: ${detectedType}`);

      if (detectedType === 'unknown') {
        this.logger?.info(`Q${current}: Unknown type — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 2: Get strategy config
      const typeConfig = config.questionTypeConfig[detectedType];
      if (!typeConfig) {
        this.logger?.info(`Q${current}: No config for "${detectedType}" — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinue(frame, current, isLastQuestion);
        continue;
      }

      // STEP 3: Answer the question
      await this.executeStrategy(frame, detectedType, typeConfig);

      // STEP 4: Click Continue
      isLastQuestion = current === total;
      await this.clickContinueProctor(frame, current, isLastQuestion);
    }
  }

  /**
   * Click Continue button — Proctor mode (single click, no feedback expected).
   * Waits for button to become active, clicks, then waits for question to advance.
   */
  private async clickContinueProctor(frame: FrameLocator, questionNumber: number, isLast: boolean): Promise<void> {
    const continueBtn = frame.locator('button.move-to-next-content');
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for Continue button to become active (answer registered)
    for (let attempt = 0; attempt < 30; attempt++) {
      const classes = await continueBtn.getAttribute('class') ?? '';
      if (classes.includes('move-to-next-content-active')) break;
      if (attempt === 29) {
        this.logger?.debug(`Q${questionNumber}: Continue button never became active, clicking anyway`);
      }
      await this.page.waitForTimeout(200);
    }

    await continueBtn.click();
    this.logger?.success(`Q${questionNumber}: Continue clicked`);

    if (!isLast) {
      // Wait for next question to load
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click the primary button in the section-complete popup.
   * Handles: "Proceed to Next Section", "Complete Survey", "Finalize and View Results"
   * Checks both inside iframe and on the main page with retries.
   * Returns the clicked button text, or false if no popup found.
   */
  private async clickSectionPopupPrimaryButton(frame: FrameLocator, sectionNumber: number): Promise<string | false> {
    for (let attempt = 1; attempt <= 5; attempt++) {
      // Check inside the iframe first
      try {
        const iframePrimaryBtn = frame.locator('complete-assessment button.primary-button');
        const count = await iframePrimaryBtn.count();
        if (count > 0 && await iframePrimaryBtn.first().isVisible({ timeout: 2000 })) {
          const btnText = (await iframePrimaryBtn.first().textContent())?.trim() || 'primary';
          await iframePrimaryBtn.first().click();
          this.logger?.success(`Section ${sectionNumber}: Clicked popup: "${btnText}"`);
          return btnText;
        }
      } catch { /* not in iframe */ }

      // Check on the main page (CDK overlay outside iframe)
      try {
        const mainPrimaryBtn = this.page.locator('complete-assessment button.primary-button');
        const count = await mainPrimaryBtn.count();
        if (count > 0 && await mainPrimaryBtn.first().isVisible({ timeout: 2000 })) {
          const btnText = (await mainPrimaryBtn.first().textContent())?.trim() || 'primary';
          await mainPrimaryBtn.first().click();
          this.logger?.success(`Section ${sectionNumber}: Clicked popup (main page): "${btnText}"`);
          return btnText;
        }
      } catch { /* not on main page */ }

      // Fallback: try text-based selectors on main page
      const textSelectors = [
        this.page.locator('button:has-text("Proceed to Next Section")'),
        this.page.locator('button:has-text("Complete Survey")'),
        this.page.locator('button:has-text("Finalize and View Results")'),
        this.page.locator('button:has-text("Finalize Answers")'),
        this.page.locator('.cdk-overlay-container button.primary-button'),
        this.page.locator('mat-dialog-container button.primary-button'),
      ];

      for (const sel of textSelectors) {
        try {
          const cnt = await sel.count();
          if (cnt > 0 && await sel.first().isVisible({ timeout: 500 })) {
            const btnText = (await sel.first().textContent())?.trim() || 'primary';
            await sel.first().click();
            this.logger?.success(`Section ${sectionNumber}: Clicked popup fallback: "${btnText}"`);
            return btnText;
          }
        } catch { /* try next */ }
      }

      // Also try text-based inside iframe
      const iframeTextSelectors = [
        frame.locator('button:has-text("Proceed to Next Section")'),
        frame.locator('button:has-text("Complete Survey")'),
        frame.locator('button:has-text("Finalize and View Results")'),
        frame.locator('button:has-text("Finalize Answers")'),
        frame.locator('.cdk-overlay-container button.primary-button'),
        frame.locator('mat-dialog-container button.primary-button'),
      ];

      for (const sel of iframeTextSelectors) {
        try {
          const cnt = await sel.count();
          if (cnt > 0 && await sel.first().isVisible({ timeout: 500 })) {
            const btnText = (await sel.first().textContent())?.trim() || 'primary';
            await sel.first().click();
            this.logger?.success(`Section ${sectionNumber}: Clicked popup (iframe text): "${btnText}"`);
            return btnText;
          }
        } catch { /* try next */ }
      }

      if (attempt < 5) {
        this.logger?.debug(`Section ${sectionNumber}: Popup not found (attempt ${attempt}/5), waiting 2s...`);
        await this.page.waitForTimeout(2000);
      }
    }

    return false;
  }

  /**
   * Handle the survey page that appears after clicking "Complete Survey".
   * Works like assessment — one question at a time, answer it, click Continue, repeat.
   * Questions can be radio buttons, checkboxes, or fill-in-the-blank (text).
   */
  private async handleSurveyPage(frame: FrameLocator): Promise<void> {
    this.logger?.separator('SURVEY HANDLER');
    await this.page.waitForTimeout(3000);

    let questionNumber = 0;
    const maxQuestions = 50; // safety limit

    while (questionNumber < maxQuestions) {
      questionNumber++;
      this.logger?.info(`Survey Q${questionNumber}: Detecting and answering...`);

      // Check if there's still a question visible (radio, checkbox, text input, textarea)
      const hasRadio = await frame.locator('mat-radio-button, input[type="radio"]').count().catch(() => 0) > 0;
      const hasCheckbox = await frame.locator('mat-checkbox, input[type="checkbox"]').count().catch(() => 0) > 0;
      const hasTextInput = await frame.locator('input[type="text"]:not([readonly]):not(.calculator-display), textarea').count().catch(() => 0) > 0;

      if (!hasRadio && !hasCheckbox && !hasTextInput) {
        this.logger?.info(`Survey: No more questions found after Q${questionNumber - 1}`);
        break;
      }

      // Answer the current survey question
      if (hasRadio) {
        await this.answerSurveyRadio(frame, questionNumber);
      }
      if (hasCheckbox) {
        await this.answerSurveyCheckbox(frame, questionNumber);
      }
      if (hasTextInput) {
        await this.answerSurveyTextInput(frame, questionNumber);
      }

      // Click Continue (same as assessment flow)
      await this.page.waitForTimeout(500);
      const continueBtn = frame.locator('button.move-to-next-content');
      try {
        // Wait for Continue to become active (check both 'move-to-next-content-active' and 'focus-on')
        for (let attempt = 0; attempt < 20; attempt++) {
          const classes = await continueBtn.getAttribute('class') ?? '';
          if (classes.includes('move-to-next-content-active') || classes.includes('focus-on')) break;
          await this.page.waitForTimeout(300);
        }
        await continueBtn.click();
        this.logger?.success(`Survey Q${questionNumber}: Clicked Continue`);
      } catch {
        this.logger?.debug(`Survey Q${questionNumber}: Continue button not found, survey may be done`);
        break;
      }

      await this.page.waitForTimeout(1500);
    }

    this.logger?.success(`Survey completed: answered ${questionNumber} question(s)`);

    // After survey, a popup appears with "Finalize and View Results" — click it
    await this.page.waitForTimeout(2000);
    const finalizeBtn = this.page.locator('complete-assessment button.primary-button');
    try {
      await finalizeBtn.waitFor({ state: 'visible', timeout: 10000 });
      const btnText = (await finalizeBtn.textContent())?.trim();
      await finalizeBtn.click();
      this.logger?.success(`Survey: Clicked "${btnText}"`);
      await this.page.waitForTimeout(20000);
    } catch {
      // Try inside iframe as fallback
      try {
        const iframeFinalizeBtn = frame.locator('complete-assessment button.primary-button');
        if (await iframeFinalizeBtn.isVisible({ timeout: 5000 })) {
          const btnText = (await iframeFinalizeBtn.textContent())?.trim();
          await iframeFinalizeBtn.click();
          this.logger?.success(`Survey: Clicked "${btnText}" (iframe)`);
          await this.page.waitForTimeout(20000);
        }
      } catch {
        this.logger?.debug('Survey: No Finalize popup found');
      }
    }
  }

  /**
   * Click "Go back to the last question" in the complete-assessment popup
   * and validate that it navigates back to the last question.
   */
  async clickGoBackToLastQuestion(frame: FrameLocator): Promise<void> {
    this.logger?.separator('GO BACK TO LAST QUESTION');
    await this.page.waitForTimeout(2000);

    const goBackText = 'Go back to last question';
    let clicked = false;

    // Try on main page first
    const mainGoBackBtn = this.page.locator(`complete-assessment button:has-text("${goBackText}")`);
    try {
      if (await mainGoBackBtn.isVisible({ timeout: 5000 })) {
        await mainGoBackBtn.click();
        clicked = true;
        this.logger?.success(`Clicked "${goBackText}" on main page`);
      }
    } catch { /* not on main page */ }

    // Try inside iframe
    if (!clicked) {
      const iframeGoBackBtn = frame.locator(`complete-assessment button:has-text("${goBackText}")`);
      try {
        if (await iframeGoBackBtn.isVisible({ timeout: 5000 })) {
          await iframeGoBackBtn.click();
          clicked = true;
          this.logger?.success(`Clicked "${goBackText}" inside iframe`);
        }
      } catch { /* not in iframe */ }
    }

    // Fallback: text-based on page and iframe
    if (!clicked) {
      const fallbackSelectors = [
        this.page.locator(`button:has-text("${goBackText}")`),
        this.page.locator(`.cdk-overlay-container button:has-text("${goBackText}")`),
        frame.locator(`button:has-text("${goBackText}")`),
      ];
      for (const sel of fallbackSelectors) {
        try {
          if (await sel.first().isVisible({ timeout: 2000 })) {
            await sel.first().click();
            clicked = true;
            this.logger?.success(`Clicked "${goBackText}" (fallback)`);
            break;
          }
        } catch { /* try next */ }
      }
    }

    if (!clicked) {
      throw new Error(`"${goBackText}" button not found in popup`);
    }

    // Wait for navigation back and validate a question is visible
    await this.page.waitForTimeout(3000);

    // Verify popup is dismissed and a question is showing
    const hasQuestion = await frame.locator('.question-position h1, mat-radio-button, input[type="radio"], comp-multiplechoice, input[type="text"], textarea, mat-checkbox, input[type="checkbox"]').first().isVisible({ timeout: 10000 }).catch(() => false);

    if (hasQuestion) {
      this.logger?.success('✅ Navigated back to the last question successfully');
    } else {
      throw new Error('Failed to navigate back to the last question — no question content visible');
    }
  }

  /**
   * Answer a survey radio button question (select the first option).
   * Handles both native comp-multiplechoice (input[type="radio"] + label) and mat-radio-button.
   */
  private async answerSurveyRadio(frame: FrameLocator, questionNumber: number): Promise<void> {
    // Pattern 1: Native radio (comp-multiplechoice with input[type="radio"] + label)
    const nativeRadioLabel = frame.locator('comp-multiplechoice .question-option label').first();
    const hasNativeRadio = await nativeRadioLabel.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasNativeRadio) {
      await nativeRadioLabel.click();
      const text = (await nativeRadioLabel.textContent())?.trim();
      this.logger?.success(`Survey Q${questionNumber}: Clicked native radio label "${text}"`);
      return;
    }

    // Pattern 2: Mat-radio-button (Angular Material)
    const matRadio = frame.locator('mat-radio-button').first();
    const hasMatRadio = await matRadio.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasMatRadio) {
      await matRadio.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);

      // Click the MDC label
      const label = matRadio.locator('div.mdc-form-field label');
      const labelVisible = await label.isVisible({ timeout: 500 }).catch(() => false);
      if (labelVisible) {
        await label.click();
      } else {
        await matRadio.click({ force: true });
      }
      this.logger?.success(`Survey Q${questionNumber}: Clicked mat-radio-button`);
      return;
    }

    // Pattern 3: Any input[type="radio"] — click its label or the input directly
    const anyRadio = frame.locator('input[type="radio"]').first();
    const hasAnyRadio = await anyRadio.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasAnyRadio) {
      // Try clicking the associated label
      const radioId = await anyRadio.getAttribute('id');
      if (radioId) {
        const associatedLabel = frame.locator(`label[for="${radioId}"]`);
        if (await associatedLabel.isVisible({ timeout: 500 }).catch(() => false)) {
          await associatedLabel.click();
          const text = (await associatedLabel.textContent())?.trim();
          this.logger?.success(`Survey Q${questionNumber}: Clicked radio label "${text}"`);
          return;
        }
      }
      // Fallback: click the input directly
      await anyRadio.click({ force: true });
      this.logger?.success(`Survey Q${questionNumber}: Clicked radio input directly`);
      return;
    }

    this.logger?.debug(`Survey Q${questionNumber}: No radio button found`);
  }

  /**
   * Answer a survey checkbox question (check the first option).
   */
  private async answerSurveyCheckbox(frame: FrameLocator, questionNumber: number): Promise<void> {
    const matCheckbox = frame.locator('mat-checkbox').first();
    try {
      if (await matCheckbox.isVisible({ timeout: 500 })) {
        await matCheckbox.click();
        this.logger?.success(`Survey Q${questionNumber}: Checked checkbox`);
        return;
      }
    } catch { /* try native */ }

    const nativeCheckbox = frame.locator('input[type="checkbox"]').first();
    try {
      await nativeCheckbox.click({ force: true });
      this.logger?.success(`Survey Q${questionNumber}: Checked native checkbox`);
    } catch {
      this.logger?.debug(`Survey Q${questionNumber}: Could not check checkbox`);
    }
  }

  /**
   * Answer a survey fill-in-the-blank (fill with "01") or textarea (fill with "test").
   */
  private async answerSurveyTextInput(frame: FrameLocator, questionNumber: number): Promise<void> {
    // Fill-in-the-blank inputs get "01"
    const fillInputs = frame.locator('input[type="text"]:not([readonly]):not(.calculator-display)');
    const fillCount = await fillInputs.count().catch(() => 0);
    for (let i = 0; i < fillCount; i++) {
      try {
        const input = fillInputs.nth(i);
        if (await input.isVisible({ timeout: 500 })) {
          await input.click();
          await input.fill('01');
          await input.dispatchEvent('input');
          await input.dispatchEvent('change');
          this.logger?.success(`Survey Q${questionNumber}: Filled input ${i + 1} with "01"`);
        }
      } catch { /* skip */ }
    }

    // Textareas get "test"
    const textareas = frame.locator('textarea');
    const textareaCount = await textareas.count().catch(() => 0);
    for (let i = 0; i < textareaCount; i++) {
      try {
        const ta = textareas.nth(i);
        if (await ta.isVisible({ timeout: 500 })) {
          await ta.click();
          await ta.fill('test');
          await ta.dispatchEvent('input');
          await ta.dispatchEvent('change');
          this.logger?.success(`Survey Q${questionNumber}: Filled textarea ${i + 1} with "test"`);
        }
      } catch { /* skip */ }
    }
  }

  /**
   * Check if feedback appeared after submitting an answer (non-blocking).
   * Returns true if feedback is visible, false otherwise.
   */
  private async checkForFeedback(frame: FrameLocator, questionNumber: number): Promise<boolean> {
    this.logger?.debug(`Q${questionNumber}: Checking for optional feedback...`);

    const feedbackSelectors = [
      frame.locator('.correct-answer, .incorrect-answer'),
      frame.locator('.answer-feedback'),
      frame.locator('.feedback-container'),
      frame.locator('.result-indicator'),
      frame.locator('.rationale, .explanation'),
    ];

    // Quick check — don't wait long since feedback is optional
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const selector of feedbackSelectors) {
        try {
          const count = await selector.count();
          if (count > 0 && await selector.first().isVisible({ timeout: 300 })) {
            const feedbackText = (await selector.first().textContent())?.trim().substring(0, 80);
            this.logger?.success(`Q${questionNumber}: Feedback shown: "${feedbackText}..."`);
            return true;
          }
        } catch { /* try next */ }
      }

      // Also check if Continue button became active again (indicates feedback was processed)
      const continueBtn = frame.locator('button.move-to-next-content');
      const classes = await continueBtn.getAttribute('class').catch(() => '');
      if (classes?.includes('move-to-next-content-active')) {
        // Button is active — could be feedback mode or already advanced
        // Check if question number changed (no feedback, already moved)
        const { current } = await this.getQuestionProgress(frame).catch(() => ({ current: questionNumber }));
        if (current !== questionNumber) {
          this.logger?.debug(`Q${questionNumber}: No feedback — already advanced to Q${current}`);
          return false;
        }
        this.logger?.success(`Q${questionNumber}: Continue re-enabled (feedback acknowledged)`);
        return true;
      }

      await this.page.waitForTimeout(300);
    }

    this.logger?.debug(`Q${questionNumber}: No feedback detected`);
    return false;
  }

  /**
   * Answer all questions within a single section — Direct page mode
   */
  private async answerSectionQuestionsDirect(
    config: QuestionConfigFile,
    sectionNumber: number
  ): Promise<void> {
    let isLastQuestion = false;
    let previousQuestion = 0;

    while (!isLastQuestion) {
      const { current, total } = await this.getQuestionProgressDirect();
      this.logger?.separator(`Section ${sectionNumber} — Question ${current}/${total}`);

      if (current === previousQuestion) {
        throw new Error(
          `Section ${sectionNumber}: Question did not advance from Q${current}. Detection or answer may be incorrect.`
        );
      }
      previousQuestion = current;

      // Wait for question to load
      await this.waitForQuestionToLoadDirect();

      // STEP 1: Detect question type
      let detectedType: QuestionType = 'unknown';
      for (let attempt = 0; attempt < 5; attempt++) {
        detectedType = await this.detectQuestionTypeDirect();
        if (detectedType !== 'unknown') break;
        this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting...`);
        await this.page.waitForTimeout(1500);
      }
      this.logger?.info(`Detected: ${detectedType}`);

      if (detectedType === 'unknown') {
        this.logger?.info(`Q${current}: Unknown type — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinueDirect(current, isLastQuestion);
        continue;
      }

      // STEP 2: Get strategy config
      const typeConfig = config.questionTypeConfig[detectedType];
      if (!typeConfig) {
        this.logger?.info(`Q${current}: No config for "${detectedType}" — flagging and skipping`);
        isLastQuestion = current === total;
        await this.flagAndContinueDirect(current, isLastQuestion);
        continue;
      }

      // STEP 3: Answer the question
      await this.executeStrategyDirect(detectedType, typeConfig);

      // STEP 4: First Continue click — submit the answer
      await this.clickContinueForFeedbackDirect(current);

      // STEP 5: Wait for correct/incorrect feedback to appear
      await this.waitForFeedbackDirect(current);

      // STEP 6: Check if last question
      isLastQuestion = current === total;

      // STEP 7: Second Continue click — proceed to next question (or end of section)
      await this.clickContinueAfterFeedbackDirect(current, isLastQuestion);
    }
  }

  /**
   * Detect question type directly on the page (no iframe)
   */
  private async detectQuestionTypeDirect(): Promise<QuestionType> {
    const p = this.page;

    const hotSpot = p.locator('comp-hotspot, .hot-spot-question-container');
    if (await this.isVisibleOnPage(hotSpot)) return 'hotSpot';

    const orderedDragDrop = p.locator('comp-draganddrop, .order-response, #sortable-container, ie-order-interaction, ie-order-interaction-delivery');
    if (await this.isVisibleOnPage(orderedDragDrop)) return 'orderedResponse';

    const bowtie = p.locator('ie-bowtie-html-delivery, div.bowtie');
    if (await this.isVisibleOnPage(bowtie)) return 'bowtie';

    const clozeDD = p.locator('ie-drag-drop-triad-html-delivery, app-drag-drop-triad-html, ie-drag-drop-html-delivery, app-drag-drop-html');
    if (await this.isVisibleOnPage(clozeDD)) return 'clozeDropdown';

    const gapMatch = p.locator('ie-gap-match-interaction-delivery .option-list');
    if (await this.isVisibleOnPage(gapMatch)) return 'gapMatch';

    const dragItems = p.locator('[cdkDrag], [draggable="true"], .cdk-drag, .drag-item');
    if (await this.isVisibleOnPage(dragItems)) {
      const dropZones = p.locator('[cdkDropList], .cdk-drop-list, .drop-zone, .drop-target');
      const dropCount = await dropZones.count().catch(() => 0);
      return dropCount > 1 ? 'dragAndDrop' : 'orderedResponse';
    }

    const highlightText = p.locator('app-highlight-display, ie-highlight-display-delivery');
    if (await this.isVisibleOnPage(highlightText)) return 'highlightText';

    const tableControl = p.locator('ie-table-control-delivery, table.highlight-table');
    if (await this.isVisibleOnPage(tableControl)) {
      if (await this.isVisibleOnPage(tableControl.locator('mat-select'))) return 'dropdown';
      if (await this.isVisibleOnPage(tableControl.locator('mat-checkbox'))) return 'matrixMultipleResponse';
      return 'highlightTable';
    }

    const checkboxes = p.locator('mat-checkbox');
    if (await this.isVisibleOnPage(checkboxes)) return 'multiSelect';

    const matrixTable = p.locator('ie-match-interaction-delivery, table.matrix-table');
    if (await this.isVisibleOnPage(matrixTable)) return 'matrixMultipleChoice';

    const nativeRadio = p.locator('comp-multiplechoice');
    if (await this.isVisibleOnPage(nativeRadio)) return 'multipleChoice';

    const radioButtons = p.locator('ie-choice-interaction-delivery mat-radio-group, div.ie-choice-interaction mat-radio-button');
    if (await this.isVisibleOnPage(radioButtons)) return 'radioButton';

    const formRadio = p.locator('form mat-radio-group, form mat-radio-button, form [role="radiogroup"], form input[type="radio"]');
    if (await this.isVisibleOnPage(formRadio)) {
      const hasMat = await this.isVisibleOnPage(p.locator('mat-radio-button'));
      return hasMat ? 'radioButton' : 'multipleChoice';
    }

    const dropdowns = p.locator('mat-select, select, .cloze-dropdown, .mat-select');
    if (await this.isVisibleOnPage(dropdowns)) return 'dropdown';

    const formArea = p.locator('form, .question-area, .mainContent');
    const textInputs = formArea.locator('input[type="text"]:not([readonly]):not(.calculator-display), textarea, .cloze-text-input, input.fill-blank');
    if (await this.isVisibleOnPage(textInputs)) return 'fillInTheBlank';

    return 'unknown';
  }

  private async isVisibleOnPage(locator: ReturnType<Page['locator']>): Promise<boolean> {
    try {
      const count = await locator.count();
      if (count === 0) return false;
      return await locator.first().isVisible({ timeout: 300 });
    } catch {
      return false;
    }
  }

  /**
   * Execute answer strategy directly on the page (no iframe)
   */
  private async executeStrategyDirect(type: QuestionType, config: TypeConfig): Promise<void> {
    switch (type) {
      case 'radioButton':
        await this.answerRadioButtonDirect(config);
        break;
      case 'multiSelect':
        await this.answerMultiSelectDirect(config);
        break;
      case 'fillInTheBlank':
        await this.answerFillInTheBlankDirect(config);
        break;
      case 'dragAndDrop':
        await this.answerDragAndDropDirect(config);
        break;
      case 'dropdown':
        await this.answerDropdownDirect(config);
        break;
      case 'orderedResponse':
        await this.answerOrderedResponseDirect(config);
        break;
      case 'hotSpot':
        await this.answerHotSpotDirect(config);
        break;
      case 'highlightText':
        await this.answerHighlightTextDirect(config);
        break;
      case 'highlightTable':
        await this.answerHighlightTableDirect(config);
        break;
      case 'matrixMultipleChoice':
        await this.answerMatrixMultipleChoiceDirect(config);
        break;
      case 'bowtie':
        await this.answerBowtieDirect(config);
        break;
      case 'clozeDropdown':
        await this.answerClozeDropdownDirect(config);
        break;
      case 'gapMatch':
        await this.answerGapMatchDirect(config);
        break;
      case 'matrixMultipleResponse':
        await this.answerMatrixMultipleResponseDirect(config);
        break;
      case 'multipleChoice':
        await this.answerMultipleChoiceDirect(config);
        break;
      default:
        throw new Error(`No handler for type: ${type}`);
    }
  }

  // === DIRECT PAGE ANSWER METHODS ===

  private async answerRadioButtonDirect(config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const options = this.page.locator('div.ie-choice-interaction');
    const count = await options.count();
    this.logger?.info(`Radio (mat/direct): ${count} options, selecting index ${index}`);

    if (count === 0) throw new Error('RadioButton: no ie-choice-interaction elements found');
    if (index >= count) throw new Error(`RadioButton answerIndex ${index} out of range (${count} options)`);

    const radio = options.nth(index).locator('mat-radio-button').first();
    await radio.waitFor({ state: 'visible', timeout: 5000 });
    await radio.click();
    const selectedText = (await options.nth(index).textContent())?.trim();
    this.logger?.success(`Radio selected [${index}]: "${selectedText}"`);
  }

  private async answerMultipleChoiceDirect(config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const options = this.page.locator('comp-multiplechoice .question-option, form .question-option[role="radiogroup"]');
    const count = await options.count();
    this.logger?.info(`MultipleChoice (native/direct): ${count} options, selecting index ${index}`);

    if (count === 0) throw new Error('MultipleChoice: no .question-option elements found');
    if (index >= count) throw new Error(`MultipleChoice answerIndex ${index} out of range (${count} options)`);

    const option = options.nth(index);
    const label = option.locator('label');
    await label.waitFor({ state: 'visible', timeout: 5000 });
    await label.click();
    const selectedText = (await label.textContent())?.trim();
    this.logger?.success(`MultipleChoice selected [${index}]: "${selectedText}"`);
  }

  private async answerMultiSelectDirect(config: TypeConfig): Promise<void> {
    const indices = config.answerIndices ?? [0];
    const checkboxes = this.page.locator('mat-checkbox');
    const count = await checkboxes.count();
    this.logger?.info(`MultiSelect (direct): ${count} options, selecting indices [${indices.join(', ')}]`);

    for (const idx of indices) {
      if (idx >= count) throw new Error(`MultiSelect index ${idx} out of range (${count} options)`);
      await checkboxes.nth(idx).click();
      const text = (await checkboxes.nth(idx).textContent())?.trim();
      this.logger?.success(`Checked [${idx}]: "${text}"`);
    }
  }

  private async answerMatrixMultipleResponseDirect(config: TypeConfig): Promise<void> {
    const groups = this.page.locator('ie-choice-interaction-delivery .choice-interaction-checkbox-group');
    const groupCount = await groups.count();
    this.logger?.info(`MatrixMultipleResponse (direct): ${groupCount} row group(s)`);

    for (let g = 0; g < groupCount; g++) {
      const groupCheckboxes = groups.nth(g).locator('mat-checkbox');
      const cbCount = await groupCheckboxes.count();
      if (cbCount === 0) continue;
      const idx = config.answerIndex ?? 0;
      const target = idx < cbCount ? groupCheckboxes.nth(idx) : groupCheckboxes.first();
      await target.click();
      const text = (await target.textContent())?.trim();
      this.logger?.success(`Row ${g + 1}: checked [${idx}]: "${text}"`);
    }
  }

  private async answerFillInTheBlankDirect(config: TypeConfig): Promise<void> {
    const value = config.value ?? '';
    if (!value) throw new Error('fillInTheBlank config needs a "value" field');

    const formArea = this.page.locator('form, .question-area, .mainContent');
    const inputs = formArea.locator('input[type="text"]:not([readonly]):not(.calculator-display), textarea, .cloze-text-input, input.fill-blank');
    const inputCount = await inputs.count();
    this.logger?.info(`FillInBlank (direct): ${inputCount} input(s), typing "${value}"`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.click();
      await input.fill('');
      await input.pressSequentially(value, { delay: 20 });
      await input.dispatchEvent('input');
      await input.dispatchEvent('change');
      await input.dispatchEvent('blur');
      this.logger?.success(`Input [${i + 1}]: typed "${value}"`);
    }
    await this.page.waitForTimeout(300);
  }

  private async answerDropdownDirect(config: TypeConfig): Promise<void> {
    const dropdowns = this.page.locator('mat-select');
    const dropdownCount = await dropdowns.count();
    this.logger?.info(`Dropdown (direct): ${dropdownCount} mat-select(s)`);

    for (let i = 0; i < dropdownCount; i++) {
      const dropdown = dropdowns.nth(i);
      await dropdown.click();
      await this.page.waitForTimeout(300);

      const matOptions = this.page.locator('mat-option');
      const optionCount = await matOptions.count();

      if (optionCount > 0) {
        let selectedIdx = -1;
        for (let o = 0; o < optionCount; o++) {
          const text = (await matOptions.nth(o).textContent())?.trim().toLowerCase();
          if (!text || text === 'select...' || text === 'select' || text === '-- select --' || text === '') continue;
          selectedIdx = o;
          break;
        }
        if (selectedIdx === -1) selectedIdx = optionCount - 1;
        const optText = (await matOptions.nth(selectedIdx).textContent())?.trim();
        await matOptions.nth(selectedIdx).click();
        this.logger?.success(`Dropdown ${i + 1}/${dropdownCount}: selected "${optText}"`);
      } else {
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(300);
    }
  }

  private async answerDragAndDropDirect(config: TypeConfig): Promise<void> {
    const sources = this.page.locator('[cdkDrag], .drag-item, [draggable="true"]');
    const targets = this.page.locator('[cdkDropList], .drop-zone, .drop-target');
    const sourceCount = await sources.count();
    const targetCount = await targets.count();
    this.logger?.info(`DragDrop (direct): ${sourceCount} sources, ${targetCount} targets`);

    const limit = Math.min(sourceCount, targetCount);
    for (let i = 0; i < limit; i++) {
      await sources.nth(i).dragTo(targets.nth(i));
      this.logger?.success(`Dragged item ${i + 1} → target ${i + 1}`);
    }
  }

  private async answerOrderedResponseDirect(_config: TypeConfig): Promise<void> {
    const leftBox = this.page.locator('#DropZoneOne');
    const rightBox = this.page.locator('#DropZoneTwo');

    if (await this.isVisibleOnPage(leftBox)) {
      const items = leftBox.locator('li.draggable-option');
      const count = await items.count();
      this.logger?.info(`OrderedResponse (drag/direct): ${count} items`);
      for (let i = 0; i < count; i++) {
        const firstItem = leftBox.locator('li.draggable-option').first();
        await firstItem.dragTo(rightBox);
        this.logger?.success(`Moved [${i + 1}]`);
        await this.page.waitForTimeout(200);
      }
      return;
    }

    const sourceList = this.page.locator('.ordered-source-list');
    if (await this.isVisibleOnPage(sourceList)) {
      const items = sourceList.locator('.cdk-drag.row');
      const count = await items.count();
      this.logger?.info(`OrderedResponse (click/direct): ${count} items`);
      for (let i = 0; i < count; i++) {
        const firstItem = sourceList.locator('.cdk-drag.row').first();
        const choiceEl = firstItem.locator('ie-ordered-simple-choice');
        await choiceEl.focus();
        await choiceEl.press('Space');
        this.logger?.success(`Moved [${i + 1}/${count}]`);
        await this.page.waitForTimeout(200);
      }
      return;
    }

    this.logger?.success('Ordered response (direct): no reorder applied');
  }

  private async answerHotSpotDirect(config: TypeConfig): Promise<void> {
    const index = config.answerIndex ?? 0;
    const areas = this.page.locator('map[name="imagemap"] area');
    const areaCount = await areas.count();
    this.logger?.info(`HotSpot (direct): ${areaCount} areas, selecting index ${index}`);

    if (areaCount === 0) throw new Error('No hot spot areas found');
    if (index >= areaCount) throw new Error(`HotSpot answerIndex ${index} out of range (${areaCount} areas)`);

    await areas.nth(index).click({ force: true });
    this.logger?.success(`HotSpot: clicked area [${index}]`);
  }

  private async answerHighlightTextDirect(config: TypeConfig): Promise<void> {
    const hotTexts = this.page.locator('ie-hot-text-interaction-delivery span.hot-text-button');
    const count = await hotTexts.count();
    this.logger?.info(`HighlightText (direct): ${count} clickable word(s)`);

    if (config.answerIndices) {
      for (const idx of config.answerIndices) {
        if (idx >= count) continue;
        await hotTexts.nth(idx).click();
        const text = (await hotTexts.nth(idx).textContent())?.trim();
        this.logger?.success(`Clicked word [${idx}]: "${text}"`);
      }
    } else {
      let clicked = 0;
      for (let i = 0; i < count; i++) {
        await hotTexts.nth(i).click();
        clicked++;
        if (clicked >= (config.answerIndex ?? 1)) break;
      }
    }
    await this.page.waitForTimeout(300);
  }

  private async answerHighlightTableDirect(config: TypeConfig): Promise<void> {
    const indices = config.answerIndices ?? [0];
    const hotTexts = this.page.locator('ie-hot-text-interaction-delivery span.hot-text-button');
    const count = await hotTexts.count();
    this.logger?.info(`HighlightTable (direct): ${count} hot-text targets`);

    for (const idx of indices) {
      if (idx >= count) continue;
      await hotTexts.nth(idx).click();
      const text = (await hotTexts.nth(idx).textContent())?.trim();
      this.logger?.success(`Highlighted [${idx}]: "${text}"`);
    }
  }

  private async answerMatrixMultipleChoiceDirect(config: TypeConfig): Promise<void> {
    const colIndex = config.answerIndex ?? 0;
    const rows = this.page.locator('table.matrix-table tbody tr.matrix-row');
    const rowCount = await rows.count();
    this.logger?.info(`MatrixMultipleChoice (direct): ${rowCount} rows, column ${colIndex}`);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const radios = row.locator('td.matrix-cell mat-radio-button');
      const radioCount = await radios.count();
      if (colIndex >= radioCount) await radios.first().click();
      else await radios.nth(colIndex).click();
      this.logger?.success(`Row ${i}: selected column ${colIndex}`);
    }
  }

  private async answerBowtieDirect(config: TypeConfig): Promise<void> {
    const optionLists = this.page.locator('ie-gap-match-interaction-delivery .option-list.is-bowtie-item');
    const listCount = await optionLists.count();
    this.logger?.info(`Bowtie (direct): ${listCount} columns`);

    for (let col = 0; col < listCount; col++) {
      const list = optionLists.nth(col);
      const columnLabel = await list.getAttribute('aria-label') ?? `Column${col}`;
      const targets = this.page.locator(`.bowtie-column[aria-label="${columnLabel}"] .bowtie-target`);
      const targetCount = await targets.count();
      const options = list.locator('.option-list-item');
      const optionCount = await options.count();
      const itemsToFill = Math.min(targetCount, optionCount);

      for (let t = 0; t < itemsToFill; t++) {
        const option = list.locator('.option-list-item').nth(t);
        const moveBtn = option.locator('button.contextMenuButton');
        await moveBtn.waitFor({ state: 'visible', timeout: 5000 });
        await moveBtn.click();
        await this.page.waitForTimeout(300);

        const menuItems = this.page.locator('.cdk-overlay-container .mat-menu-item');
        const menuCount = await menuItems.count();
        if (menuCount > 0) {
          const slotIndex = t < menuCount ? t : 0;
          await menuItems.nth(slotIndex).click();
          this.logger?.success(`Column ${columnLabel} [${t + 1}/${itemsToFill}]: placed`);
        } else {
          await this.page.keyboard.press('Escape');
        }
        await this.page.waitForTimeout(300);
      }
    }
  }

  private async answerClozeDropdownDirect(config: TypeConfig): Promise<void> {
    const inlineTargets = this.page.locator('ie-target-delivery .target');
    const targetCount = await inlineTargets.count();
    const optionLists = this.page.locator('ie-gap-match-interaction-delivery .option-list:not(.is-bowtie-item)');
    const listCount = await optionLists.count();
    this.logger?.info(`ClozeDropdown (direct): ${listCount} list(s), ${targetCount} target(s)`);

    for (let listIdx = 0; listIdx < listCount; listIdx++) {
      const list = optionLists.nth(listIdx);
      const options = list.locator('.option-list-item');
      const optionCount = await options.count();
      const itemsToFill = Math.min(optionCount, targetCount);

      for (let i = 0; i < itemsToFill; i++) {
        const option = options.nth(i);
        const moveBtn = option.locator('button.contextMenuButton');
        const btnCount = await moveBtn.count();
        if (btnCount === 0) continue;
        try { await moveBtn.waitFor({ state: 'visible', timeout: 3000 }); } catch { continue; }

        await moveBtn.click();
        await this.page.waitForTimeout(300);

        const menuItems = this.page.locator('.cdk-overlay-container .mat-menu-item');
        const menuCount = await menuItems.count();
        if (menuCount > 0) {
          const slotIndex = i < menuCount ? i : 0;
          await menuItems.nth(slotIndex).click();
          this.logger?.success(`[${i + 1}/${itemsToFill}]: placed`);
        } else {
          await this.page.keyboard.press('Escape');
        }
        await this.page.waitForTimeout(300);
      }
    }
  }

  private async answerGapMatchDirect(_config: TypeConfig): Promise<void> {
    const optionLists = this.page.locator('ie-gap-match-interaction-delivery .option-list');
    const listCount = await optionLists.count();
    this.logger?.info(`GapMatch (direct): ${listCount} option list(s)`);

    for (let listIdx = 0; listIdx < listCount; listIdx++) {
      const list = optionLists.nth(listIdx);
      const options = list.locator('.option-list-item');
      const optionCount = await options.count();

      for (let i = 0; i < optionCount; i++) {
        const option = options.nth(i);
        const moveBtn = option.locator('button.contextMenuButton');
        const btnCount = await moveBtn.count();
        if (btnCount === 0) continue;
        try { await moveBtn.waitFor({ state: 'visible', timeout: 3000 }); } catch { continue; }

        await moveBtn.click();
        await this.page.waitForTimeout(300);

        const menuItems = this.page.locator('.cdk-overlay-container .mat-menu-item');
        const menuCount = await menuItems.count();
        if (menuCount > 0) {
          await menuItems.first().click();
          this.logger?.success(`Option ${i + 1}/${optionCount}: placed`);
        } else {
          await this.page.keyboard.press('Escape');
        }
        await this.page.waitForTimeout(300);
      }
    }
  }

  // === DIRECT PAGE HELPERS ===

  private async getQuestionProgressDirect(): Promise<{ current: number; total: number }> {
    const header = this.page.locator('.question-position h1');
    await header.waitFor({ state: 'visible', timeout: 30000 });
    const text = await header.textContent();
    const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of\s+(\d+)/);
    if (!match) {
      throw new Error(`Could not parse question progress from header: "${text}"`);
    }
    return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) };
  }

  private async waitForQuestionToLoadDirect(): Promise<void> {
    const combined = this.page.locator('div.stem-text.read-area, .stem-text, .question-stem, .mainContent.read-area, #highlightWordsText');
    try {
      await combined.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      this.logger?.debug('No question stem found on page, proceeding with detection');
    }
  }

  private async flagAndContinueDirect(questionNumber: number, isLast: boolean = false): Promise<void> {
    const flagBtn = this.page.locator('button[aria-label="Flag this question for Review"]');
    try {
      await flagBtn.waitFor({ state: 'visible', timeout: 5000 });
      await flagBtn.click();
      this.logger?.success(`Q${questionNumber}: Flagged for review`);
    } catch {
      this.logger?.debug(`Q${questionNumber}: Flag button not found, skipping flag`);
    }

    if (!isLast) {
      const continueBtn = this.page.locator('button.move-to-next-content');
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click({ force: true });
      this.logger?.success(`Q${questionNumber}: Clicked Continue (skipped)`);
      await this.page.waitForTimeout(500);
    }
  }

  private async clickContinueForFeedbackDirect(questionNumber: number): Promise<void> {
    const continueBtn = this.page.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      for (let attempt = 0; attempt < 25; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Q${questionNumber}: Continue not active yet (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(200);
      }

      await continueBtn.click();
      this.logger?.success(`Q${questionNumber}: First Continue clicked (submit answer)`);
      await this.page.waitForTimeout(200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Q${questionNumber}: First Continue click failed: ${msg}`);
    }
  }

  private async waitForFeedbackDirect(questionNumber: number): Promise<void> {
    this.logger?.debug(`Q${questionNumber}: Waiting for feedback...`);

    const feedbackSelectors = [
      this.page.locator('.correct-answer, .incorrect-answer'),
      this.page.locator('.answer-feedback'),
      this.page.locator('.feedback-container'),
      this.page.locator('.result-indicator'),
      this.page.locator('[class*="correct"], [class*="incorrect"]'),
      this.page.locator('.rationale, .explanation'),
      this.page.locator('app-correctness, app-rationale .ie-question-rationale-modal-container'),
      this.page.locator('ie-inline-rationale-correctness:not([hidden])'),
    ];

    let feedbackFound = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      for (const selector of feedbackSelectors) {
        try {
          const count = await selector.count();
          if (count > 0 && await selector.first().isVisible({ timeout: 300 })) {
            const feedbackText = (await selector.first().textContent())?.trim().substring(0, 80);
            this.logger?.success(`Q${questionNumber}: Feedback shown: "${feedbackText}..."`);
            feedbackFound = true;
            break;
          }
        } catch { /* try next */ }
      }
      if (feedbackFound) break;

      const continueBtn = this.page.locator('button.move-to-next-content');
      const classes = await continueBtn.getAttribute('class').catch(() => '');
      if (classes?.includes('move-to-next-content-active')) {
        this.logger?.success(`Q${questionNumber}: Continue re-enabled (feedback acknowledged)`);
        feedbackFound = true;
        break;
      }

      await this.page.waitForTimeout(300);
    }

    if (!feedbackFound) {
      this.logger?.debug(`Q${questionNumber}: Feedback not explicitly detected, proceeding anyway`);
    }
  }

  private async clickContinueAfterFeedbackDirect(questionNumber: number, isLastQuestion: boolean): Promise<void> {
    const continueBtn = this.page.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      for (let attempt = 0; attempt < 25; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Q${questionNumber}: Continue not active after feedback (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(200);
      }

      await continueBtn.click();
      this.logger?.success(`Q${questionNumber}: Second Continue clicked (after feedback)`);
      await this.page.waitForTimeout(200);

      if (!isLastQuestion) {
        const header = this.page.locator('.question-position h1');
        for (let attempt = 0; attempt < 16; attempt++) {
          const text = await header.textContent();
          const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of/);
          if (match && parseInt(match[1], 10) !== questionNumber) {
            this.logger?.debug(`Question advanced to Q${match[1]}`);
            break;
          }
          await this.page.waitForTimeout(200);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Q${questionNumber}: Second Continue click failed: ${msg}`);
    }
  }

  private async handleSectionCompletePopupDirect(sectionNumber: number): Promise<void> {
    this.logger?.debug(`Section ${sectionNumber}: Waiting for section-complete popup...`);
    await this.page.waitForTimeout(1000);

    const popupSelectors = [
      this.page.locator('button:has-text("Finalize and View Results")'),
      this.page.locator('button:has-text("View Results")'),
      this.page.locator('button:has-text("Finalize")'),
      this.page.locator('button:has-text("Continue")'),
      this.page.locator('button:has-text("OK")'),
      this.page.locator('button:has-text("Next")'),
      this.page.locator('button:has-text("Proceed")'),
      this.page.locator('button:has-text("Start")'),
      this.page.locator('button:has-text("Begin")'),
      this.page.locator('.modal button.btn-primary, .modal button.btn-default'),
      this.page.locator('mat-dialog-actions button'),
      this.page.locator('.cdk-overlay-container button'),
    ];

    for (const btnLocator of popupSelectors) {
      try {
        const count = await btnLocator.count();
        if (count > 0) {
          const btn = btnLocator.first();
          if (await btn.isVisible({ timeout: 1000 })) {
            const btnText = (await btn.textContent())?.trim();
            await btn.click();
            this.logger?.success(`Section ${sectionNumber}: Popup clicked: "${btnText}"`);
            await this.page.waitForTimeout(1000);
            return;
          }
        }
      } catch { /* try next */ }
    }

    this.logger?.debug(`Section ${sectionNumber}: No popup detected, proceeding`);
  }
}
