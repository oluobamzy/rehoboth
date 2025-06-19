/**
 * Utility functions for Firebase Storage URL handling with CORS proxy support
 */

/**
 * Converts a Firebase Storage URL or path to a proxied URL that avoids CORS issues
 * 
 * @param {string} path - Either a full Firebase Storage URL or a relative path
 * @param {boolean} debug - Whether to log debug info
 * @returns {string} The URL to access the resource through the proxy
 */
export function getProxiedStorageUrl(path: string, debug: boolean = false): string {
  // Safety check for null/undefined
  if (!path) {
    if (debug) console.log('Empty path provided to getProxiedStorageUrl');
    return '';
  }
  
  // Check if it's already a proxied URL
  if (path.startsWith('/api/proxy/')) {
    if (debug) console.log('Already proxied URL:', path);
    return path;
  }
  
  // Handle URLs with protocol-relative format (//firebasestorage...)
  if (path.startsWith('//firebasestorage.googleapis.com')) {
    path = `https:${path}`;
  }
  
  // Handle Firebase Storage URLs
  if (path.includes('firebasestorage.googleapis.com')) {
    // Extract the path from the URL
    const match = path.match(/\/o\/([^?]+)/);
    if (match && match[1]) {
      const decodedPath = decodeURIComponent(match[1]);
      const proxiedUrl = `/api/proxy/${decodedPath}`;
      if (debug) console.log(`Converting Firebase URL to proxy: ${path} -> ${proxiedUrl}`);
      return proxiedUrl;
    }
    if (debug) console.log('Could not parse Firebase URL pattern:', path);
    return path; // Return original if can't parse
  }
  
  // For explicit Firebase Storage paths (not complete URLs):
  // Handle paths that start with commonly used Firebase Storage folders
  const isFirebasePath = 
    path.startsWith('sermons/') || 
    path.startsWith('sermon_series/') || 
    path.startsWith('carousel/') ||
    path.startsWith('events/') ||
    /^\d+-\d+\.jpeg$/.test(path); // Handle timestamp-based filenames
    
  if (isFirebasePath) {
    // Remove any leading slash to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const proxiedUrl = `/api/proxy/${cleanPath}`;
    if (debug) console.log(`Converting Firebase path to proxy: ${path} -> ${proxiedUrl}`);
    return proxiedUrl;
  }
  
  // For all other URLs/paths, return as-is without proxying
  if (debug) console.log('Not proxying URL/path:', path);
  return path;
}

/**
 * Updates all Firebase Storage URLs in your application to use the proxy
 * 
 * @example
 * // Use in components
 * import { getProxiedStorageUrl } from '@/utils/storageProxy';
 * 
 * // Converting a Firebase URL
 * const audioUrl = getProxiedStorageUrl(sermon.audioUrl);
 * 
 * // Or using directly with a path
 * const imageUrl = getProxiedStorageUrl('sermon_series/summer2025/thumbnail.jpg');
 */
