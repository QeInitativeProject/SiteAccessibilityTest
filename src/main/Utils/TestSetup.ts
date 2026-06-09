import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '@delegates/LoginPage';
import { MyATIPage } from '@delegates/MyATIPage';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { BatchCreation } from '@utils/BatchCreation';
import { Assertions } from '@utils/Assertion';
import { Logger } from '@utils/Logger';
import { ATICommonMethod } from '@utils/ATICommonMethod';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';

export interface TestContext {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  assertions: Assertions;
  batchCreation: BatchCreation;
  extractedBatchId: string;
  atiLoginPage: LoginPage;
  myATIPage: MyATIPage;
  assessmentPage: AssessmentPage;
  atiCommonMethod: ATICommonMethod;
  locators: StudentFacingPageLocators;
}

export interface SetupOptions {
  /** Login type: 'student' or 'faculty' */
  loginAs: 'student' | 'faculty';
  /** Whether to create an MU batch before login */
  createBatch?: boolean;
  /** Assessment name for batch creation (defaults to process.env.Assessment) */
  assessmentName?: string;
  /** Institution name for batch creation (defaults to process.env.Institution) */
  institution?: string;
}

/**
 * Sets up the test environment: launches browser, creates batch (optional), and logs in.
 * Returns a TestContext with all initialized page objects.
 */
export async function setupTestEnvironment(options: SetupOptions): Promise<TestContext> {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const assertions = new Assertions(page);
  const batchCreation = new BatchCreation(browser);
  const atiLoginPage = new LoginPage(page);
  const myATIPage = new MyATIPage(page);
  const assessmentPage = new AssessmentPage(page);
  const atiCommonMethod = new ATICommonMethod(page);
  const locators = new StudentFacingPageLocators(page);

  let extractedBatchId = '';

  // --- Login first (opens baseUrl in the main browser window) ---
  console.log(`[Setup] Logging in as ${options.loginAs}...`);
  await page.goto(process.env.baseUrl!);

  if (options.loginAs === 'student') {
    await atiLoginPage.fillStuUserName(process.env.stuUsername!);
    await atiLoginPage.fillStuPassword(process.env.stuPassword!);
  } else {
    await atiLoginPage.fillfacUserName(process.env.stuUsernamezzcab!);
    await atiLoginPage.fillfacPassword(process.env.stuUsernamezzcab!);
  }

  await atiLoginPage.clickLogin();
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
  console.log(`[Setup] ${options.loginAs} login complete`);

  return {
    browser,
    context,
    page,
    assertions,
    batchCreation,
    extractedBatchId,
    atiLoginPage,
    myATIPage,
    assessmentPage,
    atiCommonMethod,
    locators,
  };
}

/**
 * Tears down the test environment by closing the browser.
 */
export async function teardownTestEnvironment(ctx: TestContext): Promise<void> {
  await ctx?.browser?.close();
}

/**
 * Clears all cookies from a browser context to avoid "Multiple Active Test Sessions" errors.
 * Call this before re-logging in a student after a tab close.
 */
export async function clearSessionCookies(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}

export function createTestSuite(
  config: {
    suiteName: string;
    scenarioName: string;
    loginAs: 'student' | 'faculty';
    createBatch?: boolean;
    assessmentName?: string;
    institution?: string;
    tag?: string;
  },
  tests: (getCtx: (testInfo: any, tcNumber: string, loggerName?: string) => TestContext & { logger: Logger }) => void
) {
  base.describe.serial(config.suiteName, () => {
    let ctx: TestContext;
    let currentLogger: Logger;

    base.beforeAll(async () => {
      ctx = await setupTestEnvironment({
        loginAs: config.loginAs,
        createBatch: config.createBatch,
        assessmentName: config.assessmentName,
        institution: config.institution,
      });
    });

    base.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== testInfo.expectedStatus) {
        await currentLogger?.captureScreenshot('test_failure');
      }
    });

    base.afterAll(async () => {
      await teardownTestEnvironment(ctx);
    });

    const getCtx = (testInfo: any, tcNumber: string, loggerName?: string) => {
      const name = loggerName || `${tcNumber}: ${testInfo.title}`;
      currentLogger = new Logger(ctx.page, name, testInfo, {
        scenarioName: config.scenarioName,
        tcNumber,
      });
      ctx.atiLoginPage.setLogger(currentLogger);
      ctx.myATIPage.setLogger(currentLogger);
      ctx.assessmentPage.setLogger(currentLogger);
      ctx.atiCommonMethod.setLogger(currentLogger);
      ctx.assertions.setLogger(currentLogger);
      return { ...ctx, logger: currentLogger };
    };

    tests(getCtx);
  });
}
