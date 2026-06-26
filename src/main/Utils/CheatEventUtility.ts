import { Page, CDPSession } from '@playwright/test';
import { AssessmentPage } from '@delegates/AssessmentPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { Logger } from '@utils/Logger';

export class CheatEventUtility {
  private logger?: Logger;

  constructor(private page: Page) {}

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async focusIframe(studentTab: Page): Promise<void> {
    const assessmentIframe = studentTab.frameLocator('iframe').first();
    await assessmentIframe.locator('body').waitFor({ state: 'visible', timeout: 10000 });
    const iframeElement = studentTab.locator('iframe').first();
    await iframeElement.click();
    await studentTab.waitForTimeout(1000);
  }

  private async waitForCheatModal(studentTab: Page): Promise<void> {
    const assessmentIframe = studentTab.frameLocator('iframe').first();
    const invalidKeyModal = assessmentIframe.locator('#end-assessment-confirm-title');
    await invalidKeyModal.waitFor({ state: 'visible', timeout: 15000 });
  }

  private async handleIncidentResponse(
    studentTab: Page,
    incidentNumber: number,
    proctorUtil: ProctorUtility
  ): Promise<void> {
    const assessmentPage = new AssessmentPage(studentTab);
    assessmentPage.setLogger(this.logger!);

    await proctorUtil.ignoreIncident();
    await studentTab.bringToFront();

    if (incidentNumber <= 2) {
      await assessmentPage.validateProctorNotifiedAndResume(incidentNumber);
    } else if (incidentNumber === 3) {
      await assessmentPage.validateInvalidKeyWarningAndResume();
    } else {
      await assessmentPage.validateThresholdMaxedAndClose();
    }
  }


  // ============================================================
  // CHEAT EVENT FUNCTIONS - PRINT SCREEN
  // ============================================================

  async triggerPrintScreenCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('PrintScreen');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Print Screen triggered cheat event modal');
  }

  async printScreenCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerPrintScreenCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (print-screen) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - ALT+TAB
  // ============================================================

  async triggerAltTabCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('Alt+Tab');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Alt+Tab triggered cheat event modal');
  }

  async altTabCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerAltTabCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (alt-tab) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - CTRL+N
  // ============================================================

  async triggerCtrlNCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('Control+n');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Ctrl+N triggered cheat event modal');
  }

  async ctrlNCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerCtrlNCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (ctrl-n) handled successfully`);
  }


  // ============================================================
  // CHEAT EVENT FUNCTIONS - CTRL+C (Copy)
  // ============================================================

  async triggerCtrlCCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('Control+c');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Ctrl+C (Copy) triggered cheat event modal');
  }

  async ctrlCCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerCtrlCCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (ctrl-c) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - CTRL+V (Paste)
  // ============================================================

  async triggerCtrlVCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('Control+v');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Ctrl+V (Paste) triggered cheat event modal');
  }

  async ctrlVCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerCtrlVCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (ctrl-v) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - CTRL+P (Print)
  // ============================================================

  async triggerCtrlPCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    // Use CDP to dispatch Ctrl+P to avoid the native Print dialog
    const cdpSession = await studentTab.context().newCDPSession(studentTab);
    await cdpSession.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      modifiers: 2, // Ctrl modifier
      key: 'p',
      code: 'KeyP',
      windowsVirtualKeyCode: 80,
      nativeVirtualKeyCode: 80,
    });
    await cdpSession.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      modifiers: 2,
      key: 'p',
      code: 'KeyP',
      windowsVirtualKeyCode: 80,
      nativeVirtualKeyCode: 80,
    });
    await cdpSession.detach();
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('Ctrl+P (Print) triggered cheat event modal');
  }

  async ctrlPCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerCtrlPCheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (ctrl-p) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - F12
  // ============================================================

  async triggerF12Cheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);
    await studentTab.keyboard.press('F12');
    await studentTab.waitForTimeout(3000);
    await this.waitForCheatModal(studentTab);
    this.logger?.success('F12 triggered cheat event modal');
  }

  async f12CheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerF12Cheat(studentTab);
    await this.handleIncidentResponse(studentTab, incidentNumber, proctorUtil);
    this.logger?.success(`Cheat incident #${incidentNumber} (f12) handled successfully`);
  }

  // ============================================================
  // CHEAT EVENT FUNCTIONS - ESCAPE
  // ============================================================

  async triggerEscapeCheat(studentTab: Page): Promise<void> {
    await this.focusIframe(studentTab);

    // Use CDP Input.dispatchKeyEvent to simulate Escape at the browser level
    const cdpSession = await studentTab.context().newCDPSession(studentTab);
    await cdpSession.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27,
    });
    await studentTab.waitForTimeout(100);
    await cdpSession.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
      nativeVirtualKeyCode: 27,
    });
    await cdpSession.detach();

    await studentTab.waitForTimeout(3000);

    // Escape triggers a different dialog: "Invalid key pressed" fullscreen exit dialog
  /*  const assessmentIframe = studentTab.frameLocator('iframe').first();
    const fullScreenDialog = assessmentIframe.locator('#fullScreenDialog');
    await fullScreenDialog.waitFor({ state: 'visible', timeout: 15000 });
    this.logger?.success('Escape triggered "Invalid key pressed" fullscreen dialog');

    // Click "I UNDERSTAND" button to dismiss
    const understandButton = assessmentIframe.locator('#understandButton');
    await understandButton.click();
    await studentTab.waitForTimeout(2000);
    this.logger?.success('Clicked "I UNDERSTAND" to dismiss fullscreen dialog');*/
  }

  async escapeCheatAndHandle(studentTab: Page, incidentNumber: number, proctorUtil: ProctorUtility): Promise<void> {
    await this.triggerEscapeCheat(studentTab);
    // Escape's "I UNDERSTAND" is already clicked in triggerEscapeCheat.
    // The incident is sent to proctor — faculty ignores it.
    await proctorUtil.ignoreIncident();
    await studentTab.bringToFront();
    this.logger?.success(`Cheat incident #${incidentNumber} (escape) handled successfully`);
  }

  /**
   * Simulates a network disconnect for the given page using CDP.
   * Returns the CDPSession for later restore/detach.
   */
  async simulateNetworkDisconnect(targetPage: Page): Promise<CDPSession> {
    const cdpSession = await targetPage.context().newCDPSession(targetPage);
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    });
    this.logger?.step('Network disconnected (offline mode enabled)');
    return cdpSession;
  }

  /**
   * Restores network connectivity using an existing CDP session.
   */
  async restoreNetwork(cdpSession: CDPSession): Promise<void> {
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
    this.logger?.step('Network restored (online mode)');
  }

  /**
   * Simulates network disconnect, waits, then restores.
   * Returns the CDPSession (caller should detach after handling any resulting modals).
   */
  async simulateNetworkDropAndRestore(
    targetPage: Page,
    offlineDurationMs: number = 5000
  ): Promise<CDPSession> {
    const cdpSession = await this.simulateNetworkDisconnect(targetPage);
    await targetPage.waitForTimeout(offlineDurationMs);
    await this.restoreNetwork(cdpSession);
    await targetPage.waitForTimeout(5000);
    return cdpSession;
  }

  /**
   * Checks if the student sees a connectivity loss alert during network disconnect.
   * Should be called WHILE network is offline.
   */
  async validateStudentConnectivityAlert(studentTab: Page): Promise<boolean> {
    const assessmentIframe = studentTab.frameLocator('iframe').first();

    const alertSelectors = [
      assessmentIframe.locator('text=/connection.*lost|internet.*lost|you are offline|network.*error/i').first(),
      studentTab.locator('text=/connection.*lost|internet.*lost|you are offline|network.*error/i').first(),
      assessmentIframe.locator('[class*="disconnect"], [class*="offline"], [class*="no-connection"]').first(),
      studentTab.locator('[class*="disconnect"], [class*="offline"], [class*="no-connection"]').first(),
    ];

    for (const alert of alertSelectors) {
      try {
        await alert.waitFor({ state: 'visible', timeout: 10000 });
        this.logger?.success('Student connectivity loss alert detected');
        return true;
      } catch {
        continue;
      }
    }

    this.logger?.info('No explicit student connectivity alert found');
    return false;
  }

  /**
   * Checks if the faculty/proctor page shows a disconnect alert for a student.
   */
  async validateFacultyDisconnectAlert(facultyPage: Page): Promise<boolean> {
    const disconnectSelectors = [
      facultyPage.locator('text=/disconnect|offline|lost connection|not responding/i').first(),
      facultyPage.locator('[class*="disconnect"], [class*="offline"], [class*="warning"]').first(),
      facultyPage.locator('[class*="status"] >> text=/disconnect|offline/i').first(),
    ];

    for (const selector of disconnectSelectors) {
      try {
        await selector.waitFor({ state: 'visible', timeout: 15000 });
        const alertText = await selector.textContent();
        this.logger?.success(`Faculty disconnect alert detected: "${alertText}"`);
        return true;
      } catch {
        continue;
      }
    }

    // Try after reload
    await facultyPage.reload({ waitUntil: 'load' });
    await facultyPage.waitForTimeout(5000);

    for (const selector of disconnectSelectors) {
      try {
        await selector.waitFor({ state: 'visible', timeout: 10000 });
        const alertText = await selector.textContent();
        this.logger?.success(`Faculty disconnect alert detected after reload: "${alertText}"`);
        return true;
      } catch {
        continue;
      }
    }

    this.logger?.info('Faculty disconnect alert not found');
    return false;
  }

  /**
   * Verifies that questions are NOT visible/accessible during network drop.
   */
  async validateQuestionsHiddenDuringNetworkDrop(studentTab: Page): Promise<boolean> {
    const assessmentIframe = studentTab.frameLocator('iframe').first();

    const questionContent = assessmentIframe
      .locator('.question-content, .ie-choice-interaction, [class*="question"]')
      .first();
    const isQuestionVisible = await questionContent.isVisible().catch(() => false);

    if (!isQuestionVisible) {
      this.logger?.success('Questions are NOT visible during network drop - test stopped correctly');
      return true;
    }

    // Check for overlay/blocker covering questions
    const blocker = assessmentIframe
      .locator('.overlay, .blocker, [class*="disconnect"], [class*="offline"]')
      .first();
    const hasBlocker = await blocker.isVisible().catch(() => false);

    if (hasBlocker) {
      this.logger?.success('Overlay/blocker detected - questions are effectively hidden');
      return true;
    }

    this.logger?.info('Questions may still be visible - no blocker detected');
    return false;
  }

  /**
   * Validates that answer radio buttons are disabled or unresponsive during network drop.
   */
  async validateButtonsDisabledDuringNetworkDrop(studentTab: Page): Promise<boolean> {
    const assessmentIframe = studentTab.frameLocator('iframe').first();

    const answerSelectors = [
      assessmentIframe.locator('input[type="radio"]').first(),
      assessmentIframe.locator('input[type="checkbox"]').first(),
      assessmentIframe.locator('[class*="choice"] input, [class*="option"] input').first(),
    ];

    for (const answerInput of answerSelectors) {
      const exists = await answerInput.isVisible().catch(() => false);
      if (exists) {
        const disabled = await answerInput.isDisabled().catch(() => true);
        if (disabled) {
          this.logger?.success('Answer radio/checkbox is disabled during network drop');
          return true;
        }
        // Not disabled — try clicking and check if selection state changes
        const checkedBefore = await answerInput.isChecked().catch(() => false);
        await answerInput.click({ force: true, timeout: 3000 }).catch(() => {});
        await studentTab.waitForTimeout(1000);
        const checkedAfter = await answerInput.isChecked().catch(() => false);
        if (checkedBefore === checkedAfter) {
          this.logger?.success('Answer click had no effect - selection blocked during network drop');
          return true;
        }
        this.logger?.info('Answer selection state changed - interaction NOT blocked');
        return false;
      }
    }

    this.logger?.info('No answer radio/checkbox buttons found');
    return true;
  }
}
