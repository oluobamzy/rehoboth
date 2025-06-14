// Simple direct test for carousel slide creation
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runDirectTest() {
  try {
    console.log('Running simplified carousel test...');
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // First check if the table exists and its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('carousel_slides')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('Error checking table:', tableError);
      return;
    }
    
    console.log('Table exists, sample data:', tableInfo);
    
    // Now try to insert a simple slide
    const slideData = {
      title: 'Simple Test Slide',
      subtitle: 'Created using direct insert',
      image_url: 'https://example.com/test.jpg',
      cta_text: 'Test CTA',
      cta_link: 'https://example.com/test',
      display_order: 99,
      is_active: true,
      start_date: null,
      end_date: null
    };
    
    console.log('Attempting to insert slide with data:', slideData);
    
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert([slideData])
      .select();
      
    if (error) {
      console.error('Insert failed:', error);
      return;
    }
    
    console.log('Slide inserted successfully:', data);
    
  } catch (err) {
    console.error('Test failed with unexpected error:', err);
  }
}

// Run the test
runDirectTest();
