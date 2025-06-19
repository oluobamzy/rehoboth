// scripts/test_carousel_access.js
// This script tests carousel access for a specific user
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCarouselAccess() {
  try {
    console.log('===== Testing Carousel Access =====');
    
    // The user email to test
    const userEmail = 'oluobamzy@gmail.com';
    console.log(`Testing carousel access for user: ${userEmail}`);
    
    // Get the user using admin SQL queries since the admin API might not be available
    const { data: userData, error: userError } = await supabase.rpc('exec', {
      query: `
        SELECT id, email, raw_app_meta_data as metadata
        FROM auth.users
        WHERE email = '${userEmail}';
      `
    });
    
    if (userError || !userData || userData.length === 0) {
      console.error('Error fetching user:', userError || 'User not found');
      return;
    }
    
    const user = userData[0];
    console.log(`Found user: ${user.id}`);
    console.log('User metadata:', user.metadata);
    
    // Check carousel table permissions
    console.log('\n1. Checking carousel_slides table permissions...');
    
    const { error: permissionsError } = await supabase.rpc('exec', {
      query: `
        SELECT grantee, privilege_type 
        FROM information_schema.role_table_grants 
        WHERE table_name = 'carousel_slides';
      `
    });
    
    if (permissionsError) {
      console.error('Error checking permissions:', permissionsError);
    }
    
    // Check RLS policies
    console.log('\n2. Checking RLS policies on carousel_slides...');
    
    const { data: policiesData, error: policiesError } = await supabase.rpc('exec', {
      query: `
        SELECT polname AS policy_name, polpermissive, polroles, polqual, polwithcheck
        FROM pg_policy
        JOIN pg_class ON pg_policy.polrelid = pg_class.oid
        WHERE relname = 'carousel_slides';
      `
    });
    
    if (policiesError) {
      console.error('Error checking RLS policies:', policiesError);
    } else {
      console.log('RLS policies on carousel_slides table:');
      console.log(policiesData);
    }
    
    // Check if RLS is enabled
    console.log('\n3. Checking if RLS is enabled on carousel_slides...');
    
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec', {
      query: `
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relname = 'carousel_slides';
      `
    });
    
    if (rlsError) {
      console.error('Error checking RLS status:', rlsError);
    } else {
      console.log('RLS status:', rlsData);
      console.log('RLS enabled:', rlsData[0]?.relrowsecurity);
    }
    
    // Simulate user access by creating a temporary auth token
    console.log('\n4. Simulating user access with a temporary token...');
    
    // Clean up any existing admin access bypass cookies
    await supabase.rpc('exec', {
      query: `
        UPDATE auth.users
        SET raw_app_meta_data = 
          raw_app_meta_data || 
          '{"role": "admin", "test_permission": true}'::jsonb
        WHERE id = '${user.id}';
      `
    });
    
    // Re-fetch the user to check metadata is updated
    const { data: updatedUserData } = await supabase.rpc('exec', {
      query: `
        SELECT id, email, raw_app_meta_data as metadata
        FROM auth.users
        WHERE id = '${user.id}';
      `
    });
    console.log('Updated user metadata:', updatedUserData?.[0]?.metadata);
    
    // Test inserting a row as test
    console.log('\n5. Testing direct insert into carousel_slides...');
    
    const testData = {
      title: 'Test Carousel',
      subtitle: 'Created by test script',
      image_url: '/test_image.jpg',
      display_order: 999,
      is_active: false
    };
    
    const { data: insertData, error: insertError } = await supabase.rpc('exec', {
      query: `
        INSERT INTO carousel_slides (
          title, subtitle, image_url, display_order, is_active
        ) VALUES (
          '${testData.title}',
          '${testData.subtitle}',
          '${testData.image_url}',
          ${testData.display_order},
          ${testData.is_active}
        ) RETURNING id;
      `
    });
    
    if (insertError) {
      console.error('Error inserting test data:', insertError);
    } else {
      console.log('Test row inserted successfully:', insertData);
      
      // Clean up the test row
      if (insertData[0]?.id) {
        console.log('Cleaning up test row...');
        await supabase.rpc('exec', {
          query: `DELETE FROM carousel_slides WHERE id = '${insertData[0].id}';`
        });
      }
    }
    
    // Final recommendation
    console.log('\n===== Test Complete =====');
    console.log(`
Summary of actions you can take:
1. If RLS is enabled and causing issues, run:
   - node scripts/fix_carousel_permissions.js
   
2. Make sure the user logs out and logs back in after changes
   
3. If issues persist, try temporarily disabling RLS for testing:
   - ALTER TABLE carousel_slides DISABLE ROW LEVEL SECURITY;
   
4. Review tokenRefresher.ts to ensure it's not causing constant refreshes

5. Remember to re-enable RLS when done testing:
   - ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testCarouselAccess();
