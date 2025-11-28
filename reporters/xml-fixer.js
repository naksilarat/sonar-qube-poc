const fs = require('fs');
const path = require('path');

class XMLFixerReporter {
  constructor(options = {}) {
    this.inputFile = options.inputFile || 'test-results/sonar-report.xml';
    this.outputFile = options.outputFile || 'test-results/sonar-test-report.xml';
  }

  onBegin() {
    // Do nothing on begin
  }

  onTestBegin() {
    // Do nothing on test begin
  }

  onTestEnd() {
    // Do nothing on test end
  }

  onEnd() {
    // Fix the XML after all tests are done
    this.fixSonarReport();
  }

  fixSonarReport() {
    try {
      if (!fs.existsSync(this.inputFile)) {
        console.log('⚠️  Original sonar report not found, skipping fix');
        return;
      }

      let content = fs.readFileSync(this.inputFile, 'utf8');
      
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
      fs.writeFileSync(this.outputFile, content, 'utf8');
      console.log('✅ Fixed sonar report for SonarQube compatibility');
      console.log(`   Original: ${this.inputFile}`);
      console.log(`   Fixed: ${this.outputFile}`);
      
    } catch (error) {
      console.error('❌ Error fixing sonar report:', error.message);
    }
  }
}

module.exports = XMLFixerReporter;