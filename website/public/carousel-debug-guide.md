# Carousel Image Debugging Guide

If you're experiencing issues with images not showing in the carousel, this guide provides several tools and methods to diagnose and fix the problems.

## Quick Debug URL Parameter

Add `?debug=true` to your URL to enable visual debugging mode, which will show:

- Colored borders around images (green = loaded, red = error, yellow = loading)
- Status overlays on each slide
- More verbose console logging

Example: `http://localhost:3000/?debug=true`

## Browser Console Tools

We've created several debugging scripts that you can run in your browser console:

### 1. Carousel Slide Inspector

```javascript
const script = document.createElement('script');
script.src = '/carousel-slide-inspector.js';
document.body.appendChild(script);
```

This tool will:
- Analyze all slides in the carousel
- Check visibility properties (opacity, z-index, etc)
- Verify that image URLs are loading
- Provide automatic fixes

### 2. Carousel Image Health Check

```javascript
const script = document.createElement('script');
script.src = '/carousel-image-health-check.js';
document.body.appendChild(script);
```

This tool will:
- Check if all carousel images are loading properly
- Show detailed statistics about image loading success/failure
- Suggest specific fixes for broken images

### 3. Carousel Image Loading Analyzer

```javascript
const script = document.createElement('script');
script.src = '/carousel-image-analyzer.js';
document.body.appendChild(script);
```

This tool will:
- Monitor all image loading attempts in real-time
- Track which images succeed or fail
- Provide keyboard shortcuts for fixes:
  - `Ctrl+Shift+I` - Show image summary
  - `Ctrl+Shift+F` - Attempt to fix broken images

## HTML Test Pages

We've also created standalone HTML test pages to diagnose image issues:

1. **Proxy Test**: `/proxy-test.html`
   - Tests if Firebase Storage proxy is working properly
   - Compares direct and proxied image loading
   - Helps identify if the issue is with the proxy or the image paths

2. **Image Methods Comparison**: `/image-methods-comparison.html`
   - Compares different image loading techniques
   - Tests HTML images, CSS backgrounds, and layered approach
   - Helps determine which approach works best for your images

3. **Background Test**: `/background-test.html`
   - Specifically tests CSS background-image rendering
   - Checks for overlay conflicts or stacking issues

## Server-side Tools

For database and storage diagnostics, run these scripts:

```bash
# Check if carousel images exist in Firebase Storage
node scripts/check-carousel-images.js
```

## Common Fixes

1. **For missing images**:
   - Ensure the image exists in Firebase Storage
   - Check if the path is correct in the database
   - Use the logo as a fallback: `/rehoboth_logo_plain.png`

2. **For CORS issues**:
   - The proxy should handle this automatically
   - Make sure you're using the `/api/proxy/` path for Firebase Storage images

3. **For visibility issues**:
   - Use the Carousel Slide Inspector to fix z-index, opacity, and visibility

4. **For loading issues**:
   - Preload critical carousel images
   - Use the Image Loading Analyzer to find bottlenecks

## Testing a Specific Image

To test if a specific image loads correctly:

1. Open `/proxy-test.html`
2. Enter the image path (e.g., `carousel/1750328686704-823.jpeg`)
3. Click "Test Proxy" to see if it loads through the proxy
4. Click "Test Direct" to see if it loads directly from Firebase

If direct works but proxy doesn't, it's an issue with the proxy configuration.
