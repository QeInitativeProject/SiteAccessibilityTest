import type { Page, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive Logger Utility for Playwright Test Framework
 *
 * Features:
 * - Structured logging with timestamps and log levels
 * - Automatic screenshots on errors
 * - HTML snapshots capture
 * - Video recording integration
 * - Step-by-step execution tracking
 * - Clean, color-coded console output
 * - Centralized log file management
 */

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  STEP = 'STEP',
  SEPARATOR = 'SEPARATOR',
}

export interface LoggerOptions {
  enableFileLogging?: boolean;
  enableConsoleLogging?: boolean;
  logDirectory?: string;
  screenshotOnError?: boolean;
  captureHtmlSnapshot?: boolean;
  scenarioName?: string;
  attemptId?: string; // For tracking test attempts
  tcNumber?: string; // Test case number for failure logging
}

export class Logger {
  // Static map to store scenario folder timestamps - shared across all test cases in same run
  private static scenarioTimestamps: Map<string, string> = new Map();

  private page: Page;
  private testInfo?: TestInfo;
  private testName: string;
  private logFilePath?: string;
  private options: Required<LoggerOptions>;
  private stepCounter: number = 0;
  private scenarioName?: string;
  private attemptId?: string;
  private tcNumber?: string;
  private scenarioLogDir?: string;
  private scenarioFolderName?: string; // Store the folder name for reuse in screenshots

  // Console color codes
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
  };

  // Emoji icons for better visibility
  private icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍',
    step: '📝',
    separator: '═',
    screenshot: '📸',
    video: '🎥',
    html: '📄',
    time: '⏱️',
  };

  constructor(page: Page, testName: string, testInfo?: TestInfo, options?: LoggerOptions) {
    this.page = page;
    this.testInfo = testInfo;
    this.testName = testName;
    this.scenarioName = options?.scenarioName;
    this.attemptId = options?.attemptId || Date.now().toString();
    this.tcNumber = options?.tcNumber;

    // Default options - Disable file logging by default, enable only on error
    this.options = {
      enableFileLogging: options?.enableFileLogging ?? false, // Changed to false
      enableConsoleLogging: options?.enableConsoleLogging ?? true,
      logDirectory: options?.logDirectory ?? 'test-results/logs',
      screenshotOnError: options?.screenshotOnError ?? true,
      captureHtmlSnapshot: options?.captureHtmlSnapshot ?? true,
      scenarioName: options?.scenarioName ?? '',
      attemptId: options?.attemptId || Date.now().toString(),
      tcNumber: options?.tcNumber ?? '',
    };

    // Don't initialize log file immediately - only create when error occurs
    // if (this.options.enableFileLogging) {
    //   this.initializeLogFile();
    // }
  }

  /**
   * Initialize log file for the test
   */
  private initializeLogFile(): void {
    let logDir = this.options.logDirectory;
    let logFileName = 'test.log';

    // If scenario name is provided, create a scenario-specific folder with ddmmyyyy_HHMMSS format
    if (this.scenarioName) {
      const sanitizedScenarioName = this.scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Check if we already have a timestamp for this scenario (from earlier test case)
      let scenarioFolder: string;
      if (Logger.scenarioTimestamps.has(sanitizedScenarioName)) {
        // Reuse existing timestamp from earlier test case in same run
        scenarioFolder = Logger.scenarioTimestamps.get(sanitizedScenarioName)!;
      } else {
        // Create new timestamp for this scenario's first test case
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const dateFolder = `${day}${month}${year}`;
        const timeStamp = `${hours}${minutes}${seconds}`;
        scenarioFolder = `${sanitizedScenarioName}_${dateFolder}_${timeStamp}`;
        
        // Store for reuse by other test cases in same scenario
        Logger.scenarioTimestamps.set(sanitizedScenarioName, scenarioFolder);
      }
      
      logDir = path.join(this.options.logDirectory, scenarioFolder);
      this.scenarioLogDir = logDir;
      this.scenarioFolderName = scenarioFolder; // Store for success screenshots

      // Clean up old scenario folders (keep only latest run)
      this.cleanOldScenarioFolders(this.options.logDirectory, sanitizedScenarioName);
    }

    // Create log directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Use TC number as log file name if provided, otherwise use test name
    if (this.tcNumber) {
      logFileName = `${this.tcNumber}.log`;
    } else {
      const sanitizedTestName = this.testName.replace(/[^a-zA-Z0-9]/g, '_');
      logFileName = `${sanitizedTestName}.log`;
    }

    this.logFilePath = path.join(logDir, logFileName);

    // Write initial header
    const header = `
${'='.repeat(80)}
TEST EXECUTION LOG
${'='.repeat(80)}
Test Name: ${this.testName}
Start Time: ${new Date().toISOString()}
Environment: ${process.env.ENV || 'stage'}
Base URL: ${process.env.baseUrl || 'N/A'}
Attempt ID: ${this.attemptId}
${'='.repeat(80)}
`;
    fs.writeFileSync(this.logFilePath, header);
  }

  /**
   * Clean old scenario folders to keep only the latest run
   * Only deletes folders older than 5 minutes to avoid deleting logs from current test run
   */
  private cleanOldScenarioFolders(baseLogDir: string, scenarioName: string): void {
    if (!fs.existsSync(baseLogDir)) {
      return;
    }

    try {
      const currentTime = Date.now();
      const fiveMinutesAgo = currentTime - (5 * 60 * 1000); // 5 minutes in milliseconds

      // Find all folders matching the scenario name pattern
      const allFolders = fs.readdirSync(baseLogDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name.startsWith(scenarioName + '_'))
        .map(entry => ({
          name: entry.name,
          path: path.join(baseLogDir, entry.name),
          mtime: fs.statSync(path.join(baseLogDir, entry.name)).mtime.getTime()
        }))
        .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

      // Delete folders older than 5 minutes (not from current test run)
      const oldFolders = allFolders.filter(folder => folder.mtime < fiveMinutesAgo);
      
      if (oldFolders.length > 0) {
        for (const folder of oldFolders) {
          fs.rmSync(folder.path, { recursive: true, force: true });
          console.log(`  🗑️  Removed old log folder: ${folder.name}`);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not clean old scenario folders: ${error}`);
    }
  }

  /**
   * Clear scenario timestamps for a new test run
   * Call this in test.beforeAll if you want to force new folders for a new run
   */
  static clearScenarioTimestamps(): void {
    Logger.scenarioTimestamps.clear();
  }

  /**
   * Get timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message with level and timestamp
   */
  private formatLogMessage(level: LogLevel, message: string): string {
    return `[${this.getTimestamp()}] [${level}] ${message}`;
  }

  /**
   * Write to log file
   */
  private writeToFile(message: string): void {
    if (this.options.enableFileLogging && this.logFilePath) {
      fs.appendFileSync(this.logFilePath, message + '\n');
    }
  }

  /**
   * Get color for log level
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return this.colors.red;
      case LogLevel.SUCCESS:
        return this.colors.green;
      case LogLevel.WARNING:
        return this.colors.yellow;
      case LogLevel.INFO:
        return this.colors.cyan;
      case LogLevel.DEBUG:
        return this.colors.magenta;
      case LogLevel.STEP:
        return this.colors.blue;
      default:
        return this.colors.white;
    }
  }

  /**
   * Get icon for log level
   */
  private getIconForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return this.icons.error;
      case LogLevel.SUCCESS:
        return this.icons.success;
      case LogLevel.WARNING:
        return this.icons.warning;
      case LogLevel.INFO:
        return this.icons.info;
      case LogLevel.DEBUG:
        return this.icons.debug;
      case LogLevel.STEP:
        return this.icons.step;
      default:
        return '';
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatLogMessage(level, message);
    const icon = this.getIconForLevel(level);
    const color = this.getColorForLevel(level);

    // Console output
    if (this.options.enableConsoleLogging) {
      const consoleMessage = `${color}${icon} ${message}${this.colors.reset}`;
      console.log(consoleMessage);

      if (data) {
        console.log(`${this.colors.dim}${JSON.stringify(data, null, 2)}${this.colors.reset}`);
      }
    }

    // File output
    this.writeToFile(formattedMessage);
    if (data) {
      this.writeToFile(`Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  /**
   * Info level log
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Success level log
   */
  success(message: string, data?: any): void {
    this.log(LogLevel.SUCCESS, message, data);
  }

  /**
   * Warning level log
   */
  warning(message: string, data?: any): void {
    this.log(LogLevel.WARNING, message, data);
  }

  /**
   * Error level log with automatic screenshot and HTML snapshot
   * Enables file logging when error occurs
   */
  async error(message: string, error?: any): Promise<void> {
    // Enable file logging on first error if not already enabled
    if (!this.options.enableFileLogging) {
      this.options.enableFileLogging = true;
      this.initializeLogFile();
    }
    
    this.log(LogLevel.ERROR, message, error);

    // Capture failure log with TC number
    if (this.scenarioName && this.tcNumber) {
      await this.captureFailureLog();
    }

    // Capture and move video for failed test
    if (this.scenarioName && this.tcNumber && this.testInfo) {
      await this.captureFailureVideo();
    }

    // Capture screenshot on error
    if (this.options.screenshotOnError) {
      await this.captureScreenshot(`error_${Date.now()}`);
    }

    // Capture HTML snapshot on error
    if (this.options.captureHtmlSnapshot) {
      await this.captureHtmlSnapshot(`error_${Date.now()}`);
    }
  }

  /**
   * Debug level log
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Step logging for test execution flow
   */
  step(description: string): void {
    this.stepCounter++;
    const stepMessage = `Step ${this.stepCounter}: ${description}`;
    this.log(LogLevel.STEP, stepMessage);
  }

  /**
   * Visual separator for log sections
   */
  separator(title?: string): void {
    const separatorLine = this.icons.separator.repeat(80);
    if (this.options.enableConsoleLogging) {
      console.log(`\n${this.colors.cyan}${separatorLine}${this.colors.reset}`);
      if (title) {
        console.log(`${this.colors.bright}${this.colors.cyan}${title}${this.colors.reset}`);
        console.log(`${this.colors.cyan}${separatorLine}${this.colors.reset}\n`);
      }
    }
    this.writeToFile(`\n${separatorLine}`);
    if (title) {
      this.writeToFile(title);
      this.writeToFile(separatorLine);
    }
  }

  /**
   * Log test section start
   */
  startSection(sectionName: string): void {
    this.separator(sectionName);
    this.info(`Starting section: ${sectionName}`);
  }

  /**
   * Log test section end
   */
  endSection(sectionName: string): void {
    this.success(`Completed section: ${sectionName}`);
    this.separator();
  }

  /**
   * Capture screenshot with enhanced error handling
   */
  async captureScreenshot(name: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');

      // Check if page is still valid before taking screenshot
      if (!this.page || this.page.isClosed()) {
        this.warning('Cannot capture screenshot: Page is closed or invalid');
        return null;
      }

      // Wait a moment for any animations/transitions to complete
      await this.page.waitForTimeout(500);

      // Capture screenshot as buffer with error handling
      let screenshot: Buffer;
      try {
        screenshot = await this.page.screenshot({ 
          fullPage: true,
          timeout: 5000  // 5 second timeout for screenshot
        });
      } catch (screenshotError) {
        // If fullPage fails, try viewport screenshot
        this.warning('Full page screenshot failed, attempting viewport screenshot');
        try {
          screenshot = await this.page.screenshot({ 
            fullPage: false,
            timeout: 5000
          });
        } catch (viewportError) {
          this.warning(`Screenshot capture failed: ${viewportError}`);
          return null;
        }
      }

      // Verify screenshot is not empty
      if (!screenshot || screenshot.length === 0) {
        this.warning('Screenshot buffer is empty');
        return null;
      }

      // Check if this is a success or failure screenshot
      const isSuccessScreenshot = name.toLowerCase().includes('success');
      const isFailureScreenshot = name.toLowerCase().includes('failure') || name.toLowerCase().includes('test_failure');

      // Handle success screenshots - use shared folder logic
      if (isSuccessScreenshot && this.scenarioFolderName) {
        // Success screenshots go to test-results/success-screenshots/{scenarioFolderName}
        // Uses the SAME folder name as logs for consistency across all test cases
        const screenshotDir = path.join('test-results/success-screenshots', this.scenarioFolderName);
        
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const screenshotPath = path.join(screenshotDir, `${sanitizedName}_${timestamp}.png`);
        fs.writeFileSync(screenshotPath, screenshot);
        this.info(`${this.icons.screenshot} Success screenshot captured: ${screenshotPath}`);
        
        return screenshotPath;
      }

      // Handle failure screenshots - use shared folder logic (same as success)
      if (isFailureScreenshot && this.scenarioFolderName) {
        // Failure screenshots go to test-results/Failed_screenshots/{scenarioFolderName}
        // Uses the SAME folder name as logs for consistency across all test cases
        const screenshotDir = path.join('test-results/Failed_screenshots', this.scenarioFolderName);
        
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const screenshotPath = path.join(screenshotDir, `${sanitizedName}_${timestamp}.png`);
        fs.writeFileSync(screenshotPath, screenshot);
        this.info(`${this.icons.screenshot} Failure screenshot captured: ${screenshotPath}`);
        
        return screenshotPath;
      }

      // Attach to test report if testInfo is available (Playwright manages storage)
      if (this.testInfo) {
        await this.testInfo.attach(`screenshot-${sanitizedName}-${timestamp}`, {
          body: screenshot,
          contentType: 'image/png',
        });
        this.info(
          `${this.icons.screenshot} Screenshot captured: screenshot-${sanitizedName}-${timestamp}.png`
        );
        return `screenshot-${sanitizedName}-${timestamp}.png`;
      } else {
        // Fallback: Save to file only if testInfo is not available
        const screenshotDir = 'test-results/screenshots';
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotPath = path.join(screenshotDir, `${sanitizedName}_${timestamp}.png`);
        fs.writeFileSync(screenshotPath, screenshot);
        this.info(`${this.icons.screenshot} Screenshot captured: ${screenshotPath}`);
        return screenshotPath;
      }
    } catch (error) {
      this.warning(`Failed to capture screenshot: ${error}`);
      return null;
    }
  }

  /**
   * Capture HTML snapshot
   */
  async captureHtmlSnapshot(name: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const htmlContent = await this.page.content();

      // Attach to test report if testInfo is available (Playwright manages storage)
      if (this.testInfo) {
        await this.testInfo.attach(`html-snapshot-${sanitizedName}-${timestamp}`, {
          body: htmlContent,
          contentType: 'text/html',
        });
        this.info(
          `${this.icons.html} HTML snapshot captured: html-snapshot-${sanitizedName}-${timestamp}.html`
        );
        return `html-snapshot-${sanitizedName}-${timestamp}.html`;
      } else {
        // Fallback: Save to file only if testInfo is not available
        const snapshotDir = 'test-results/html-snapshots';
        if (!fs.existsSync(snapshotDir)) {
          fs.mkdirSync(snapshotDir, { recursive: true });
        }
        const snapshotPath = path.join(snapshotDir, `${sanitizedName}_${timestamp}.html`);
        fs.writeFileSync(snapshotPath, htmlContent);
        this.info(`${this.icons.html} HTML snapshot captured: ${snapshotPath}`);
        return snapshotPath;
      }
    } catch (error) {
      this.warning(`Failed to capture HTML snapshot: ${error}`);
      return null;
    }
  }

  /**
   * Capture failure log with scenario name and TC number
   */
  async captureFailureLog(): Promise<void> {
    if (!this.scenarioLogDir || !this.tcNumber) return;

    try {
      const failureLogName = `${this.tcNumber}_FAILED.log`;
      const failureLogPath = path.join(this.scenarioLogDir, failureLogName);

      // Ensure scenario log directory exists
      if (!fs.existsSync(this.scenarioLogDir)) {
        fs.mkdirSync(this.scenarioLogDir, { recursive: true });
      }

      // Copy current log content to failure log
      if (this.logFilePath && fs.existsSync(this.logFilePath)) {
        const logContent = fs.readFileSync(this.logFilePath, 'utf-8');
        fs.writeFileSync(failureLogPath, logContent);
        this.info(`📝 Failure log captured: ${failureLogPath}`);
      } else {
        // Create a minimal failure log even if original log doesn't exist
        const minimalLog = `
${'='.repeat(80)}
TEST FAILURE LOG
${'='.repeat(80)}
Test Case: ${this.tcNumber}
Scenario: ${this.scenarioName}
Failure Time: ${new Date().toISOString()}
${'='.repeat(80)}
Note: Original log file was not found at: ${this.logFilePath}
`;
        fs.writeFileSync(failureLogPath, minimalLog);
        this.info(`📝 Minimal failure log created: ${failureLogPath}`);
      }
    } catch (error) {
      this.warning(`Failed to capture failure log: ${error}`);
    }
  }

  /**
   * Capture and move video for failed test to playwright-report/data folder
   */
  async captureFailureVideo(): Promise<void> {
    if (!this.testInfo || !this.scenarioName || !this.tcNumber) return;

    try {
      // Wait for video to be saved
      await this.page.waitForTimeout(1000);

      // Get video path from testInfo
      const video = this.page.video();
      if (!video) {
        this.warning('No video recording available for failed test');
        return;
      }

      const videoPath = await video.path();
      
      if (!videoPath || !fs.existsSync(videoPath)) {
        this.warning('Video file not found');
        return;
      }

      // Create destination folder: playwright-report/data/{scenarioName_ddmmyyyy_HHMMSS_TCnumber}
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const dateFolder = `${day}${month}${year}`;
      const timeStamp = `${hours}${minutes}${seconds}`;
      const sanitizedScenarioName = this.scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
      
      const videoFolderName = `${sanitizedScenarioName}_${dateFolder}_${timeStamp}_${this.tcNumber}`;
      const videoDestDir = path.join('playwright-report', 'data', videoFolderName);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(videoDestDir)) {
        fs.mkdirSync(videoDestDir, { recursive: true });
      }

      // Copy video to destination
      const videoFileName = `${this.tcNumber}_FAILED.webm`;
      const videoDestPath = path.join(videoDestDir, videoFileName);
      
      fs.copyFileSync(videoPath, videoDestPath);
      
      this.info(`🎥 Failure video captured: ${videoDestPath}`);
    } catch (error) {
      this.warning(`Failed to capture failure video: ${error}`);
    }
  }

  /**
   * Capture success screenshot for the test
   */
  async captureSuccessScreenshot(): Promise<string | null> {
    if (!this.scenarioName) {
      this.warning('Cannot capture success screenshot without scenario name');
      return null;
    }

    try {
      const sanitizedTestName = this.testName.replace(/[^a-zA-Z0-9]/g, '_');
      return await this.captureScreenshot(`success_${sanitizedTestName}`);
    } catch (error) {
      this.warning(`Failed to capture success screenshot: ${error}`);
      return null;
    }
  }

  /**
   * Log page navigation
   */
  async logNavigation(url: string): Promise<void> {
    const currentUrl = this.page.url();
    this.info(`🔗 Navigating from: ${currentUrl}`);
    this.info(`🔗 Navigating to: ${url}`);
  }

  /**
   * Log assertion
   */
  logAssertion(description: string, passed: boolean): void {
    if (passed) {
      this.success(`✓ Assertion passed: ${description}`);
    } else {
      this.error(`✗ Assertion failed: ${description}`);
    }
  }

  /**
   * Log action
   */
  logAction(action: string, target: string): void {
    this.info(`🎯 Action: ${action} on "${target}"`);
  }

  /**
   * Log timing information
   */
  logTiming(operation: string, durationMs: number): void {
    this.info(
      `${this.icons.time} ${operation} completed in ${durationMs}ms (${(durationMs / 1000).toFixed(2)}s)`
    );
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName: string): () => void {
    const startTime = Date.now();
    this.info(`${this.icons.time} Starting: ${operationName}`);

    // Return a function to stop the timer
    return () => {
      const duration = Date.now() - startTime;
      this.logTiming(operationName, duration);
    };
  }

  /**
   * Log test data
   */
  logTestData(description: string, data: any): void {
    this.info(`📊 Test Data - ${description}:`);
    this.debug(JSON.stringify(data, null, 2));
  }

  /**
   * Log API request/response
   */
  logApiCall(method: string, url: string, status?: number, response?: any): void {
    this.info(`🌐 API ${method}: ${url}`);
    if (status) {
      const statusColor = status >= 200 && status < 300 ? this.colors.green : this.colors.red;
      if (this.options.enableConsoleLogging) {
        console.log(`${statusColor}   Status: ${status}${this.colors.reset}`);
      }
      this.writeToFile(`   Status: ${status}`);
    }
    if (response) {
      this.debug('Response:', response);
    }
  }

  /**
   * Log test completion summary
   */
  async logTestSummary(passed: boolean, duration?: number): Promise<void> {
    this.separator('TEST SUMMARY');

    if (passed) {
      this.success(`Test "${this.testName}" PASSED`);
    } else {
      await this.error(`Test "${this.testName}" FAILED`);
    }

    if (duration) {
      this.logTiming('Total test execution', duration);
    }

    if (this.logFilePath) {
      this.info(`📝 Full log available at: ${this.logFilePath}`);
    }

    this.separator();
  }

  /**
   * Create child logger for sub-operations
   */
  createChildLogger(childName: string): Logger {
    const childLogger = new Logger(
      this.page,
      `${this.testName} > ${childName}`,
      this.testInfo,
      this.options
    );
    childLogger.stepCounter = this.stepCounter;
    return childLogger;
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string | undefined {
    return this.logFilePath;
  }

  /**
   * Get current page URL for context
   */
  async logCurrentContext(): Promise<void> {
    const url = this.page.url();
    const title = await this.page.title();
    this.info(`📍 Current Page: ${title}`);
    this.info(`🔗 URL: ${url}`);
  }

  /**
   * Log with custom icon
   */
  custom(icon: string, message: string, data?: any): void {
    if (this.options.enableConsoleLogging) {
      console.log(`${icon} ${message}`);
      if (data) {
        console.log(`${this.colors.dim}${JSON.stringify(data, null, 2)}${this.colors.reset}`);
      }
    }
    this.writeToFile(`${message}`);
    if (data) {
      this.writeToFile(`Data: ${JSON.stringify(data, null, 2)}`);
    }
  }
}

/**
 * Factory function to create logger instance
 */
export function createLogger(
  page: Page,
  testName: string,
  testInfo?: TestInfo,
  options?: LoggerOptions
): Logger {
  return new Logger(page, testName, testInfo, options);
}

/**
 * Utility to configure video recording path
 */
export function getVideoPath(testName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedName = testName.replace(/[^a-zA-Z0-9]/g, '_');
  return `test-results/videos/${sanitizedName}_${timestamp}.webm`;
}
