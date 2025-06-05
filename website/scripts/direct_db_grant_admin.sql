# scripts/direct_db_grant_admin.sql
-- This SQL script grants admin role to a specific user
-- Replace OLUOBAMZY@GMAIL.COM with the actual email (case sensitive)
-- You'll need to run this directly in the Supabase dashboard SQL editor

-- First create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);

-- First verify the user exists and get their ID
DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'OLUOBAMZY@GMAIL.COM'; -- Replace with actual email (case sensitive)
BEGIN
  -- Get the user's ID
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update the app_metadata to include admin role
  UPDATE auth.users 
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE id = user_id;
  
  -- Add the user to the user_roles table with admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW();
  
  RAISE NOTICE 'Admin role granted to user ID: %', user_id;
END $$;
