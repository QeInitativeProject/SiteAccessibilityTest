# ATI Proctored Assessment UI Automation — How the Agents Work

## What is this system?

Think of it like an **assembly line** for writing and fixing automated tests.
Instead of one person doing everything, there are 5 specialized workers (agents),
each doing one job really well. A manager (the Orchestrator) decides who works
next and makes sure nothing is skipped.

---

## The Manager — Orchestrator

**Job**: Traffic controller. Decides which agent to call, when, and what to give them.
It follows a fixed flow and never lets you skip steps.

You talk to the Orchestrator. It does the rest.

> **Live progress messages**: Every time the Orchestrator moves to a new phase, it prints a message in the chat so you always know which agent is working and what it is doing.
>
> Example:
> ```
> ⏳ PHASE 3 — EXECUTE · Stg_Proctor_Scramble
>    Agent:   test-executor
>    Doing:   Running headed then headless tests
> ```

---

## The 5 Workers

---

### Worker 1 — test-planner
**Simple job**: "Tell me WHAT to test"

You hand it a scenario like "we need to test scramble validation."
The planner gives back a full game plan:

- Serial TC breakdown (Batch → Faculty → Student 1 → Student 2 → Validation)
- Browser context plan (which pages for faculty vs students)
- Environment variables needed
- Existing delegates/utilities to reuse
- What new utility class might be needed

**It does NOT write any code.** It just plans.

---

### Worker 2 — test-implementor
**Simple job**: "Write the actual test code"

Takes the plan and produces:

| File | What it is |
|------|-----------|
| **Spec file** | The test — serial TCs orchestrating the full proctored flow |
| **Utility class** (if needed) | Reusable logic for the scenario (e.g., ScrambleUtil, CheatEventUtility) |

Rules it strictly follows:
- **NO inline function definitions in spec files** — all logic lives in Utils/Delegates
- Logger integration in every TC
- try/catch error handling
- Path aliases for all imports

---

### Worker 3 — test-reviewer
**Simple job**: "Check the work and diagnose problems"

**Hat 1 — Quality Inspector** (after implementor)
Checks against 10 rules:
- No inline functions in spec?
- Logger + try/catch in every TC?
- Serial execution for state flows?
- Path aliases used?
- Tab cleanup in afterAll?

**Hat 2 — Doctor** (after a test fails)
Reads the error, stack trace, and screenshot.
Classifies to one of 10 root causes (RC-01 through RC-10).
Gives a precise prescription.

**It never changes code itself.** It only reads and advises.

---

### Worker 4 — test-executor
**Simple job**: "Run the tests and tell me what broke"

Runs tests in this order:
1. TypeScript compile check
2. Headed (visible browser)
3. Headless (how CI runs it)

Collects: error messages, Logger output, screenshots, URLs, timing data.

**It does not fix anything.** It runs and reports.

---

### Worker 5 — test-healer
**Simple job**: "Apply the fix the reviewer prescribed"

Takes the prescription and makes the smallest possible code change.
Rules:
- Fix utility/delegate first, then spec if needed
- Never add inline functions to spec
- Always validate (headed + headless must pass)
- Max 3 attempts before escalating

---

## The Full Flow

```
You give a scenario/requirement
        ↓
test-planner writes the test plan
        ↓
You approve the plan
        ↓
test-implementor writes spec + utilities
        ↓
test-reviewer checks quality (10 checks)
    ↓ blocked?          ↓ approved?
test-healer fixes    test-executor runs tests
    ↓                       ↓ fails?        ↓ passes?
re-check quality     test-reviewer       DONE — CI ready
                     diagnoses
                          ↓
                     test-healer fixes
                          ↓
                     test-executor re-runs
                          ↓ still fails after 3 tries?
                     ESCALATE → human reviews
```

---

## The 10 Quality Checks

| # | Check | Severity | What it means |
|---|-------|----------|---------------|
| C1 | No inline functions in spec | 🔴 Critical | All logic must be in Utils/Delegates |
| C2 | Logger + try/catch in every TC | 🔴 Critical | Error capture and debugging |
| C3 | test.describe.serial() used | 🔴 Critical | State-dependent flows require serial |
| C4 | Path aliases (@delegates/, @utils/, @locators/) | 🟠 High | Consistent imports |
| C5 | setLogger() on all instances | 🟠 High | Logging works across all classes |
| C6 | beforeAll/afterAll lifecycle | 🟠 High | Proper setup and cleanup |
| C7 | afterEach screenshot on failure | 🟠 High | Debugging artifacts |
| C8 | No hardcoded credentials | 🟠 High | All from process.env |
| C9 | Tab isClosed() check | 🟡 Medium | Safe cleanup |
| C10 | Logger separator at TC start | 🟡 Medium | Readable output |

---

## Root Cause Categories

| RC | Problem | Healable? |
|----|---------|-----------|
| RC-01 | Timing too short | ✅ |
| RC-02 | Selector not found | ✅ |
| RC-03 | Tab/context closed | ✅ |
| RC-04 | Proctor sync issue | ✅ |
| RC-05 | Env variable missing | ⚠️ Config |
| RC-06 | App bug (real failure) | ❌ Escalate |
| RC-07 | iframe not loaded | ✅ |
| RC-08 | Dialog/popup blocking | ✅ |
| RC-09 | TypeScript compile error | ✅ |
| RC-10 | CI-only network/timeout | ✅ |

---

## Files in This System

| File | What it is |
|------|-----------|
| `.claude/agents/orchestrator.agent.md` | The manager — routing rules and phase definitions |
| `.claude/agents/test-planner.agent.md` | Planning agent instructions |
| `.claude/agents/test-implementor.agent.md` | Code writing agent instructions |
| `.claude/agents/test-reviewer.agent.md` | Quality check + diagnosis agent instructions |
| `.claude/agents/test-executor.agent.md` | Test runner agent instructions |
| `.claude/agents/test-healer.agent.md` | Fix applier agent instructions |
| `docs/AGENTS_GUIDE.md` | This file — explains how the system works |
| `docs/CODEBASE_ISSUES.md` | Known issues register — reviewer checks against this |

---

## Project-Specific Context

### Architecture (Delegate/Utility Pattern)
Unlike traditional Page Object Model, this project uses:
- **Delegates** (`src/main/Delegates/`) — Page-level classes (LoginPage, MyATIPage, FACHomePage)
- **Utilities** (`src/main/Utils/`) — Workflow-level classes (ProctorUtility, BatchCreation, CheatEventUtility)
- **Locators** (`src/main/Locator_Store/`) — Centralized element locators

### Test Flow Pattern (Proctored Assessments)
Every proctored test follows this serial structure:
1. **TC1**: Create MU Batch (BatchCreation utility)
2. **TC2**: Faculty login → navigate to proctor → enter batch → start proctoring
3. **TC3+**: Student login → enter batch ID → attestation → faculty approval → start test
4. **TC-N**: Validation (assertions on captured data)

### Environment Management
- `$env:ENV="stage"` sets the environment before running
- `playwright.config.ts` loads `src/ENV/.env.${ENV}` via dotenv
- All credentials come from environment variables
