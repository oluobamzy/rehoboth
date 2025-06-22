
// Carousel Debug Script - Run in browser console
(function() {
  console.log('🔍 Carousel Debug Script Loaded');
  
  // Find the carousel container
  const carousel = document.querySelector('[data-carousel="hero"]') || 
                  document.querySelector('.relative.overflow-hidden') ||
                  document.querySelector('section');
  
  if (!carousel) {
    console.error('❌ Could not find carousel container');
    return;
  }
  
  console.log('✅ Found carousel container:', carousel);
  
  // Find all slide elements
  const slides = carousel.querySelectorAll('[data-slide]') || 
                carousel.querySelectorAll('.absolute.top-0.left-0') ||
                carousel.querySelectorAll('div > div > div');
  
  if (slides.length === 0) {
    console.error('❌ Could not find slide elements');
    return;
  }
  
  console.log(`✅ Found ${slides.length} slides`);
  
  // Find all images in the carousel
  const images = carousel.querySelectorAll('img');
  console.log(`✅ Found ${images.length} images in carousel`);
  
  // Add debug overlay to the carousel
  const debugOverlay = document.createElement('div');
  debugOverlay.style.position = 'absolute';
  debugOverlay.style.top = '0';
  debugOverlay.style.left = '0';
  debugOverlay.style.padding = '10px';
  debugOverlay.style.background = 'rgba(0,0,0,0.7)';
  debugOverlay.style.color = 'white';
  debugOverlay.style.zIndex = '1000';
  debugOverlay.style.fontFamily = 'monospace';
  debugOverlay.style.fontSize = '12px';
  debugOverlay.style.maxWidth = '80%';
  debugOverlay.style.maxHeight = '80%';
  debugOverlay.style.overflow = 'auto';
  debugOverlay.style.borderRadius = '4px';
  
  carousel.style.position = 'relative';
  carousel.appendChild(debugOverlay);
  
  function updateDebugInfo() {
    const allImages = carousel.querySelectorAll('img');
    const visibleSlides = carousel.querySelectorAll('[style*="visibility: visible"]') || 
                          carousel.querySelectorAll('[style*="opacity: 1"]') ||
                          carousel.querySelectorAll('.opacity-100');
    
    let debugHTML = '<h3>Carousel Debug</h3>';
    
    // Current state
    debugHTML += '<h4>Current State</h4>';
    debugHTML += `<div>Total Slides: ${slides.length}</div>`;
    debugHTML += `<div>Visible Slides: ${visibleSlides.length}</div>`;
    debugHTML += `<div>Total Images: ${allImages.length}</div>`;
    
    // Image info
    debugHTML += '<h4>Images</h4>';
    allImages.forEach((img, i) => {
      const parent = img.parentElement;
      const grandparent = parent?.parentElement;
      
      const isVisible = window.getComputedStyle(img).display !== 'none' && 
                       window.getComputedStyle(img).visibility !== 'hidden' &&
                       !img.closest('[style*="visibility: hidden"]');
                       
      const computedStyle = window.getComputedStyle(img);
      
      debugHTML += `<div style="margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom: 8px;">
        <div>Image #${i + 1}</div>
        <div>src: ${img.currentSrc || img.src}</div>
        <div>visible: ${isVisible ? '✓' : '✗'}</div>
        <div>complete: ${img.complete ? '✓' : '✗'}</div>
        <div>size: ${img.naturalWidth}×${img.naturalHeight}</div>
        <div>display: ${computedStyle.display}</div>
        <div>position: ${computedStyle.position}</div>
        <div>objectFit: ${computedStyle.objectFit}</div>
        <div>width: ${computedStyle.width}</div>
        <div>height: ${computedStyle.height}</div>
      </div>`;
    });
    
    // Parent container styles
    const parentStyles = window.getComputedStyle(carousel);
    debugHTML += '<h4>Carousel Container</h4>';
    debugHTML += `<div>width: ${parentStyles.width}</div>`;
    debugHTML += `<div>height: ${parentStyles.height}</div>`;
    debugHTML += `<div>position: ${parentStyles.position}</div>`;
    debugHTML += `<div>display: ${parentStyles.display}</div>`;
    debugHTML += `<div>overflow: ${parentStyles.overflow}</div>`;
    
    // Add close button
    debugHTML += '<button id="closeDebug" style="margin-top: 10px; padding: 5px 10px; background: #f44336; border: none; color: white; border-radius: 4px; cursor: pointer;">Close Debug</button>';
    
    debugOverlay.innerHTML = debugHTML;
    
    // Add event listener to close button
    document.getElementById('closeDebug').addEventListener('click', () => {
      debugOverlay.remove();
      clearInterval(updateInterval);
      console.log('🔍 Carousel debug closed');
    });
  }
  
  // Update debug info every second
  updateDebugInfo();
  const updateInterval = setInterval(updateDebugInfo, 1000);
  
  // Log image rendering events
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    img.addEventListener('load', () => {
      console.log('🖼️ Image loaded:', img.src);
    });
    img.addEventListener('error', () => {
      console.error('❌ Image failed to load:', img.src);
    });
    return img;
  };
  
  console.log('🔍 Carousel debug active. A debug panel has been added to the carousel.');
})();
