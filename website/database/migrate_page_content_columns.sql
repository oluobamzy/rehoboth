-- Migration to add missing columns to page_content table
-- Run this in Supabase SQL Editor

-- Add the missing columns to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'html',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update the updated_at trigger to handle new columns
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Update existing records to have proper defaults
UPDATE page_content 
SET 
  content_type = 'html',
  is_published = true
WHERE content_type IS NULL OR is_published IS NULL;