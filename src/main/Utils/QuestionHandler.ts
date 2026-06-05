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
      for (let attempt = 0; attempt < 5; attempt++) {
        detectedType = await this.detectQuestionType(frame);
        if (detectedType !== 'unknown') break;
        this.logger?.debug(`Detection attempt ${attempt + 1} returned unknown, waiting for question to load...`);
        await this.page.waitForTimeout(3000);
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

      await this.page.waitForTimeout(700);
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
      return await locator.first().isVisible({ timeout: 2000 });
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

    const radio = options.nth(index).locator('mat-radio-button').first();
    await radio.waitFor({ state: 'visible', timeout: 5000 });
    await radio.click();
    const selectedText = (await options.nth(index).textContent())?.trim();
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
      await input.pressSequentially(value, { delay: 50 });

      // Dispatch input + change events to trigger Angular/Knockout validation
      await input.dispatchEvent('input');
      await input.dispatchEvent('change');
      await input.dispatchEvent('blur');

      this.logger?.success(`Input [${i + 1}]: typed "${value}" and dispatched events`);
    }

    // Wait briefly for Angular to process and enable Continue
    await this.page.waitForTimeout(1000);
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
      await this.page.waitForTimeout(500);

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
      await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(500);
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

        await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(300);
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
        await this.page.waitForTimeout(500);
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

    await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(500);

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
        await this.page.waitForTimeout(700);
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
        await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(500);
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
    const selectors = [
      frame.locator('div.stem-text.read-area'),
      frame.locator('.stem-text'),
      frame.locator('.question-stem'),
      frame.locator('#highlightWordsText'),
    ];

    for (const selector of selectors) {
      try {
        await selector.first().waitFor({ state: 'visible', timeout: 10000 });
        return;
      } catch {
        // try next
      }
    }
    // If no question text found, still proceed — some types may not have stem text
    this.logger?.debug('No question stem found, proceeding with detection');
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
      await this.page.waitForTimeout(2000);
    }
  }

  private async clickContinue(frame: FrameLocator, questionIndex: number): Promise<void> {
    const continueBtn = frame.locator('button.move-to-next-content');
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for Continue button to become active (has 'move-to-next-content-active' class)
      for (let attempt = 0; attempt < 15; attempt++) {
        const classes = await continueBtn.getAttribute('class') ?? '';
        if (classes.includes('move-to-next-content-active')) break;
        this.logger?.debug(`Continue button not active yet, waiting... (attempt ${attempt + 1})`);
        await this.page.waitForTimeout(1000);
      }

      await continueBtn.click();
      this.logger?.success('Continue clicked');

      // Wait for question to actually advance (header text changes)
      await this.page.waitForTimeout(2000);
      const header = frame.locator('.question-position h1');
      
      // Wait up to 8s for the question number to change
      for (let attempt = 0; attempt < 8; attempt++) {
        const text = await header.textContent();
        const match = text?.match(/(\d+)\s*(?:&nbsp;|\s)*of/);
        if (match && parseInt(match[1], 10) !== questionIndex + 1) {
          this.logger?.debug(`Question advanced to Q${match[1]}`);
          break; // Question advanced
        }
        await this.page.waitForTimeout(1000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Continue button issue at Q${questionIndex + 1}: ${msg}`);
    }
  }
}
