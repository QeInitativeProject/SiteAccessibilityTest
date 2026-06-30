/**
 * Regression Test - Proctored Scramble Validation
 * Description: Validate that question order and option order are scrambled
 * across two students for the same proctored assessment batch.
 *
 * Notes:
 * - This test assumes the target assessment has scramble enabled.
 * - If scramble is not enabled in assessment configuration, validation will fail by design.
 */

import { test, expect, Browser, BrowserContext, FrameLocator, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { FACHomePage } from '@delegates/FACHomePage';
import { MyATIPage } from '@delegates/MyATIPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { BatchCreation } from '@utils/BatchCreation';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

const EXPECTED_ASSESSMENT_NAME = process.env.ProctoredAssessment;
const EXPECTED_INSTITUTION = process.env.Institution_zzcab;
const SCENARIO_NAME = 'Stg_Proctor_Scramble.spec.ts';

const STUDENT1_USERNAME = process.env.stuUsernameauto12;
const STUDENT1_PASSWORD = process.env.stuPasswordauto1;
const STUDENT2_USERNAME = process.env.stuUsernameauto10;
const STUDENT2_PASSWORD = process.env.stuPasswordauto1;
const QUESTIONS_TO_COMPARE = 4;

interface QuestionSnapshot {
  index: number;
  stem: string;
  options: string[];
}

test.describe.serial('@Regression - Stg_Proctor_Scramble.spec.ts', { tag: '@regression' }, () => {
  let browser: Browser;
  let facultyContext: BrowserContext;
  let facultyPage: Page;
  let student1Context: BrowserContext;
  let student1Page: Page;
  let student2Context: BrowserContext;
  let student2Page: Page;

  let facultyLoginPage: LoginPage;
  let facHomePage: FACHomePage;
  let proctorUtil: ProctorUtility;
  let assertions: Assertions;
  let logger: Logger;
  let batchCreation: BatchCreation;

  let extractedBatchId: string;
  let student1Snapshots: QuestionSnapshot[] = [];
  let student2Snapshots: QuestionSnapshot[] = [];

  const normalizeText = (value: string | null | undefined): string =>
    (value || '').replace(/\s+/g, ' ').trim();

  const waitForStudentOverlaysToClear = async (page: Page): Promise<void> => {
    const overlays = page.locator('.blockUI.blockOverlay, .ui-widget-overlay.ui-front');
    if ((await overlays.count()) > 0) {
      await overlays.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }
  };

  const getQuestionStem = async (
    frame: FrameLocator,
    locators: StudentFacingPageLocators,
    qIndex: number
  ): Promise<string> => {
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
      if (!isVisible) {
        continue;
      }

      const text = normalizeText(await selector.first().textContent());
      if (text) {
        return text;
      }
    }

    throw new Error(`Unable to capture question stem for question index ${qIndex}`);
  };

  const getOptionTexts = async (frame: FrameLocator): Promise<string[]> => {
    const optionSets = [
      frame.locator('div.ie-choice-interaction'),
      frame.locator('mat-radio-button .mdc-label'),
      frame.locator('label.mat-radio-label'),
      frame.locator('input[type="radio"] + span, input[type="checkbox"] + span'),
    ];

    for (const set of optionSets) {
      const count = await set.count().catch(() => 0);
      if (!count) {
        continue;
      }

      const values: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = normalizeText(await set.nth(i).textContent());
        if (text) {
          values.push(text);
        }
      }

      if (values.length > 1) {
        return values;
      }
    }

    return [];
  };

  const selectFirstOption = async (frame: FrameLocator): Promise<void> => {
    const clickableOption = frame
      .locator('div.ie-choice-interaction mat-radio-button, mat-radio-button, input[type="radio"], input[type="checkbox"]')
      .first();

    const visible = await clickableOption.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      throw new Error('No selectable option found before Continue');
    }

    await clickableOption.click({ timeout: 10000, force: true });
  };

  const clickContinueToNext = async (frame: FrameLocator): Promise<void> => {
    const continueButton = frame
      .locator('#moveNext, button:has-text("Continue To Next Question"), .move-to-next-content-active')
      .first();

    await continueButton.waitFor({ state: 'visible', timeout: 10000 });
    await continueButton.click({ timeout: 10000, force: true });
  };

  const captureQuestionSequence = async (
    page: Page,
    locators: StudentFacingPageLocators,
    totalToCapture: number
  ): Promise<QuestionSnapshot[]> => {
    const frame = locators.getAssessmentFrameLocator();
    const snapshots: QuestionSnapshot[] = [];
    let previousStem = '';

    await page.waitForSelector(locators.assessmentFrameSelector, { state: 'attached', timeout: 30000 });
    await frame.locator('body').first().waitFor({ state: 'visible', timeout: 30000 });

    for (let i = 0; i < totalToCapture; i++) {
      const stem = await getQuestionStem(frame, locators, i + 1);
      const options = await getOptionTexts(frame);
      snapshots.push({ index: i + 1, stem, options });

      if (i === totalToCapture - 1) {
        break;
      }

      await selectFirstOption(frame);
      await clickContinueToNext(frame);

      await page.waitForFunction(
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

      previousStem = stem;
      await page.waitForTimeout(800);
    }

    return snapshots;
  };

  const addProductAndReachAssessment = async (
    studentPage: Page,
    studentUser: string,
    studentPass: string,
    batchId: string,
    tcLabel: string
  ): Promise<void> => {
    const studentLogin = new LoginPage(studentPage);
    const studentATI = new MyATIPage(studentPage);
    const studentLocators = new StudentFacingPageLocators(studentPage);
    const studentAssertions = new Assertions(studentPage);

    await studentPage.goto(process.env.baseUrl!, { waitUntil: 'load' });
    await studentPage.waitForTimeout(2000);

    await studentLogin.fillStuUserName(studentUser);
    await studentLogin.fillStuPassword(studentPass);
    await studentLogin.clickLogin();
    await studentPage.waitForLoadState('load');

    await waitForStudentOverlaysToClear(studentPage);

    await studentATI.clickOnMyATITab();
    await studentPage.waitForLoadState('load');
    await studentPage.waitForTimeout(2000);

    await studentATI.clickOnAssessmentsTab();
    await studentPage.waitForTimeout(1500);

    await studentAssertions.waitAndAssertVisible(studentLocators.idTextbox, 15000);
    await studentLocators.idTextbox.fill(batchId.trim());
    await studentAssertions.waitAndAssertVisible(studentLocators.continueButton, 10000);
    await studentLocators.continueButton.click();

    const studentProctorUtil = new ProctorUtility(studentPage);
    studentProctorUtil.setLogger(logger);
    await studentPage.waitForTimeout(2000);
    await studentProctorUtil.fillAttestationPage();

    await studentATI.waitForPageLoadAndVerifyNavigation('/Assessment');

    await facultyPage.bringToFront();
    await facultyPage.reload({ waitUntil: 'load' });
    await facultyPage.waitForTimeout(2500);
    await proctorUtil.approveByProctor();

    await studentPage.bringToFront();
    await studentPage.waitForLoadState('load');
    await studentPage.waitForTimeout(3000);
    await studentProctorUtil.startTest();
    await studentPage.waitForLoadState('load');

    logger.success(`${tcLabel}: student reached assessment`);
  };

  test.beforeAll(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch({ headless: process.env.CI ? true : false });

    facultyContext = await browser.newContext();
    facultyPage = await facultyContext.newPage();

    facultyLoginPage = new LoginPage(facultyPage);
    facHomePage = new FACHomePage(facultyPage);
    proctorUtil = new ProctorUtility(facultyPage);
    assertions = new Assertions(facultyPage);
    batchCreation = new BatchCreation(browser);

    facultyPage.on('dialog', async (dialog) => {
      logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
      await dialog.dismiss();
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await logger?.captureScreenshot('test_failure');
    }
  });

  test.afterAll(async () => {
    try {
      if (student1Page && !student1Page.isClosed()) await student1Page.close();
      if (student1Context) await student1Context.close();
      if (student2Page && !student2Page.isClosed()) await student2Page.close();
      if (student2Context) await student2Context.close();
      if (facultyContext) await facultyContext.close();
      if (browser) await browser.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('TC1: Create MU batch for scramble validation', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(facultyPage, 'TC1__Batch_Creation', testInfo, {
      scenarioName: SCENARIO_NAME,
      tcNumber: 'TC1',
    });

    logger.separator('TC1: BATCH CREATION FOR SCRAMBLE VALIDATION');

    extractedBatchId = await batchCreation.createBatch(EXPECTED_ASSESSMENT_NAME!, EXPECTED_INSTITUTION!);
    assertions.assertValidNumericId(extractedBatchId, 5);
    logger.success(`Batch created with ID: ${extractedBatchId}`);
  });

  test('TC2: Faculty setup and start proctoring', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(facultyPage, 'TC2__Faculty_Setup_Proctoring', testInfo, {
      scenarioName: SCENARIO_NAME,
      tcNumber: 'TC2',
    });

    facultyLoginPage.setLogger(logger);
    facHomePage.setLogger(logger);
    proctorUtil.setLogger(logger);
    assertions.setLogger(logger);

    logger.separator('TC2: FACULTY SETUP PROCTORING');

    await facultyPage.goto(process.env.baseUrl!, { waitUntil: 'load' });
    await facultyLoginPage.fillfacUserName(process.env.facUsernamezzcab3!);
    await facultyLoginPage.fillfacPassword(process.env.facPasswordzzcab3!);
    await facultyLoginPage.clickLogin();
    await facultyPage.waitForLoadState('load');
    await assertions.assertURLNotContains('/login');

    await facHomePage.clickOnMenuBar();
    await facultyPage.waitForLoadState('load');
    await proctorUtil.navigateToProctorTab();
    await facultyPage.waitForLoadState('load');
    await facultyPage.waitForTimeout(12000);

    await proctorUtil.fillAssessmentID(extractedBatchId);
    await facultyPage.waitForLoadState('load');
    await proctorUtil.completeProctorAgreementPage();
    await facultyPage.waitForLoadState('load');
    await facultyPage.waitForTimeout(2000);
    await proctorUtil.checkInStudents();
    await facultyPage.waitForLoadState('load');
    await proctorUtil.startProctoring();
    await facultyPage.waitForLoadState('load');

    logger.success('TC2 PASS: Faculty setup completed');
  });

  test('TC3: Student 1 captures scrambled sequence', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(facultyPage, 'TC3__Student1_Capture_Sequence', testInfo, {
      scenarioName: SCENARIO_NAME,
      tcNumber: 'TC3',
    });
    proctorUtil.setLogger(logger);

    logger.separator('TC3: STUDENT 1 CAPTURE QUESTION/OPTION ORDER');

    student1Context = await browser.newContext();
    student1Page = await student1Context.newPage();

    await addProductAndReachAssessment(
      student1Page,
      STUDENT1_USERNAME!,
      STUDENT1_PASSWORD!,
      extractedBatchId,
      'TC3'
    );

    const s1Locators = new StudentFacingPageLocators(student1Page);
    student1Snapshots = await captureQuestionSequence(student1Page, s1Locators, QUESTIONS_TO_COMPARE);

    logger.info(`Student 1 sequence captured: ${student1Snapshots.map((q) => q.stem).join(' | ')}`);
    logger.success('TC3 PASS: Student 1 question/option sequence captured');
  });

  test('TC4: Student 2 captures scrambled sequence', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(facultyPage, 'TC4__Student2_Capture_Sequence', testInfo, {
      scenarioName: SCENARIO_NAME,
      tcNumber: 'TC4',
    });
    proctorUtil.setLogger(logger);

    logger.separator('TC4: STUDENT 2 CAPTURE QUESTION/OPTION ORDER');

    student2Context = await browser.newContext();
    student2Page = await student2Context.newPage();

    await addProductAndReachAssessment(
      student2Page,
      STUDENT2_USERNAME!,
      STUDENT2_PASSWORD!,
      extractedBatchId,
      'TC4'
    );

    const s2Locators = new StudentFacingPageLocators(student2Page);
    student2Snapshots = await captureQuestionSequence(student2Page, s2Locators, QUESTIONS_TO_COMPARE);

    logger.info(`Student 2 sequence captured: ${student2Snapshots.map((q) => q.stem).join(' | ')}`);
    logger.success('TC4 PASS: Student 2 question/option sequence captured');
  });

  test('TC5: Validate questions and options are scrambled', { tag: '@regression' }, async ({}, testInfo) => {
    logger = new Logger(facultyPage, 'TC5__Validate_Scrambling', testInfo, {
      scenarioName: SCENARIO_NAME,
      tcNumber: 'TC5',
    });

    logger.separator('TC5: SCRAMBLE ASSERTIONS');

    expect(student1Snapshots.length).toBeGreaterThan(0);
    expect(student2Snapshots.length).toBeGreaterThan(0);

    const student1QuestionOrder = student1Snapshots.map((q) => q.stem).join(' || ');
    const student2QuestionOrder = student2Snapshots.map((q) => q.stem).join(' || ');

    expect(
      student1QuestionOrder,
      'Question order is identical for both students. Ensure question scramble is enabled in assessment configuration.'
    ).not.toBe(student2QuestionOrder);

    const student2ByStem = new Map(student2Snapshots.map((q) => [q.stem, q.options]));

    let optionOrderDiffCount = 0;
    for (const q1 of student1Snapshots) {
      const q2Options = student2ByStem.get(q1.stem);
      if (!q2Options || q1.options.length < 2 || q2Options.length < 2) {
        continue;
      }

      if (q1.options.join('||') !== q2Options.join('||')) {
        optionOrderDiffCount++;
      }
    }

    expect(
      optionOrderDiffCount,
      'No option-order difference found for common questions. Ensure option scramble is enabled in assessment configuration.'
    ).toBeGreaterThan(0);

    logger.success(`Question order is scrambled across students`);
    logger.success(`Option order differs for ${optionOrderDiffCount} common question(s)`);
  });
});
