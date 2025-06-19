/**
 * Check the codebase for direct Firebase Storage URLs that should be proxied
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking for direct Firebase Storage URLs in the codebase...');

// Run grep to find Firebase Storage URLs in components
try {
  // Find all direct Firebase Storage URLs in components and app code
  console.log('Running grep command to find Firebase Storage URLs...');
  
  // More verbose output for debugging
  const grepCommand = 'grep -r "firebasestorage.googleapis.com" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" src/components src/app src/hooks';
  console.log(`Command: ${grepCommand}`);
  
  const result = execSync(
    grepCommand,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );

  console.log('Raw grep results:');
  console.log(result || '(no results)');

  // Filter out false positives
  const lines = result.split('\n').filter(line => 
    line.trim() !== '' && 
    !line.includes('getProxiedStorageUrl') && 
    !line.includes('proxyImageUrl') && 
    !line.includes('if (') && 
    !line.includes('src.includes') &&
    !line.includes('url.includes') &&
    !line.includes('// Example') &&
    !line.includes('@example') &&
    !line.includes('// Skip') &&
    !line.includes('// Use our proxy') &&
    !line.includes('src/utils/storageProxy')
  );

  if (lines.length > 0) {
    console.log('\n⚠️  Found potential direct Firebase Storage URLs not using the proxy:');
    lines.forEach(line => console.log(`  ${line}`));
    console.log('\nMake sure these URLs use getProxiedStorageUrl() to avoid CORS issues.\n');
  } else {
    console.log('✅ No direct Firebase Storage URLs found in components!');
  }

} catch (error) {
  console.log(`Exit code: ${error.status}`);
  
  if (error.status === 1) {
    // Status 1 from grep means "no matches found", which is actually good in our case
    console.log('✅ No direct Firebase Storage URLs found in components!');
  } else {
    console.error('\n❌ Error checking for Firebase URLs:', error.message);
    console.error(error);
  }
}

// Check if the utility functions are imported and used
console.log('\nChecking for proxy utility usage in components that display media...');

const requiredComponents = [
  'src/components/sermons/SermonPlayer.tsx',
  'src/components/common/FallbackImage.tsx',
  'src/app/admin/carousel/page.tsx',
  'src/services/carouselService.ts'
];

let allGood = true;

requiredComponents.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing file: ${file}`);
    allGood = false;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  if (!content.includes('getProxiedStorageUrl') && !content.includes('proxyImageUrl')) {
    console.log(`❌ Missing proxy usage in: ${file}`);
    allGood = false;
  } else {
    console.log(`✅ Proxy used in: ${file}`);
  }
});

if (allGood) {
  console.log('\n✨ All critical components are using the Firebase Storage proxy!');
  console.log('The CORS issues should be resolved across the application.');
} else {
  console.log('\n⚠️ Some components may still not be using the Firebase Storage proxy.');
  console.log('Review the issues above to fully resolve all CORS problems.');
}
