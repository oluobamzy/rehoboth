-- ================================
-- UPDATE RLS POLICIES FOR AUTHENTICATED USERS
-- Run this to allow any authenticated user to manage content
-- ================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admin full access to page_content" ON page_content;
DROP POLICY IF EXISTS "Admin full access to page_content_history" ON page_content_history;

-- Create new policies for authenticated users
CREATE POLICY "Authenticated users full access to page_content" ON page_content
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users full access to page_content_history" ON page_content_history
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Update helper function to check for any authenticated user instead of admin
CREATE OR REPLACE FUNCTION upsert_page_content(
  p_page_key TEXT,
  p_section_key TEXT,
  p_content TEXT
)
RETURNS UUID AS $$
DECLARE
  content_id UUID;
  user_id UUID := auth.uid();
BEGIN
  -- Check if user is authenticated (instead of checking for admin role)
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Upsert the content
  INSERT INTO page_content (page_key, section_key, content, created_by, updated_by)
  VALUES (p_page_key, p_section_key, p_content, user_id, user_id)
  ON CONFLICT (page_key, section_key)
  DO UPDATE SET
    content = EXCLUDED.content,
    updated_by = user_id,
    updated_at = NOW()
  RETURNING id INTO content_id;

  RETURN content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification: Check updated policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('page_content', 'page_content_history');