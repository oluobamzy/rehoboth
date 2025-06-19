// src/utils/imageUpload.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import  firebaseApp  from '@/services/firebase';
import { posthog } from '@/services/posthog';
import { getProxiedStorageUrl } from './storageProxy';

const storage = getStorage(firebaseApp);

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'carousel/image1.jpg')
 * @param useProxy Whether to return a proxied URL
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
    
    // Return either the direct URL or the proxied URL based on the useProxy flag
    return useProxy ? getProxiedStorageUrl(downloadURL) : downloadURL;
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
 * Get a proxied URL for the uploaded image
 * @param path The storage path of the image
 * @returns The proxied URL of the image
 */
export function getProxiedImageUrl(path: string): string {
  return getProxiedStorageUrl(path);
}

/**
 * Proxy an existing image URL
 * @param url The original URL of the image
 * @returns The proxied URL if applicable, otherwise the original URL
 */
export function proxyImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  
  // Only proxy Firebase Storage URLs
  if (url.includes('firebasestorage.googleapis.com')) {
    return getProxiedStorageUrl(url);
  }
  
  return url;
}
