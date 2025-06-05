// scripts/directAdminGrant.js
// This script directly grants admin privileges to a user
// It uses direct database queries which should work even if other methods fail
// Run with: node scripts/directAdminGrant.js user_email@example.com

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get the email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address: node scripts/directAdminGrant.js user_email@example.com');
  process.exit(1);
}

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key (has admin privileges)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function directGrantAdmin() {
  try {
    console.log('------------------------------------');
    console.log('🔑 ADMIN ROLE DIRECT GRANTING SCRIPT');
    console.log('------------------------------------');
    console.log(`📧 Target user: ${email}`);
    
    // Step 1: Get the user ID from Auth
    console.log('\n🔍 Step 1: Finding user ID...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    if (userError) {
      console.error(`❌ Error finding user: ${userError.message}`);
      process.exit(1);
    }

    if (!userData || !userData.user) {
      console.error(`❌ User with email ${email} not found in Auth.`);
      process.exit(1);
    }

    const userId = userData.user.id;
    console.log(`✅ Found user: ${email} (ID: ${userId})`);

    // Step 2: Update user's app_metadata via Admin API
    console.log('\n🔍 Step 2: Updating user app_metadata...');
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { app_metadata: { role: 'admin' } }
    );

    if (updateError) {
      console.error(`❌ Error updating user metadata: ${updateError.message}`);
    } else {
      console.log(`✅ User app_metadata updated with admin role`);
    }

    // Step 3: Ensure user_roles table exists
    console.log('\n🔍 Step 3: Ensuring user_roles table exists...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(user_id, role)
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec', { query: createTableQuery });
    
    if (tableError) {
      console.error(`❌ Error creating table: ${tableError.message}`);
    } else {
      console.log(`✅ user_roles table confirmed`);
    }

    // Step 4: Insert/update role in the user_roles table
    console.log('\n🔍 Step 4: Updating user_roles table...');
    
    // First try with the from API
    let success = false;
    
    try {
      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: 'admin', updated_at: new Date() },
          { onConflict: 'user_id,role' }
        );
      
      if (upsertError) {
        console.warn(`⚠️ Upsert API error: ${upsertError.message}`);
        console.warn('Trying SQL method instead...');
      } else {
        console.log('✅ User role updated via Supabase API');
        success = true;
      }
    } catch (e) {
      console.warn(`⚠️ Exception using Supabase API: ${e.message}`);
      console.warn('Trying SQL method instead...');
    }
    
    // If API method failed, try with direct SQL
    if (!success) {
      const insertQuery = `
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('${userId}', 'admin')
        ON CONFLICT (user_id, role) 
        DO UPDATE SET updated_at = now();
      `;
      
      const { error: insertError } = await supabase.rpc('exec', { query: insertQuery });
      
      if (insertError) {
        console.error(`❌ Error inserting role: ${insertError.message}`);
      } else {
        console.log('✅ User role updated via SQL');
        success = true;
      }
    }

    if (success) {
      console.log('\n✅ SUCCESS: Admin privileges granted!');
      console.log('------------------------------------');
      console.log('👉 Important:');
      console.log('1. Sign out completely');
      console.log('2. Clear browser cache for this site');
      console.log('3. Sign in again with your credentials');
      console.log('------------------------------------');
    } else {
      console.log('\n❌ FAILED: Could not grant admin privileges.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

directGrantAdmin();
