// scripts/deployFirebaseRules.js
// This script deploys the Firebase storage rules to protect sermon media files

const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Deploy Firebase storage rules
 * Note: This requires the Firebase CLI to be installed and configured
 * Run 'npm install -g firebase-tools' and 'firebase login' first
 */
async function deployStorageRules() {
  try {
    console.log('Deploying Firebase storage rules...');
    
    // Path to the rules file
    const rulesPath = path.join(__dirname, '..', 'firebase-storage.rules');
    
    // Check if rules file exists
    if (!fs.existsSync(rulesPath)) {
      throw new Error('Firebase storage rules file not found');
    }
    
    // Read the rules file
    const rules = fs.readFileSync(rulesPath, 'utf8');
    console.log('Rules file loaded successfully');
    
    // Execute Firebase CLI command to deploy rules
    const { exec } = require('child_process');
    const command = 'firebase deploy --only storage';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error deploying rules: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      
      console.log(`stdout: ${stdout}`);
      console.log('✅ Firebase storage rules deployed successfully');
    });
  } catch (error) {
    console.error('Error deploying Firebase storage rules:', error.message);
  }
}

/**
 * Setup Firebase project configuration for storage rules
 */
async function setupFirebaseConfig() {
  try {
    console.log('Setting up Firebase project configuration...');
    
    // Create a firebase.json file if it doesn't exist
    const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
    
    const firebaseConfig = {
      "storage": {
        "rules": "firebase-storage.rules"
      }
    };
    
    fs.writeFileSync(
      firebaseConfigPath,
      JSON.stringify(firebaseConfig, null, 2),
      'utf8'
    );
    
    console.log('✅ Firebase configuration created successfully');
  } catch (error) {
    console.error('Error setting up Firebase configuration:', error.message);
  }
}

// Run the setup and deployment
async function main() {
  await setupFirebaseConfig();
  await deployStorageRules();
  
  // Call the sermon storage setup script
  console.log('Setting up sermon storage structure...');
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/setupSermonStorage.js', { stdio: 'inherit' });
    console.log('✅ Sermon storage structure setup successfully');
  } catch (error) {
    console.error('Error setting up sermon storage structure:', error);
  }
}

main();
