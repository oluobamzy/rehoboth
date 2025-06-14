// scripts/test_auth_system.js
// This script tests the authentication system and connection to Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuthSystem() {
  try {
    console.log('===== Authentication System Test =====');
    console.log('\n1. Testing connection to Supabase...');

    // Test connection by executing a simple query
    const { data: versionData, error: versionError } = await supabase
      .from('_prisma_migrations') // A table that should exist in most Supabase projects
      .select('id')
      .limit(1);

    if (versionError) {
      console.log('❌ Connection failed:', versionError.message);
      
      // Check if we have the exec function for direct SQL execution
      console.log('\nTrying to execute SQL directly...');
      const { data: execData, error: execError } = await supabase.rpc('exec', {
        query: 'SELECT version();'
      });

      if (execError) {
        console.log('❌ Direct SQL execution failed:', execError.message);
        console.log('\n⚠️ The exec function may not be set up in your Supabase instance.');
        console.log('Run: node scripts/createExecFunction.js to create it.');
      } else {
        console.log('✅ Direct SQL execution successful!');
        console.log('SQL Result:', execData);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('Test query result:', versionData);

      // Test direct SQL execution
      console.log('\n2. Testing direct SQL execution...');
      try {
        const { data: execData, error: execError } = await supabase.rpc('exec', {
          query: 'SELECT version();'
        });

        if (execError) {
          console.log('❌ Direct SQL execution failed:', execError.message);
          console.log('⚠️ The exec function may not be set up in your Supabase instance.');
        } else {
          console.log('✅ Direct SQL execution successful!');
          console.log('SQL Result:', execData);
        }
      } catch (e) {
        console.log('❌ Error executing SQL:', e.message);
      }
    }

    // Test auth admin API
    console.log('\n3. Testing Auth Admin API...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
        limit: 5
      });

      if (usersError) {
        console.log('❌ Auth Admin API access failed:', usersError.message);
      } else {
        console.log('✅ Auth Admin API access successful!');
        console.log(`Found ${users.users.length} users:`);
        users.users.forEach((user, i) => {
          console.log(`  User ${i+1}: ${user.email} (${user.id})`);
          console.log(`    Role: ${user.app_metadata?.role || 'No role'}`);
        });
      }
    } catch (e) {
      console.log('❌ Error accessing Auth Admin API:', e.message);
    }

    // Check auth tables
    console.log('\n4. Checking auth tables...');
    
    // Check user_roles table
    try {
      const { data: roleData, error: roleError } = await supabase.rpc('exec', {
        query: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_roles'
        );`
      });

      if (roleError) {
        console.log('❌ Unable to check user_roles table:', roleError.message);
      } else {
        const userRolesExists = roleData && roleData[0] && roleData[0].exists;
        console.log(`User roles table exists: ${userRolesExists ? '✅ YES' : '❌ NO'}`);
        
        if (userRolesExists) {
          // Check roles in the table
          const { data: roles, error: rolesError } = await supabase.rpc('exec', {
            query: `SELECT user_id, role FROM user_roles LIMIT 5;`
          });
          
          if (rolesError) {
            console.log('❌ Error getting roles:', rolesError.message);
          } else {
            console.log(`Found ${roles.length} role entries:`);
            roles.forEach((role, i) => {
              console.log(`  Role ${i+1}: User ${role.user_id} has role "${role.role}"`);
            });
          }
        }
      }
    } catch (e) {
      console.log('❌ Error checking user_roles table:', e.message);
    }

    // Check auth.users with admin privileges 
    try {
      const { data: adminCheck, error: adminError } = await supabase.rpc('exec', {
        query: `
          SELECT id, email, raw_app_meta_data->>'role' as role 
          FROM auth.users 
          WHERE raw_app_meta_data->>'role' = 'admin' 
          LIMIT 5;
        `
      });

      if (adminError) {
        console.log('❌ Unable to check admin users:', adminError.message);
      } else {
        console.log(`Found ${adminCheck.length} users with admin role in app_metadata:`);
        adminCheck.forEach((user, i) => {
          console.log(`  Admin ${i+1}: ${user.email} (${user.id})`);
        });
      }
    } catch (e) {
      console.log('❌ Error checking admin users:', e.message);
    }

    console.log('\n===== Authentication System Test Complete =====');
  } catch (error) {
    console.error('Error testing authentication system:', error);
  }
}

testAuthSystem();
