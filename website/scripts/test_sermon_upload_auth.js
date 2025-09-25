#!/usr/bin/env node
// Test script to diagnose sermon upload authentication issues
// Run with: node scripts/test_sermon_upload_auth.js

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
  console.log('\n======== SERMON UPLOAD DIAGNOSTICS ========\n');

  try {
    // Check if sermon-media bucket exists
    console.log('1. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError.message);
    } else {
      const sermonBucket = buckets.find(b => b.id === 'sermon-media');
      if (sermonBucket) {
        console.log('✅ sermon-media bucket exists');
        console.log(`   - Public: ${sermonBucket.public}`);
        console.log(`   - Created: ${sermonBucket.created_at}`);
      } else {
        console.log('❌ sermon-media bucket NOT found');
        console.log('   Available buckets:', buckets.map(b => b.id).join(', '));
      }
    }

    // Check storage policies
    console.log('\n2. Checking storage policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'sermon-media');

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError.message);
    } else {
      console.log(`✅ Found ${policies.length} policies for sermon-media bucket:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.name} (${policy.command})`);
      });
    }

    // Check admin users
    console.log('\n3. Checking admin users...');
    const { data: adminUsers, error: usersError } = await supabase
      .from('user_roles')
      .select('*, user_id')
      .eq('role', 'admin');

    if (usersError) {
      console.error('❌ Error fetching admin users:', usersError.message);
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users in user_roles table`);
      for (const admin of adminUsers) {
        console.log(`   - User ID: ${admin.user_id}`);
      }
    }

    // Check auth.users for admin metadata
    console.log('\n4. Checking auth.users for admin metadata...');
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
        console.log(`     Created: ${user.created_at}`);
      });
    }

    console.log('\n======== RECOMMENDATIONS ========');
    
    const sermonBucketExists = buckets && buckets.find(b => b.id === 'sermon-media');
    const hasPolicies = policies && policies.length > 0;
    const hasAdminUsers = (adminUsers && adminUsers.length > 0) || 
                         (authUsers && authUsers.users.some(u => u.app_metadata?.role === 'admin'));

    if (!sermonBucketExists) {
      console.log('❌ CRITICAL: sermon-media bucket missing');
      console.log('   → Run the SQL script: fix_sermon_upload_permissions.sql');
    }

    if (!hasPolicies) {
      console.log('❌ CRITICAL: No storage policies found for sermon-media');
      console.log('   → Run the SQL script: fix_sermon_upload_permissions.sql');
    }

    if (!hasAdminUsers) {
      console.log('❌ CRITICAL: No admin users found');
      console.log('   → Run the SQL script: fix_sermon_upload_permissions.sql');
    }

    if (sermonBucketExists && hasPolicies && hasAdminUsers) {
      console.log('✅ All components appear to be configured correctly');
      console.log('   → Try uploading again. If it still fails, check browser dev tools for detailed error messages');
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }
}

runDiagnostics();