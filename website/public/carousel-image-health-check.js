// Carousel Image Health Check Script
// This script will examine all carousel images and verify they can be loaded

(function() {
  console.log('🔍 Carousel Image Health Check running...');
  
  // Find the carousel
  const carousel = document.querySelector('[data-carousel="hero"]') || 
                   document.querySelector('#hero-carousel');
  
  if (!carousel) {
    console.error('❌ Could not find carousel element');
    return;
  }
  
  console.log('✅ Found carousel element:', carousel);
  
  // Find all slides
  const slides = carousel.querySelectorAll('.carousel-slide');
  
  if (slides.length === 0) {
    console.error('❌ Could not find slides using .carousel-slide selector');
    return;
  }
  
  console.log(`✅ Found ${slides.length} carousel slides`);
  
  // Create an array to track results
  const results = [];
  
  // Process each slide
  slides.forEach((slide, index) => {
    const isActive = slide.getAttribute('data-active') === 'true';
    console.log(`Checking slide ${index} (${isActive ? 'active' : 'inactive'}):`);
    
    // Find the background element
    const backgroundDiv = slide.querySelector('[data-testid="carousel-slide-background"]');
    if (!backgroundDiv) {
      console.warn(`⚠️ Slide ${index} has no background element with data-testid="carousel-slide-background"`);
      return;
    }
    
    // Extract the image URL from the style
    const style = window.getComputedStyle(backgroundDiv);
    const bgImage = style.backgroundImage;
    
    // Extract the URL from the background-image CSS property
    let imageUrl = null;
    if (bgImage && bgImage !== 'none') {
      const matches = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/i);
      if (matches && matches[1]) {
        imageUrl = matches[1];
      }
    }
    
    // Also check data attributes
    const dataImageUrl = backgroundDiv.getAttribute('data-image-url');
    
    console.log(`Slide ${index} background image:`, imageUrl);
    console.log(`Slide ${index} data-image-url:`, dataImageUrl);
    
    // Check if the image exists
    if (imageUrl) {
      const img = new Image();
      img.onload = function() {
        console.log(`✅ Image for slide ${index} loaded successfully: ${imageUrl}`);
        results.push({
          slide: index,
          url: imageUrl,
          status: 'success',
          dimensions: `${img.naturalWidth}x${img.naturalHeight}`
        });
        updateSummary();
      };
      img.onerror = function() {
        console.error(`❌ Image for slide ${index} failed to load: ${imageUrl}`);
        results.push({
          slide: index,
          url: imageUrl,
          status: 'error'
        });
        
        // If it's a proxied image, suggest using the proxy test tool
        if (imageUrl.includes('/api/proxy/')) {
          console.warn(`This is a proxied Firebase Storage image. Check if the path exists in Firebase Storage.`);
          console.warn(`Try the proxy testing tool: /proxy-test.html`);
          
          // Calculate the direct Firebase URL for comparison
          const path = imageUrl.replace('/api/proxy/', '');
          console.info(`Direct Firebase URL would be: https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/${encodeURIComponent(path)}?alt=media`);
        }
        
        updateSummary();
      };
      img.src = imageUrl;
    } else {
      console.warn(`⚠️ Could not extract image URL for slide ${index}`);
      results.push({
        slide: index,
        url: null,
        status: 'unknown'
      });
      updateSummary();
    }
  });
  
  // Create a summary display
  function updateSummary() {
    const total = slides.length;
    const processed = results.length;
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const unknown = results.filter(r => r.status === 'unknown').length;
    
    console.log('\n--- CAROUSEL IMAGE HEALTH SUMMARY ---');
    console.log(`Total slides: ${total}`);
    console.log(`Checked: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
    console.log(`Success: ${successful} (${Math.round(successful/total*100)}%)`);
    console.log(`Failed: ${failed} (${Math.round(failed/total*100)}%)`);
    console.log(`Unknown: ${unknown} (${Math.round(unknown/total*100)}%)`);
    
    if (processed === total) {
      console.log('\nAll slides checked. Summary:');
      
      if (failed > 0) {
        console.error(`❌ ${failed} images failed to load. Check console for details.`);
        console.log('\nSuggested fixes:');
        console.log('1. Verify the image paths exist in Firebase Storage');
        console.log('2. Try the proxy test tool at /proxy-test.html');
        console.log('3. Check browser network tab for specific HTTP errors');
      } else if (successful === total) {
        console.log('✅ All carousel images loaded successfully!');
      }
    }
  }
})();
