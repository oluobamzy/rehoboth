#!/usr/bin/env node

// scripts/test_admin_auth.js
// This script tests if admin authentication is working properly for a user
// Usage: node scripts/test_admin_auth.js email@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminAuth(email) {
  try {
    if (!email || !email.includes('@')) {
      console.error('❌ Please provide a valid email address');
      console.error('Usage: node scripts/test_admin_auth.js email@example.com');
      process.exit(1);
    }

    console.log(`\n======== ADMIN AUTHENTICATION TEST ========`);
    console.log(`Testing admin auth for user: ${email}`);
    
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
    console.log(`\n1. User Information:`);
    console.log(`✅ Found user: ${user.email} (ID: ${userId})`);
    console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
    
    // Check app_metadata in auth.users
    console.log(`\n2. App Metadata (auth.users):`);
    const appMetadata = user.app_metadata || {};
    console.log(JSON.stringify(appMetadata, null, 2));
    
    const hasAdminInMetadata = appMetadata.role === 'admin';
    console.log(`Admin role in app_metadata: ${hasAdminInMetadata ? '✅ YES' : '❌ NO'}`);
    
    // Check user_roles table
    console.log(`\n3. User Roles Table:`);
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (rolesError) {
      throw new Error(`Error checking user_roles table: ${rolesError.message}`);
    }
    
    if (!roles || roles.length === 0) {
      console.log(`❌ No roles found in user_roles table`);
    } else {
      console.log(`Roles: ${roles.map(r => r.role).join(', ')}`);
      const hasAdminRole = roles.some(r => r.role === 'admin');
      console.log(`Admin role in user_roles: ${hasAdminRole ? '✅ YES' : '❌ NO'}`);
    }
    
    // Check active sessions
    console.log(`\n4. Active Sessions:`);
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUserSessions(userId);
    
    if (sessionsError) {
      throw new Error(`Error listing sessions: ${sessionsError.message}`);
    }
    
    if (!sessions || sessions.length === 0) {
      console.log(`No active sessions found. User needs to log in.`);
    } else {
      console.log(`✅ Found ${sessions.length} active sessions`);
      sessions.forEach((session, i) => {
        console.log(`\nSession #${i+1}:`);
        console.log(`Created: ${new Date(session.created_at).toLocaleString()}`);
        console.log(`Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        console.log(`User Agent: ${session.user_agent || 'Unknown'}`);
        
        // Check if session contains admin role
        const sessionHasAdminRole = session.user?.app_metadata?.role === 'admin';
        console.log(`Has admin role in session: ${sessionHasAdminRole ? '✅ YES' : '❌ NO'}`);
      });
    }
    
    // Summary
    console.log(`\n5. Authentication Status Summary:`);
    
    const hasAdminInUserRoles = roles && roles.some(r => r.role === 'admin');
    const anyActiveSessions = sessions && sessions.length > 0;
    
    if (hasAdminInMetadata && hasAdminInUserRoles) {
      console.log(`✅ Server-side admin authentication is correctly configured`);
    } else {
      console.log(`❌ Server-side admin authentication has issues:`);
      if (!hasAdminInMetadata) console.log(`   - Missing admin role in app_metadata`);
      if (!hasAdminInUserRoles) console.log(`   - Missing admin role in user_roles table`);
    }
    
    if (!anyActiveSessions) {
      console.log(`ℹ️ No active sessions. User needs to log in for client-side state to be fixed.`);
    } else {
      const anySessionWithoutAdmin = sessions.some(s => s.user?.app_metadata?.role !== 'admin');
      if (anySessionWithoutAdmin) {
        console.log(`⚠️ Some sessions don't have admin role. User should log out and log in again.`);
      }
    }
    
    console.log(`\n6. Recommendations:`);
    
    if (!hasAdminInMetadata || !hasAdminInUserRoles) {
      console.log(`• Fix server-side permissions:`);
      console.log(`  node scripts/fix_admin_auth_state.js ${email}`);
    }
    
    if ((hasAdminInMetadata && hasAdminInUserRoles) && (!anyActiveSessions || sessions.some(s => s.user?.app_metadata?.role !== 'admin'))) {
      console.log(`• User should:`);
      console.log(`  1. Visit /fix_auth_state.html to repair client-side state, OR`);
      console.log(`  2. Clear browser storage and log in again`);
    }
    
    console.log(`\n======== TEST COMPLETED ========\n`);

  } catch (error) {
    console.error(`\n❌ Error testing admin auth: ${error.message}`);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node scripts/test_admin_auth.js email@example.com');
  process.exit(1);
}

testAdminAuth(email).then(() => process.exit(0));
