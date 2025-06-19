#!/usr/bin/env node
/**
 * Script to check if all Firebase Storage URLs are properly proxied in key components
 * This helps identify potential CORS issues with Firebase Storage URLs
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Config
const FIREBASE_STORAGE_PATTERN = /firebasestorage\.googleapis\.com/;
const PROXY_PATTERN = /(getProxiedStorageUrl|\/api\/proxy)/;
const PATHS_TO_CHECK = [
  'src/components/**/*.tsx',
  'src/app/**/*.tsx',
  'src/services/**/*.ts',
  'src/utils/**/*.ts'
];
const EXPECTED_PROXIES = [
  'src/components/sermons/SermonPlayer.tsx',
  'src/components/common/FallbackImage.tsx',
  'src/app/admin/carousel/page.tsx',
  'src/services/carouselService.ts'
];

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

// Check for direct Firebase Storage URLs not using the proxy
async function findDirectStorageUrls() {
  console.log('Checking for direct Firebase Storage URLs in the codebase...\n');
  
  // Use grep to search for Firebase Storage URLs
  const cmd = `grep -r "firebasestorage\\.googleapis\\.com" --include="*.tsx" --include="*.ts" --include="*.js" src/`;
  
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.error(`Error running grep: ${error.message}`);
        return resolve([]);
      }
      
      if (!stdout.trim()) {
        console.log(`${COLORS.green}✅ No direct Firebase Storage URLs found.${COLORS.reset}`);
        return resolve([]);
      }
      
      // Filter out false positives (URLs that are already proxied or in proxy implementation)
      const lines = stdout.split('\n').filter(line => {
        // Keep only non-empty lines
        if (!line.trim()) return false;
        
        // Skip lines that are part of implementation or checks
        if (line.includes('getProxiedStorageUrl')) return false;
        if (line.includes('proxyImageUrl')) return false;
        if (line.includes('/utils/storageProxy.ts')) return false;
        if (line.includes('src.includes(')) return false;
        if (line.includes('url.includes(')) return false;
        if (line.includes('/api/proxy/[...path]/route.ts')) return false;
        if (line.includes('Content-Security-Policy')) return false;
        
        return true;
      });
      
      if (lines.length === 0) {
        console.log(`${COLORS.green}✅ All Firebase Storage URLs appear to be properly proxied.${COLORS.reset}`);
        return resolve([]);
      }
      
      console.log(`${COLORS.yellow}⚠️  Found potential direct Firebase Storage URLs not using the proxy:${COLORS.reset}`);
      lines.forEach(line => {
        console.log(`  ${line.trim()}`);
      });
      console.log('\nMake sure these URLs use getProxiedStorageUrl() to avoid CORS issues.\n');
      
      resolve(lines);
    });
  });
}

// Check key components to ensure they're using the proxy
async function checkProxyUsage() {
  console.log('\nChecking for proxy utility usage in components that display media...');
  
  const results = [];
  
  for (const filePath of EXPECTED_PROXIES) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`${COLORS.yellow}⚠️ File not found: ${filePath}${COLORS.reset}`);
      results.push({ file: filePath, status: 'missing' });
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.match(PROXY_PATTERN)) {
      console.log(`${COLORS.green}✅ Proxy used in: ${filePath}${COLORS.reset}`);
      results.push({ file: filePath, status: 'ok' });
    } else {
      console.log(`${COLORS.red}❌ Missing proxy usage in: ${filePath}${COLORS.reset}`);
      results.push({ file: filePath, status: 'missing-proxy' });
    }
  }
  
  return results;
}

// Main function to run all checks
async function main() {
  const directUrls = await findDirectStorageUrls();
  const proxyResults = await checkProxyUsage();
  
  const missingProxies = proxyResults.filter(r => r.status === 'missing-proxy');
  
  if (directUrls.length > 0 || missingProxies.length > 0) {
    console.log(`\n${COLORS.yellow}⚠️ Some components may still not be using the Firebase Storage proxy.${COLORS.reset}`);
    console.log('Review the issues above to fully resolve all CORS problems.');
  } else {
    console.log(`\n${COLORS.green}✅ All checks passed! Your application is properly using the Firebase Storage proxy.${COLORS.reset}`);
  }
}

// Run the script
main().catch(err => {
  console.error('Error running proxy check:', err);
  process.exit(1);
});
