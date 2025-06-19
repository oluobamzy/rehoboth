/**
 * A simpler direct method to update Firebase Storage CORS using the REST API
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Config
const PROJECT_ID = 'rehoboth-church-63d6e';
const CORS_CONFIG_PATH = path.resolve(__dirname, '..', '..', 'firebaseCORS.json');

// Main function
async function updateCors() {
  // Read the access token from environment variable
  const accessToken = process.env.FIREBASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Error: FIREBASE_ACCESS_TOKEN environment variable is required');
    console.error('Run: npx firebase-tools login:ci and set the token as FIREBASE_ACCESS_TOKEN');
    process.exit(1);
  }

  try {
    // Read CORS configuration
    const corsConfig = JSON.parse(fs.readFileSync(CORS_CONFIG_PATH, 'utf8'));
    console.log('Using CORS configuration:');
    console.log(JSON.stringify(corsConfig, null, 2));

    // Make the API request to update CORS
    const bucketName = process.env.BUCKET_NAME || `${PROJECT_ID}.appspot.com`;
    console.log(`Updating CORS for bucket: ${bucketName}`);

    const options = {
      hostname: 'storage.googleapis.com',
      path: `/storage/v1/b/${bucketName}/cors`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('CORS configuration updated successfully!');
          try {
            const responseData = JSON.parse(data);
            console.log(JSON.stringify(responseData, null, 2));
          } catch (e) {
            console.log(data);
          }
        } else {
          console.error(`Error updating CORS: ${res.statusCode}`);
          console.error(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error making request:', error);
    });

    req.write(JSON.stringify({ cors: corsConfig }));
    req.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the function
updateCors();
