-- Check admin status for a specific email
-- Run this in the Supabase SQL Editor

-- First, get the user ID from auth.users
WITH user_info AS (
  SELECT id, email, raw_app_meta_data
  FROM auth.users
  WHERE email = 'oluobamzy@gmail.com'
)

-- Check multiple sources of admin privileges
SELECT 
  u.email,
  u.id,
  -- Check app_metadata for role = admin
  (u.raw_app_meta_data->>'role') = 'admin' AS has_app_metadata_admin,
  
  -- Check user_roles table
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = u.id AND role = 'admin'
  ) AS has_user_roles_admin,
  
  -- Check profiles table if it exists
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) AS profiles_table_exists,
  
  -- Show raw app_metadata for inspection
  u.raw_app_meta_data AS app_metadata
  
  
FROM user_info u;

-- Additional query to see all user roles (for verification)
SELECT r.* FROM public.user_roles r
JOIN auth.users u ON r.user_id = u.id
WHERE u.email = 'oluobamzy@gmail.com';
