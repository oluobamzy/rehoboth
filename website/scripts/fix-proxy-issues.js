#!/usr/bin/env node
/**
 * Script to fix common Firebase Storage proxy issues
 * This script helps migrate direct Firebase Storage URLs to use our proxy
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for direct Firebase Storage URLs in components...');

// Find all instances of Firebase Storage URLs directly used
try {
  const result = execSync(
    'grep -r "https://firebasestorage\\.googleapis\\.com" --include="*.tsx" --include="*.jsx" src/components src/app',
    { encoding: 'utf8' }
  ).trim();

  if (!result) {
    console.log('✅ No direct Firebase Storage URLs found in components!');
    process.exit(0);
  }

  console.log('\nFound direct Firebase Storage URLs:');
  
  const lines = result.split('\n').filter(line => 
    !line.includes('getProxiedStorageUrl') &&
    !line.includes('proxyImageUrl') &&
    !line.includes('if (src.includes(') &&
    !line.includes('if (url.includes(')
  );

  if (lines.length === 0) {
    console.log('✅ All URLs are properly handled!');
    process.exit(0);
  }

  lines.forEach(line => console.log(`  ${line}`));
  
  // Ask for confirmation before fixing
  console.log('\n🔧 Do you want to automatically fix these issues? (Y/n)');
  process.stdin.setEncoding('utf8');
  
  process.stdin.once('data', data => {
    const input = data.trim().toLowerCase();
    
    if (input === 'y' || input === 'yes' || input === '') {
      fixProxyIssues();
    } else {
      console.log('Operation cancelled.');
      process.exit(0);
    }
  });

} catch (error) {
  if (error.status === 1) {
    console.log('✅ No direct Firebase Storage URLs found!');
  } else {
    console.error('Error searching for Firebase URLs:', error);
  }
}

/**
 * Fix common proxy issues
 */
function fixProxyIssues() {
  console.log('\n🔧 Fixing Firebase Storage URL issues...');
  
  // 1. Add imports for the proxy utility where missing
  console.log('Adding imports for getProxiedStorageUrl where needed...');
  try {
    // Find files with Firebase URLs but no proxy import
    const filesWithFirebaseUrls = execSync(
      'grep -l "firebasestorage\\.googleapis\\.com" --include="*.tsx" --include="*.jsx" src/components src/app',
      { encoding: 'utf8' }
    ).trim().split('\n');
    
    for (const file of filesWithFirebaseUrls) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if already has the import
      if (!content.includes("getProxiedStorageUrl") && 
          !content.includes("storageProxy") && 
          !content.includes("/api/proxy/")) {
        
        // Add the import
        const newContent = content.replace(
          /^(import.*?from.*?['"];)(\n)/m,
          `$1\nimport { getProxiedStorageUrl } from '@/utils/storageProxy';\n`
        );
        
        fs.writeFileSync(file, newContent);
        console.log(`  ✅ Added import to ${file}`);
      }
    }
  } catch (error) {
    console.error('Error adding imports:', error);
  }
  
  // 2. Convert direct URL strings to use the proxy
  console.log('\nWrapping Firebase Storage URLs with getProxiedStorageUrl()...');
  try {
    const filesWithFirebaseUrls = execSync(
      'grep -l "firebasestorage\\.googleapis\\.com" --include="*.tsx" --include="*.jsx" src/components src/app',
      { encoding: 'utf8' }
    ).trim().split('\n');
    
    let fixedCount = 0;
    
    for (const file of filesWithFirebaseUrls) {
      if (!fs.existsSync(file)) continue;
      
      let content = fs.readFileSync(file, 'utf8');
      
      // Find direct URL string literals
      const urlRegex = /(['"])https:\/\/firebasestorage\.googleapis\.com\/[^'"]+(['"])/g;
      let match;
      let replaced = false;
      
      // Replace all matches with proxied version
      while ((match = urlRegex.exec(content)) !== null) {
        // Skip if already wrapped
        const prevChars = content.substring(Math.max(0, match.index - 20), match.index);
        if (prevChars.includes('getProxiedStorageUrl') || prevChars.includes('proxyImageUrl')) {
          continue;
        }
        
        // Replace the URL with the proxied version
        const fullMatch = match[0];
        const url = fullMatch.substring(1, fullMatch.length - 1); // Remove quotes
        const replacementWithQuotes = `getProxiedStorageUrl(${fullMatch})`;
        
        // Replace this specific instance
        content = content.substring(0, match.index) + 
                 replacementWithQuotes + 
                 content.substring(match.index + fullMatch.length);
                 
        replaced = true;
        fixedCount++;
        
        // Update regex lastIndex due to string length change
        urlRegex.lastIndex += (replacementWithQuotes.length - fullMatch.length);
      }
      
      // Save the file if modified
      if (replaced) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed URLs in ${file}`);
      }
    }
    
    console.log(`\nFixed ${fixedCount} direct Firebase Storage URLs`);
    
  } catch (error) {
    console.error('Error fixing URLs:', error);
  }
  
  console.log('\n✅ Proxy issues fixed! Please run the application to verify the changes worked correctly.');
}
