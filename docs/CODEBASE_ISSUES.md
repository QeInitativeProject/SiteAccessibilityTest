# ATI Proctored Assessment UI Automation — Codebase Issues Register

> Last audited: 2026-07-01  
> Scope: `src/test/TestScript/`, `src/main/Delegates/`, `src/main/Utils/`, `src/main/Locator_Store/`  
> Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## How to Use This File

Every new or healed script **must be reviewed against all items in this register** before it is marked CI-ready or before an MR is raised.  
The `test-reviewer` agent uses this file as its authoritative best-practices checklist.

---

## ISSUE-01 · Inline Function Definitions in Spec Files
**Severity**: 🔴 Critical  
**Category**: Code Organization  
**Rule**: Spec files (`*.spec.ts`) must NEVER define inline functions (`const fn = async () => {...}`). All reusable logic lives in `src/main/Utils/` or `src/main/Delegates/`.

Spec files are pure test orchestration — they instantiate classes, call methods, and validate outcomes.

**Correct pattern** (spec calls utility):
```typescript
// In spec file — call utility method
const scrambleUtil = new ScrambleUtil(student1Tab);
scrambleUtil.setLogger(logger);
student1Snapshots = await scrambleUtil.captureQuestionSequence(s1Locators, QUESTIONS_TO_COMPARE);
```

**Incorrect pattern** (inline function in spec):
```typescript
// ❌ WRONG — function definition inside describe block
const captureQuestionSequence = async (page: Page, locators: StudentFacingPageLocators) => {
  // ... implementation ...
};
```

**Check command**:
```powershell
# Must return 0 results for spec files
Select-String -Path "src\test\TestScript\Regression\*.spec.ts" -Pattern "const\s+\w+\s*=\s*async"
```

---

## ISSUE-02 · Missing Logger Integration
**Severity**: 🔴 Critical  
**Category**: Observability  
**Rule**: Every test case (`test(...)` block) MUST:
1. Create a `Logger` instance
2. Call `setLogger()` on all delegate/utility instances
3. Wrap the body in try/catch with `logger.error()` on failure

**Correct pattern**:
```typescript
test('TC1: Batch creation', { tag: '@regression' }, async ({}, testInfo) => {
  logger = new Logger(page, 'TC1__Batch_Creation', testInfo, {
    scenarioName: SCENARIO_NAME, tcNumber: 'TC1'
  });
  assertions.setLogger(logger);
  logger.separator('TC1: BATCH CREATION');

  try {
    // ... test logic ...
    logger.success('TC1 PASS: ...');
  } catch (error: any) {
    await logger?.error('TC1 FAIL: ' + error.message, error);
    throw error;
  }
});
```

---

## ISSUE-03 · Non-Serial Execution for State-Dependent Flows
**Severity**: 🔴 Critical  
**Category**: Test Structure  
**Rule**: Proctored assessment flows where TCs depend on state from prior TCs MUST use `test.describe.serial()`. Using parallel execution will cause random failures.

**Check command**:
```powershell
# Proctored specs must have .serial
Select-String -Path "src\test\TestScript\Regression\Stg_Proctor_*.spec.ts" -Pattern "test\.describe\.serial"
```

---

## ISSUE-04 · Missing afterEach Screenshot Capture
**Severity**: 🟠 High  
**Category**: Debugging  
**Rule**: Every spec file must have `test.afterEach` that captures a screenshot when a test fails.

**Correct pattern**:
```typescript
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await logger?.captureScreenshot('test_failure');
  }
});
```

---

## ISSUE-05 · Missing afterAll Cleanup
**Severity**: 🟠 High  
**Category**: Resource Management  
**Rule**: Every spec that creates browser contexts/pages must clean them up in `test.afterAll`. Always check `!tab.isClosed()` before closing.

**Correct pattern**:
```typescript
test.afterAll(async () => {
  try {
    if (student1Tab && !student1Tab.isClosed()) await student1Tab.close();
    if (student1Context) await student1Context.close();
    if (context) await context.close();
    if (browser) await browser.close();
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
});
```

---

## ISSUE-06 · Hardcoded Credentials
**Severity**: 🟠 High  
**Category**: Security / Maintainability  
**Rule**: All credentials, URLs, and environment-specific values MUST come from `process.env`. Never hardcode usernames, passwords, or base URLs in spec or utility files.

**Correct pattern**:
```typescript
const STUDENT1_USERNAME = process.env.stuUsernameauto12;
const STUDENT1_PASSWORD = process.env.stuPasswordauto1;
```

**Check command**:
```powershell
# Should not find hardcoded passwords
Select-String -Path "src\test\TestScript\**\*.spec.ts" -Pattern "password.*=.*['\"](?!process)"
```

---

## ISSUE-07 · Relative Imports Instead of Path Aliases
**Severity**: 🟠 High  
**Category**: Maintainability  
**Rule**: All imports from `src/main/` must use path aliases (`@delegates/`, `@utils/`, `@locators/`). Relative imports (`../../main/...`) break when files move and are harder to read.

**Correct pattern**:
```typescript
import { LoginPage } from '@delegates/LoginPage';
import { ProctorUtility } from '@utils/Proctorutillity';
import { StudentFacingPageLocators } from '@locators/StudentFacing_Page_Locators';
```

**Incorrect pattern**:
```typescript
// ❌ WRONG
import { LoginPage } from '../../main/Delegates/LoginPage';
```

---

## ISSUE-08 · Missing setLogger() Calls
**Severity**: 🟠 High  
**Category**: Observability  
**Rule**: Every delegate or utility instance used in a TC must have `setLogger()` called before use. Without this, internal logging is silent and debugging is impossible.

**Check**: In each TC, after creating a Logger, every instance should have:
```typescript
atiLoginPage.setLogger(logger);
facHomePage.setLogger(logger);
proctorUtil.setLogger(logger);
assertions.setLogger(logger);
```

---

## ISSUE-09 · Missing blockUI Overlay Handling
**Severity**: 🟡 Medium  
**Category**: Reliability  
**Rule**: Before interacting with elements on the student-facing page, always dismiss the blockUI overlay:

```typescript
await page.locator('.blockUI.blockOverlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
```

This overlay appears during page transitions and blocks all interactions until dismissed.

---

## ISSUE-10 · Insufficient Wait After Proctor Actions
**Severity**: 🟡 Medium  
**Category**: CI Reliability  
**Rule**: After proctor actions that trigger page state changes (startProctoring, approveByProctor, checkInStudents), add explicit waits:

```typescript
await proctorUtil.startProctoring();
await page.waitForLoadState('load');
await page.waitForTimeout(5000); // Allow proctor dashboard to update
```

Without these, subsequent actions (like student approval) may fail in CI due to slower rendering.

---

## ISSUE-11 · Tab Context Not Verified Before Operations
**Severity**: 🟡 Medium  
**Category**: Reliability  
**Rule**: Before performing operations on student tabs (especially in later TCs), verify the tab is still open:

```typescript
if (student1Tab && !student1Tab.isClosed()) {
  await student1Tab.bringToFront();
  // ... operations ...
}
```

Assessment tabs can close unexpectedly (cheat threshold reached, session expired).

---

## ISSUE-12 · Missing Dialog Handler
**Severity**: 🟡 Medium  
**Category**: Reliability  
**Rule**: Faculty and student pages should register dialog handlers in `beforeAll` to prevent unhandled dialog errors:

```typescript
page.on('dialog', async (dialog) => {
  logger?.info(`Dialog ${dialog.type()} dismissed: ${dialog.message()}`);
  await dialog.dismiss();
});
```

---

## ISSUE-13 · Inconsistent Spec File Naming
**Severity**: 🟢 Low  
**Category**: Convention  
**Rule**: Spec files follow the naming pattern: `Stg_<Category>_<Feature>.spec.ts`

Categories:
- `Proctor_` — Proctored assessment flows
- `Practice_` — Practice test flows
- `CE_` — Cheat event specific
- `Multi_` — Multi-select/multi-assessment
- `RegressionCases` — General regression

---

## ISSUE-14 · Missing Scenario Name Constant
**Severity**: 🟢 Low  
**Category**: Convention  
**Rule**: Every spec file should define a `SCENARIO_NAME` constant used by Logger for folder organization:

```typescript
const SCENARIO_NAME = 'Stg_Proctor_Scramble';
```

This ensures log artifacts are organized by scenario in the test-results directory.
