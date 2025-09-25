-- EMERGENCY SERMON UPLOAD FIX
-- Run this if you need sermon uploads working IMMEDIATELY
-- This is a simplified version that just fixes the core issue

-- 1. Create storage bucket if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('sermon-media', 'sermon-media', true, 52428800)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- 2. Create user_roles table if missing
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Make the current user an admin RIGHT NOW
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
DO $$
DECLARE
    current_email TEXT := 'YOUR_EMAIL_HERE'; -- CHANGE THIS TO YOUR EMAIL
    target_user_id UUID;
BEGIN
    -- Find your user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = current_email;
    
    IF target_user_id IS NOT NULL THEN
        -- Update app_metadata
        UPDATE auth.users 
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            '{"role": "admin"}'::jsonb
        WHERE id = target_user_id;
        
        -- Add to user_roles table
        INSERT INTO user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Made user % an admin', current_email;
    ELSE
        RAISE NOTICE 'User % not found - check email address', current_email;
    END IF;
END $$;

-- 4. Create essential storage policies
CREATE POLICY "Allow public read access to sermon media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'sermon-media');

CREATE POLICY "Allow admin upload to sermon media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'sermon-media' AND
  (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Allow admin update sermon media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'sermon-media' AND
  (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Allow admin delete sermon media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'sermon-media' AND
  (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- 5. Verification - this will show your admin status
SELECT 
  'SUCCESS - You are now an admin!' as message,
  u.email,
  u.raw_app_meta_data ->> 'role' as app_metadata_role,
  ur.role as user_roles_table_role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'YOUR_EMAIL_HERE'; -- CHANGE THIS TO YOUR EMAIL