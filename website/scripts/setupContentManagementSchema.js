const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const contentManagementSchemaSql = `
-- ======== CONTENT MANAGEMENT SYSTEM SCHEMA ========

-- Ensure user_roles table exists (required for RLS policies)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create index for user_roles if not exists
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can read own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow admin users to read all roles
CREATE POLICY "Admin can read all roles" ON user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Allow admin users to manage roles
CREATE POLICY "Admin can manage roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Grant permissions on user_roles table
GRANT SELECT ON user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON user_roles TO authenticated;

-- Main content table for editable page content
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key VARCHAR(100) NOT NULL,        -- 'about', 'homepage', 'contact', 'ministries'
  section_key VARCHAR(100) NOT NULL,     -- 'mission', 'vision', 'welcome', 'hero'
  title VARCHAR(255),                    -- Optional title for the content section
  content TEXT NOT NULL,                 -- HTML content from rich editor
  content_type VARCHAR(50) DEFAULT 'html', -- 'html', 'text', 'json'
  is_published BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of page and section
  UNIQUE(page_key, section_key)
);

-- Content history table for versioning
CREATE TABLE IF NOT EXISTS page_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_content_id UUID REFERENCES page_content(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'html',
  version INTEGER NOT NULL,
  action VARCHAR(20) DEFAULT 'update', -- 'create', 'update', 'publish', 'unpublish'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content (page_key);
CREATE INDEX IF NOT EXISTS idx_page_content_section_key ON page_content (section_key);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content (is_published);
CREATE INDEX IF NOT EXISTS idx_page_content_updated ON page_content (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_history_content_id ON page_content_history (page_content_id);
CREATE INDEX IF NOT EXISTS idx_content_history_version ON page_content_history (version DESC);

-- Row Level Security (RLS) policies
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_history ENABLE ROW LEVEL SECURITY;

-- ======== PAGE_CONTENT TABLE POLICIES ========

-- Allow public read access to published content only
CREATE POLICY "Public can read published content" ON page_content
  FOR SELECT TO anon, authenticated 
  USING (is_published = true);

-- Allow admin users full SELECT access (including drafts)
CREATE POLICY "Admin can read all content" ON page_content
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to INSERT new content
CREATE POLICY "Admin can insert content" ON page_content
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to UPDATE existing content
CREATE POLICY "Admin can update content" ON page_content
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to DELETE content
CREATE POLICY "Admin can delete content" ON page_content
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ======== PAGE_CONTENT_HISTORY TABLE POLICIES ========

-- Allow admin users to read content history
CREATE POLICY "Admin can read content history" ON page_content_history
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to insert content history (via triggers mostly)
CREATE POLICY "Admin can insert content history" ON page_content_history
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to delete content history if needed
CREATE POLICY "Admin can delete content history" ON page_content_history
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ======== GRANT NECESSARY PERMISSIONS ========

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant table permissions to authenticated users (RLS will control access)
GRANT SELECT ON page_content TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON page_content TO authenticated;
GRANT SELECT, INSERT, DELETE ON page_content_history TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ======== HELPER FUNCTIONS FOR CONTENT MANAGEMENT ========

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get content with fallback
CREATE OR REPLACE FUNCTION get_content(p_page_key TEXT, p_section_key TEXT)
RETURNS TABLE(
  id UUID,
  page_key VARCHAR(100),
  section_key VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  content_type VARCHAR(50),
  is_published BOOLEAN,
  version INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.page_key, pc.section_key, pc.title, pc.content, 
         pc.content_type, pc.is_published, pc.version, pc.created_at, pc.updated_at
  FROM page_content pc
  WHERE pc.page_key = p_page_key 
    AND pc.section_key = p_section_key
    AND (pc.is_published = true OR is_admin());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all content for a page
CREATE OR REPLACE FUNCTION get_page_content(p_page_key TEXT)
RETURNS TABLE(
  id UUID,
  page_key VARCHAR(100),
  section_key VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  content_type VARCHAR(50),
  is_published BOOLEAN,
  version INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.id, pc.page_key, pc.section_key, pc.title, pc.content, 
         pc.content_type, pc.is_published, pc.version, pc.created_at, pc.updated_at
  FROM page_content pc
  WHERE pc.page_key = p_page_key
    AND (pc.is_published = true OR is_admin())
  ORDER BY pc.section_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk update content sections
CREATE OR REPLACE FUNCTION bulk_update_content(content_updates JSONB)
RETURNS INTEGER AS $$
DECLARE
  update_count INTEGER := 0;
  content_item JSONB;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Loop through content updates
  FOR content_item IN SELECT * FROM jsonb_array_elements(content_updates)
  LOOP
    INSERT INTO page_content (
      page_key, section_key, title, content, content_type, is_published
    ) VALUES (
      content_item->>'page_key',
      content_item->>'section_key', 
      content_item->>'title',
      content_item->>'content',
      COALESCE(content_item->>'content_type', 'html'),
      COALESCE((content_item->>'is_published')::BOOLEAN, true)
    )
    ON CONFLICT (page_key, section_key) 
    DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      content_type = EXCLUDED.content_type,
      is_published = EXCLUDED.is_published;
    
    update_count := update_count + 1;
  END LOOP;

  RETURN update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create history entries
CREATE OR REPLACE FUNCTION create_content_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_content_history (
    page_content_id,
    title,
    content,
    content_type,
    version,
    action,
    created_by
  ) VALUES (
    NEW.id,
    NEW.title,
    NEW.content,
    NEW.content_type,
    NEW.version,
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END,
    NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create history entries
DROP TRIGGER IF EXISTS content_history_trigger ON page_content;
CREATE TRIGGER content_history_trigger
  AFTER INSERT OR UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION create_content_history();

-- Function to update version and updated_at on content changes
CREATE OR REPLACE FUNCTION update_content_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment version if content actually changed
  IF TG_OP = 'UPDATE' AND (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title) THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update version and timestamps
DROP TRIGGER IF EXISTS update_version_trigger ON page_content;
CREATE TRIGGER update_version_trigger
  BEFORE INSERT OR UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_version();

-- Insert initial content sections that can be edited
INSERT INTO page_content (page_key, section_key, title, content) VALUES
-- About page sections
('about', 'main_content', 'About Us', '<p>Rehoboth Christian Church is a vibrant community of believers committed to loving God and serving people. No matter who you are, where you come from, or your background, you belong here. God''s love is for everyone—and we warmly invite you to be part of our church family.</p><p>We are a Christ-centered community that believes in the transformative power of God''s love. Through worship, fellowship, biblical teaching, and compassionate service, we create an environment where everyone can grow in their faith and experience the abundant life that Jesus offers.</p>'),
('about', 'motto', 'Our Motto', '<p class="text-xl font-semibold text-green-800">Christ-Centered, Compassion-Driven, Community-Focused</p>'),
('about', 'commitment', 'Our Commitment', '<p>We commit to follow Jesus, grow in His Word, and show His love through prayer, worship, and service to others.</p>'),

-- Mission page sections  
('about', 'mission_statement', 'Our Mission', '<p class="text-xl font-semibold text-green-800">To proclaim Christ, disciple believers, and demonstrate God''s compassion through love and service.</p>'),
('about', 'mission_description', 'Mission Description', '<p>We are dedicated to sharing God''s unconditional love and boundless mercy, inviting everyone into a transformative relationship with Jesus Christ.</p><p>No matter their background or circumstances, we provide opportunities for individuals to experience His grace and be renewed in faith. Through prayer, worship, biblical teaching, and compassionate service, we foster a vibrant faith community that reflects God''s heart for the world.</p>'),

-- Vision page sections
('about', 'vision_statement', 'Our Vision', '<h3 class="text-xl font-semibold mb-3 text-green-600">Loving God, Serving People</h3><p class="text-lg text-gray-700">A community transformed by God''s love and inspired to show His compassion.</p>'),
('about', 'vision_description', 'Vision Description', '<p>At Rehoboth Christian Church, our vision is to be a community that loves God deeply and serves people wholeheartedly. We envision a church family transformed by God''s amazing love, where every person experiences His grace and is inspired to extend that same compassion to others.</p>'),

-- Homepage sections
('homepage', 'welcome_title', 'Welcome Title', '<h2 class="text-4xl md:text-5xl font-bold mb-4 text-center relative text-blue-900">Welcome to <span class="text-green-600">Rehoboth</span> Christian Church</h2>'),
('homepage', 'welcome_description', 'Welcome Description', '<p class="text-lg md:text-xl mb-8 text-gray-700 leading-relaxed">A community of believers committed to loving God and serving people. No matter who you are, where you come from, or your background, you belong here. God''s love is for everyone—and we warmly invite you to be part of our church family.</p>'),

-- Feature cards content
('homepage', 'feature_sunday_services', 'Sunday Services Card', '<h3 class="text-2xl font-bold mb-3 text-blue-900">Sunday Services</h3><p class="mb-5 text-gray-600">Join us every Sunday at 3:00 PM - 6:00 PM for worship, prayer, and fellowship.</p>'),
('homepage', 'feature_sermons', 'Latest Sermons Card', '<h3 class="text-2xl font-bold mb-3 text-blue-900">Latest Sermons</h3><p class="mb-5 text-gray-600">Listen to our recent messages and grow in your understanding of God''s Word.</p>'),
('homepage', 'feature_giving', 'Giving Back Card', '<h3 class="text-2xl font-bold mb-3 text-blue-900">Giving Back</h3><p class="mb-5 text-gray-600">Discover opportunities to serve, connect, and make a difference in our community.</p>'),

-- Contact page sections
('contact', 'pastor_description', 'Pastor Description', '<p class="text-gray-700 mb-4">Pastor Patrick and his wife lead Rehoboth Christian Church with a passion for sharing God''s love and transforming lives through the power of the gospel.</p><p class="text-gray-700">We invite you to connect with us, join our services, and become part of our growing community of faith.</p>')

ON CONFLICT (page_key, section_key) DO NOTHING;
`;

async function setupContentManagementSchema() {
  try {
    console.log('Setting up content management database schema...');
    
    // Execute the SQL to create tables and policies
    const { error } = await supabase.rpc('exec', { query: contentManagementSchemaSql });
    
    if (error) throw error;
    
    console.log('✅ Content management schema setup complete!');
    console.log('- Created page_content table');
    console.log('- Created page_content_history table');
    console.log('- Created indexes for performance');
    console.log('- Set up RLS policies');
    console.log('- Added triggers for versioning');
    console.log('- Inserted initial content sections');
    
  } catch (error) {
    console.error('Error setting up content management schema:', error);
    process.exit(1);
  }
}

setupContentManagementSchema();