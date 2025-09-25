#!/usr/bin/env node
// Debug script to check event image URLs and storage permissions
// Run with: node scripts/debug_event_images.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugEventImages() {
  console.log('\n======== EVENT IMAGES DEBUG ========\n');

  try {
    // 1. Check recent events and their image URLs
    console.log('1. Checking recent events for image URLs...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError.message);
      return;
    }

    console.log(`Found ${events.length} recent events:`);
    events.forEach((event, index) => {
      console.log(`\n   Event ${index + 1}:`);
      console.log(`   - Title: ${event.title}`);
      console.log(`   - ID: ${event.id}`);
      console.log(`   - Image URL: ${event.image_url || 'NULL - No image set'}`);
      console.log(`   - Created: ${event.created_at}`);
    });

    // 2. Check storage bucket and files
    console.log('\n2. Checking storage bucket contents...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError.message);
      return;
    }

    const sermonBucket = buckets.find(b => b.id === 'sermon-media');
    if (sermonBucket) {
      console.log('✅ sermon-media bucket found');
      
      // List files in events folder
      const { data: eventFiles, error: filesError } = await supabase.storage
        .from('sermon-media')
        .list('events', { limit: 10 });
        
      if (filesError) {
        console.error('❌ Error listing event files:', filesError.message);
      } else {
        console.log(`   Found ${eventFiles.length} items in events folder:`);
        eventFiles.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      }
    } else {
      console.log('❌ sermon-media bucket not found');
    }

    // 3. Test a specific image URL if any exist
    const eventsWithImages = events.filter(e => e.image_url);
    if (eventsWithImages.length > 0) {
      console.log('\n3. Testing image URL accessibility...');
      const testEvent = eventsWithImages[0];
      console.log(`Testing: ${testEvent.image_url}`);
      
      try {
        const response = await fetch(testEvent.image_url);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')}`);
        
        if (response.ok) {
          console.log('✅ Image URL is accessible');
        } else {
          console.log('❌ Image URL returned error status');
        }
      } catch (fetchError) {
        console.error('❌ Error fetching image:', fetchError.message);
      }
    } else {
      console.log('\n3. No events with image URLs found');
      console.log('   → This means no events have been created with images yet');
      console.log('   → Try creating a new event with an image or editing an existing event to add an image');
    }

    // 4. Recommendations
    console.log('\n======== RECOMMENDATIONS ========');
    
    if (eventsWithImages.length === 0) {
      console.log('🔍 ISSUE IDENTIFIED: No events have image URLs');
      console.log('   → The events you\'re viewing were created before image upload was added');
      console.log('   → Solution: Edit an existing event and upload an image');
      console.log('   → Or create a new event with an image');
    } else {
      console.log('🔍 Events have image URLs but may not be displaying properly');
      console.log('   → Check browser developer tools for image loading errors');
      console.log('   → Verify storage bucket permissions are correct');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugEventImages();