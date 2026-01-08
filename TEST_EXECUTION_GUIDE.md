# Test Execution Guide

## Overview
This guide provides optimized short commands to run tests with automatic test-results cleanup. All commands automatically clear the `test-results` folder before execution to prevent file locking issues.

---

## Quick Start

### Individual Test Cases (Smoke)

```bash
# Run specific smoke tests (headed mode by default)
npm run smoke:reader-off    # PracticeTest_ReaderOff.spec.ts
npm run smoke:reader-on     # PracticeTest_ReaderOn.spec.ts
npm run smoke:proctor       # Proctor.spec.ts
```

### Individual Test Cases (Regression)

```bash
# Run specific regression tests (headed mode by default)
npm run regression:0        # 0_Percent.spec.ts
npm run regression:25       # 25_Percent.spec.ts
npm run regression:50       # 50_Percent.spec.ts
npm run regression:75       # 75_Percent.spec.ts
npm run regression:100      # 100_Percent.spec.ts
```

### Suite-Level Execution

```bash
# Run entire smoke suite
npm run smoke               # All smoke tests (headless)
npm run smoke:headed        # All smoke tests (headed)
npm run smoke:ui            # All smoke tests (UI mode)
npm run smoke:debug         # All smoke tests (debug mode)

# Run entire regression suite
npm run regression          # All regression tests (headless)
npm run regression:headed   # All regression tests (headed)
npm run regression:ui       # All regression tests (UI mode)
npm run regression:debug    # All regression tests (debug mode)
```

### Parallel Execution

```bash
# Smoke tests with different worker counts
npm run smoke:workers1      # 1 worker (sequential)
npm run smoke:workers2      # 2 workers (parallel)
npm run smoke:workers4      # 4 workers (parallel)

# Regression tests with different worker counts
npm run regression:workers1 # 1 worker (sequential)
npm run regression:workers2 # 2 workers (parallel)
npm run regression:workers4 # 4 workers (parallel)
```

---

## All Available Commands

### General Commands

| Command | Description |
|---------|-------------|
| `npm run clean` | Manually clear test-results folder |
| `npm test` | Run all tests (auto-clear enabled) |
| `npm run test:headed` | Run all tests in headed mode |
| `npm run test:ui` | Run all tests in UI mode |
| `npm run test:debug` | Run all tests in debug mode |
| `npm run report` | Open last HTML report |
| `npm run type-check` | TypeScript type checking |

### Smoke Test Commands

| Command | Description | Path |
|---------|-------------|------|
| `npm run smoke` | All smoke tests (headless) | `Smoke/` |
| `npm run smoke:headed` | All smoke tests (headed) | `Smoke/` |
| `npm run smoke:ui` | All smoke tests (UI mode) | `Smoke/` |
| `npm run smoke:debug` | All smoke tests (debug) | `Smoke/` |
| `npm run smoke:workers1` | Smoke tests (1 worker) | `Smoke/` |
| `npm run smoke:workers2` | Smoke tests (2 workers) | `Smoke/` |
| `npm run smoke:workers4` | Smoke tests (4 workers) | `Smoke/` |
| **Individual Tests:** | | |
| `npm run smoke:reader-off` | PracticeTest ReaderOff | `Smoke/PracticeTest_ReaderOff.spec.ts` |
| `npm run smoke:reader-on` | PracticeTest ReaderOn | `Smoke/PracticeTest_ReaderOn.spec.ts` |
| `npm run smoke:proctor` | Proctor test | `Smoke/Proctor.spec.ts` |

### Regression Test Commands

| Command | Description | Path |
|---------|-------------|------|
| `npm run regression` | All regression tests (headless) | `Regression/` |
| `npm run regression:headed` | All regression tests (headed) | `Regression/` |
| `npm run regression:ui` | All regression tests (UI mode) | `Regression/` |
| `npm run regression:debug` | All regression tests (debug) | `Regression/` |
| `npm run regression:workers1` | Regression tests (1 worker) | `Regression/` |
| `npm run regression:workers2` | Regression tests (2 workers) | `Regression/` |
| `npm run regression:workers4` | Regression tests (4 workers) | `Regression/` |
| **Individual Tests:** | | |
| `npm run regression:0` | 0% scoring test | `Regression/Scoring/0_Percent.spec.ts` |
| `npm run regression:25` | 25% scoring test | `Regression/Scoring/25_Percent.spec.ts` |
| `npm run regression:50` | 50% scoring test | `Regression/Scoring/50_Percent.spec.ts` |
| `npm run regression:75` | 75% scoring test | `Regression/Scoring/75_Percent.spec.ts` |
| `npm run regression:100` | 100% scoring test | `Regression/Scoring/100_Percent.spec.ts` |

### Proctor Test Commands

| Command | Description |
|---------|-------------|
| `npm run proctor` | Proctor test (headless) |
| `npm run proctor:headed` | Proctor test (headed) |
| `npm run proctor:debug` | Proctor test (debug) |

---

## Auto-Clear Feature

### How It Works

Every test command automatically clears the `test-results` folder before execution. This happens at **two levels**:

#### Level 1: NPM Script Level
All npm test commands include `npm run clean &&` which clears test-results before running tests.

#### Level 2: Global Setup Level
The `global-setup.ts` file also clears test-results as a safety mechanism, even if you run tests directly with `npx playwright test`.

### Benefits

✅ **No manual cleanup needed** - Always starts with clean state  
✅ **Prevents file locking errors** - No EPERM or EBUSY issues  
✅ **Works uniformly** - Individual files, suites, any execution method  
✅ **Double safety** - Both npm script + global-setup clear test-results  

---

## Examples

### Example 1: Run Single Test
```bash
# Old way (long command)
npx playwright test src/test/TestScript/Smoke/PracticeTest_ReaderOn.spec.ts --headed

# New way (optimized)
npm run smoke:reader-on
```

### Example 2: Run Multiple Tests Sequentially
```bash
# Run tests one after another
npm run smoke:reader-off
npm run smoke:reader-on
npm run smoke:proctor

# No need to manually clear test-results between runs!
```

### Example 3: Run Entire Suite
```bash
# Run all smoke tests
npm run smoke:headed

# Run all regression tests
npm run regression:headed
```

### Example 4: Parallel Execution
```bash
# Run all smoke tests with 4 workers
npm run smoke:workers4

# Run all regression tests with 2 workers
npm run regression:workers2
```

### Example 5: Debug a Test
```bash
# Debug specific test
npm run smoke:proctor

# Then use debug mode
npm run proctor:debug
```

---

## Direct Playwright Commands

If you prefer using `npx playwright test` directly, the auto-clear still works via `global-setup.ts`:

```bash
# These also auto-clear test-results
npx playwright test Smoke/PracticeTest_ReaderOn.spec.ts --headed
npx playwright test Regression/Scoring/50_Percent.spec.ts --debug
npx playwright test --ui
```

---

## Test Results Location

After test execution, results are stored in:

```
test-results/
├── logs/
│   └── {ScenarioName}_{DDMMYYYY}_{HHMMSS}/
│       ├── TC1.log
│       ├── TC2.log
│       └── TC3.log
├── success-screenshots/
│   └── {ScenarioName}_{DDMMYYYY}_{HHMMSS}/
│       └── screenshots.png
└── Failed_screenshots/
    └── {ScenarioName}_{DDMMYYYY}_{HHMMSS}/
        └── failure_screenshots.png

playwright-report/
└── index.html  # HTML test report
```

---

## Viewing Reports

```bash
# Open last HTML report in browser
npm run report

# Or manually open
start playwright-report/index.html
```

---

## Configuration

### Environment Variables

Set environment before running tests:

```bash
# Windows PowerShell
$env:ENV="stage"
npm run smoke:headed

# Windows CMD
set ENV=stage
npm run smoke:headed

# Default is 'stage' if not specified
```

### Worker Configuration

Default workers are set in `playwright.config.ts`:
- **Local**: 1 worker (sequential)
- **CI**: 4 workers (parallel)

Override with worker commands:
```bash
npm run smoke:workers2    # Force 2 workers
npm run smoke:workers4    # Force 4 workers
```

---

## Troubleshooting

### Issue: Test won't run with existing test-results folder
**Solution**: ✅ Fixed - Auto-clear now runs before every test

### Issue: EPERM errors when running tests
**Solution**: ✅ Fixed - test-results folder is cleared automatically

### Issue: Need to manually delete test-results
**Solution**: ✅ Fixed - Use `npm run clean` or let auto-clear handle it

### Issue: Want to run test without clearing results
**Solution**: Use direct playwright command and disable global-setup:
```bash
npx playwright test --config playwright.config.ts --global-timeout=0
```

---

## Best Practices

1. ✅ **Use npm scripts** instead of long playwright commands
2. ✅ **Run tests individually** during development using shorthand commands
3. ✅ **Run full suites** before committing code
4. ✅ **Use workers** for faster parallel execution
5. ✅ **Check reports** after test execution using `npm run report`
6. ✅ **Use debug mode** when troubleshooting: `npm run smoke:debug`

---

## Summary

| Task | Command | Auto-Clear |
|------|---------|------------|
| Single smoke test | `npm run smoke:reader-on` | ✅ Yes |
| Single regression test | `npm run regression:50` | ✅ Yes |
| All smoke tests | `npm run smoke:headed` | ✅ Yes |
| All regression tests | `npm run regression:headed` | ✅ Yes |
| Parallel execution | `npm run smoke:workers4` | ✅ Yes |
| Debug mode | `npm run proctor:debug` | ✅ Yes |
| Direct playwright | `npx playwright test ...` | ✅ Yes (via global-setup) |

---

## Quick Reference Card

```bash
# SMOKE TESTS
npm run smoke:reader-off     # PracticeTest ReaderOff
npm run smoke:reader-on      # PracticeTest ReaderOn
npm run smoke:proctor        # Proctor test

# REGRESSION TESTS
npm run regression:0         # 0% scoring
npm run regression:25        # 25% scoring
npm run regression:50        # 50% scoring
npm run regression:75        # 75% scoring
npm run regression:100       # 100% scoring

# SUITES
npm run smoke:headed         # All smoke (headed)
npm run regression:headed    # All regression (headed)

# UTILITIES
npm run clean               # Clear test-results manually
npm run report              # View HTML report
```

---

**Last Updated**: December 31, 2025  
**Version**: 1.0  
**Auto-Clear**: ✅ Enabled for all commands
