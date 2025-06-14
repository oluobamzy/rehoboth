// Fix carousel table columns using Supabase custom SQL
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project URL and API key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing from environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCarouselTable() {
  try {
    console.log('Checking if carousel_slides table exists...');
    
    // First check if exec function exists
    console.log('Checking if exec function exists...');
    const { data: execCheck, error: execError } = await supabase.rpc('exec', { 
      query: "SELECT 1" 
    });
    
    console.log('Exec function check result:', execCheck, 'Error:', execError);
    
    if (execError) {
      console.log('Need to create exec function first...');
      // Create the exec function
      const createExecFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec(query text) 
        RETURNS SETOF json 
        LANGUAGE plpgsql
        SECURITY DEFINER -- Important: This will run as the DB owner
        AS $$
        BEGIN
          RETURN QUERY EXECUTE query;
        END;
        $$;
      `;
      
      const { error: createFnError } = await supabase.rpc('exec', { 
        query: createExecFunctionSQL 
      });
      
      if (createFnError) {
        // If we can't create the exec function, create it using a different approach
        console.log('Creating exec function using a different approach...');
        
        const { error: createError } = await supabase.from('_exec_sql').select('*').limit(1);
        
        if (createError && createError.message?.includes('does not exist')) {
          console.log('Creating temporary SQL execution table...');
          
          // Create a temporary table to execute SQL
          const { error: tempTableError } = await supabase.sql(`
            CREATE TABLE IF NOT EXISTS _exec_sql (
              id SERIAL PRIMARY KEY,
              sql TEXT,
              result JSONB
            );
            
            CREATE OR REPLACE FUNCTION exec(query text) 
            RETURNS SETOF json 
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              RETURN QUERY EXECUTE query;
            END;
            $$;
          `);
          
          if (tempTableError) {
            throw new Error(`Failed to create exec function: ${tempTableError.message}`);
          }
        }
      }
    }
    
    console.log('Checking if carousel_slides table exists...');
    
    // Check if table exists
    const { data: tableData, error: tableError } = await supabase.rpc('exec', { 
      query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_slides')" 
    });
    
    if (tableError) {
      throw new Error(`Error checking if table exists: ${tableError.message}`);
    }
    
    const tableExists = tableData && tableData[0] && tableData[0].exists;
    
    if (!tableExists) {
      console.log('Table carousel_slides does not exist. Creating it...');
      
      // Create the table with the correct columns
      const { data: createData, error: createError } = await supabase.rpc('exec', { 
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
      
      if (createError) {
        throw new Error(`Error creating table: ${createError.message}`);
      }
      
      console.log('Table carousel_slides created successfully with correct column names!');
      return;
    }
    
    console.log('Table carousel_slides exists. Checking columns...');
    
    // Check if button_text/button_link columns exist
    const { data: buttonColsData, error: buttonColsError } = await supabase.rpc('exec', { 
      query: `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' 
        AND column_name IN ('button_text', 'button_link')
      ` 
    });
    
    if (buttonColsError) {
      throw new Error(`Error checking button columns: ${buttonColsError.message}`);
    }
    
    // Check if cta_text/cta_link columns exist
    const { data: ctaColsData, error: ctaColsError } = await supabase.rpc('exec', { 
      query: `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' 
        AND column_name IN ('cta_text', 'cta_link')
      ` 
    });
    
    if (ctaColsError) {
      throw new Error(`Error checking CTA columns: ${ctaColsError.message}`);
    }
    
    console.log('Button columns:', buttonColsData);
    console.log('CTA columns:', ctaColsData);
    
    // If button columns exist and cta columns don't
    if (buttonColsData && buttonColsData.length > 0 && 
        (!ctaColsData || ctaColsData.length < 2)) {
      console.log('Found button columns that need to be renamed to CTA columns');
      
      // Rename button_text to cta_text if it exists
      if (buttonColsData.some(col => col.column_name === 'button_text')) {
        console.log('Renaming button_text to cta_text...');
        const { error: renameTextError } = await supabase.rpc('exec', { 
          query: `ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text;` 
        });
        
        if (renameTextError) {
          throw new Error(`Error renaming button_text: ${renameTextError.message}`);
        }
      }
      
      // Rename button_link to cta_link if it exists
      if (buttonColsData.some(col => col.column_name === 'button_link')) {
        console.log('Renaming button_link to cta_link...');
        const { error: renameLinkError } = await supabase.rpc('exec', { 
          query: `ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link;` 
        });
        
        if (renameLinkError) {
          throw new Error(`Error renaming button_link: ${renameLinkError.message}`);
        }
      }
      
      console.log('Successfully renamed button columns to CTA columns');
    } 
    // If neither CTA columns exist
    else if (!ctaColsData || ctaColsData.length === 0) {
      console.log('Neither button nor CTA columns exist. Adding CTA columns...');
      
      // Add cta_text and cta_link columns
      const { error: addColsError } = await supabase.rpc('exec', { 
        query: `
          ALTER TABLE carousel_slides 
          ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100),
          ADD COLUMN IF NOT EXISTS cta_link VARCHAR(500);
        ` 
      });
      
      if (addColsError) {
        throw new Error(`Error adding CTA columns: ${addColsError.message}`);
      }
      
      console.log('Successfully added CTA columns');
    } else {
      console.log('CTA columns already exist. No changes needed.');
    }
    
    // Final verification
    const { data: finalColsData, error: finalColsError } = await supabase.rpc('exec', { 
      query: `
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' 
        AND column_name IN ('cta_text', 'cta_link')
      ` 
    });
    
    if (finalColsError) {
      throw new Error(`Error verifying final columns: ${finalColsError.message}`);
    }
    
    console.log('Final column verification:', finalColsData);
    
    if (finalColsData && finalColsData.length === 2) {
      console.log('Success! Carousel table now has the correct columns.');
    } else {
      console.log('Warning: Not all CTA columns are present. Please check the table structure.');
    }
    
  } catch (error) {
    console.error('Error fixing carousel table:', error);
  }
}

fixCarouselTable();
