// Test creating a carousel slide
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Print environment variables for debugging
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// First check the table structure directly
async function checkTableStructure() {
  try {
    console.log('Checking carousel_slides table structure directly...');
    
    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check column structure
    const { data, error } = await supabase
      .from('carousel_slides')
      .select()
      .limit(1);
      
    if (error) {
      console.error('Error querying carousel_slides:', error);
    } else {
      console.log('Table structure exists. Sample row:', data);
      
      // Get table schema
      const { data: columns, error: columnError } = await supabase
        .rpc('exec', {
          query: `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'carousel_slides'
          `
        });
        
      if (columnError) {
        console.error('Error fetching schema:', columnError);
      } else {
        console.log('Table columns:', columns);
      }
    }
  } catch (err) {
    console.error('Error checking table structure:', err);
  }
}

// Dynamically import the module (because it's likely using ES modules)
async function importCarouselService() {
  try {
    // Try with .ts extension first (since most files in the project use .ts)
    const module = await import('../src/services/carouselService.ts');
    return module;
  } catch (err) {
    console.log('Failed to import with .ts extension, trying without extension...');
    try {
      // Try without extension
      const module = await import('../src/services/carouselService');
      return module;
    } catch (err) {
      console.error('Failed to import carouselService:', err.message);
      throw err;
    }
  }
}

async function testCreateCarouselSlide() {
  try {
    console.log('Testing carousel slide creation...');
    
    const slideData = {
      title: 'Test Slide',
      subtitle: 'This is a test slide',
      imageUrl: 'https://example.com/image.jpg',
      ctaText: 'Learn More',
      ctaLink: 'https://example.com',
      displayOrder: 1,
      isActive: true,
      // Explicitly set these to null to avoid timestamp parsing errors
      startDate: null,
      endDate: null
    };
    
    console.log('Creating slide with data:', slideData);
    const { createCarouselSlide } = await importCarouselService();
    const result = await createCarouselSlide(slideData);
    console.log('Slide created successfully:', result);
    
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Direct insertion test using Supabase
async function testDirectInsertion() {
  try {
    console.log('Testing direct slide insertion via Supabase...');
    
    // Initialize client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const slideData = {
      title: 'Test Direct Slide',
      subtitle: 'This is a direct test slide',
      image_url: 'https://example.com/image.jpg', // Using snake_case for DB fields
      cta_text: 'Learn Direct', // This should match column name in DB
      cta_link: 'https://example.com/direct', // This should match column name in DB
      display_order: 2,
      is_active: true,
      // Explicitly set dates to null rather than empty strings or undefined
      start_date: null,
      end_date: null
    };
    
    console.log('Inserting slide with data:', slideData);
    
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert([slideData])
      .select();
      
    if (error) {
      console.error('Error with direct insertion:', error);
    } else {
      console.log('Direct insertion successful:', data);
    }
  } catch (err) {
    console.error('Exception during direct insertion:', err);
  }
}

// First check the table structure, then try direct insertion, then try service
async function runTests() {
  await checkTableStructure();
  await testDirectInsertion(); // Try direct insertion first
  await testCreateCarouselSlide();
}

runTests();
