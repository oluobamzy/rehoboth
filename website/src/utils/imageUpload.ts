// src/utils/imageUpload.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import  firebaseApp  from '@/services/firebase';
import { posthog } from '@/services/posthog';

const storage = getStorage(firebaseApp);

/**
 * Upload an image to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'carousel/image1.jpg')
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
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
