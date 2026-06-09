import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

class CIReporter implements Reporter {
  private totalTests = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private timedOut = 0;
  private startTime = 0;
  private failedTests: { title: string; file: string; error: string; duration: number }[] = [];
  private passedTests: { title: string; duration: number }[] = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                        CI/CD TEST EXECUTION STARTED                         ║');
    console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Environment  : ${(process.env.ENV || 'stage').padEnd(58)}║`);
    console.log(`║  Total Tests  : ${String(this.totalTests).padEnd(58)}║`);
    console.log(`║  Workers      : ${String(config.workers).padEnd(58)}║`);
    console.log(`║  Retries      : ${String(config.projects[0]?.retries ?? 0).padEnd(58)}║`);
    console.log(`║  Start Time   : ${new Date().toISOString().padEnd(58)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const durationStr = this.formatDuration(duration);
    const status = result.status;

    if (status === 'passed') {
      this.passed++;
      this.passedTests.push({ title: test.title, duration });
      console.log(`  ✅ PASS | ${durationStr} | ${test.title}`);
    } else if (status === 'failed') {
      this.failed++;
      const errorMsg = result.errors?.[0]?.message?.split('\n')[0] || 'Unknown error';
      this.failedTests.push({
        title: test.title,
        file: test.location.file.replace(/.*[/\\]/, ''),
        error: errorMsg.substring(0, 120),
        duration,
      });
      console.log(`  ❌ FAIL | ${durationStr} | ${test.title}`);
    } else if (status === 'timedOut') {
      this.timedOut++;
      this.failedTests.push({
        title: test.title,
        file: test.location.file.replace(/.*[/\\]/, ''),
        error: 'Test timed out',
        duration,
      });
      console.log(`  ⏱️  TIMEOUT | ${durationStr} | ${test.title}`);
    } else if (status === 'skipped') {
      this.skipped++;
      console.log(`  ⏭️  SKIP | ${durationStr} | ${test.title}`);
    }
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const passRate = this.totalTests > 0 ? ((this.passed / this.totalTests) * 100).toFixed(1) : '0';

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                       CI/CD TEST EXECUTION SUMMARY                          ║');
    console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Status       : ${result.status.toUpperCase().padEnd(58)}║`);
    console.log(`║  Duration     : ${this.formatDuration(totalDuration).padEnd(58)}║`);
    console.log(`║  End Time     : ${new Date().toISOString().padEnd(58)}║`);
    console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Total        : ${String(this.totalTests).padEnd(58)}║`);
    console.log(`║  ✅ Passed     : ${String(this.passed).padEnd(58)}║`);
    console.log(`║  ❌ Failed     : ${String(this.failed).padEnd(58)}║`);
    console.log(`║  ⏱️  Timed Out  : ${String(this.timedOut).padEnd(57)}║`);
    console.log(`║  ⏭️  Skipped   : ${String(this.skipped).padEnd(58)}║`);
    console.log(`║  Pass Rate    : ${(passRate + '%').padEnd(58)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

    if (this.failedTests.length > 0) {
      console.log('\n');
      console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
      console.log('│                            FAILED TEST DETAILS                                │');
      console.log('├──────────────────────────────────────────────────────────────────────────────┤');
      this.failedTests.forEach((t, i) => {
        console.log(`│  ${i + 1}. ${t.title}`);
        console.log(`│     File    : ${t.file}`);
        console.log(`│     Duration: ${this.formatDuration(t.duration)}`);
        console.log(`│     Error   : ${t.error}`);
        console.log('│');
      });
      console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    }

    if (this.passedTests.length > 0) {
      console.log('\n');
      console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
      console.log('│                            PASSED TEST DETAILS                                │');
      console.log('├──────────────────────────────────────────────────────────────────────────────┤');
      this.passedTests.forEach((t, i) => {
        console.log(`│  ${i + 1}. ${t.title} (${this.formatDuration(t.duration)})`);
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
