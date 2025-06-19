#!/usr/bin/env node

/**
 * This script updates CORS settings using Firebase CLI
 * Uses firebase-tools to avoid the need for gcloud
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to CORS configuration file
const corsConfigPath = path.join(__dirname, '..', '..', 'firebaseCORS.json');

// Get the bucket name from environment or default to project ID
const getBucketName = () => {
  // Use the bucket name from env or default to the known project ID
  if (process.env.BUCKET_NAME) {
    return process.env.BUCKET_NAME;
  }
  
  // Default project ID from the command line error
  return 'rehoboth-church-63d6e.appspot.com';
};

// Main execution
const main = async () => {
  try {
    // Check if CORS config file exists
    if (!fs.existsSync(corsConfigPath)) {
      console.error(`CORS config file not found at ${corsConfigPath}`);
      process.exit(1);
    }

    // Read CORS config
    const corsConfig = fs.readFileSync(corsConfigPath, 'utf-8');
    
    // Get bucket name
    const bucketName = process.env.BUCKET_NAME || getBucketName();
    
    console.log(`Updating CORS configuration for bucket: ${bucketName}`);
    console.log('Using configuration:');
    console.log(corsConfig);
    
    // Create a temporary file for the command
    const tempFile = path.join(__dirname, 'temp_cors.json');
    fs.writeFileSync(tempFile, corsConfig);
    
    // Get project ID
    const projectId = 'rehoboth-church-63d6e'; // Hardcoded since we know the ID
    
    // Run the Firebase storage:cors command
    const cmd = `npx firebase-tools storage:cors ${tempFile} --project ${projectId}`;
    
    console.log(`Executing: ${cmd}`);
    
    exec(cmd, (error, stdout, stderr) => {
      // Clean up the temporary file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(stderr);
        process.exit(1);
      }
      
      console.log('CORS configuration successfully updated!');
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

main();
