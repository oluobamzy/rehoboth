#!/usr/bin/env node

/**
 * Test script for volunteer application submission
 * This will test if the RLS policies are working correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create client with anon key (same as the web app uses)
const supabase = createClient(supabaseUrl, anonKey);

async function testVolunteerSubmission() {
  try {
    console.log('🧪 Testing volunteer application submission...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      ministry: 'General Support',
      experience: 'Test experience',
      availability: 'Weekends',
      message: 'This is a test submission'
    };

    console.log('📝 Submitting test application...');
    
    const { data, error } = await supabase
      .from('volunteer_applications')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Error submitting application:', error);
      
      if (error.code === '42501') {
        console.log('');
        console.log('💡 This means the RLS policies are still blocking anonymous inserts.');
        console.log('📋 Make sure you ran the SQL query in your Supabase dashboard.');
        console.log('');
        console.log('If you already ran it, try this additional SQL:');
        console.log('');
        console.log('-- Force refresh policies');
        console.log('SELECT pg_reload_conf();');
        console.log('');
        console.log('-- Check current policies');
        console.log('SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check');
        console.log('FROM pg_policies WHERE tablename = \'volunteer_applications\';');
      }
      return false;
    } else {
      console.log('✅ Test application submitted successfully!');
      console.log('📝 Application ID:', data[0]?.id);
      
      // Clean up test data
      if (data && data[0]) {
        const { error: deleteError } = await supabase
          .from('volunteer_applications')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.warn('⚠️  Could not clean up test data:', deleteError);
        } else {
          console.log('🧹 Test data cleaned up');
        }
      }
      
      return true;
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testVolunteerSubmission().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Volunteer application form should work now.');
  } else {
    console.log('❌ Tests failed. Please check the setup.');
  }
});