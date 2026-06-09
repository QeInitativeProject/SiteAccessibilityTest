import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

class CIReporter implements Reporter {
  private totalTests = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private timedOut = 0;
  private startTime = 0;
  private failedTests: { title: string; file: string; error: string; duration: number }[] = [];
  private passedTests: { title: string; file: string; duration: number }[] = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const status = result.status;

    if (status === 'passed') {
      this.passed++;
      this.passedTests.push({ title: test.title, file: test.location.file.replace(/.*[/\\]/, ''), duration });
    } else if (status === 'failed') {
      this.failed++;
      const errorMsg = result.errors?.[0]?.message?.split('\n')[0] || 'Unknown error';
      this.failedTests.push({
        title: test.title,
        file: test.location.file.replace(/.*[/\\]/, ''),
        error: errorMsg.substring(0, 120),
        duration,
      });
    } else if (status === 'timedOut') {
      this.timedOut++;
      this.failedTests.push({
        title: test.title,
        file: test.location.file.replace(/.*[/\\]/, ''),
        error: 'Test timed out',
        duration,
      });
    } else if (status === 'skipped') {
      this.skipped++;
    }
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                       CI/CD TEST EXECUTION SUMMARY                          ║');
    console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Status: ${result.status.toUpperCase()}  |  Total: ${this.totalTests}  |  Passed: ${this.passed}  |  Failed: ${this.failed}  |  Duration: ${this.formatDuration(totalDuration)}`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

    if (this.failedTests.length > 0) {
      console.log('\n┌──────────────────────────────────────────────────────────────────────────────┐');
      console.log('│                            FAILED TEST DETAILS                                │');
      console.log('├──────────────────────────────────────────────────────────────────────────────┤');
      this.failedTests.forEach((t, i) => {
        console.log(`│  ${i + 1}. ${t.title}`);
        console.log(`│     File: ${t.file}  |  Duration: ${this.formatDuration(t.duration)}`);
        console.log(`│     Error: ${t.error}`);
        console.log('│');
      });
      console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    }

    if (this.passedTests.length > 0) {
      const passedFiles = [...new Set(this.passedTests.map(t => t.file))];
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
