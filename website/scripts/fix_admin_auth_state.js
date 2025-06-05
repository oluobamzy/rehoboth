#!/usr/bin/env node

// scripts/fix_admin_auth_state.js
// This script completely fixes admin authentication by checking and setting admin role in both:
// 1. app_metadata in auth.users table
// 2. user_roles table
// Usage: node scripts/fix_admin_auth_state.js email@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminAuthState(email) {
  try {
    if (!email || !email.includes('@')) {
      console.error('❌ Please provide a valid email address');
      console.error('Usage: node scripts/fix_admin_auth_state.js email@example.com');
      process.exit(1);
    }

    console.log(`🔍 Looking up user: ${email}`);
    
    // Find the user by email using the admin API
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error listing users: ${userError.message}`);
    }
    
    // Find the user with the specified email
    const user = userData?.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    const userId = user.id;
    console.log(`✅ Found user with ID: ${userId}`);
    console.log(`📧 Email: ${user.email}`);
    
    // 1. Check app_metadata in auth.users
    console.log('\n📝 Checking app_metadata in auth.users...');
    console.log(`Current app_metadata: ${JSON.stringify(user.app_metadata || {})}`);
    
    let appMetadataContainsAdmin = user.app_metadata?.role === 'admin';
    
    if (!appMetadataContainsAdmin) {
      console.log('❌ Admin role not found in app_metadata. Adding it now...');
      
      // Update app_metadata to include admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: 'admin' } }
      );
      
      if (updateError) {
        throw new Error(`Error updating app_metadata: ${updateError.message}`);
      }
      
      console.log('✅ Successfully added admin role to app_metadata');
    } else {
      console.log('✅ Admin role already exists in app_metadata');
    }
    
    // 2. Check user_roles table
    console.log('\n📝 Checking user_roles table...');
    
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleError) {
      throw new Error(`Error checking user_roles table: ${roleError.message}`);
    }
    
    if (!existingRole) {
      console.log('❌ Admin role not found in user_roles table. Adding it now...');
      
      // Add admin role to the user_roles table
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, role: 'admin' }
        ]);
      
      if (insertError) {
        throw new Error(`Error adding admin role to user_roles: ${insertError.message}`);
      }
      
      console.log('✅ Successfully added admin role to user_roles table');
    } else {
      console.log('✅ Admin role already exists in user_roles table');
    }
    
    // 3. Fetch the user again to verify changes
    console.log('\n🔄 Verifying changes...');
    
    const { data: updatedUser, error: verifyError } = await supabase.auth.admin.getUserById(userId);
    
    if (verifyError) {
      throw new Error(`Error verifying user: ${verifyError.message}`);
    }
    
    console.log(`Updated app_metadata: ${JSON.stringify(updatedUser.user.app_metadata)}`);
    
    const { data: verifyRole, error: verifyRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (verifyRoleError) {
      throw new Error(`Error verifying roles: ${verifyRoleError.message}`);
    }
    
    console.log(`User roles in database: ${JSON.stringify(verifyRole.map(r => r.role))}`);
    
    // 4. Check for any active Supabase sessions
    console.log('\n🔑 Checking for active sessions...');
    
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUserSessions(userId);
    
    if (sessionsError) {
      throw new Error(`Error listing sessions: ${sessionsError.message}`);
    }
    
    if (!sessions || sessions.length === 0) {
      console.log('ℹ️ No active sessions found. User needs to log in again.');
    } else {
      console.log(`✅ Found ${sessions.length} active sessions`);
      console.log('📌 Note: User may need to restart their session to get the updated roles');
      
      // Optionally, we could revoke all sessions to force re-login
      console.log('\nWould you like to revoke all sessions to force the user to re-login? (y/N)');
      
      // We can't do interactive prompts in a script, so just provide instructions
      console.log('\nTo revoke all sessions, run:');
      console.log(`node scripts/revoke_sessions.js ${userId}`);
    }
    
    console.log('\n✅ ADMIN ROLE FIX COMPLETED!');
    console.log('\n📌 Next steps:');
    console.log('1. Have the user visit: /public/fix_auth_state.html to repair their browser state');
    console.log('2. Or have them clear their browser data and log in again');
    console.log('3. They should now be able to access admin areas');

  } catch (error) {
    console.error(`❌ Error fixing admin auth state: ${error.message}`);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node scripts/fix_admin_auth_state.js email@example.com');
  process.exit(1);
}

fixAdminAuthState(email).then(() => process.exit(0));
