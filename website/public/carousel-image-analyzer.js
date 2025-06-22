// Carousel Image Loading Analyzer
// This script monitors and verifies image loading in the carousel

(function() {
  console.log('🔍 Carousel Image Loading Analyzer activated...');
  
  // Create image loading interceptor
  const originalImageConstructor = window.Image;
  const loadedImages = {};
  const failedImages = {};
  
  // Override Image constructor to monitor loading
  window.Image = function() {
    const img = new originalImageConstructor();
    
    // Override the src setter to monitor
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    Object.defineProperty(img, 'src', {
      get: originalDescriptor.get,
      set: function(value) {
        console.log(`👁️ Image loading attempt: ${value}`);
        
        img.addEventListener('load', function() {
          console.log(`✅ Image loaded: ${value}`);
          loadedImages[value] = {
            timestamp: Date.now(),
            dimensions: `${img.naturalWidth}x${img.naturalHeight}`
          };
        });
        
        img.addEventListener('error', function() {
          console.error(`❌ Image failed: ${value}`);
          failedImages[value] = {
            timestamp: Date.now(),
            error: 'Failed to load'
          };
        });
        
        originalDescriptor.set.call(this, value);
      }
    });
    
    return img;
  };
  
  // Monitor background image changes
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(propertyName, value, priority) {
    if (propertyName === 'background-image' && value.includes('url(')) {
      const urlMatch = value.match(/url\(['"]?([^'"]+)['"]?\)/i);
      if (urlMatch && urlMatch[1]) {
        const imageUrl = urlMatch[1];
        console.log(`👁️ Background image set: ${imageUrl}`);
        
        // Check if the image loads
        const img = new originalImageConstructor();
        img.onload = function() {
          console.log(`✅ Background image loaded: ${imageUrl}`);
          loadedImages[imageUrl] = {
            timestamp: Date.now(),
            dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
            type: 'background'
          };
        };
        img.onerror = function() {
          console.error(`❌ Background image failed: ${imageUrl}`);
          failedImages[imageUrl] = {
            timestamp: Date.now(),
            error: 'Failed to load',
            type: 'background'
          };
        };
        img.src = imageUrl;
      }
    }
    return originalSetProperty.call(this, propertyName, value, priority);
  };
  
  // Create a summary function
  window.imageSummary = function() {
    console.log('\n--- IMAGE LOADING SUMMARY ---');
    console.log(`Total images attempted: ${Object.keys(loadedImages).length + Object.keys(failedImages).length}`);
    console.log(`Successfully loaded: ${Object.keys(loadedImages).length}`);
    console.log(`Failed to load: ${Object.keys(failedImages).length}`);
    
    if (Object.keys(loadedImages).length > 0) {
      console.log('\nSuccessfully loaded images:');
      Object.entries(loadedImages).forEach(([url, info]) => {
        console.log(`- ${url} (${info.dimensions})`);
      });
    }
    
    if (Object.keys(failedImages).length > 0) {
      console.log('\nFailed images:');
      Object.entries(failedImages).forEach(([url, info]) => {
        console.log(`- ${url}`);
        
        // Help diagnose Firebase proxy issues
        if (url.includes('/api/proxy/')) {
          const path = url.replace('/api/proxy/', '');
          console.log(`  Possible fixes:
  - Check if the image exists in Firebase Storage
  - Direct URL would be: https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/${encodeURIComponent(path)}?alt=media
  - Use the proxy test tool: /proxy-test.html`);
        }
      });
    }
  };
  
  // Add a global helper
  window.fixCarouselImages = function() {
    console.log('🔧 Attempting to fix carousel image issues...');
    
    // Find all slide background elements
    const backgrounds = document.querySelectorAll('[data-testid="carousel-slide-background"]');
    
    backgrounds.forEach((bg, index) => {
      // Get the image URL
      const dataUrl = bg.getAttribute('data-image-url');
      const imageError = bg.getAttribute('data-image-error') === 'true';
      
      console.log(`Checking slide ${index} with image: ${dataUrl} (error: ${imageError})`);
      
      // If there was an error loading this image and it's a Firebase proxy URL
      if (imageError && dataUrl && dataUrl.includes('/api/proxy/')) {
        console.log(`Attempting to fix slide ${index}...`);
        
        // Set the fallback background
        bg.style.backgroundImage = "url('/rehoboth_logo_plain.png')";
        
        console.log(`Fixed slide ${index} by using fallback image`);
      }
    });
    
    console.log('✅ Carousel fix attempt complete. Check the slides visually.');
  };
  
  // Setup keyboard shortcut for convenience
  document.addEventListener('keydown', function(e) {
    // Press Ctrl+Shift+I to show image summary
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      window.imageSummary();
    }
    // Press Ctrl+Shift+F to fix carousel images
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      window.fixCarouselImages();
    }
  });
  
  console.log('Image Loading Analyzer ready. Functions available:');
  console.log('- imageSummary() - Show loading statistics');
  console.log('- fixCarouselImages() - Attempt to fix broken images');
  console.log('Keyboard shortcuts:');
  console.log('- Ctrl+Shift+I - Show image summary');
  console.log('- Ctrl+Shift+F - Fix carousel images');
})();
