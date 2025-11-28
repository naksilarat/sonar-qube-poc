const fs = require('fs');
const path = require('path');

// Read the sonar report
const reportPath = path.join(__dirname, '../test-results/sonar-report.xml');

if (fs.existsSync(reportPath)) {
  let content = fs.readFileSync(reportPath, 'utf8');
  
  // Fix empty failure elements
  content = content.replace(/<failure>\s*<\/failure>/g, '<failure message="Test failed">Test assertion failed</failure>');
  
  // Convert absolute paths to relative paths
  content = content.replace(/path="[^"]*\/([^\/]+\.spec\.ts)"/g, 'path="tests/$1"');
  
  // Write back the fixed content
  fs.writeFileSync(reportPath, content, 'utf8');
  console.log('Fixed sonar report XML format');
} else {
  console.log('Sonar report not found');
}