// scripts/verify_admin_role.js
// This script verifies that a user has admin privileges in both app_metadata and user_roles
// and helps troubleshoot authentication issues
// Usage: node scripts/verify_admin_role.js user@example.com

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
  console.error('❌ Please provide an email address: node scripts/verify_admin_role.js admin@example.com');
  process.exit(1);
}

async function verifyAdminRole() {
  try {
    console.log(`🔍 Verifying admin role for user: ${email}`);
    
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
    console.log(`✅ Found user ${user.email} (${user.id})`);
    
    // 2. Check app_metadata
    console.log('\n🔍 Checking app_metadata...');
    console.log('Current app_metadata:', JSON.stringify(user.app_metadata, null, 2));
    
    const hasAdminInMetadata = user.app_metadata?.role === 'admin';
    if (hasAdminInMetadata) {
      console.log('✅ User has admin role in app_metadata');
    } else {
      console.log('❌ User does NOT have admin role in app_metadata');
      
      // Fix app_metadata
      console.log('Updating app_metadata...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: 'admin' }
      });
      
      if (updateError) {
        console.error('❌ Error updating app_metadata:', updateError);
      } else {
        console.log('✅ Successfully updated app_metadata with admin role');
      }
    }
    
    // 3. Check user_roles table
    console.log('\n🔍 Checking user_roles table...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin');
    
    if (rolesError) {
      console.error('❌ Error checking user_roles table:', rolesError);
      return false;
    }
    
    const hasAdminInTable = userRoles && userRoles.length > 0;
    if (hasAdminInTable) {
      console.log('✅ User has admin role in user_roles table');
      console.log('Role record:', JSON.stringify(userRoles[0], null, 2));
    } else {
      console.log('❌ User does NOT have admin role in user_roles table');
      
      // Fix user_roles table
      console.log('Adding admin role to user_roles table...');
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, role'
        });
      
      if (insertError) {
        console.error('❌ Error adding role to user_roles table:', insertError);
      } else {
        console.log('✅ Successfully added admin role to user_roles table');
      }
    }
    
    // 4. Force session refresh for this user
    console.log('\n🔄 Forcing session refresh for user...');
    const { error: signOutError } = await supabase.auth.admin.signOut(user.id, true);
    
    if (signOutError) {
      console.error('❌ Error signing out user sessions:', signOutError);
      console.log('⚠️ The user will need to log out and log back in for changes to take effect.');
    } else {
      console.log('✅ Successfully invalidated all sessions for this user');
      console.log('⚠️ The user will need to log in again for the changes to take effect.');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

verifyAdminRole().then((success) => {
  if (success) {
    console.log('\n✅ Admin role verification completed successfully');
    console.log('If you continue to have access issues:');
    console.log('1. Make sure the user logs out completely');
    console.log('2. Clear browser cookies for this site');
    console.log('3. Have the user log in again');
  } else {
    console.error('\n❌ Admin role verification failed');
  }
  process.exit(success ? 0 : 1);
});
