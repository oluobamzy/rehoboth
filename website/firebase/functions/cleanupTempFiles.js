// firebase/functions/cleanupTempFiles.js
// This Cloud Function automatically cleans up files in the temp directory after 24 hours

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Cloud Function that runs once a day to delete temporary files older than 24 hours
 */
exports.cleanupTempFiles = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    const storage = admin.storage();
    const bucket = storage.bucket();
    
    console.log('Starting cleanup of temporary files...');
    
    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);
    
    // List all files in the temp directory
    const [files] = await bucket.getFiles({ prefix: 'temp/' });
    
    let deletedCount = 0;
    
    // Check each file's creation time and delete if older than the cutoff
    const deletePromises = files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const createTime = new Date(metadata.timeCreated);
      
      if (createTime < cutoffTime) {
        console.log(`Deleting temporary file: ${file.name}`);
        await file.delete();
        deletedCount++;
      }
    });
    
    await Promise.all(deletePromises);
    
    console.log(`Cleanup complete. Deleted ${deletedCount} temporary files.`);
    return null;
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
    return null;
  }
});

/**
 * Cloud Function that triggers when a new file is uploaded to the temp directory
 * This sets metadata on the file with the upload time so we can track its age
 */
exports.markTempFileUpload = functions.storage.object().onFinalize(async (object) => {
  try {
    // Only process files in the temp directory
    if (!object.name.startsWith('temp/')) {
      return null;
    }
    
    const storage = admin.storage();
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(object.name);
    
    // Add metadata to track when the file was uploaded
    const metadata = {
      metadata: {
        tempUploadTime: new Date().toISOString()
      }
    };
    
    await file.setMetadata(metadata);
    
    console.log(`Marked temporary file ${object.name} for future cleanup`);
    return null;
  } catch (error) {
    console.error('Error marking temporary file upload:', error);
    return null;
  }
});
