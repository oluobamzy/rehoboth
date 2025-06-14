// Grant permissions for carousel table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (admin privileges)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantCarouselPermissions() {
  try {
    console.log('Granting permissions for carousel_slides table...');
    
    // First check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('carousel_slides')
      .select('id')
      .limit(1);
      
    if (tableError && (tableError.message?.includes('does not exist') || tableError.code === '42P01')) {
      console.log('Table carousel_slides does not exist. Please run the create_carousel_table.js script first.');
      return;
    }
    
    console.log('Table exists. Granting permissions...');
    
    // Grant permissions to the authenticated role (logged in users)
    const { error: permError } = await supabase.rpc('exec', {
      query: `
        -- Grant permissions to authenticated users
        GRANT SELECT, INSERT, UPDATE, DELETE ON carousel_slides TO authenticated;
        
        -- Grant usage on sequence if there's one for the id column
        GRANT USAGE ON SEQUENCE IF EXISTS carousel_slides_id_seq TO authenticated;
      `
    });
    
    if (permError) {
      // If the exec function doesn't exist or fails
      console.error('Could not grant permissions using RPC exec function:', permError);
      console.log('Attempting direct SQL request...');
      
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
            -- Grant permissions to authenticated users
            GRANT SELECT, INSERT, UPDATE, DELETE ON carousel_slides TO authenticated;
            
            -- Grant usage on sequence if there's one for the id column
            GRANT USAGE ON SEQUENCE IF EXISTS carousel_slides_id_seq TO authenticated;
          `
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to grant permissions: ${await response.text()}`);
      }
      
      console.log('Permissions granted using direct SQL API.');
      return;
    }
    
    console.log('Permissions successfully granted to authenticated users for carousel_slides table!');
    
    // Also grant anon permissions if needed (for public viewing)
    const { error: anonPermError } = await supabase.rpc('exec', {
      query: `
        -- Grant read-only permissions to anonymous users (for public viewing)
        GRANT SELECT ON carousel_slides TO anon;
      `
    });
    
    if (anonPermError) {
      console.error('Could not grant anon permissions:', anonPermError);
    } else {
      console.log('Read permissions granted to anonymous users for carousel_slides table.');
    }
    
  } catch (error) {
    console.error('Error granting carousel permissions:', error);
  }
}

grantCarouselPermissions();
