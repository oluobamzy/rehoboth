// Fix carousel table columns script with direct SQL query
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Initialize Supabase client with your project URL and API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing from environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create a PostgreSQL connection directly using the DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is missing from environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function fixCarouselTableColumns() {
  try {
    console.log('Checking if carousel_slides table exists...');
    
    // Check if the table exists
    const { data: tableCheck, error: checkError } = await supabase
      .from('carousel_slides')
      .select('id')
      .limit(1);
      
    if (checkError) {
      if (checkError.message?.includes('does not exist') || checkError.code === '42P01') {
        console.log('Table carousel_slides does not exist. Creating it...');
        
        // Create the table directly using pg
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS carousel_slides (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title VARCHAR(255) NOT NULL,
              subtitle VARCHAR(255),
              image_url VARCHAR(500) NOT NULL,
              cta_text VARCHAR(100),
              cta_link VARCHAR(500),
              display_order INT NOT NULL,
              is_active BOOLEAN DEFAULT true,
              start_date TIMESTAMP,
              end_date TIMESTAMP,
              created_at TIMESTAMP DEFAULT now(),
              updated_at TIMESTAMP DEFAULT now()
            );
          `);
          console.log('Table carousel_slides created successfully with correct column names!');
        } finally {
          client.release();
        }
        return;
      }
      
      throw new Error(`Error checking carousel_slides table: ${checkError.message}`);
    }
    
    console.log('Table carousel_slides exists. Checking columns...');
    
    // Use pg to directly query the database schema
    const client = await pool.connect();
    try {
      // Check if button_text and button_link columns exist
      const buttonColumnsRes = await client.query(`
        SELECT 
          COUNT(*) as button_columns_count
        FROM 
          information_schema.columns
        WHERE 
          table_name = 'carousel_slides' 
          AND column_name IN ('button_text', 'button_link')
      `);
      
      const buttonColumnsExist = parseInt(buttonColumnsRes.rows[0].button_columns_count) > 0;
      console.log(`Button columns exist: ${buttonColumnsExist ? 'Yes' : 'No'}`);
      
      if (buttonColumnsExist) {
        console.log('Found button_text/button_link columns. Renaming to cta_text/cta_link...');
        
        // Check which button columns exist before renaming
        const columnCheckRes = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'carousel_slides' 
          AND column_name IN ('button_text', 'button_link')
        `);
        
        const existingColumns = columnCheckRes.rows.map(row => row.column_name);
        console.log('Existing button columns:', existingColumns);
        
        // Rename only the columns that exist
        for (const column of existingColumns) {
          const newName = column === 'button_text' ? 'cta_text' : 'cta_link';
          console.log(`Renaming ${column} to ${newName}...`);
          await client.query(`ALTER TABLE carousel_slides RENAME COLUMN ${column} TO ${newName}`);
        }
        
        console.log('Columns renamed successfully!');
      } else {
        console.log('Checking if cta_text and cta_link columns exist...');
        
        const ctaColumnsRes = await client.query(`
          SELECT 
            COUNT(*) as cta_columns_count
          FROM 
            information_schema.columns
          WHERE 
            table_name = 'carousel_slides' 
            AND column_name IN ('cta_text', 'cta_link')
        `);
        
        const ctaColumnsExist = parseInt(ctaColumnsRes.rows[0].cta_columns_count) > 0;
        console.log(`CTA columns exist: ${ctaColumnsExist ? 'Yes' : 'No'}`);
        
        if (ctaColumnsExist) {
          console.log('cta_text and cta_link columns already exist. No changes needed.');
        } else {
          console.log('Neither button_* nor cta_* columns exist. Adding cta_text and cta_link columns...');
          
          // Add the missing columns
          await client.query(`
            ALTER TABLE carousel_slides 
            ADD COLUMN cta_text VARCHAR(100),
            ADD COLUMN cta_link VARCHAR(500)
          `);
          
          console.log('Columns added successfully!');
        }
      }
      
      console.log('Carousel table is now set up correctly with cta_text and cta_link columns!');
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fixing carousel table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
fixCarouselTableColumns();
