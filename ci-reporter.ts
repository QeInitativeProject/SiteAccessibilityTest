import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

interface TestEntry {
  title: string;
  file: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  error?: string;
  duration: number;
}

class CIReporter implements Reporter {
  private totalTests = 0;
  private startTime = 0;
  private testResults = new Map<string, TestEntry>();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testId = test.id;
    const file = test.location.file.replace(/.*[/\\]/, '');
    const entry: TestEntry = {
      title: test.title,
      file,
      status: result.status as TestEntry['status'],
      duration: result.duration,
    };

    if (result.status === 'failed' || result.status === 'timedOut') {
      const errorMsg = result.status === 'timedOut'
        ? 'Test timed out'
        : (result.errors?.[0]?.message?.split('\n')[0] || 'Unknown error').substring(0, 120);
      entry.error = errorMsg;
    }

    // Always overwrite — last attempt is the final result
    this.testResults.set(testId, entry);
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;

    // Compute final counts from deduplicated results
    const allResults = [...this.testResults.values()];
    const passed = allResults.filter(t => t.status === 'passed').length;
    const failed = allResults.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
    const skipped = allResults.filter(t => t.status === 'skipped').length;
    const failedTests = allResults.filter(t => t.status === 'failed' || t.status === 'timedOut');
    const passedTests = allResults.filter(t => t.status === 'passed');

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                       CI/CD TEST EXECUTION SUMMARY                          ║');
    console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Status: ${result.status.toUpperCase()}  |  Total: ${this.totalTests}  |  Passed: ${passed}  |  Failed: ${failed}  |  Skipped: ${skipped}  |  Duration: ${this.formatDuration(totalDuration)}`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

    if (failedTests.length > 0) {
      console.log('\n┌──────────────────────────────────────────────────────────────────────────────┐');
      console.log('│                            FAILED TEST DETAILS                                │');
      console.log('├──────────────────────────────────────────────────────────────────────────────┤');
      failedTests.forEach((t, i) => {
        console.log(`│  ${i + 1}. ${t.title}`);
        console.log(`│     File: ${t.file}  |  Duration: ${this.formatDuration(t.duration)}`);
        console.log(`│     Error: ${t.error}`);
        console.log('│');
      });
      console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    }

    if (passedTests.length > 0) {
      const passedFiles = [...new Set(passedTests.map(t => t.file))];
      console.log('\n┌──────────────────────────────────────────────────────────────────────────────┐');
      console.log('│                            PASSED SPEC FILES                                  │');
      console.log('├──────────────────────────────────────────────────────────────────────────────┤');
      passedFiles.forEach((file, i) => {
        console.log(`│  ${i + 1}. ${file}`);
      });
      console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    }

    console.log('\n');
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }
}

export default CIReporter;
