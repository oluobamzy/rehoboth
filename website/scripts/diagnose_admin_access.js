// scripts/diagnose_admin_access.js
// This script diagnoses admin access issues by checking the user's role in both locations
// Usage: node scripts/diagnose_admin_access.js user@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Required environment variables are missing. Please check .env.local file.');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get the email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address: node scripts/diagnose_admin_access.js admin@example.com');
  process.exit(1);
}

async function diagnoseAdminAccess() {
  try {
    console.log(`🔍 Diagnosing admin access for: ${email}...`);
    
    // 1. Find user by email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      filter: { email }
    });
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError);
      return false;
    }
    
    if (!users || users.users.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      return false;
    }
    
    const user = users.users[0];
    console.log(`✅ Found user: ${user.email} (${user.id})`);
    
    // 2. Check app_metadata
    console.log('\n🔍 Checking app_metadata...');
    console.log('Current app_metadata:', JSON.stringify(user.app_metadata, null, 2));
    
    const hasAdminInMetadata = user.app_metadata?.role === 'admin';
    if (hasAdminInMetadata) {
      console.log('✅ User has admin role in app_metadata');
    } else {
      console.log('❌ User does NOT have admin role in app_metadata');
    }
    
    // 3. Check user_roles table
    console.log('\n🔍 Checking user_roles table...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('❌ Error checking user_roles table:', rolesError);
      return false;
    }
    
    console.log('User roles from database:', JSON.stringify(userRoles, null, 2));
    
    const hasAdminInTable = userRoles && userRoles.some(role => role.role === 'admin');
    if (hasAdminInTable) {
      console.log('✅ User has admin role in user_roles table');
    } else {
      console.log('❌ User does NOT have admin role in user_roles table');
    }
    
    // 4. Test middleware logic directly
    console.log('\n🔍 Testing middleware admin role check logic...');
    
    // First check: app_metadata.role === 'admin'
    const appMetadataCheck = hasAdminInMetadata;
    console.log(`Admin role in app_metadata: ${appMetadataCheck ? '✅ YES' : '❌ NO'}`);
    
    // Second check: user_roles table has admin role
    console.log(`Admin role in user_roles table: ${hasAdminInTable ? '✅ YES' : '❌ NO'}`);
    
    // Final admin check result (this is the logic used in middleware)
    const isAdmin = appMetadataCheck || hasAdminInTable;
    console.log(`\n📋 FINAL RESULT: ${isAdmin ? '✅ THIS USER SHOULD HAVE ADMIN ACCESS' : '❌ THIS USER DOES NOT HAVE ADMIN ACCESS'}`);
    
    if (isAdmin) {
      console.log('\nIf the user is still having access issues, the problem is likely with session management.');
      console.log('Recommended steps:');
      console.log('1. Have the user completely clear cookies for the site');
      console.log('2. Have the user log out and log back in');
      console.log('3. Check browser storage in developer tools for any persistent state');
    } else {
      console.log('\nThis user needs to be granted admin privileges. Run:');
      console.log(`node scripts/fix_admin_users.js ${email}`);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

diagnoseAdminAccess().then((success) => {
  process.exit(success ? 0 : 1);
});
