// setupContentManagementSchema.js
// Run with: node setupContentManagementSchema.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupContentManagementSchema() {
  console.log('🚀 Setting up content management schema...');
  console.log('');
  console.log('ℹ️  Note: Please run the following SQL commands in your Supabase dashboard:');
  console.log('   Go to: Project Dashboard > SQL Editor > New Query');
  console.log('');
  
  const sqlCommands = `
-- ================================
-- CONTENT MANAGEMENT SCHEMA SETUP
-- ================================

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(page_key, section_key)
);

-- Create page_content_history table for versioning
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

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for page_content
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for content versioning
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
END;
$$ language 'plpgsql';

-- Create trigger for versioning (only on updates, not inserts)
DROP TRIGGER IF EXISTS create_page_content_version ON page_content;
CREATE TRIGGER create_page_content_version
  AFTER UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION create_content_version();

-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Enable RLS on both tables
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin full access to page_content" ON page_content;
DROP POLICY IF EXISTS "Public read access to page_content" ON page_content;
DROP POLICY IF EXISTS "Admin full access to page_content_history" ON page_content_history;
DROP POLICY IF EXISTS "Public read access to page_content_history" ON page_content_history;

-- Page content policies
CREATE POLICY "Public read access to page_content" ON page_content
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to page_content" ON page_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Page content history policies
CREATE POLICY "Public read access to page_content_history" ON page_content_history
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to page_content_history" ON page_content_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to get content with fallback
CREATE OR REPLACE FUNCTION get_content_with_fallback(
  p_page_key TEXT,
  p_section_key TEXT,
  p_fallback_content TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  content_result TEXT;
BEGIN
  SELECT content INTO content_result
  FROM page_content
  WHERE page_key = p_page_key AND section_key = p_section_key;
  
  RETURN COALESCE(content_result, p_fallback_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert content (admin only)
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
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
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

-- Function to get content history
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

-- ================================
-- SAMPLE DATA (OPTIONAL)
-- ================================

-- Insert some initial content (you can modify or remove this)
-- This provides fallback content for your existing pages

-- About page content
INSERT INTO page_content (page_key, section_key, content) VALUES
('about', 'main_content', '<p>Welcome to Rehoboth Christian Church, where faith comes alive and community thrives!</p>'),
('about', 'motto', '<p class="text-xl font-semibold">Loving God, Serving People</p>'),
('about', 'commitment', '<p>We are committed to creating an atmosphere where people can encounter God''s love and grow in their faith journey.</p>'),
('about', 'mission_statement', '<p class="text-xl font-semibold text-green-800">To proclaim Christ, disciple believers, and demonstrate God''s compassion through love and service.</p>'),
('about', 'mission_description', '<p>We are dedicated to sharing God''s unconditional love and boundless mercy, inviting everyone into a transformative relationship with Jesus Christ.</p><p>No matter their background or circumstances, we provide opportunities for individuals to experience His grace and be renewed in faith.</p>'),
('about', 'vision_statement', '<h3 class="text-xl font-semibold mb-3 text-green-600">Loving God, Serving People</h3><p class="text-lg text-gray-700">A community transformed by God''s love and inspired to show His compassion.</p>'),
('about', 'vision_description', '<p>At Rehoboth Christian Church, our vision is to be a community that loves God deeply and serves people wholeheartedly.</p>')
ON CONFLICT (page_key, section_key) DO NOTHING;
`;

  console.log('📋 Copy and paste this SQL into your Supabase SQL Editor:');
  console.log('=' + '='.repeat(70));
  console.log(sqlCommands);
  console.log('=' + '='.repeat(70));
  
  try {
    // Test the connection
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('user_roles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('');
    console.log('📋 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Run the query');
    console.log('');
    console.log('🎯 After running the SQL:');
    console.log('   • page_content and page_content_history tables will be created');
    console.log('   • Row Level Security policies will be set up');
    console.log('   • Helper functions will be available');
    console.log('   • Sample content will be inserted');
    console.log('   • Admin users can create/edit content');
    console.log('   • Public users can read content');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupContentManagementSchema();