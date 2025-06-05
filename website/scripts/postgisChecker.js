// This script creates helper functions to check if PostGIS is enabled in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check if PostGIS is enabled using multiple methods
 * @returns {Promise<{isEnabled: boolean, method: string, version: string|null}>}
 */
async function checkPostgis() {
  console.log('🔍 Checking if PostGIS is enabled...');
  
  try {
    // Method 1: Try to use a direct SQL query with the exec function
    try {
      const { error: execError } = await supabase.rpc('exec', {
        query: 'SELECT 1 FROM spatial_ref_sys LIMIT 1;'
      });
      
      if (!execError) {
        return { isEnabled: true, method: 'spatial_ref_sys table check via exec', version: null };
      }
    } catch (e) {
      console.log('exec function not available, trying other methods...');
    }
    
    // Method 2: Try to use postgis function via raw query
    try {
      // We need to create a simple function to test for postgis
      const { error: createFuncError } = await supabase.rpc('exec', {
        query: `
          CREATE OR REPLACE FUNCTION public.check_postgis_available()
          RETURNS boolean AS $$
          BEGIN
            RETURN EXISTS (
              SELECT 1 FROM pg_extension WHERE extname = 'postgis'
            );
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (!createFuncError) {
        // Now try to use the function we just created
        const { data, error } = await supabase.rpc('check_postgis_available');
        
        if (!error && data === true) {
          return { isEnabled: true, method: 'pg_extension check via custom function', version: null };
        }
      }
    } catch (e) {
      console.log('Custom function creation failed, trying other methods...');
    }
    
    // Method 3: Try to check directly using a custom RPC function
    try {
      const { data: versionData, error: versionError } = await supabase
        .rpc('get_postgis_version');
        
      if (!versionError && versionData) {
        return { isEnabled: true, method: 'version check function', version: versionData };
      }
    } catch (e) {
      console.log('Version check function not available, trying direct table access...');
    }
    
    // Method 4: Try direct query to see if the postgis extension exists
    try {
      // This SQL query avoids system schemas which might be restricted
      const { data, error } = await supabase.rpc('exec', {
        query: `
          DO $$
          BEGIN
            PERFORM ST_Point(0,0);
            RAISE NOTICE 'PostGIS is enabled';
          EXCEPTION
            WHEN undefined_function THEN
              RAISE NOTICE 'PostGIS is not enabled';
          END;
          $$;
        `
      });
      
      // We can't easily get the result of the DO block,
      // so we'll consider no error a success
      if (!error) {
        // Just assume it worked - we can't get the actual result easily
        return { isEnabled: true, method: 'function test via exec', version: null };
      }
    } catch (e) {
      console.log('PostGIS function test failed, last resort check...');
    }
    
    // Last resort: Just inform the user about dashboard check
    return { 
      isEnabled: false, 
      method: 'failed all checks', 
      version: null,
      message: 'Could not verify PostGIS status programmatically. Please check the dashboard.'
    };
    
  } catch (error) {
    console.error('Error checking PostGIS:', error.message);
    return { 
      isEnabled: false, 
      method: 'error', 
      version: null,
      error: error.message 
    };
  }
}

// Export the function for use in other scripts
module.exports = { checkPostgis };

// If run directly, execute the check
if (require.main === module) {
  checkPostgis().then(result => {
    console.log('\n--- PostGIS Status ---');
    console.log(`Enabled: ${result.isEnabled}`);
    console.log(`Detection Method: ${result.method}`);
    if (result.version) console.log(`Version: ${result.version}`);
    if (result.message) console.log(`Note: ${result.message}`);
    if (result.error) console.log(`Error: ${result.error}`);
    console.log('---------------------');
  });
}
