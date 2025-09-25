-- ==============================
-- COMPREHENSIVE SERMON UPLOAD FIX
-- ==============================
-- Run this script in Supabase SQL Editor to fix video upload issues

-- ======== STEP 1: ENSURE STORAGE BUCKET EXISTS ========
-- This creates the sermon-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermon-media', 'sermon-media', true)
ON CONFLICT (id) DO NOTHING;

-- ======== STEP 2: CLEAR OLD STORAGE POLICIES ========
-- Remove any conflicting policies (including the ones we just created)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sermon media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view sermon media" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access sermon-media" ON storage.objects;
-- Drop the policies we created in previous runs
DROP POLICY IF EXISTS "Public can view sermon media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload sermon media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update sermon media" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete sermon media" ON storage.objects;

-- ======== STEP 3: CREATE NEW COMPREHENSIVE STORAGE POLICIES ========

-- Policy 1: Anyone can read/view files from sermon-media bucket (for public access to sermons)
CREATE POLICY "Public can view sermon media"
ON storage.objects FOR SELECT
USING (bucket_id = 'sermon-media');

-- Policy 2: Admin users can upload files to sermon-media bucket
CREATE POLICY "Admin can upload sermon media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sermon-media' 
  AND (
    
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- Policy 3: Admin users can update files in sermon-media bucket
CREATE POLICY "Admin can update sermon media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sermon-media' 
  AND (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- Policy 4: Admin users can delete files from sermon-media bucket
CREATE POLICY "Admin can delete sermon media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sermon-media' 
  AND (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- ======== STEP 4: ENSURE SERMON TABLE RLS POLICIES ARE CORRECT ========

-- Make sure RLS is enabled on sermons table
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Drop existing sermon policies
DROP POLICY IF EXISTS "Public can view published sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can manage sermons" ON sermons;

-- Recreate sermon table policies
CREATE POLICY "Public can view published sermons"
ON sermons FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage sermons"
ON sermons FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ======== STEP 5: ENSURE USER_ROLES TABLE EXISTS AND HAS PROPER POLICIES ========

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create user_roles policies
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR auth.jwt() ->> 'role' = 'admin'
);

-- ======== STEP 6: DIAGNOSTIC QUERIES ========

-- Check if everything is set up correctly
SELECT 'Storage Bucket Check' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM storage.buckets WHERE id = 'sermon-media'
       ) THEN 'SUCCESS: sermon-media bucket exists' 
         ELSE 'ERROR: sermon-media bucket missing' 
       END as result
UNION ALL

SELECT 'Storage Policies Check' as check_type,
       'Policies created - check manually in Supabase Dashboard > Storage > sermon-media > Policies' as result
UNION ALL

SELECT 'Current User Admin Check' as check_type,
       CASE 
         WHEN auth.uid() IS NULL THEN 'ERROR: Not logged in'
         WHEN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN 'SUCCESS: Admin via app_metadata'
         WHEN EXISTS (
           SELECT 1 FROM user_roles 
           WHERE user_id = auth.uid() AND role = 'admin'
         ) THEN 'SUCCESS: Admin via user_roles'
         ELSE 'ERROR: User is not admin'
       END as result;

-- ======== STEP 7: ADD ADMIN USER IF NEEDED ========

-- Insert admin role for the main admin user if not exists
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'oluobamzy@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

SELECT 
  'Final Check' as check_type,
  'Setup Complete - Try uploading now!' as result;