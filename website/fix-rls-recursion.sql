-- ================================
-- FIX RLS POLICY RECURSION
-- Remove problematic policies and create simple ones
-- ================================

-- First, get all existing policies on user_roles and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_roles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_roles';
    END LOOP;
END $$;

-- Also drop specific known policies
DROP POLICY IF EXISTS "Public read access to user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "authenticated_users_can_read_user_roles" ON user_roles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_roles;
DROP POLICY IF EXISTS "authenticated_users_can_insert_user_roles" ON user_roles;

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

-- Verify the table structure and policies
SELECT schemaname, tablename, policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'user_roles';

SELECT 'RLS policies fixed for user_roles table' as status;