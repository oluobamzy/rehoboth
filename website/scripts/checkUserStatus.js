// scripts/checkUserStatus.js
// This script checks the status of user accounts in the system
// Run this script with: node scripts/checkUserStatus.js admin@example.com

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
  console.error('❌ Please provide an email address: node scripts/checkUserStatus.js admin@example.com');
  process.exit(1);
}

async function checkUserStatus() {
  try {
    console.log(`Checking status for user: ${email}`);

    // Get user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    if (userError || !user) {
      console.error('❌ User not found:', userError?.message || 'No user with this email');
      process.exit(1);
    }

    // Print user information
    console.log('\n📋 User Information:');
    console.log('----------------');
    console.log(`ID: ${user.user.id}`);
    console.log(`Email: ${user.user.email}`);
    console.log(`Email confirmed: ${user.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`Created at: ${new Date(user.user.created_at).toLocaleString()}`);
    console.log(`Last sign in: ${user.user.last_sign_in_at ? new Date(user.user.last_sign_in_at).toLocaleString() : 'Never'}`);
    
    // Check app_metadata
    console.log('\n📋 App Metadata:');
    console.log('----------------');
    console.log('Role in app_metadata:', user.user.app_metadata?.role || 'None');
    
    // Check user_roles table
    console.log('\n📋 Database Roles:');
    console.log('----------------');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.user.id);
    
    if (rolesError) {
      console.log(`❌ Error fetching roles: ${rolesError.message}`);
      
      // Check if user_roles table exists
      const { error: tableError, data: tableExists } = await supabase.rpc('exec', {
        query: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_roles'
        );`
      });
      
      if (tableError) {
        console.log(`❌ Error checking table: ${tableError.message}`);
      } else {
        console.log(`user_roles table exists: ${tableExists && tableExists[0]?.exists ? 'Yes' : 'No'}`);
      }
    } else {
      if (roles && roles.length > 0) {
        roles.forEach((role) => {
          console.log(`- ${role.role}`);
        });
      } else {
        console.log('No roles found in database');
      }
    }
    
    // Check profiles table
    console.log('\n📋 Profile:');
    console.log('----------------');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
    
    if (profileError) {
      console.log(`❌ Error fetching profile: ${profileError.message}`);
      
      // Check if profiles table exists
      const { error: tableError, data: tableExists } = await supabase.rpc('exec', {
        query: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
        );`
      });
      
      if (tableError) {
        console.log(`❌ Error checking profiles table: ${tableError.message}`);
      } else {
        console.log(`profiles table exists: ${tableExists && tableExists[0]?.exists ? 'Yes' : 'No'}`);
      }
    } else {
      if (profile) {
        console.log(`First name: ${profile.first_name || 'Not set'}`);
        console.log(`Last name: ${profile.last_name || 'Not set'}`);
        console.log(`Role in profile: ${profile.role || 'Not set'}`);
      } else {
        console.log('No profile found');
      }
    }
    
    // Determine if user is an admin
    const isAdmin = user.user.app_metadata?.role === 'admin' || 
                   (roles && roles.some(r => r.role === 'admin')) ||
                   (profile && profile.role === 'admin');
    
    console.log('\n📋 Summary:');
    console.log('----------------');
    console.log(`Admin status: ${isAdmin ? '✅ User is an admin' : '❌ User is NOT an admin'}`);
    
    if (!isAdmin) {
      console.log('\nTo grant admin privileges, run: node scripts/fixUserRoles.js', email);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserStatus();
