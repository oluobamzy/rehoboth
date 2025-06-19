/**
 * Script to update Firebase Storage CORS configuration
 * This bypasses the need for gcloud CLI
 */
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// You need to download your service account key from Firebase console
// Go to Project Settings > Service accounts > Generate new private key
// Save it securely and provide the path below
// IMPORTANT: Never commit this file to version control!
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json';

// Initialize Firebase Admin
try {
  console.log('Initializing Firebase Admin...');
  const serviceAccount = require(serviceAccountPath);
  
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  const bucket = getStorage().bucket();
  
  console.log('Setting CORS configuration for bucket:', bucket.name);
  
  // This matches your existing configuration
  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET'],
      maxAgeSeconds: 3600,
      responseHeader: [
        'Content-Type',
        'Cross-Origin-Resource-Policy',
        'Content-Length',
        'Date',
        'ETag'
      ]
    }
  ];
  
  bucket.setCorsConfiguration(corsConfiguration)
    .then(() => {
      console.log('Successfully updated CORS configuration!');
    })
    .catch((error) => {
      console.error('Error updating CORS configuration:', error);
    });
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  console.log('Make sure you have set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('or placed your service account key at ./service-account-key.json');
}
