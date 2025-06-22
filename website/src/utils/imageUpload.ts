// src/utils/imageUpload.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import  firebaseApp  from '@/services/firebase';
import { posthog } from '@/services/posthog';

const storage = getStorage(firebaseApp);

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'carousel/image1.jpg')
 * @param useProxy Whether to return a proxied URL (deprecated, kept for backward compatibility)
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(file: File, path: string, useProxy: boolean = false): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Track the event
    posthog.capture('image_upload_success', {
      fileSize: file.size,
      fileType: file.type,
      path,
    });
    
    // Always return the direct URL now
    return downloadURL;
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
  // For backward compatibility, now just returns the path or constructs a direct URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // If this is a relative path without http, assume it's a Firebase Storage path
  // and construct the direct URL
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/${encodedPath}?alt=media`;
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
