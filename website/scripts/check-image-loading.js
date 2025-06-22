// Script to check image loading from various sources
const https = require('https');
const http = require('http');

// Test URLs to check
const testUrls = [
  // Unsplash images (external)
  'https://images.unsplash.com/photo-1536500152107-01ab1422f932?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
  
  // Local assets
  'http://localhost:3000/rehoboth_logo_plain.png',
  
  // Firebase direct URL (for comparison)
  'https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/carousel%2Fwelcome-banner.jpg?alt=media'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    console.log(`\nChecking URL: ${url}`);
    
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = protocol.get(url, (res) => {
      const duration = Date.now() - startTime;
      const { statusCode, headers } = res;
      const contentType = headers['content-type'] || 'unknown';
      const contentLength = headers['content-length'] || 'unknown';
      
      let data = [];
      res.on('data', (chunk) => {
        data.push(chunk);
        if (data.length >= 3) {
          // We only need the first few chunks to confirm data is flowing
          req.destroy();
        }
      });
      
      res.on('end', () => {
        console.log(`✅ STATUS: ${statusCode}, Content-Type: ${contentType}`);
        console.log(`✅ Size: ${contentLength} bytes, Response time: ${duration}ms`);
        console.log(`✅ Data received: ${data.length > 0 ? 'Yes' : 'No'}`);
        resolve({
          url,
          statusCode,
          contentType,
          contentLength,
          responseTime: duration,
          dataReceived: data.length > 0
        });
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.error(`❌ ERROR: ${error.message}`);
      console.error(`❌ Response time until failure: ${duration}ms`);
      resolve({
        url,
        error: error.message,
        responseTime: duration,
        dataReceived: false
      });
    });
    
    // Set a timeout in case the request hangs
    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out after 5s'));
    });
  });
}

async function main() {
  console.log('🔍 CHECKING IMAGE LOADING FROM DIFFERENT SOURCES');
  console.log('===========================================');
  
  for (const url of testUrls) {
    await checkUrl(url);
  }
  
  console.log('\n===========================================');
  console.log('✅ Check complete! If all checks passed, image loading should work in the browser.');
  console.log('📝 If any checks failed, try accessing the problematic URLs directly in the browser to confirm.');
}

main().catch(console.error);
