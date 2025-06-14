// scripts/check_permissions.js
// This script checks what permissions we have with our current service role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPermissions() {
  try {
    console.log('===== Checking Supabase Permissions =====\n');
    
    // Test creating a simple table
    console.log('1. Testing database permissions...');
    
    // First try to delete the test table if it exists
    const { error: dropError } = await supabase.rpc('exec', { 
      query: `DROP TABLE IF EXISTS _permissions_test_table;` 
    });
    
    if (dropError) {
      console.log('❌ Drop table permission check failed:', dropError.message);
    } else {
      console.log('✅ Drop table permission check passed');
    }
    
    // Try to create a new table
    const { error: createError } = await supabase.rpc('exec', { 
      query: `
        CREATE TABLE IF NOT EXISTS _permissions_test_table (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      ` 
    });
    
    if (createError) {
      console.log('❌ Create table permission check failed:', createError.message);
    } else {
      console.log('✅ Create table permission check passed');
    }
    
    // Try to insert data
    const { error: insertError } = await supabase.rpc('exec', { 
      query: `INSERT INTO _permissions_test_table (name) VALUES ('test');` 
    });
    
    if (insertError) {
      console.log('❌ Insert data permission check failed:', insertError.message);
    } else {
      console.log('✅ Insert data permission check passed');
    }
    
    // Check auth schema access
    console.log('\n2. Testing auth schema access...');
    
    // Try to access auth.users
    const { data: users, error: usersError } = await supabase.rpc('exec', { 
      query: `SELECT count(*) FROM auth.users;` 
    });
    
    if (usersError) {
      console.log('❌ Auth schema access check failed:', usersError.message);
    } else {
      console.log('✅ Auth schema access check passed');
      if (users && users[0]) {
        console.log(`Found ${users[0].count} users in auth.users`);
      } else {
        console.log('Query returned no data, but no error occurred');
      }
    }
    
    // Check admin functions (might fail if JS API doesn't match)
    console.log('\n3. Testing auth admin functions...');
    
    if (typeof supabase.auth.admin?.listUsers === 'function') {
      try {
        const { data, error } = await supabase.auth.admin.listUsers({
          limit: 1
        });
        
        if (error) {
          console.log('❌ Admin listUsers check failed:', error.message);
        } else {
          console.log('✅ Admin listUsers check passed');
          console.log(`Found ${data.users.length} users`);
        }
      } catch (e) {
        console.log('❌ Admin listUsers check failed with exception:', e.message);
      }
    } else {
      console.log('⚠️ auth.admin.listUsers function not available in this version of supabase-js');
    }
    
    // Check for updating app_metadata directly via SQL (most reliable admin action)
    console.log('\n4. Testing ability to update app_metadata...');
    
    const { error: metadataError } = await supabase.rpc('exec', { 
      query: `
        UPDATE auth.users 
        SET raw_app_meta_data = raw_app_meta_data || '{"test_permission": true}'::jsonb 
        WHERE email = 'oluobamzy@gmail.com'
        RETURNING id;
      ` 
    });
    
    if (metadataError) {
      console.log('❌ Update app_metadata check failed:', metadataError.message);
    } else {
      console.log('✅ Update app_metadata check passed');
    }
    
    // Clean up
    console.log('\n5. Cleaning up test resources...');
    const { error: cleanupError } = await supabase.rpc('exec', { 
      query: `DROP TABLE IF EXISTS _permissions_test_table;` 
    });
    
    if (cleanupError) {
      console.log('❌ Cleanup failed:', cleanupError.message);
    } else {
      console.log('✅ Cleanup successful');
      
      // Verify if table was removed
      const { data: tableExists, error: existsError } = await supabase.rpc('exec', { 
        query: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '_permissions_test_table'
        );` 
      });
      
      if (existsError) {
        console.log('❌ Verification failed:', existsError.message);
      } else {
        const stillExists = tableExists[0].exists;
        if (stillExists) {
          console.log('⚠️ Test table still exists after cleanup attempt');
        } else {
          console.log('✅ Verified table was removed');
        }
      }
    }
    
    // Remove test permission added earlier
    const { error: revertError } = await supabase.rpc('exec', { 
      query: `
        UPDATE auth.users 
        SET raw_app_meta_data = raw_app_meta_data - 'test_permission'
        WHERE email = 'oluobamzy@gmail.com'
        RETURNING id;
      ` 
    });
    
    if (revertError) {
      console.log('❌ Reverting test permission failed:', revertError.message);
    } else {
      console.log('✅ Test permission removed');
    }
    
    console.log('\n===== Permission Check Complete =====');
    
  } catch (error) {
    console.error('Error in permission check:', error);
  }
}

checkPermissions();
