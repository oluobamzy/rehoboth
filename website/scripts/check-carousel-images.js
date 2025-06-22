#!/usr/bin/env node

// Check Carousel Images Script
// This script checks if carousel images exist in Firebase Storage

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// Configuration
const FIREBASE_STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o';

async function main() {
  console.log('🔍 Checking carousel images in database...\n');
  
  try {
    // Check if we're in the project root
    if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      console.error('❌ Error: Please run this script from the project root directory');
      process.exit(1);
    }
    
    // Create a temporary directory to store results
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // 1. Query the database for carousel slides
    console.log('Fetching carousel slides from database...');
    const carouselDataRaw = execSync('npx supabase-cli db query "SELECT * FROM carousel_slides"').toString();
    
    // Simple parsing of the output (assuming it's in a tabular format)
    const lines = carouselDataRaw.split('\n').filter(line => line.trim());
    
    // Check if we have any results
    if (lines.length <= 2) {
      console.warn('⚠️ No carousel slides found in the database');
      return;
    }
    
    // Parse the table (skipping header row)
    const slides = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const fields = line.split('|').map(f => f.trim());
        
        // Assuming the format is: id | title | subtitle | image_url | ...
        const slide = {
          id: fields[0],
          title: fields[1],
          imageUrl: fields[3] // Adjust index based on your database schema
        };
        
        slides.push(slide);
      }
    }
    
    console.log(`Found ${slides.length} slides in the database.\n`);
    
    // 2. Check if each image exists
    console.log('Checking image availability...');
    const results = [];
    
    for (const slide of slides) {
      process.stdout.write(`Checking slide ${slide.id} with image ${slide.imageUrl}... `);
      
      if (!slide.imageUrl) {
        console.log('⚠️ No image URL');
        results.push({ ...slide, status: 'no_url' });
        continue;
      }
      
      // Extract the path if it's a storage URL
      let imagePath = slide.imageUrl;
      
      if (imagePath.includes('firebasestorage.googleapis.com')) {
        const match = imagePath.match(/\/o\/([^?]+)/);
        if (match && match[1]) {
          imagePath = decodeURIComponent(match[1]);
        }
      } else if (imagePath.startsWith('/api/proxy/')) {
        imagePath = imagePath.replace('/api/proxy/', '');
      } else if (!imagePath.startsWith('http')) {
        // If it's just a path, use it directly
        imagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      }
      
      // For external URLs (e.g., Unsplash), just verify they exist
      if (imagePath.startsWith('http')) {
        try {
          const response = await fetch(imagePath, { 
            method: 'HEAD',
            timeout: 5000
          });
          
          if (response.ok) {
            console.log('✅ Available (external URL)');
            results.push({ ...slide, status: 'available', path: imagePath });
          } else {
            console.log(`❌ External image not available (${response.status})`);
            results.push({ ...slide, status: 'not_available', path: imagePath });
          }
        } catch (error) {
          console.log(`❌ Error checking external URL: ${error.message}`);
          results.push({ ...slide, status: 'error', path: imagePath });
        }
        continue;
      }
      
      // For Firebase Storage images, check if they exist
      try {
        const url = `${FIREBASE_STORAGE_BASE_URL}/${encodeURIComponent(imagePath)}?alt=media`;
        const response = await fetch(url, { 
          method: 'HEAD',
          timeout: 5000
        });
        
        if (response.ok) {
          console.log('✅ Available');
          results.push({ ...slide, status: 'available', path: imagePath });
        } else {
          console.log(`❌ Not available (${response.status})`);
          results.push({ ...slide, status: 'not_available', path: imagePath });
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        results.push({ ...slide, status: 'error', path: imagePath });
      }
    }
    
    // Generate summary
    console.log('\n--- SUMMARY ---');
    const available = results.filter(r => r.status === 'available').length;
    const notAvailable = results.filter(r => r.status === 'not_available').length;
    const errors = results.filter(r => r.status === 'error').length;
    const noUrl = results.filter(r => r.status === 'no_url').length;
    
    console.log(`Total slides: ${results.length}`);
    console.log(`Available images: ${available}`);
    console.log(`Unavailable images: ${notAvailable}`);
    console.log(`Errors: ${errors}`);
    console.log(`No URL: ${noUrl}`);
    
    // Save results to a file
    const outputFile = path.join(tempDir, 'carousel-check-results.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nDetailed results saved to ${outputFile}`);
    
    // Suggestions for fixing issues
    if (notAvailable > 0 || errors > 0) {
      console.log('\n--- POSSIBLE FIXES ---');
      console.log('1. Update the carousel slides to use valid image URLs');
      console.log('2. Upload missing images to Firebase Storage');
      console.log('3. Switch to using public image URLs (e.g., from Unsplash)');
      
      // List problem slides
      console.log('\nProblem slides:');
      results
        .filter(r => r.status === 'not_available' || r.status === 'error')
        .forEach(slide => {
          console.log(`- Slide ${slide.id}: "${slide.title}" - ${slide.path}`);
        });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
