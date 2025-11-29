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
        console.log('⚠️  Original sonar report not found, creating empty report');
        this.createEmptyReport();
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
      
      // Fix self-closing elements
      content = content.replace(/<testCase([^>]*)\s*\/>/g, '<testCase$1></testCase>');
      
      // Ensure testsuites wrapper exists
      if (!content.includes('<testsuites')) {
        content = content.replace(/<testsuite/, '<testsuites><testsuite');
        content = content.replace(/<\/testsuite>/, '</testsuite></testsuites>');
      }
      
      // Clean up formatting
      content = content.replace(/>\s+</g, '>\n<');
      
      // Write the fixed content
      fs.writeFileSync(this.outputFile, content, 'utf8');
      console.log('✅ Fixed sonar report for SonarQube compatibility');
      console.log(`   Original: ${this.inputFile}`);
      console.log(`   Fixed: ${this.outputFile}`);
      
    } catch (error) {
      console.error('❌ Error fixing sonar report:', error.message);
      // Create fallback empty report on error
      this.createEmptyReport();
    }
  }

  createEmptyReport() {
    const emptyReport = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Playwright Tests" tests="0" failures="0" errors="0" time="0">
  </testsuite>
</testsuites>`;
    
    // Ensure directory exists
    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.outputFile, emptyReport, 'utf8');
    console.log('✅ Created empty sonar report');
  }
}

module.exports = XMLFixerReporter;