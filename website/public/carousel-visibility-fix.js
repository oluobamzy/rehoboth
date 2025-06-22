// Carousel Visibility Fix Script
// This script verifies and fixes issues with slide visibility in the carousel
(function() {
  console.log('🔧 Carousel Visibility Fix Running...');
  
  // Find the carousel container
  const carousel = document.querySelector('[data-carousel="hero"]') || 
                   document.querySelector('#hero-carousel');
  
  if (!carousel) {
    console.error('❌ Could not find carousel container');
    return;
  }
  
  console.log('✅ Found carousel container');
  
  // Find all slides
  const slides = carousel.querySelectorAll('.carousel-slide');
  
  if (slides.length === 0) {
    console.error('❌ Could not find slide elements using .carousel-slide');
    return;
  }
  
  console.log(`✅ Found ${slides.length} slides`);
  
  // Check which slides are active vs inactive
  const activeSlides = [];
  const inactiveSlides = [];
  
  slides.forEach((slide, index) => {
    const isActive = slide.getAttribute('data-active') === 'true';
    const visibility = window.getComputedStyle(slide).visibility;
    const opacity = parseFloat(window.getComputedStyle(slide).opacity);
    const zIndex = window.getComputedStyle(slide).zIndex;
    
    console.log(`Slide ${index}: Active=${isActive}, Visibility=${visibility}, Opacity=${opacity}, Z-Index=${zIndex}`);
    
    if (isActive) {
      activeSlides.push(slide);
    } else {
      inactiveSlides.push(slide);
    }
  });
  
  console.log(`Active slides: ${activeSlides.length}, Inactive slides: ${inactiveSlides.length}`);
  
  // Ensure only one slide is active
  if (activeSlides.length !== 1) {
    console.warn(`⚠️ Found ${activeSlides.length} active slides, should be exactly 1`);
  }
  
  // Fix visibility issues
  inactiveSlides.forEach((slide, index) => {
    // Make sure inactive slides are truly hidden
    slide.style.visibility = 'hidden';
    slide.style.opacity = '0';
    slide.style.zIndex = '0';
    console.log(`Fixed inactive slide ${index}`);
  });
  
  activeSlides.forEach((slide, index) => {
    // Make sure active slide is fully visible
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';
    slide.style.zIndex = '10';
    console.log(`Fixed active slide ${index}`);
  });
  
  // Check background elements
  slides.forEach((slide, index) => {
    const bgElements = slide.querySelectorAll('[data-testid="carousel-slide-background"]');
    if (bgElements.length === 0) {
      console.warn(`⚠️ Slide ${index} has no background element`);
    } else {
      console.log(`Slide ${index} has ${bgElements.length} background element(s)`);
      
      // Check background image URL
      const bgElement = bgElements[0];
      const imageUrl = bgElement.getAttribute('data-image-url');
      console.log(`Slide ${index} background URL: ${imageUrl}`);
    }
  });
  
  console.log('🎉 Carousel visibility check/fix complete!');
})();
