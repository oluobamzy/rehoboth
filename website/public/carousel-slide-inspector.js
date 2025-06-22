// Carousel Slide Visibility Inspector
// This script analyzes carousel slides to detect visibility issues
(function() {
  console.log('🔍 Carousel Slide Visibility Inspector Running');
  
  // Find the carousel
  const carousel = document.querySelector('[data-carousel="hero"]') || 
                   document.querySelector('#hero-carousel');
  
  if (!carousel) {
    console.error('❌ Could not find carousel container');
    return;
  }
  
  console.log('✅ Found carousel container:', carousel);
  
  // Function to check all CSS properties that could affect visibility
  const checkVisibility = (element, label) => {
    const style = window.getComputedStyle(element);
    const info = {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      zIndex: style.zIndex,
      position: style.position,
      width: style.width,
      height: style.height,
      overflow: style.overflow
    };
    
    console.log(`${label} visibility properties:`, info);
    return info;
  };
  
  // Get all carousel slides
  const slides = carousel.querySelectorAll('.carousel-slide');
  
  if (slides.length === 0) {
    console.error('❌ Could not find carousel slides with .carousel-slide class');
    return;
  }
  
  console.log(`Found ${slides.length} slides`);
  
  // Check each slide
  slides.forEach((slide, index) => {
    const isActive = slide.getAttribute('data-active') === 'true';
    console.log(`\n---------- SLIDE ${index} ${isActive ? '(ACTIVE)' : '(INACTIVE)'} ----------`);
    
    // Check overall slide visibility
    checkVisibility(slide, `Slide ${index}`);
    
    // Check the slide's background
    const background = slide.querySelector('[data-testid="carousel-slide-background"]');
    if (background) {
      checkVisibility(background, `Slide ${index} background`);
      
      // Get the background image URL
      const bgImage = window.getComputedStyle(background).backgroundImage;
      console.log(`Background image URL: ${bgImage}`);
    } else {
      console.warn(`⚠️ Slide ${index} has no background element with data-testid="carousel-slide-background"`);
    }
    
    // Check overlay
    const overlay = slide.querySelector('.absolute.inset-0.bg-black');
    if (overlay) {
      checkVisibility(overlay, `Slide ${index} overlay`);
      
      // Check overlay opacity specifically
      const overlayBg = window.getComputedStyle(overlay).backgroundColor;
      console.log(`Overlay background: ${overlayBg}`);
    } else {
      console.warn(`⚠️ Slide ${index} has no overlay element`);
    }
    
    // Check content
    const content = slide.querySelector('.relative.flex.flex-col.justify-center');
    if (content) {
      checkVisibility(content, `Slide ${index} content`);
    } else {
      console.warn(`⚠️ Slide ${index} has no content element`);
    }
    
    // Check for any absolute positioned elements that might block the view
    const absoluteElements = slide.querySelectorAll('[style*="position: absolute"]');
    console.log(`Found ${absoluteElements.length} absolutely positioned elements in slide ${index}`);
  });
  
  // Provide some potential fixes
  console.log('\n---------- POTENTIAL FIXES ----------');
  console.log('If active slides are not visible, try the following:');
  console.log('1. Ensure active slides have visibility: visible; opacity: 1;');
  console.log('2. Ensure inactive slides have visibility: hidden; opacity: 0;');
  console.log('3. Make sure active slide has the highest z-index (e.g., 10)');
  console.log('4. Check for overlay elements with high opacity that might be blocking the image');
  console.log('5. Make sure the background image URLs are correct and loaded properly');
  
  // Offer to automatically fix common issues
  console.log('\nTo automatically attempt fixing visibility issues, run:');
  console.log('carousel_visibility_fix()');
  
  window.carousel_visibility_fix = function() {
    console.log('🔧 Attempting to fix carousel visibility issues...');
    
    slides.forEach((slide, index) => {
      const isActive = slide.getAttribute('data-active') === 'true';
      
      if (isActive) {
        slide.style.visibility = 'visible';
        slide.style.opacity = '1';
        slide.style.zIndex = '10';
        console.log(`Fixed active slide ${index}`);
        
        // Find and fix overlay if needed
        const overlay = slide.querySelector('.absolute.inset-0.bg-black');
        if (overlay) {
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Set to 30% opacity
          console.log(`Fixed overlay opacity on slide ${index}`);
        }
      } else {
        slide.style.visibility = 'hidden';
        slide.style.opacity = '0';
        slide.style.zIndex = '0';
        console.log(`Fixed inactive slide ${index}`);
      }
    });
    
    console.log('✅ Visibility fixes applied');
  };
})();
