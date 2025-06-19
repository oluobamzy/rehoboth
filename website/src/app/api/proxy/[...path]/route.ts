// File: src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * This proxy endpoint fetches resources from Firebase storage
 * and adds the necessary CORS headers
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { path: string[] } }
) {
  try {
    // Ensure params is awaited before using its properties
    const pathSegments = await Promise.resolve(params.path);
    // Reconstruct the path from the path segments
    const path = pathSegments.join('/');
    
    // Handle external URLs that mistakenly got routed through our proxy
    if (path.startsWith('http')) {
      console.error(`❌ ERROR: External URL routed to proxy: ${path}`);
      return NextResponse.json(
        { error: `Cannot proxy external URLs` },
        { status: 400 }
      );
    }
    
    // Get the Firebase storage URL from env variables or construct it
    const storageBaseUrl = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL || 
      'https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o';
    
    // Validate this is for a Firebase Storage resource
    const isFirebasePath = 
      path.startsWith('sermons/') || 
      path.startsWith('sermon_series/') || 
      path.startsWith('carousel/') ||
      path.startsWith('events/') ||
      // Handle direct timestamp-based filenames that might be in the root folder
      /^\d+-\d+\.jpeg$/.test(path);
      
    if (!isFirebasePath) {
      console.error(`❌ ERROR: Non-Firebase path: ${path}`);
      return NextResponse.json(
        { error: `Not a valid Firebase Storage path` },
        { status: 400 }
      );
    }
    
    // For timestamp-based files without a folder, assume they're carousel images
    let fullPath = path;
    if (/^\d+-\d+\.jpeg$/.test(path)) {
      fullPath = `carousel/${path}`;
      console.log(`Adding 'carousel/' prefix to timestamp-based filename: ${path} -> ${fullPath}`);
    }
    
    // Construct the full URL to the resource
    const url = `${storageBaseUrl}/${encodeURIComponent(fullPath)}?alt=media`;
    
    console.log('Proxying Firebase Storage resource:', url);
    
    // Fetch the resource from Firebase Storage with timeout and retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        response = await fetch(url, {
          headers: {
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 Rehoboth Church Proxy'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) break; // Success, exit retry loop
        
        console.warn(`Proxy fetch attempt ${retryCount + 1} failed: ${response.status} ${response.statusText} for ${url}`);
        
        // If the resource is not found, don't keep retrying
        if (response.status === 404) break;
        
        // Increment retry counter
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      } catch (error) {
        console.error(`Proxy fetch error on attempt ${retryCount + 1}:`, error);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        } else {
          return NextResponse.json(
            { error: `Failed to fetch resource after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
          );
        }
      }
    }
    
    if (!response?.ok) {
      console.error(`❌ Failed to proxy resource after ${retryCount} retries: ${response?.status} ${response?.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch resource: ${response?.statusText || 'Unknown error'}` },
        { status: response?.status || 500 }
      );
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get the data as array buffer
    const data = await response.arrayBuffer();
    
    // Determine appropriate cache time based on content type
    let cacheControl = 'public, max-age=3600'; // Default 1 hour
    
    if (contentType.startsWith('image/')) {
      // Cache images longer (1 week) since they rarely change
      cacheControl = 'public, max-age=604800, stale-while-revalidate=86400';
    } else if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
      // Cache video/audio for 1 day
      cacheControl = 'public, max-age=86400, stale-while-revalidate=3600';
    } else if (contentType === 'application/vnd.apple.mpegurl' || path.endsWith('.m3u8')) {
      // Don't cache HLS playlists for too long
      cacheControl = 'public, max-age=300'; // 5 minutes
    }
    
    // Return the response with proper CORS headers and caching
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': cacheControl,
        'ETag': response.headers.get('ETag') || `"${Buffer.from(path).toString('base64')}"`,
        'Last-Modified': response.headers.get('Last-Modified') || new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error('Error proxying Firebase Storage resource:', error);
    return NextResponse.json(
      { error: 'Failed to proxy resource' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
    },
  });
}
