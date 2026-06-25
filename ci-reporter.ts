/// <reference types="node" />
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestEntry {
  title: string;
  file: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  error?: string;
  duration: number;
  steps: number;
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
      steps: result.steps.length,
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

    // Generate HTML summary report for sharing
    this.generateHtmlReport(result, allResults, passed, failed, skipped, totalDuration);

    console.log('\n');
  }

  private generateHtmlReport(result: FullResult, allResults: TestEntry[], passed: number, failed: number, skipped: number, totalDuration: number) {
    const date = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const passRate = allResults.length > 0 ? ((passed / allResults.length) * 100).toFixed(1) : '0';
    const statusColor = failed === 0 ? '#22c55e' : '#ef4444';
    const statusText = failed === 0 ? 'ALL PASSED' : `${failed} FAILED`;

    // Group tests by spec file
    const specMap = new Map<string, TestEntry[]>();
    for (const t of allResults) {
      const list = specMap.get(t.file) || [];
      list.push(t);
      specMap.set(t.file, list);
    }

    // Build failed rows: Spec File | Test Case | Steps | Error
    const failedEntries: { file: string; title: string; steps: number; error: string }[] = [];
    const passedFileData: { file: string; testCount: number; totalSteps: number }[] = [];

    for (const [file, tests] of specMap) {
      const failures = tests.filter(t => t.status === 'failed' || t.status === 'timedOut');
      if (failures.length > 0) {
        for (const t of failures) {
          failedEntries.push({ file, title: t.title, steps: t.steps, error: t.error || '' });
        }
      } else if (tests.some(t => t.status === 'passed')) {
        const passedInFile = tests.filter(t => t.status === 'passed');
        passedFileData.push({ file, testCount: passedInFile.length, totalSteps: passedInFile.reduce((sum, t) => sum + t.steps, 0) });
      }
    }

    const totalSteps = allResults.reduce((sum, t) => sum + t.steps, 0);
    const totalSpecs = specMap.size;

    const failedRows = failedEntries
      .map((t, i) => `<tr><td>${i + 1}</td><td>${this.escapeHtml(t.file)}</td><td>${this.escapeHtml(t.title)}</td><td>${t.steps}</td><td class="error">${this.escapeHtml(t.error)}</td></tr>`)
      .join('\n');

    const passedRows = passedFileData
      .map((f, i) => `<tr><td>${i + 1}</td><td>${f.file}</td><td>${f.testCount}</td><td>${f.totalSteps}</td><td class="pass">PASSED</td></tr>`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Execution Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;padding:24px}
  .header{text-align:center;margin-bottom:32px}
  .header h1{font-size:24px;color:#0f172a}
  .header p{color:#64748b;margin-top:4px}
  .cards{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:32px}
  .card{background:#fff;border-radius:12px;padding:20px 32px;box-shadow:0 1px 3px rgba(0,0,0,.1);text-align:center;min-width:140px}
  .card .value{font-size:32px;font-weight:700}
  .card .label{font-size:13px;color:#64748b;margin-top:4px}
  .status-badge{display:inline-block;padding:6px 20px;border-radius:20px;color:#fff;font-weight:600;font-size:14px;margin-top:12px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:24px}
  th{background:#0f172a;color:#fff;padding:12px 16px;text-align:left;font-size:13px}
  td{padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:13px}
  tr:last-child td{border-bottom:none}
  tr:hover{background:#f1f5f9}
  .error{color:#dc2626;font-size:12px;max-width:400px;word-break:break-word}
  .section-title{font-size:18px;font-weight:600;margin:32px 0 12px;padding-left:4px}
  .pass{color:#16a34a;font-weight:600} .fail{color:#dc2626}
  @media print{body{padding:12px}.cards{gap:8px}}
</style></head>
<body>
<div class="header">
  <h1>ATI UI Automation — Test Execution Report</h1>
  <p>${date} &nbsp;|&nbsp; Duration: ${this.formatDuration(totalDuration)}</p>
  <div class="status-badge" style="background:${statusColor}">${statusText}</div>
</div>
<div class="cards">
  <div class="card"><div class="value">${totalSpecs}</div><div class="label">Spec Files</div></div>
  <div class="card"><div class="value">${allResults.length}</div><div class="label">Test Cases</div></div>
  <div class="card"><div class="value">${totalSteps}</div><div class="label">Total Steps</div></div>
  <div class="card"><div class="value pass">${passed}</div><div class="label">Passed</div></div>
  <div class="card"><div class="value fail">${failed}</div><div class="label">Failed</div></div>
  <div class="card"><div class="value">${skipped}</div><div class="label">Skipped</div></div>
  <div class="card"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
</div>
${failedRows ? `<div class="section-title fail">❌ Failed</div>
<table><thead><tr><th>#</th><th>Spec File</th><th>Test Case</th><th>Steps</th><th>Error</th></tr></thead><tbody>${failedRows}</tbody></table>` : ''}
<div class="section-title pass">✅ Passed</div>
<table><thead><tr><th>#</th><th>Spec File</th><th>Test Cases</th><th>Steps</th><th>Status</th></tr></thead><tbody>${passedRows || '<tr><td colspan="5">No fully passed spec files</td></tr>'}</tbody></table>
</body></html>`;

    const reportDir = path.resolve('playwright-report');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, 'test-summary.html');
    fs.writeFileSync(reportPath, html, 'utf-8');
    console.log(`📊 Summary report saved: ${reportPath}`);
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
