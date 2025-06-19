/**
 * Helper script to set up environment variables for the Firebase Storage Proxy
 */
const fs = require('fs');
const path = require('path');

// Default project ID (from error message)
const PROJECT_ID = 'rehoboth-church-63d6e';

// Determine bucket name
const bucketName = process.env.BUCKET_NAME || `${PROJECT_ID}.appspot.com`;

// Path to .env.local file
const envPath = path.resolve(__dirname, '..', '.env.local');

try {
  // Read existing .env.local file or create empty one
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if the FIREBASE_STORAGE_URL already exists
  const hasStorageUrl = envContent.includes('NEXT_PUBLIC_FIREBASE_STORAGE_URL=');
  
  // Add or update the storage URL
  if (hasStorageUrl) {
    // Replace existing line
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_STORAGE_URL=.*/g,
      `NEXT_PUBLIC_FIREBASE_STORAGE_URL=https://firebasestorage.googleapis.com/v0/b/${bucketName}/o`
    );
  } else {
    // Add new line
    envContent += `\nNEXT_PUBLIC_FIREBASE_STORAGE_URL=https://firebasestorage.googleapis.com/v0/b/${bucketName}/o\n`;
  }
  
  // Write back the updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('Environment configured for Firebase Storage Proxy');
  console.log(`Storage URL: https://firebasestorage.googleapis.com/v0/b/${bucketName}/o`);
  console.log('\nTo use the proxy instead of direct Firebase Storage URLs, replace:');
  console.log(`  https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/path/to/file?alt=media`);
  console.log('with:');
  console.log('  /api/proxy/path/to/file');
  
} catch (error) {
  console.error('Error setting up proxy configuration:', error);
}
