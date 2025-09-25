const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hlunsfnhdvyzdsfzzjaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdW5zZm5oZHZ5emRzZnp6amFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NjE3NjUsImV4cCI6MjA1MDIzNzc2NX0.gX0SImJU4T-bUJSHGCIqbLfOo0UFCEX4MQPb3FDKqwQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEventImageDisplay() {
  try {
    console.log('🔍 Testing Event Image Display Issue...');
    console.log('=====================================');
    
    // Get events with images to test specific event IDs
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, image_url, is_published')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .limit(3);

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('⚠️ No events with images found');
      return;
    }

    console.log(`📊 Found ${events.length} events with images:`);
    console.log('');

    for (const event of events) {
      console.log(`📅 Event: ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Published: ${event.is_published}`);
      console.log(`   Image URL: ${event.image_url}`);
      
      // Test single event fetch (like the API does)
      console.log('   🔍 Testing single event fetch...');
      const { data: singleEvent, error: singleError } = await supabase
        .from('events')
        .select('*')
        .eq('id', event.id)
        .single();

      if (singleError) {
        console.log(`   ❌ Single fetch error:`, singleError);
      } else {
        console.log(`   ✅ Single fetch success`);
        console.log(`   Image URL in single fetch: ${singleEvent.image_url || 'null'}`);
        
        // Test if the image URL is accessible
        if (singleEvent.image_url) {
          try {
            const response = await fetch(singleEvent.image_url);
            console.log(`   📡 Image accessibility: ${response.ok ? '✅ OK' : '❌ Failed'} (${response.status})`);
          } catch (fetchError) {
            console.log(`   📡 Image accessibility: ❌ Network error`);
          }
        }
      }
      
      console.log(`   🌐 Public URL: http://localhost:3000/events/${event.id}`);
      console.log(`   🔧 Admin URL: http://localhost:3000/admin/events/${event.id}`);
      console.log('   ---');
    }

    console.log('');
    console.log('🎯 Debugging Steps:');
    console.log('1. Visit one of the public URLs above');
    console.log('2. Open browser developer tools');
    console.log('3. Check the Network tab for API calls to /api/events/[id]');
    console.log('4. Check the Console for any image loading messages');
    console.log('5. Verify the API response includes the image_url field');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testEventImageDisplay();