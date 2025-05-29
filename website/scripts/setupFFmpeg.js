// scripts/setupFFmpeg.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs for FFmpeg core files
const FFMPEG_CORE_JS_URL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/ffmpeg-core.js';
const FFMPEG_CORE_WASM_URL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/ffmpeg-core.wasm';

// Destination directory
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

/**
 * Downloads a file from a URL to a destination
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${destination}...`);
    
    // Ensure the directory exists
    const dir = path.dirname(destination);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: Status code ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${url}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

/**
 * Main setup function
 */
async function setupFFmpeg() {
  try {
    console.log('Setting up FFmpeg core files...');
    
    // Download FFmpeg core JS
    const coreJsPath = path.join(PUBLIC_DIR, 'ffmpeg-core.js');
    await downloadFile(FFMPEG_CORE_JS_URL, coreJsPath);
    
    // Download FFmpeg core WASM
    const coreWasmPath = path.join(PUBLIC_DIR, 'ffmpeg-core.wasm');
    await downloadFile(FFMPEG_CORE_WASM_URL, coreWasmPath);
    
    console.log('✅ FFmpeg setup complete');
  } catch (error) {
    console.error('Error setting up FFmpeg:', error);
    process.exit(1);
  }
}

// Run the setup
setupFFmpeg();
