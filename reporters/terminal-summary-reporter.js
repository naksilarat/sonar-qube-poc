const os = require('os');

class TerminalSummaryReporter {
  constructor(options = {}) {
    this.options = options;
    this._passed = 0;
    this._failed = 0;
    this._skipped = 0;
  }

  // Helper to count tests in the suite recursively
  _countTests(suite) {
    let count = 0;
    if (suite.tests) count += suite.tests.length;
    if (suite.suites) {
      for (const s of suite.suites) count += this._countTests(s);
    }
    return count;
  }

  // Count tests grouped by the immediate child suites (Playwright puts projects as top-level children)
  _countTestsByProject(suite) {
    const counts = {};
    if (!suite || !suite.suites || suite.suites.length === 0) {
      counts['default'] = this._countTests(suite);
      return counts;
    }

    for (const s of suite.suites) {
      const projectName = s.title && s.title.trim() !== '' ? s.title : (s._project && s._project.name) || 'default';
      counts[projectName] = this._countTests(s);
    }
    return counts;
  }

  onBegin(config, suite) {
    try {
      const totalTests = this._countTests(suite);
      const workers = config.workers ?? os.cpus().length;
      // Friendly summary header that includes tests per project and total
      console.log(`\n🔧 Playwright: running ${totalTests} test${totalTests !== 1 ? 's' : ''} using ${workers} worker${workers !== 1 ? 's' : ''}`);
      const perProject = this._countTestsByProject(suite);
      for (const [project, c] of Object.entries(perProject)) {
        console.log(`  • ${project}: ${c} test${c !== 1 ? 's' : ''}`);
      }
      console.log('--------------------------------------------------------------------------------');
    } catch (e) {
      // Be defensive: don't crash the runner if counting fails
      console.log('Playwright: unable to compute total tests/workers:', e && e.message ? e.message : e);
    }
  }

  // Forward stdout / stderr chunks from workers so console.log from tests are visible
  onStdOut(...args) {
    // Look for a string/Buffer in the args (Playwright's signature may vary across versions)
    for (const a of args) {
      if (typeof a === 'string' || Buffer.isBuffer(a)) {
        process.stdout.write(a.toString());
        return;
      }
    }
  }

  onStdErr(...args) {
    for (const a of args) {
      if (typeof a === 'string' || Buffer.isBuffer(a)) {
        process.stderr.write(a.toString());
        return;
      }
    }
  }

  onEnd(result) {
    // Print a tiny footer to separate test output from summary reporters
    try {
      const passed = typeof this._passed === 'number' ? this._passed : 'N/A';
      const failed = typeof this._failed === 'number' ? this._failed : 'N/A';
      const skipped = typeof this._skipped === 'number' ? this._skipped : 'N/A';
      console.log('\n--------------------------------------------------------------------------------');
      console.log(`🧾 Playwright tests finished — passed: ${passed}, failed: ${failed}, skipped: ${skipped}`);
    } catch (e) {
      console.log('Playwright: finished (unable to resolve result summary)');
    }
  }

  onTestEnd(test, result) {
    try {
      if (!result || !result.status) return;
      if (result.status === 'passed') this._passed += 1;
      else if (result.status === 'failed') this._failed += 1;
      else if (result.status === 'skipped') this._skipped += 1;

      // Print a live line showing the test result as it completes
      // Try to determine a project name by walking up the parent chain
      let projectName = 'default';
      try {
        let node = test.parent;
        const ancestors = [];
        while (node) {
          if (node.title) ancestors.push(node.title);
          node = node.parent;
        }
        // Choose the last ancestor that looks like a project name (first non-empty from the end)
        if (ancestors.length) {
          for (let i = ancestors.length - 1; i >= 0; i--) {
            if (ancestors[i] && ancestors[i].trim() !== '') {
              projectName = ancestors[i];
              break;
            }
          }
        }
      } catch (e) {
        // swallow
      }

      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      const loc = (test && test.location && test.location.file) ? ` (${test.location.file}:${test.location.line || ''})` : '';
      console.log(`[${projectName}] ${statusIcon} ${test.title}${loc} — ${result.status}`);
    } catch (e) {
      // ignore counting errors
    }
  }
}

module.exports = TerminalSummaryReporter;
