/**
 * Utility functions for Supabase Storage URL handling
 */

/**
 * Converts a Supabase Storage URL or path to the correct format
 * 
 * @param {string} path - Either a full Supabase Storage URL or a relative path
 * @param {boolean} debug - Whether to log debug info
 * @returns {string} The URL to access the resource
 */
export function getSupabaseStorageUrl(path: string, debug: boolean = false): string {
  // Safety check for null/undefined
  if (!path) {
    if (debug) console.log('Empty path provided to getSupabaseStorageUrl');
    return '';
  }
  
  // If it's already a full Supabase URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (debug) console.log('Full URL provided:', path);
    return path;
  }
  
  // For relative paths, construct the full Supabase Storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL not configured');
    return path;
  }
  
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/sermon-media/${path}`;
  if (debug) console.log(`Converting relative path to full URL: ${path} -> ${fullUrl}`);
  
  return fullUrl;
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/v1/object/public/');
}

/**
 * Extract the file path from a Supabase Storage URL
 */
export function extractSupabaseStoragePath(url: string): string {
  const match = url.match(/\/storage\/v1\/object\/public\/sermon-media\/(.+)$/);
  return match ? match[1] : url;
}