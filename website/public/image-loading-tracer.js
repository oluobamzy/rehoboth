// Enhanced Debug Script to Track Image Loading
// Run this script in the browser console to track all image loading attempts

(function() {
  console.log('📸 Enhanced Image Loading Debug Tool Starting...');
  
  // Store original methods to track image loading
  const originalImageConstructor = window.Image;
  const originalImagePrototype = {};
  
  // Store loaded and failed images
  const loadedImages = {};
  const failedImages = {};
  const allImageAttempts = [];
  
  // Intercept Image construction
  window.Image = function() {
    const img = new originalImageConstructor();
    
    // Track this element
    const imageId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    // Store the original src setter
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    // Override src setter
    Object.defineProperty(img, 'src', {
      get: originalSrcDescriptor.get,
      set: function(value) {
        const timestamp = new Date().toISOString();
        console.log(`🖼️ [${timestamp}] Image load attempt: ${value}`);
        
        allImageAttempts.push({
          id: imageId,
          src: value,
          timestamp,
          status: 'loading'
        });
        
        // Original onload/onerror handling
        const originalOnload = img.onload;
        const originalOnerror = img.onerror;
        
        // Track success
        img.onload = function(e) {
          const successTime = new Date().toISOString();
          console.log(`✅ [${successTime}] Image loaded: ${value}`);
          
          loadedImages[imageId] = {
            src: value,
            timestamp: successTime,
            dimensions: `${img.naturalWidth}x${img.naturalHeight}`
          };
          
          // Update attempt status
          allImageAttempts.forEach(attempt => {
            if (attempt.id === imageId && attempt.src === value) {
              attempt.status = 'loaded';
              attempt.completedAt = successTime;
            }
          });
          
          // Call original handler if exists
          if (originalOnload) originalOnload.call(this, e);
        };
        
        // Track failures
        img.onerror = function(e) {
          const errorTime = new Date().toISOString();
          console.error(`❌ [${errorTime}] Image failed: ${value}`);
          
          failedImages[imageId] = {
            src: value,
            timestamp: errorTime
          };
          
          // Update attempt status
          allImageAttempts.forEach(attempt => {
            if (attempt.id === imageId && attempt.src === value) {
              attempt.status = 'failed';
              attempt.completedAt = errorTime;
            }
          });
          
          // Call original handler if exists
          if (originalOnerror) originalOnerror.call(this, e);
        };
        
        // Call original setter
        originalSrcDescriptor.set.call(this, value);
      },
      configurable: true
    });
    
    return img;
  };
  
  // Monitor CSS background-image settings
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(prop, value) {
    if (prop === 'background-image' && value && value.includes('url(')) {
      const timestamp = new Date().toISOString();
      const matches = value.match(/url\(['"]?(.*?)['"]?\)/);
      if (matches && matches[1]) {
        const url = matches[1];
        console.log(`🎨 [${timestamp}] Background image set: ${url}`);
        
        // Check if it loads
        const img = new Image();
        img.src = url;
      }
    }
    return originalSetProperty.apply(this, arguments);
  };
  
  // Add window function to display results
  window.imageLoadingSummary = function() {
    console.log('\n----- IMAGE LOADING SUMMARY -----');
    console.log(`Total attempts: ${allImageAttempts.length}`);
    console.log(`Successfully loaded: ${Object.keys(loadedImages).length}`);
    console.log(`Failed: ${Object.keys(failedImages).length}`);
    
    console.log('\n----- FAILED IMAGES -----');
    Object.values(failedImages).forEach((img, i) => {
      console.log(`${i+1}. ${img.src}`);
      
      // Help diagnose proxy issues
      if (img.src.includes('/api/proxy/')) {
        const path = img.src.replace('/api/proxy/', '');
        console.log(`   - This is a proxied Firebase Storage image`);
        console.log(`   - Direct Firebase URL: https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/${encodeURIComponent(path)}?alt=media`);
      }
    });
    
    console.log('\n----- ALL IMAGE ATTEMPTS -----');
    allImageAttempts.forEach((attempt, i) => {
      const statusColor = attempt.status === 'loaded' ? '✓' : 
                        (attempt.status === 'failed' ? '✗' : '⟳');
      console.log(`${i+1}. ${statusColor} ${attempt.src} (${attempt.status})`);
    });
    
    return {
      attempts: allImageAttempts,
      loaded: loadedImages, 
      failed: failedImages
    };
  };
  
  console.log('Debug tool installed. Use window.imageLoadingSummary() to view results');
})();
