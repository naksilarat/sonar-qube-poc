const fs = require('fs');
const path = require('path');

class SonarCompatibleReporter {
  constructor(options = {}) {
    this.options = options;
    this.outputFile = options.outputFile || 'test-results/sonar-report.xml';
    this.fixedOutputFile = options.fixedOutputFile || 'test-results/sonar-test-report.xml';
    this.sonarReporter = null;
  }

  async onBegin(config, suite) {
    try {
      // Try different import patterns
      let SonarReporter;
      try {
        const module = await import('@bdellegrazie/playwright-sonar-reporter');
        SonarReporter = module.default || module.SonarReporter || module;
      } catch (e) {
        console.log('Failed to import SonarReporter, will create basic reporter');
        return;
      }
      
      this.sonarReporter = new SonarReporter(this.options);
      
      if (this.sonarReporter.onBegin) {
        await this.sonarReporter.onBegin(config, suite);
      }
    } catch (error) {
      console.log('Error initializing SonarReporter:', error.message);
    }
  }

  async onTestBegin(test, result) {
    if (this.sonarReporter && this.sonarReporter.onTestBegin) {
      await this.sonarReporter.onTestBegin(test, result);
    }
  }

  async onTestEnd(test, result) {
    if (this.sonarReporter && this.sonarReporter.onTestEnd) {
      await this.sonarReporter.onTestEnd(test, result);
    }
  }

  async onEnd(result) {
    // Call parent onEnd to generate original report
    if (this.sonarReporter && this.sonarReporter.onEnd) {
      await this.sonarReporter.onEnd(result);
    }
    
    // Fix the generated XML for SonarQube compatibility
    this.fixSonarReport();
  }

  fixSonarReport() {
    try {
      if (!fs.existsSync(this.outputFile)) {
        console.log('Original sonar report not found, skipping fix');
        return;
      }

      let content = fs.readFileSync(this.outputFile, 'utf8');
      
      // Add XML declaration if missing
      if (!content.startsWith('<?xml')) {
        content = '<?xml version="1.0" encoding="UTF-8"?>\n' + content;
      }
      
      // Fix absolute paths to relative paths
      content = content.replace(/path="[^"]*\/([^\/]+\.spec\.ts)"/g, 'path="tests/$1"');
      
      // Fix empty failure elements with proper message
      content = content.replace(/<failure>\s*<\/failure>/g, '<failure message="Test failed">Assertion failed</failure>');
      
      // Fix empty skipped elements with proper message
      content = content.replace(/<skipped>\s*<\/skipped>/g, '<skipped message="Test skipped">Test was skipped</skipped>');
      
      // Convert self-closing testCase elements that have content
      content = content.replace(/<testCase([^>]*)>\s*<\/testCase>/g, '<testCase$1/>');
      
      // Ensure proper formatting
      content = content.replace(/>\s+</g, '><').replace(/><</g, '>\n<');
      
      // Write the fixed content
      fs.writeFileSync(this.fixedOutputFile, content, 'utf8');
      console.log('✅ Fixed sonar report for SonarQube compatibility');
      console.log(`   Original: ${this.outputFile}`);
      console.log(`   Fixed: ${this.fixedOutputFile}`);
      
    } catch (error) {
      console.error('❌ Error fixing sonar report:', error.message);
    }
  }
}

module.exports = SonarCompatibleReporter;