// scripts/basic_auth_check.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuth() {
  try {
    console.log('Testing Supabase connection...');
    // Simple check to verify connection works
    const { data: versionData, error: versionError } = await supabase.rpc('get_postgres_version');
    
    if (versionError) {
      console.error('❌ Connection error:', versionError.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Step 1: Check if we can list users
    console.log('\nTrying to list users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError.message);
    } else {
      console.log(`✅ Successfully retrieved ${users.users.length} users`);
      
      // Find admin user
      const adminUser = users.users.find(user => 
        user.email === 'oluobamzy@gmail.com' || 
        (user.app_metadata && user.app_metadata.role === 'admin')
      );
      
      if (adminUser) {
        console.log(`\nFound admin user: ${adminUser.email}`);
        console.log(`User ID: ${adminUser.id}`);
        console.log(`App metadata:`, adminUser.app_metadata);
        
        // Step 2: Check user_roles table
        console.log('\nChecking user_roles table...');
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', adminUser.id);
          
        if (rolesError) {
          console.error('❌ Error checking user_roles:', rolesError.message);
        } else {
          console.log('User roles:', userRoles);
        }
        
        // Step 3: Try to get session data (this is the problematic function)
        console.log('\nTrying to list sessions (known issue)...');
        try {
          const { data: sessions, error: sessionError } = await supabase.auth.admin.listUserSessions(adminUser.id);
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError.message);
          } else {
            console.log(`✅ Found ${sessions.length} active sessions`);
          }
        } catch (e) {
          console.error('❌ Exception with listUserSessions:', e.message);
        }
      } else {
        console.log('❌ No admin user found');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAuth();
