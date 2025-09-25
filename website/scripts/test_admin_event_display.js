const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hlunsfnhdvyzdsfzzjaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdW5zZm5oZHZ5emRzZnp6amFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NjE3NjUsImV4cCI6MjA1MDIzNzc2NX0.gX0SImJU4T-bUJSHGCIqbLfOo0UFCEX4MQPb3FDKqwQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminEventDisplay() {
  try {
    console.log('🔍 Checking admin event display readiness...');
    console.log('===============================================');
    
    // Get events with images
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, image_url, event_type, is_published, is_featured, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('⚠️ No events found in database');
      return;
    }

    console.log(`📊 Found ${events.length} recent events:`);
    console.log('');

    for (const event of events) {
      console.log(`📅 Event: ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Type: ${event.event_type}`);
      console.log(`   Published: ${event.is_published ? '✅ Yes' : '❌ No'}`);
      console.log(`   Featured: ${event.is_featured ? '⭐ Yes' : '   No'}`);
      console.log(`   Image: ${event.image_url || '❌ No image'}`);
      
      if (event.image_url) {
        // Test if the image URL is accessible
        try {
          const imageResponse = await fetch(event.image_url);
          if (imageResponse.ok) {
            console.log(`   Image Status: ✅ Accessible (${imageResponse.status})`);
          } else {
            console.log(`   Image Status: ⚠️ HTTP ${imageResponse.status}`);
          }
        } catch (imgError) {
          console.log(`   Image Status: ❌ Error: ${imgError.message}`);
        }
      }
      
      console.log(`   Admin URL: http://localhost:3000/admin/events/${event.id}`);
      console.log('   ---');
    }

    console.log('');
    console.log('🎯 Next Steps for Admin Event Display:');
    console.log('1. Visit any of the admin URLs above');
    console.log('2. Check if the event preview section displays the image');
    console.log('3. Verify the image loads with proper error handling');
    console.log('4. Test the upload functionality for new images');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAdminEventDisplay();