const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Fixing carousel_slides table structure and RLS...');
    
    // Using the SQL REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: `
          -- Drop and recreate the carousel_slides table
          DROP TABLE IF EXISTS carousel_slides CASCADE;
          
          -- Create carousel_slides table
          CREATE TABLE carousel_slides (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            description TEXT,
            image_url VARCHAR(500) NOT NULL,
            button_text VARCHAR(100),
            button_link VARCHAR(500),
            display_order INTEGER NOT NULL,
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true
          );
          
          -- Enable Row Level Security
          ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
          
          -- Create security policies
          CREATE POLICY "Public can read active slides"
            ON carousel_slides FOR SELECT
            USING (is_active = true);
            
          CREATE POLICY "Authenticated users can read all slides"
            ON carousel_slides FOR SELECT
            TO authenticated
            USING (true);
            
          -- Add sample data
          INSERT INTO carousel_slides (
            title, subtitle, description, image_url, 
            button_text, button_link, display_order, is_active
          ) VALUES (
            'Welcome to Rehoboth Church', 
            'A Place of Restoration', 
            'Join us every Sunday for worship and fellowship', 
            '/assets/images/church-hero.jpg', 
            'Learn More', 
            '/about', 
            1,
            true
          );
        `
      })
    });
    
    const result = await response.json();
    console.log('Carousel table fix result:', result);
    
    if (response.ok) {
      console.log('✅ Carousel_slides table structure fixed successfully');
      
      // Try to check if we can access the carousel_slides table now
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('is_active', true)
        .limit(1);
        
      if (error) {
        console.error('Error accessing carousel_slides table:', error);
      } else {
        console.log('Successfully accessed carousel_slides table:', data);
      }
    } else {
      console.error('Failed to fix carousel_slides table:', result);
    }
  } catch (error) {
    console.error('Error fixing carousel_slides table:', error);
  }
})();
