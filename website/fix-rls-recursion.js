// fix-rls-recursion.js
// Run with: node fix-rls-recursion.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSRecursion() {
  console.log('🔧 Fixing RLS recursion in user_roles table...');
  
  const fixRLSSQL = `
-- ================================
-- FIX RLS POLICY RECURSION
-- Remove problematic policies and create simple ones
-- ================================

-- First, drop ALL existing policies on user_roles to prevent recursion
DROP POLICY IF EXISTS "Public read access to user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;

-- Temporarily disable RLS on user_roles to test
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- If user_roles table doesn't exist, create it
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Re-enable RLS with simple, non-recursive policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow authenticated users to read all user_roles
CREATE POLICY "authenticated_users_can_read_user_roles" ON user_roles
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Simple policy: Allow users to update their own profile only
CREATE POLICY "users_can_update_own_profile" ON user_roles
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Simple policy: Allow authenticated users to insert (for admin creating profiles)
CREATE POLICY "authenticated_users_can_insert_user_roles" ON user_roles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
`;

  try {
    console.log('Executing RLS fix SQL...');
    
    const { data, error } = await supabase.rpc('exec', {
      sql: fixRLSSQL
    });

    if (error) {
      console.error('❌ Error executing RLS fix:', error);
      
      // Try alternative method using the REST API
      console.log('🔄 Trying alternative method...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ query: fixRLSSQL })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alternative method failed:', errorText);
        return;
      }
      
      console.log('✅ RLS recursion fix applied successfully (alternative method)!');
    } else {
      console.log('✅ RLS recursion fix applied successfully!');
    }

    // Verify the policies
    console.log('🔍 Verifying policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_roles');

    if (policiesError) {
      console.log('⚠️  Could not verify policies, but fix should be applied');
    } else {
      console.log('📋 Current policies on user_roles:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd}`);
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixRLSRecursion();