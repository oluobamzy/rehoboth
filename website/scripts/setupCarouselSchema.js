// scripts/setupCarouselSchema.js
// This script will set up the Supabase schema for the carousel slides table
// To run this script: node scripts/setupCarouselSchema.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCarouselSlidesTable() {
  console.log('Creating carousel_slides table...');
  
  const { error } = await supabase.rpc('create_carousel_slides_table', {});
  
  if (error) {
    console.error('Error creating carousel_slides table:', error);
    return false;
  }
  
  console.log('Successfully created carousel_slides table');
  return true;
}

async function insertSampleData() {
  console.log('Inserting sample carousel slides...');
  
  const sampleSlides = [
    {
      title: 'Welcome to Rehoboth Christian Church',
      subtitle: 'Join us for Sunday worship at 10:00 AM',
      image_url: 'https://images.unsplash.com/photo-1602437098422-419392a1b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      cta_text: 'Learn More',
      cta_link: '/about',
      display_order: 1,
      is_active: true
    },
    {
      title: 'Join Our Community',
      subtitle: 'Find fellowship, purpose, and spiritual growth',
      image_url: 'https://images.unsplash.com/photo-1536500152107-01ab1422f932?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      cta_text: 'Get Involved',
      cta_link: '/ministries',
      display_order: 2,
      is_active: true
    },
    {
      title: 'Sunday School for All Ages',
      subtitle: 'Every Sunday at 9:00 AM',
      image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      cta_text: 'View Schedule',
      cta_link: '/events',
      display_order: 3,
      is_active: true
    }
  ];
  
  const { data, error } = await supabase
    .from('carousel_slides')
    .insert(sampleSlides)
    .select();
  
  if (error) {
    console.error('Error inserting sample data:', error);
    return false;
  }
  
  console.log(`Successfully inserted ${data.length} sample slides`);
  return true;
}

async function setupSchema() {
  try {
    // First create the stored procedure to create the table
    console.log('Creating stored procedure...');
    
    const sqlCreateFunction = `
    CREATE OR REPLACE FUNCTION create_carousel_slides_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS carousel_slides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image_url VARCHAR(500) NOT NULL,
        cta_text VARCHAR(100),
        cta_link VARCHAR(500),
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_carousel_active_order ON carousel_slides (is_active, display_order);
      CREATE INDEX IF NOT EXISTS idx_carousel_dates ON carousel_slides (start_date, end_date);
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    const { error: fnError } = await supabase.rpc('exec', { query: sqlCreateFunction });
    
    if (fnError) {
      console.error('Error creating stored procedure:', fnError);
      return;
    }
    
    // Then create the table
    await createCarouselSlidesTable();
    
    // Finally insert sample data
    await insertSampleData();
    
    console.log('✅ Schema setup complete');
  } catch (error) {
    console.error('Error setting up schema:', error);
  }
}

setupSchema();
