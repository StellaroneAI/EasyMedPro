import fs from 'fs';
import path from 'path';

// Function to remove TypeScript annotations from JavaScript code
function stripTypeScript(content) {
  // Remove private/public/protected modifiers
  content = content.replace(/\s+(private|public|protected)\s+/g, ' ');
  
  // Remove type annotations from parameters and return types
  content = content.replace(/(\w+):\s*[^,){}=]+(\s*[,)=}])/g, '$1$2');
  
  // Remove optional parameter markers
  content = content.replace(/(\w+)\?\s*:/g, '$1:');
  content = content.replace(/(\w+)\?\s*([,)])/g, '$1$2');
  
  // Remove Promise return type annotations
  content = content.replace(/\):\s*Promise<[^>]+>/g, ')');
  
  // Remove standalone type annotations
  content = content.replace(/:\s*\{[^}]+\}/g, '');
  
  // Remove interface declarations (though they shouldn't be in .js files)
  content = content.replace(/interface\s+\w+\s*\{[^}]+\}/g, '');
  
  // Remove type imports that aren't used for runtime
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types\.js['"];?\s*/g, '');
  
  return content;
}

// Process all service files
const servicesDir = 'C:\\Users\\D2K2\\EasyMedPro\\EasyMedPro-2\\server\\src\\services';
const files = ['appointmentService.js', 'triageService.js', 'ehrService.js'];

files.forEach(filename => {
  const filePath = path.join(servicesDir, filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = stripTypeScript(content);
    
    // Backup original
    fs.writeFileSync(filePath + '.bak', content);
    
    // Write cleaned version
    fs.writeFileSync(filePath, cleaned);
    
    console.log(`Cleaned ${filename}`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
});

console.log('TypeScript cleanup completed!');
