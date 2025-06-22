
// Carousel Debug Script - Run in browser console
(function() {
  console.log('🔍 Carousel Debug Script Loaded');
  
  // Find the carousel container - try multiple selectors
  const carousel = document.querySelector('[data-carousel="hero"]') || 
                   document.querySelector('#hero-carousel') ||
                   document.querySelector('.relative.overflow-hidden') ||
                   document.querySelector('section');
  
  if (!carousel) {
    console.error('❌ Could not find carousel container');
    return;
  }
  
  console.log('✅ Found carousel container:', carousel);
  
  // Find all slide elements - try multiple selectors
  const slides = 
    carousel.querySelectorAll('[data-slide]') || 
    carousel.querySelectorAll('.carousel-slide') ||
    carousel.querySelectorAll('[data-carousel-slide]') ||
    carousel.querySelectorAll('[data-testid^="carousel-slide-"]');
  
  if (slides.length === 0) {
    console.error('❌ Could not find slide elements. Dumping carousel HTML for inspection:');
    console.log(carousel.innerHTML);
    return;
  }
  
  console.log(`✅ Found ${slides.length} slides`);
  
  // Check for slide backgrounds
  const backgrounds = carousel.querySelectorAll('[data-testid="carousel-slide-background"]') || 
                     carousel.querySelectorAll('[style*="background-image"]');
  
  console.log(`✅ Found ${backgrounds.length} background elements`);
  
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
    // Find active slide
    const activeSlide = carousel.querySelector('[data-active="true"]') || 
                        carousel.querySelector('[data-slide] [style*="opacity: 1"]') || 
                        carousel.querySelector('.opacity-100');
    
    let debugHTML = '<h3>Carousel Debug</h3>';
    
    // Current state
    debugHTML += '<h4>Carousel State</h4>';
    debugHTML += `<div>Total Slides: ${slides.length}</div>`;
    debugHTML += `<div>Total Background Elements: ${backgrounds.length}</div>`;
    debugHTML += `<div>Active Slide Found: ${activeSlide ? '✓' : '✗'}</div>`;
    debugHTML += `<div>Carousel Dimensions: ${carousel.offsetWidth}×${carousel.offsetHeight}</div>`;
    
    // Examine background elements
    debugHTML += '<h4>Background Images</h4>';
    backgrounds.forEach((bg, i) => {
      const url = bg.dataset.imageUrl || 
                 bg.style.backgroundImage.replace(/^url\((['"])?(.*?)\1\)$/, '$2');
      
      let isVisible = window.getComputedStyle(bg).display !== 'none' && 
                     window.getComputedStyle(bg).visibility !== 'hidden';
                     
      // Check if parent is visible
      const parent = bg.parentElement;
      if (parent && (
          window.getComputedStyle(parent).display === 'none' ||
          window.getComputedStyle(parent).visibility === 'hidden' ||
          parent.classList.contains('opacity-0')
      )) {
        isVisible = false;
      }
      
      const computedStyle = window.getComputedStyle(bg);
      
      debugHTML += `<div style="margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom: 8px;">
        <div>Background #${i + 1}</div>
        <div>URL: ${url}</div>
        <div>Visible: ${isVisible ? '✓' : '✗'}</div>
        <div>Background Image Set: ${computedStyle.backgroundImage !== 'none' ? '✓' : '✗'}</div>
        <div>Background Size: ${computedStyle.backgroundSize}</div>
        <div>Position: ${computedStyle.position}</div>
        <div>Width: ${computedStyle.width}</div>
        <div>Height: ${computedStyle.height}</div>
      </div>`;
    });
    
    // Directly check all image URLs
    debugHTML += '<h4>Image URL Tests</h4>';
    const imageUrls = Array.from(backgrounds)
      .map(bg => bg.dataset.imageUrl || 
                bg.style.backgroundImage.replace(/^url\((['"])?(.*?)\1\)$/, '$2'))
      .filter(Boolean);
    
    imageUrls.forEach((url, i) => {
      // Create an image element to test loading
      const img = new Image();
      img.onload = function() {
        const resultEl = document.getElementById(`image-test-${i}`);
        if (resultEl) {
          resultEl.innerHTML = `<span style="color:green">✓ Loaded (${this.width}×${this.height})</span>`;
        }
      };
      img.onerror = function() {
        const resultEl = document.getElementById(`image-test-${i}`);
        if (resultEl) {
          resultEl.innerHTML = '<span style="color:red">✗ Failed to load</span>';
        }
      };
      img.src = url;
      
      debugHTML += `<div style="margin-bottom: 5px;">
        <div>URL #${i + 1}: ${url}</div>
        <div id="image-test-${i}">Testing...</div>
      </div>`;
    });
    
    // Suggest fixes
    debugHTML += '<h4>Possible Issues & Fixes</h4>';
    if (slides.length === 0) {
      debugHTML += '<div style="color:red">❌ No slides found. Check carousel structure.</div>';
    }
    if (backgrounds.length === 0) {
      debugHTML += '<div style="color:red">❌ No background elements found. Check image containers.</div>';
    }
    if (backgrounds.length > 0 && imageUrls.some(url => !url || url === 'none')) {
      debugHTML += '<div style="color:red">❌ Some background images have no URL set. Check imageUrl prop.</div>';
    }
    
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
  
  console.log('🔍 Carousel debug active. A debug panel has been added to the carousel.');
})();
