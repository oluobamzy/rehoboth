-- ================================
-- FIX FOREIGN KEY RELATIONSHIPS
-- Add proper foreign key constraints for content management
-- ================================

-- First check if the user_roles table exists and has the right structure
-- If you don't have user_roles table, create it
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

-- Enable RLS on user_roles if not already enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Add policies for user_roles
DROP POLICY IF EXISTS "Public read access to user_roles" ON user_roles;
CREATE POLICY "Public read access to user_roles" ON user_roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_roles;
CREATE POLICY "Users can update own profile" ON user_roles
  FOR ALL USING (auth.uid() = user_id);

-- Update page_content table to ensure proper foreign key constraints
-- Drop and recreate the foreign key constraints if they exist
ALTER TABLE page_content DROP CONSTRAINT IF EXISTS page_content_created_by_fkey;
ALTER TABLE page_content DROP CONSTRAINT IF EXISTS page_content_updated_by_fkey;

-- Add proper foreign key constraints
ALTER TABLE page_content 
ADD CONSTRAINT page_content_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE page_content 
ADD CONSTRAINT page_content_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id);

-- Do the same for page_content_history
ALTER TABLE page_content_history DROP CONSTRAINT IF EXISTS page_content_history_created_by_fkey;
ALTER TABLE page_content_history 
ADD CONSTRAINT page_content_history_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Update the content history helper function to work with separate queries
CREATE OR REPLACE FUNCTION get_content_history(
  p_page_key TEXT,
  p_section_key TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.content,
    h.version_number,
    h.created_at,
    COALESCE(ur.first_name || ' ' || ur.last_name, 'Unknown') as created_by_name
  FROM page_content_history h
  LEFT JOIN user_roles ur ON ur.user_id = h.created_by
  WHERE h.page_key = p_page_key AND h.section_key = p_section_key
  ORDER BY h.version_number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the setup
SELECT 'Foreign key constraints added' as status;
SELECT 'user_roles table ready' as status, count(*) as user_count FROM user_roles;