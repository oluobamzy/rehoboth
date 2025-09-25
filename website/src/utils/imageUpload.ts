// src/utils/imageUpload.ts
import { createClient } from '@supabase/supabase-js';
import { posthog } from '@/services/posthog';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'carousel/image1.jpg')
 * @param useProxy Whether to return a proxied URL (deprecated, kept for backward compatibility)
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(file: File, path: string, useProxy: boolean = false): Promise<string> {
  try {
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('sermon-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('sermon-media')
      .getPublicUrl(path);

    // Track the event
    posthog.capture('image_upload_success', {
      fileSize: file.size,
      fileType: file.type,
      path,
    });
    
    // Always return the direct URL now
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Track the error
    posthog.capture('image_upload_error', {
      fileSize: file.size,
      fileType: file.type,
      path,
      error: (error as Error).message,
    });
    
    throw error;
  }
}

/**
 * Generate a unique file path for uploading
 * @param file The file to upload
 * @param directory The directory to upload to
 * @returns A unique file path
 */
export function generateUniqueFilePath(file: File, directory: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = file.name.split('.').pop();
  return `${directory}/${timestamp}-${random}.${extension}`;
}

/**
 * Get a direct URL for the uploaded image (formerly proxied)
 * @param path The storage path of the image
 * @returns The direct URL of the image
 * @deprecated - No longer needed as we use direct URLs
 */
export function getProxiedImageUrl(path: string): string {
  // For backward compatibility, now just returns the path as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // For relative paths, assume they're already Supabase Storage URLs or return as-is
  return path;
}

/**
 * No longer proxies URLs, just returns the original
 * @param url The original URL of the image
 * @returns The original URL unchanged
 * @deprecated - No longer proxies images
 */
export function proxyImageUrl(url: string | null | undefined): string | null | undefined {
  return url; // Simply return the URL unchanged
}
