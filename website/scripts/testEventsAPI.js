// Basic test for events API functionality
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function testEventsAPI() {
  console.log('🧪 Testing Events API functionality...');

  try {
    // First, insert a test event directly into the database
    console.log('\n1. Creating test event in database...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: testEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        title: 'API Test Event',
        description: 'This event was created to test the Events API',
        event_type: 'test',
        start_datetime: tomorrow.toISOString(),
        end_datetime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        location_name: 'Test Location',
        is_published: true,
        is_featured: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Failed to create test event:', insertError.message);
      process.exit(1);
    }
    
    console.log('✅ Test event created:', testEvent.id);
    
    // 2. Test GET /api/events
    console.log('\n2. Testing GET /api/events...');
    const eventsResponse = await fetch(`${API_BASE_URL}/events`);
    
    if (!eventsResponse.ok) {
      console.error('❌ GET /api/events failed:', eventsResponse.status, await eventsResponse.text());
    } else {
      const eventsData = await eventsResponse.json();
      console.log('✅ GET /api/events succeeded:', 
        `Found ${eventsData.events.length} events, ` +
        `Total: ${eventsData.pagination.totalItems}`);
    }
    
    // 3. Test GET /api/events/:id
    console.log('\n3. Testing GET /api/events/:id...');
    const eventDetailResponse = await fetch(`${API_BASE_URL}/events/${testEvent.id}`);
    
    if (!eventDetailResponse.ok) {
      console.error('❌ GET /api/events/:id failed:', eventDetailResponse.status, await eventDetailResponse.text());
    } else {
      const eventDetail = await eventDetailResponse.json();
      console.log('✅ GET /api/events/:id succeeded:', eventDetail.event.title);
    }
    
    // 4. Test event registration
    console.log('\n4. Testing POST /api/events/:id/register...');
    const registrationResponse = await fetch(`${API_BASE_URL}/events/${testEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        attendee_name: 'Test User',
        attendee_email: 'test@example.com',
        attendee_phone: '123-456-7890',
        party_size: 2,
        special_requests: 'Test request'
      })
    });
    
    let registrationId = null;
    if (!registrationResponse.ok) {
      console.error('❌ POST /api/events/:id/register failed:', 
        registrationResponse.status, await registrationResponse.text());
    } else {
      const registrationData = await registrationResponse.json();
      registrationId = registrationData.registrationId;
      console.log('✅ POST /api/events/:id/register succeeded:', 
        `Registration ID: ${registrationId}, Status: ${registrationData.status}`);
    }
    
    // 5. Test admin endpoints if registration was successful
    if (registrationId) {
      console.log('\n5. Testing GET /api/admin/events/:id/registrations...');
      const adminRegistrationsResponse = await fetch(`${API_BASE_URL}/admin/events/${testEvent.id}/registrations`);
      
      if (!adminRegistrationsResponse.ok) {
        console.error('❌ GET /api/admin/events/:id/registrations failed:', 
          adminRegistrationsResponse.status, await adminRegistrationsResponse.text());
      } else {
        const registrationsData = await adminRegistrationsResponse.json();
        console.log('✅ GET /api/admin/events/:id/registrations succeeded:', 
          `Found ${registrationsData.registrations.length} registrations`);
      }
      
      // 6. Test calendar endpoint
      console.log('\n6. Testing GET /api/events/calendar...');
      const calendarResponse = await fetch(`${API_BASE_URL}/events/calendar`);
      
      if (!calendarResponse.ok) {
        console.error('❌ GET /api/events/calendar failed:', 
          calendarResponse.status, await calendarResponse.text());
      } else {
        const calendarData = await calendarResponse.text();
        const containsEvent = calendarData.includes(testEvent.title);
        console.log('✅ GET /api/events/calendar succeeded:', 
          containsEvent ? 'Event found in iCal feed' : 'iCal feed generated (event not found)');
      }
    }
    
    // 7. Clean up test data
    console.log('\n7. Cleaning up test data...');
    if (registrationId) {
      const { error: deleteRegError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', registrationId);
      
      if (deleteRegError) {
        console.error('❌ Failed to delete test registration:', deleteRegError.message);
      } else {
        console.log('✅ Test registration deleted');
      }
    }
    
    const { error: deleteEventError } = await supabase
      .from('events')
      .delete()
      .eq('id', testEvent.id);
    
    if (deleteEventError) {
      console.error('❌ Failed to delete test event:', deleteEventError.message);
    } else {
      console.log('✅ Test event deleted');
    }
    
    console.log('\n🎉 API testing completed!');
  } catch (error) {
    console.error('❌ Unexpected error during API testing:', error);
    process.exit(1);
  }
}

testEventsAPI();
