-- COMPREHENSIVE SERMON PERMISSIONS FIX SCRIPT
-- Run this in the Supabase SQL Editor to fix sermon permissions

-- ======== PART 1: ENSURE SERMON TABLES EXIST ========

-- Make sure the sermons table exists with proper structure
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scripture_reference VARCHAR(255),
  speaker_name VARCHAR(255) NOT NULL,
  sermon_date DATE NOT NULL,
  duration_seconds INTEGER,
  audio_url VARCHAR(500),
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  transcript TEXT,
  tags TEXT[] DEFAULT '{}',
  series_id UUID,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure the sermon_series table exists
CREATE TABLE IF NOT EXISTS sermon_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_roles table exists (reuse from carousel script)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END
$$;

-- ======== PART 2: CREATE STORAGE BUCKET FOR SERMON MEDIA ========

-- Insert storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermon-media', 'sermon-media', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800; -- 50MB limit

-- ======== PART 3: GRANT DATABASE PERMISSIONS ========

-- Grant permissions for public access to sermons and series for viewing
GRANT SELECT ON sermons TO anon, authenticated;
GRANT SELECT ON sermon_series TO anon, authenticated;

-- Grant full access to authenticated users (RLS will control actual permissions)
GRANT ALL ON sermons TO authenticated;
GRANT ALL ON sermon_series TO authenticated;

-- Grant permission on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ======== PART 4: SET UP ROW LEVEL SECURITY FOR SERMONS ========

-- Enable RLS on tables
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_series ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can manage all sermons" ON sermons;
DROP POLICY IF EXISTS "Public can view active sermon series" ON sermon_series;
DROP POLICY IF EXISTS "Admins can manage sermon series" ON sermon_series;

-- Create RLS policies for sermons
CREATE POLICY "Public can view published sermons" 
ON sermons 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all sermons" 
ON sermons 
FOR ALL
USING (
  -- Check if admin role in user_roles table
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  -- OR check if admin role in JWT app_metadata
  OR auth.jwt() ->> 'role' = 'admin'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Create RLS policies for sermon_series
CREATE POLICY "Public can view active sermon series" 
ON sermon_series 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage sermon series" 
ON sermon_series 
FOR ALL
USING (
  -- Check if admin role in user_roles table
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  -- OR check if admin role in JWT app_metadata
  OR auth.jwt() ->> 'role' = 'admin'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ======== PART 5: SET UP STORAGE POLICIES FOR SERMON MEDIA ========

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

-- Create storage policies for sermon-media bucket
CREATE POLICY "Public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'sermon-media');

CREATE POLICY "Admin upload access" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'sermon-media' AND
  (
    -- Check if admin role in user_roles table
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    -- OR check if admin role in JWT app_metadata
    OR auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);

CREATE POLICY "Admin update access" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'sermon-media' AND
  (
    -- Check if admin role in user_roles table
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    -- OR check if admin role in JWT app_metadata
    OR auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);

CREATE POLICY "Admin delete access" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'sermon-media' AND
  (
    -- Check if admin role in user_roles table
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    -- OR check if admin role in JWT app_metadata
    OR auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);

-- ======== PART 6: CREATE USER ROLE SYNC FUNCTION (if not exists) ========

-- Create function to sync user_roles with app_metadata
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- If a user is created or updated and has admin role in metadata
  IF NEW.raw_app_meta_data->>'role' = 'admin' THEN
    -- Insert or update the admin role in user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync user roles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles();

-- ======== PART 7: CREATE ADMIN SETUP FUNCTION ========

-- Create a function to make any user an admin (if not exists)
CREATE OR REPLACE FUNCTION public.make_user_admin(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
  result TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = email_address;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || email_address;
  END IF;
  
  -- Update user's app_metadata
  UPDATE auth.users 
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    '{"role": "admin", "test_permission": true}'::jsonb
  WHERE id = target_user_id;
  
  -- Add to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'Successfully made user ' || email_address || ' an admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======== PART 8: SYNC EXISTING USERS ========

-- Insert admin roles for all users that have admin in their app_metadata
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- ======== USAGE INSTRUCTIONS ========

-- To make any user an admin, run:
-- SELECT make_user_admin('user@example.com');

-- To check all admins:
-- SELECT u.email, u.raw_app_meta_data, ur.role
-- FROM auth.users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- WHERE u.raw_app_meta_data->>'role' = 'admin' OR ur.role = 'admin';

-- To test sermon upload permissions:
-- SELECT auth.uid(), auth.jwt() -> 'app_metadata' ->> 'role';