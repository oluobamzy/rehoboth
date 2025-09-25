-- Quick Admin Test Script
-- Run this in Supabase SQL Editor to verify admin setup

-- 1. Check if all required tables exist
SELECT 
  'sermons' as table_name, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sermons') 
    THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'sermon_series' as table_name, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sermon_series') 
    THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'user_roles' as table_name, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
    THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 2. Check if storage bucket exists
SELECT 
  id, name, public, 
  CASE WHEN public THEN 'PUBLIC' ELSE 'PRIVATE' END as access_level
FROM storage.buckets 
WHERE id = 'sermon-media';

-- 3. Check RLS policies for sermons table
SELECT 
  schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('sermons', 'sermon_series')
ORDER BY tablename, policyname;

-- 4. Check storage policies
SELECT 
  policyname, roles, cmd, qual
FROM storage.policies 
WHERE bucket_id = 'sermon-media'
ORDER BY policyname;

-- 5. Check current user's admin status (run this while logged in)
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() -> 'app_metadata' ->> 'role' as app_metadata_role,
  CASE WHEN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN 'YES' ELSE 'NO' END as has_admin_role_in_table;

-- 6. List all admin users
SELECT 
  u.email, 
  u.raw_app_meta_data ->> 'role' as metadata_role,
  ur.role as table_role,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
WHERE u.raw_app_meta_data ->> 'role' = 'admin' 
   OR ur.role = 'admin';