// Fix carousel table columns script
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project URL and API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Service Role Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing from environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
        
        // Create the carousel_slides table with the correct columns
        const createResult = await supabase.rpc('exec', { 
          query: `
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
          `
        });
        
        if (createResult.error) {
          throw new Error(`Failed to create carousel_slides table: ${createResult.error.message}`);
        }
        
        console.log('Table carousel_slides created successfully with correct column names!');
        return;
      }
      
      throw new Error(`Error checking carousel_slides table: ${checkError.message}`);
    }
    
    console.log('Table carousel_slides exists. Checking columns...');
    
    // Instead of using RPC, let's directly check the columns with a select query
    console.log('Executing direct SQL query via pg_catalog to check columns...');
    
    // First check if we have button_text/button_link columns
    const { data: buttonColumns, error: buttonError } = await supabase
      .from('carousel_slides')
      .select('button_text, button_link')
      .limit(1)
      .maybeSingle();
    
    if (buttonError && !buttonError.message.includes('column') && !buttonError.code.includes('42703')) {
      // If error isn't about missing columns
      throw new Error(`Error checking button columns: ${buttonError.message}`);
    }
    
    // Check if the columns exist by inspecting the error message
    const buttonColumnsExist = !buttonError || 
      !(buttonError.message.includes('column') && buttonError.code.includes('42703'));
    
    if (buttonColumnsExist) {
      console.log('Found button_text/button_link columns. Renaming to cta_text/cta_link...');
      
      // Rename columns from button_* to cta_*
      const renameResult = await supabase.rpc('exec', { 
        query: `
          ALTER TABLE carousel_slides 
          RENAME COLUMN IF EXISTS button_text TO cta_text;
          
          ALTER TABLE carousel_slides 
          RENAME COLUMN IF EXISTS button_link TO cta_link;
        `
      });
      
      if (renameResult.error) {
        throw new Error(`Failed to rename columns: ${renameResult.error.message}`);
      }
      
      console.log('Columns renamed successfully!');
    } else {
      console.log('Checking if cta_text and cta_link columns exist...');
      
      // Check if we have cta_text/cta_link columns
      const { data: ctaColumns, error: ctaError } = await supabase
        .from('carousel_slides')
        .select('cta_text, cta_link')
        .limit(1)
        .maybeSingle();
      
      if (ctaError && !ctaError.message.includes('column') && !ctaError.code.includes('42703')) {
        // If error isn't about missing columns
        throw new Error(`Error checking CTA columns: ${ctaError.message}`);
      }
      
      // Check if the columns exist by inspecting the error message
      const ctaColumnsExist = !ctaError || 
        !(ctaError.message.includes('column') && ctaError.code.includes('42703'));
      
      if (!ctaColumnsExist) {
        console.log('Neither button_* nor cta_* columns exist. Adding cta_text and cta_link columns...');
        
        // Add missing columns
        const addResult = await supabase.rpc('exec', { 
          query: `
            ALTER TABLE carousel_slides 
            ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100),
            ADD COLUMN IF NOT EXISTS cta_link VARCHAR(500);
          `
        });
        
        if (addResult.error) {
          throw new Error(`Failed to add columns: ${addResult.error.message}`);
        }
        
        console.log('Columns added successfully!');
      } else {
        console.log('cta_text and cta_link columns already exist. No changes needed.');
      }
    }
    
    console.log('Carousel table is now set up correctly with cta_text and cta_link columns!');
    
  } catch (error) {
    console.error('Error fixing carousel table:', error);
  }
}

// Run the function
fixCarouselTableColumns();
