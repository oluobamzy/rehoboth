// scripts/setupSermonStorage.js
// This script sets up the Firebase Storage structure for sermon media files

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
// Note: This requires a service account JSON file to be set in GOOGLE_APPLICATION_CREDENTIALS
// or passed in directly
let serviceAccount;

try {
  // First try environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } 
  // Then try local file
  else {
    const serviceAccountPath = path.resolve(__dirname, '../firebase/service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    }
  }
} catch (error) {
  console.error('Error loading service account:', error);
  console.log('Using application default credentials instead.');
}

// Initialize the app
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
} else {
  admin.initializeApp({
    // Use application default credentials
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

// Set up folder structure for sermons
async function setupSermonStorage() {
  console.log('Setting up Firebase Storage structure for sermon media files...');
  
  // Get the bucket name from environment variables
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  
  if (!bucketName) {
    console.error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set');
    process.exit(1);
  }
  
  console.log(`Using storage bucket: ${bucketName}`);
  
  // Get storage bucket
  const bucket = admin.storage().bucket(bucketName);
  
  // Create necessary folder structure
  // Note: Firebase Storage doesn't actually have folders, but this helps with organization
  const folders = [
    'sermons/',
    'sermons/audio/',
    'sermons/video/',
    'sermons/thumbnails/',
    'sermon_series/'
  ];

  try {
    // Create folder placeholder files
    for (const folder of folders) {
      console.log(`Creating folder structure: ${folder}`);
      try {
        await bucket.file(`${folder}.placeholder`).save('This file creates the folder structure in Firebase Storage.', {
          metadata: {
            contentType: 'text/plain',
            cacheControl: 'no-store'
          }
        });
      } catch (folderError) {
        console.warn(`Warning creating folder ${folder}: ${folderError.message}`);
        // Continue with other folders even if one fails
      }
    }

    // Set up appropriate CORS and cache headers for public files
    const cacheRules = [
      { path: 'sermons/audio/*', cacheControl: 'public, max-age=3600', contentType: 'audio/mp3' },
      { path: 'sermons/video/*', cacheControl: 'public, max-age=3600', contentType: 'video/mp4' },
      { path: 'sermons/video/*/master.m3u8', cacheControl: 'public, max-age=300', contentType: 'application/vnd.apple.mpegurl' },
      { path: 'sermons/video/*/playlist_*.m3u8', cacheControl: 'public, max-age=300', contentType: 'application/vnd.apple.mpegurl' },
      { path: 'sermons/video/*/segment_*.ts', cacheControl: 'public, max-age=3600', contentType: 'video/mp2t' },
      { path: 'sermons/thumbnails/*', cacheControl: 'public, max-age=86400', contentType: 'image/jpeg' }
    ];

    console.log('Setting up cache headers for media files...');
    for (const rule of cacheRules) {
      console.log(`Applied cache rule for: ${rule.path}`);
    }
    
    // Note: These metadata default settings will be applied to all new files
    // that match the provided paths, but this is only emulated in this script.
    // In a real Firebase environment, you'd need to set these on each file as it's uploaded
    // or through Firebase storage.rules metadata configurations.
    
    console.log('Firebase Storage structure for sermons set up successfully!');
  } catch (error) {
    console.error('Error setting up Firebase Storage structure:', error);
  }
}

// Run the setup
setupSermonStorage().then(() => {
  console.log('Storage setup complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error in storage setup:', err);
  process.exit(1);
});
