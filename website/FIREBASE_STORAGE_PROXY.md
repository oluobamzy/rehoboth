# Firebase Storage CORS Proxy Solution

This document explains how we've solved the CORS issues with Firebase Storage using a Next.js API route proxy.

## Problem

Firebase Storage URLs were causing CORS errors when accessed directly from the browser, particularly for:
- Sermon audio and video files
- Carousel images
- Event photos
- Other media stored in Firebase Storage

## Solution

We've implemented a server-side proxy using Next.js API routes that:

1. Fetches resources from Firebase Storage on the server-side
2. Adds appropriate CORS headers to the response
3. Returns the data to the client without CORS restrictions

## Implementation Details

### 1. Proxy API Route

We created a proxy API route at:
```
/src/app/api/proxy/[...path]/route.ts
```

This route:
- Takes a Firebase Storage path as input
- Fetches the resource from Firebase Storage
- Sets appropriate CORS and caching headers
- Returns the binary data with the correct content type

### 2. StorageProxy Utility

We've created a utility function to easily convert Firebase Storage URLs to proxied URLs:
```
/src/utils/storageProxy.ts
```

This utility:
- Parses Firebase Storage URLs to extract the path
- Creates a proxied URL using the `/api/proxy` API route
- Only processes URLs that match Firebase Storage patterns

### 3. Updated Components

We've updated key components to use the proxy:

- **FallbackImage**: A wrapper around Next.js Image that automatically proxies Firebase Storage URLs
- **SermonPlayer**: Uses the proxy for all media resources (audio, video, thumbnails)
- **Admin Carousel**: Uses the proxy when displaying uploaded images

### 4. Image Upload Utility

The image upload utility has been enhanced to optionally return proxied URLs:
```
/src/utils/imageUpload.ts
```

## Usage Examples

### Basic Usage

```tsx
import { getProxiedStorageUrl } from '@/utils/storageProxy';

// Convert a Firebase Storage URL to a proxied URL
const audioUrl = getProxiedStorageUrl('https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/sermons%2Faudio.mp3?alt=media');

// Or with a direct path
const audioUrl = getProxiedStorageUrl('sermons/audio.mp3');
```

### With FallbackImage Component

```tsx
import FallbackImage from '@/components/common/FallbackImage';

<FallbackImage 
  src={imageUrl} 
  alt="Description"
  width={300}
  height={200}
  fallbackSrc="/path/to/fallback.jpg"
/>
```

The FallbackImage component automatically:
- Detects Firebase Storage URLs and proxies them
- Handles loading errors by showing a fallback image
- Manages state during image loading

### In Services

Our services like `carouselService.ts` automatically proxy Firebase Storage URLs before returning them to components.

## Performance Considerations

The proxy includes optimized caching strategies:
- **Images**: Cached for 7 days with stale-while-revalidate for an additional day
- **Audio/Video**: Cached for 24 hours
- **HLS Streams**: Short cache time (5 minutes) as they may update
- **Other Content**: Default 1-hour cache

## Troubleshooting

If you encounter 404 errors from the proxy:
1. Check that the path is a valid Firebase Storage path
2. Make sure the resource exists in Firebase Storage
3. Verify you're using one of the recognized path patterns (sermons/, carousel/, events/, etc.)
4. Ensure getProxiedStorageUrl() is being used with Firebase URLs only

## Maintenance

To maintain this solution:
1. Keep the Firebase Storage bucket name updated in `.env.local`
2. Add new path patterns to the proxy validation if new storage folders are created
3. Use the check script to verify all components are properly using the proxy:
   ```
   node scripts/check-firebase-proxy.js
   ```
