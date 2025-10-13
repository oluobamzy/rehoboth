-- Complete fix for page_content and page_content_history tables
-- Run this in Supabase SQL Editor

-- First, add missing columns to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'html',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Ensure page_content_history table exists with correct structure
CREATE TABLE IF NOT EXISTS page_content_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES page_content(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Check if version_number column exists in page_content_history, add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_content_history' 
        AND column_name = 'version_number'
    ) THEN
        ALTER TABLE page_content_history ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Temporarily disable the versioning trigger to avoid conflicts
DROP TRIGGER IF EXISTS create_page_content_version ON page_content;

-- Update the trigger function to handle missing columns gracefully
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  -- Get the current max version for this content
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM page_content_history
  WHERE content_id = NEW.id;

  -- Insert new version record
  INSERT INTO page_content_history (
    content_id,
    page_key,
    section_key,
    content,
    version_number,
    created_by
  ) VALUES (
    NEW.id,
    NEW.page_key,
    NEW.section_key,
    NEW.content,
    max_version + 1,
    NEW.updated_by
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the main operation
    RAISE WARNING 'Failed to create content version: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the versioning trigger
CREATE TRIGGER create_page_content_version
  AFTER UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION create_content_version();

-- Update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the updated_at trigger
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Update existing records to have proper defaults
UPDATE page_content 
SET 
  content_type = COALESCE(content_type, 'html'),
  is_published = COALESCE(is_published, true)
WHERE content_type IS NULL OR is_published IS NULL;

-- Verify the tables
SELECT 'page_content columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'page_content' 
ORDER BY ordinal_position;

SELECT 'page_content_history columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'page_content_history' 
ORDER BY ordinal_position;