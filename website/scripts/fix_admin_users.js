// scripts/fix_admin_users.js
// This script ensures admin users have admin privileges set in both app_metadata and user_roles
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', serviceRoleKey);
console.log('Anon Key:', anonkey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase URL or service role key.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function repairAdminUser(email) {
  console.log(`Fixing admin privileges for user: ${email}`);

  try {
    // 1. Get user ID by email using auth.admin functionality
    const { data: user, error: userError } = await supabase.auth.admin.listUsers({
      filter: { email: email },
    });

    if (userError) {
      console.error('Error fetching user:', userError);
      return false;
    }

    if (!user || user.users.length === 0) {
      console.error(`User not found with email: ${email}`);
      return false;
    }
    
    const userData = user.users[0];
    console.log(`Found user: ${userData.email} (${userData.id})`);

    // 2. Update user's app_metadata to include admin role
    const appMetadata = userData.app_metadata || {};
    appMetadata.role = 'admin';

    const { error: updateError } = await supabase.auth.admin.updateUserById(userData.id, {
      app_metadata: appMetadata
    });

    if (updateError) {
      console.error('Error updating app_metadata:', updateError);
      return false;
    }

    console.log(`Updated app_metadata for ${email}`);

    // 3. Ensure user has entry in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userData.id,
        role: 'admin',
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id, role',
        ignoreDuplicates: false
      });

    if (roleError) {
      // If it's a duplicate key error, that just means the user already has this role, which is fine
      if (roleError.code === '23505') {
        console.log(`User already has admin role in user_roles table`);
      } else {
        console.error('Error updating user_roles table:', roleError);
        return false;
      }
    } else {
      console.log(`Updated user_roles for ${email}`);
    }

    // 4. Invalidate and refresh user's sessions
    const { error: sessionError } = await supabase.auth.admin.signOut(userData.id);

    if (sessionError) {
      console.error('Error refreshing user sessions:', sessionError);
      console.warn('User will need to login again for changes to take effect.');
    } else {
      console.log(`Refreshed sessions for ${email}`);
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Main function to run the script
async function main() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error('Please provide a user email as an argument.');
    console.error('Usage: node fix_admin_users.js user@example.com');
    process.exit(1);
  }

  const success = await repairAdminUser(userEmail);
  
  if (success) {
    console.log(`✅ Successfully fixed admin privileges for ${userEmail}`);
    console.log('The user should now log out and log back in for changes to take effect.');
  } else {
    console.error(`❌ Failed to fix admin privileges for ${userEmail}`);
  }

  process.exit(success ? 0 : 1);
}

main();
