const fs = require('fs');
const path = require('path');

const fixFile = (filePath) => {
  console.log(`Fixing ${filePath}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Link import if missing and file uses Link
    if (content.includes('<Link') && !content.includes("import Link from 'next/link';")) {
      content = content.replace(
        /import React.*/,
        match => `${match}\nimport Link from 'next/link';`
      );
    }
    
    // Fix closing tags if corrupted
    content = content.replace(/\s+<\/div>\s+\);\s+\}/g, '\n    </div>\n  );\n}');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err);
    return false;
  }
};

const authFiles = [
  'src/app/auth/forgot-password/page.tsx',
  'src/app/auth/reset-password/page.tsx',
  'src/app/auth/verification-success/page.tsx'
];

let fixedCount = 0;
for (const file of authFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount}/${authFiles.length} files.`);
