-- COMPREHENSIVE CAROUSEL PERMISSIONS FIX SCRIPT
-- Run this in the Supabase SQL Editor to fix permissions

-- ======== PART 1: FIX CAROUSEL TABLE STRUCTURE AND PERMISSIONS ========

-- Make sure the carousel_slides table exists with proper structure
CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sample data if the table is empty
INSERT INTO carousel_slides (title, subtitle, image_url, cta_text, cta_link, display_order, is_active)
SELECT 
  'Welcome to Rehoboth Church', 
  'A Place of Restoration', 
  '/rehoboth_logo.jpg', 
  'Learn More', 
  '/about', 
  1, 
  true
WHERE NOT EXISTS (SELECT 1 FROM carousel_slides);

-- ======== PART 2: SET UP PROPER ROLE-BASED ACCESS ========

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist (to avoid duplicate roles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END
$$;

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

-- ======== PART 3: GRANT DATABASE PERMISSIONS ========

-- Grant permissions for public access to carousel for viewing
GRANT SELECT ON carousel_slides TO anon, authenticated;

-- Grant full access to authenticated users (RLS will control actual permissions)
GRANT ALL ON carousel_slides TO authenticated;

-- Grant permission on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ======== PART 4: SET UP ROW LEVEL SECURITY ========

-- Enable RLS on tables
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active carousel slides" ON carousel_slides;
DROP POLICY IF EXISTS "Admins can manage carousel slides" ON carousel_slides;
DROP POLICY IF EXISTS "Direct admin bypass for specific user" ON carousel_slides;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Create more permissive policy that checks admin role in multiple ways
CREATE POLICY "Admins can manage carousel slides" 
ON carousel_slides 
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

-- Public viewing policy for active slides
CREATE POLICY "Public can view active carousel slides" 
ON carousel_slides 
FOR SELECT 
USING (is_active = true);

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Admins can manage user roles
CREATE POLICY "Admins can manage user roles" 
ON user_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR auth.jwt() ->> 'role' = 'admin'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ======== PART 5: SYNC EXISTING USERS ========

-- Insert admin roles for all users that have admin in their app_metadata
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- ======== PART 6: CREATE A FAST ADMIN SETUP FUNCTION ========

-- Create a function to make any user an admin
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

-- ======== PART 7: FIX TOKEN REFRESH ISSUES ========

-- Clean up excess refresh tokens to avoid constant refreshing
DELETE FROM auth.refresh_tokens
WHERE created_at < NOW() - INTERVAL '1 day'
AND user_id IN (
  SELECT user_id 
  FROM auth.refresh_tokens
  GROUP BY user_id
  HAVING COUNT(*) > 5
);

-- ======== USAGE INSTRUCTIONS ========

-- To make any user an admin, run:
-- SELECT make_user_admin('user@example.com');

-- To check all admins:
-- SELECT u.email, u.raw_app_meta_data
-- FROM auth.users u
-- WHERE u.raw_app_meta_data->>'role' = 'admin';

-- To manually fix one user:
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'user@example.com';
