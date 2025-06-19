# Firebase Storage CORS Proxy Solution

## Overview

This document describes the implemented solution for handling CORS issues with Firebase Storage resources in the Rehoboth Church website. The solution eliminates CORS errors when accessing Firebase Storage media (images, audio, video) while maintaining security and performance.

## Problem Statement

Firebase Storage resources (when accessed directly) can sometimes lead to CORS (Cross-Origin Resource Sharing) errors when:
- Used in media elements like audio/video players
- Displayed in image components 
- Fetched via JavaScript APIs

## Solution Architecture

We implemented a Next.js API proxy that:
1. Intercepts requests to Firebase Storage
2. Fetches the requested resource server-side
3. Returns the resource with proper CORS headers
4. Provides caching for improved performance

### Key Components

1. **API Proxy Route** (`src/app/api/proxy/[...path]/route.ts`)
   - Receives requests for Firebase Storage resources
   - Forwards requests to Firebase Storage
   - Returns resources with proper CORS headers
   - Implements advanced caching based on content type:
     - Images: Cached for 1 week (with stale-while-revalidate for 1 day)
     - Audio/Video: Cached for 1 day (with stale-while-revalidate for 1 hour)
     - HLS Playlists: Cached for 5 minutes
     - Other resources: Cached for 1 hour
   - Preserves ETags and Last-Modified headers from Firebase

2. **Storage Proxy Utility** (`src/utils/storageProxy.ts`)
   - Provides `getProxiedStorageUrl` function to convert Firebase URLs to proxy URLs
   - Handles both full URLs and relative paths

3. **Enhanced Components**
   - `FallbackImage`: Auto-detects and proxies Firebase Storage image URLs
   - `SermonPlayer`: Uses proxy for all media resources (audio, video, thumbnails)
   - Carousel components: Use proxy for all carousel images

4. **Upload Utility** (`src/utils/imageUpload.ts`)
   - Modified to optionally return proxied URLs when requested

## How to Use the Proxy

### For Images

```tsx
// Option 1: Use FallbackImage component (recommended)
import FallbackImage from '@/components/common/FallbackImage';

<FallbackImage 
  src={imageUrl}  // Can be Firebase URL or any image URL
  alt="Description" 
  width={400} 
  height={300} 
/>

// Option 2: Convert URL manually
import { getProxiedStorageUrl } from '@/utils/storageProxy';
import Image from 'next/image';

<Image 
  src={getProxiedStorageUrl(firebaseUrl)}
  alt="Description"
  width={400}
  height={300}
/>
```

### For Media (Audio/Video)

```tsx
import { getProxiedStorageUrl } from '@/utils/storageProxy';

// Audio
<audio src={getProxiedStorageUrl(audioUrl)} controls />

// Video
<video src={getProxiedStorageUrl(videoUrl)} controls />
```

### For Image Uploads

```typescript
import { uploadImage } from '@/utils/imageUpload';

// Upload and get a proxied URL back
const imageUrl = await uploadImage(file, 'path/to/save.jpg', true); // true enables proxy
```

## Benefits

1. **Eliminates CORS Issues**: No more CORS errors for any Firebase Storage resources
2. **Better Security**: Controlled access to storage resources through your API
3. **Performance Optimization**: Built-in caching for better performance
4. **Simple Implementation**: Minimal changes to existing code
5. **Type Safety**: Full TypeScript support

## Implementation Notes

* The proxy automatically detects Firebase Storage URLs in the `FallbackImage` component
* All SermonPlayer media and carousel images now use the proxy
* The CSP (Content Security Policy) still allows direct Firebase Storage access as a fallback
* The proxy has intelligent caching built in with content-type specific cache times to improve performance

## Maintenance

* If new components are added that use Firebase Storage resources, ensure they use `getProxiedStorageUrl` or `FallbackImage`
* Run the `check-firebase-proxy.js` script to validate proxy usage across the codebase:
  ```
  node scripts/check-firebase-proxy.js
  ```

## Future Enhancements

* Consider adding more advanced caching or a CDN integration
* Implement request batching for optimizing multiple small media requests
* Add image optimization features (resize, format conversion) to the proxy
