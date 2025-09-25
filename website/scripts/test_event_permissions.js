#!/usr/bin/env node
// Test script to diagnose event permissions issues
// Run with: node scripts/test_event_permissions.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDiagnostics() {
  console.log('\n======== EVENT PERMISSIONS DIAGNOSTICS ========\n');

  try {
    // Check events table access
    console.log('1. Testing events table access...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (eventsError) {
      console.error('❌ Error accessing events table:', eventsError.message);
    } else {
      console.log(`✅ Events table accessible, found ${events.length} events`);
    }

    // Check user_roles table access
    console.log('\n2. Testing user_roles table access...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('❌ Error accessing user_roles table:', rolesError.message);
    } else {
      console.log(`✅ User_roles table accessible, found ${roles.length} admin users`);
      roles.forEach(role => {
        console.log(`   - Admin user: ${role.user_id}`);
      });
    }

    // Check auth.users for admin metadata
    console.log('\n3. Checking auth.users for admin metadata...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
    } else {
      const adminAuthUsers = authUsers.users.filter(user => 
        user.app_metadata?.role === 'admin'
      );
      console.log(`✅ Found ${adminAuthUsers.length} users with admin role in auth.users:`);
      adminAuthUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
        console.log(`     Role: ${user.app_metadata?.role}`);
      });
    }

    // Test specific event query that's failing
    console.log('\n4. Testing specific event query...');
    const { data: specificEvent, error: specificError } = await supabase
      .from('events')
      .select('*')
      .limit(1)
      .single();
    
    if (specificError) {
      console.error('❌ Error with specific event query:', specificError.message);
    } else {
      console.log('✅ Specific event query successful');
      console.log('   Event data keys:', Object.keys(specificEvent));
    }

    console.log('\n======== RECOMMENDATIONS ========');
    
    const canAccessEvents = !eventsError;
    const canAccessRoles = !rolesError;
    const hasAdminUsers = (roles && roles.length > 0) || 
                         (authUsers && authUsers.users.some(u => u.app_metadata?.role === 'admin'));

    if (!canAccessEvents) {
      console.log('❌ CRITICAL: Cannot access events table');
      console.log('   → Run the SQL script: fix_event_permissions.sql');
    }

    if (!canAccessRoles) {
      console.log('❌ CRITICAL: Cannot access user_roles table');
      console.log('   → Run the SQL script: fix_event_permissions.sql');
    }

    if (!hasAdminUsers) {
      console.log('❌ CRITICAL: No admin users found');
      console.log('   → Run the SQL script: fix_event_permissions.sql');
    }

    if (canAccessEvents && canAccessRoles && hasAdminUsers) {
      console.log('✅ All components appear to be configured correctly');
      console.log('   → The 403 errors may be client-side authentication issues');
      console.log('   → Check browser dev tools for detailed error messages');
      console.log('   → Make sure user is properly logged in as admin');
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }
}

runDiagnostics();