// Rename carousel columns from button_* to cta_*
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCarouselColumns() {
  try {
    console.log('Checking carousel_slides table structure...');
    
    // First check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('carousel_slides')
      .select('id')
      .limit(1);
      
    if (tableError) {
      if (tableError.message?.includes('does not exist') || tableError.code === '42P01') {
        console.log('Table carousel_slides does not exist. Please run the create_carousel_table.js script first.');
        return;
      }
      throw tableError;
    }
    
    console.log('Table exists. Checking column structure...');
    
    // Direct SQL query to check column names
    const { data: columns, error: columnError } = await supabase
      .rpc('exec', {
        query: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'carousel_slides'
          AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link')
        `
      });
    
    if (columnError) {
      // If the exec function doesn't exist
      console.error('Could not check columns using RPC exec function. Attempting direct SQL query...');
      
      // Try using REST API instead
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          query: `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'carousel_slides'
            AND column_name IN ('button_text', 'button_link', 'cta_text', 'cta_link')
          `
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to query column structure: ${await response.text()}`);
      }
      
      const columnsData = await response.json();
      console.log('Column check results:', columnsData);
      
      // Fix columns using direct SQL
      if (columnsData.some(col => col.column_name === 'button_text') && 
          !columnsData.some(col => col.column_name === 'cta_text')) {
        console.log('Renaming button_text to cta_text...');
        
        const renameTextResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            query: `ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text;`
          })
        });
        
        if (!renameTextResponse.ok) {
          throw new Error(`Failed to rename button_text: ${await renameTextResponse.text()}`);
        }
        console.log('Successfully renamed button_text to cta_text');
      }
      
      if (columnsData.some(col => col.column_name === 'button_link') && 
          !columnsData.some(col => col.column_name === 'cta_link')) {
        console.log('Renaming button_link to cta_link...');
        
        const renameLinkResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            query: `ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link;`
          })
        });
        
        if (!renameLinkResponse.ok) {
          throw new Error(`Failed to rename button_link: ${await renameLinkResponse.text()}`);
        }
        console.log('Successfully renamed button_link to cta_link');
      }
      
      return;
    }
    
    // Process columns if using RPC method
    console.log('Column check results:', columns);
    
    const columnNames = columns.map(col => col.column_name);
    
    if (columnNames.includes('button_text') && !columnNames.includes('cta_text')) {
      console.log('Renaming button_text to cta_text...');
      const { error: renameTextError } = await supabase
        .rpc('exec', { 
          query: `ALTER TABLE carousel_slides RENAME COLUMN button_text TO cta_text;` 
        });
      
      if (renameTextError) {
        throw new Error(`Failed to rename button_text: ${renameTextError.message}`);
      }
      console.log('Successfully renamed button_text to cta_text');
    }
    
    if (columnNames.includes('button_link') && !columnNames.includes('cta_link')) {
      console.log('Renaming button_link to cta_link...');
      const { error: renameLinkError } = await supabase
        .rpc('exec', { 
          query: `ALTER TABLE carousel_slides RENAME COLUMN button_link TO cta_link;` 
        });
      
      if (renameLinkError) {
        throw new Error(`Failed to rename button_link: ${renameLinkError.message}`);
      }
      console.log('Successfully renamed button_link to cta_link');
    }
    
    console.log('Column migration completed successfully!');
    console.log('Your carousel slides table now matches the Prisma schema and code expectations.');
    
  } catch (error) {
    console.error('Error fixing carousel columns:', error);
  }
}

fixCarouselColumns();
