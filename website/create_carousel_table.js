const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Creating carousel_slides table via SQL API...');
    
    // Using the SQL REST API to create the table directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: `
          CREATE TABLE IF NOT EXISTS carousel_slides (
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
          
          -- Add some sample data if the table is empty
          INSERT INTO carousel_slides (title, subtitle, description, image_url, button_text, button_link, display_order, is_active)
          SELECT 
            'Welcome to Rehoboth Church', 
            'A Place of Restoration', 
            'Join us every Sunday for worship and fellowship', 
            'https://images.unsplash.com/photo-1602437098422-419392a1b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', 
            'Learn More', 
            '/about', 
            1, 
            true
          WHERE NOT EXISTS (SELECT 1 FROM carousel_slides);
        `
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('✅ Carousel slides table created/updated successfully');
    } else {
      console.error('Failed to create carousel_slides table:', result);
    }
  } catch (error) {
    console.error('Error creating carousel_slides table:', error);
  }
})();
