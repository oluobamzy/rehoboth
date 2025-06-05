// filepath: /home/labber/rehoboth/website/scripts/checkEventTables.js
// Script to check if events tables are set up correctly
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { checkPostgis } = require('./postgisChecker');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventTables() {
  console.log('🔍 Checking Events schema...');

  try {
    // Check if events table exists
    console.log('Checking events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (eventsError && eventsError.message.includes('does not exist')) {
      console.error('❌ Events table does not exist:', eventsError.message);
      console.log('💡 Run setupEventsSchema.js to create the table');
    } else if (eventsError) {
      console.error('❌ Error checking events table:', eventsError.message);
    } else {
      console.log('✅ Events table exists', eventsData ? `(${eventsData.length} records found)` : '(empty)');
    }
    
    // Check if event_registrations table exists
    console.log('\nChecking event_registrations table...');
    const { data: registrationsData, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id')
      .limit(1);
    
    if (registrationsError && registrationsError.message.includes('does not exist')) {
      console.error('❌ Event_registrations table does not exist:', registrationsError.message);
      console.log('💡 Run setupEventsSchema.js to create the table');
    } else if (registrationsError) {
      console.error('❌ Error checking event_registrations table:', registrationsError.message);
    } else {
      console.log('✅ Event_registrations table exists', registrationsData ? `(${registrationsData.length} records found)` : '(empty)');
    }
    
    // Check for PostGIS extension using the dedicated helper module
    console.log('\nChecking PostGIS extension...');
    
    try {
      // Use the dedicated PostGIS checker that handles all the edge cases
      const postgisStatus = await checkPostgis();
      
      if (postgisStatus.isEnabled) {
        console.log(`✅ PostGIS extension is enabled! (Detected via: ${postgisStatus.method})`);
        if (postgisStatus.version) {
          console.log(`   Version: ${postgisStatus.version}`);
        }
      } else {
        console.log('⚠️ Could not verify that PostGIS is enabled');
        if (postgisStatus.message) {
          console.log(`   Note: ${postgisStatus.message}`);
        }
        if (postgisStatus.error) {
          console.log(`   Error: ${postgisStatus.error}`);
        }
        console.log('💡 If you need geographical features, please check the Supabase dashboard');
        console.log('💡 to confirm that PostGIS is enabled under Database > Extensions');
      }
    } catch (postgisError) {
      console.error('❌ Error during PostGIS check:', postgisError.message);
      console.log('💡 Enable the PostGIS extension in the Supabase dashboard');
    }
    
    // Insert a test event if events table exists and is empty
    if (!eventsError && (!eventsData || eventsData.length === 0)) {
      console.log('\nInserting a test event...');
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: testEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          title: 'Test Event',
          description: 'This is a test event created by the checkEventTables.js script',
          event_type: 'test',
          start_datetime: tomorrow.toISOString(),
          end_datetime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
          location_name: 'Church Main Hall',
          is_published: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Failed to insert test event:', insertError.message);
      } else {
        console.log('✅ Test event inserted successfully:', testEvent.id);
      }
    }
    
    console.log('\n🎉 Events schema check completed!');
  } catch (error) {
    console.error('❌ Unexpected error checking Events schema:', error);
    process.exit(1);
  }
}

checkEventTables();
