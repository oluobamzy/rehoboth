-- QUICK DIAGNOSTIC - Run this first to see what's missing
-- Copy and paste this into your Supabase SQL Editor

-- Check if sermon-media bucket exists
SELECT 'Storage Bucket Check' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM storage.buckets WHERE id = 'sermon-media'
       ) THEN 'sermon-media bucket EXISTS' 
         ELSE 'sermon-media bucket MISSING - This is the problem!' 
       END as result;

-- Check if storage policies exist
SELECT 'Storage Policies Check' as check_type,
       COUNT(*) || ' storage policies found for sermon-media' as result
FROM storage.policies 
WHERE bucket_id = 'sermon-media';

-- Check your current user admin status
SELECT 'Current User Admin Check' as check_type,
       CASE 
         WHEN auth.uid() IS NULL THEN 'NOT LOGGED IN - Please log in first!'
         WHEN auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' THEN 'You are an ADMIN (via app_metadata)'
         WHEN EXISTS (
           SELECT 1 FROM user_roles 
           WHERE user_id = auth.uid() AND role = 'admin'
         ) THEN 'You are an ADMIN (via user_roles table)'
         ELSE 'YOU ARE NOT AN ADMIN - This is the problem!'
       END as result;

-- Check if user_roles table exists
SELECT 'User Roles Table Check' as check_type,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'
       ) THEN 'user_roles table EXISTS' 
         ELSE 'user_roles table MISSING' 
       END as result;