-- ================================
-- HOMEPAGE CONTENT MANAGEMENT ENHANCEMENT
-- Additional schema updates for comprehensive homepage editing
-- ================================

-- Add content_type column to support different types of content
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'html';

-- Add title column for structured content
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add metadata column for structured data (JSON)
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add is_published column for draft/published state
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add sort_order for ordered content like carousel slides
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_page_content_type ON page_content(content_type);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);
CREATE INDEX IF NOT EXISTS idx_page_content_sort ON page_content(page_key, section_key, sort_order);

-- Update the history table to include new columns
ALTER TABLE page_content_history 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'html';
ALTER TABLE page_content_history 
ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE page_content_history 
ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE page_content_history 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE page_content_history 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update the versioning trigger to include new columns
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  -- Get the current max version for this content
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM page_content_history
  WHERE content_id = NEW.id;

  -- Insert new version record with all columns
  INSERT INTO page_content_history (
    content_id,
    page_key,
    section_key,
    content,
    content_type,
    title,
    metadata,
    is_published,
    sort_order,
    version_number,
    created_by
  ) VALUES (
    NEW.id,
    NEW.page_key,
    NEW.section_key,
    NEW.content,
    NEW.content_type,
    NEW.title,
    NEW.metadata,
    NEW.is_published,
    NEW.sort_order,
    max_version + 1,
    NEW.updated_by
  );

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get carousel slides
CREATE OR REPLACE FUNCTION get_carousel_slides()
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.title,
    pc.content,
    pc.metadata,
    pc.sort_order
  FROM page_content pc
  WHERE pc.page_key = 'home' 
    AND pc.section_key = 'carousel_slide'
    AND pc.is_published = true
  ORDER BY pc.sort_order ASC, pc.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get structured content (like contact info, service times)
CREATE OR REPLACE FUNCTION get_structured_content(
  p_page_key TEXT,
  p_section_key TEXT
)
RETURNS TABLE (
  content TEXT,
  metadata JSONB,
  title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.content,
    pc.metadata,
    pc.title
  FROM page_content pc
  WHERE pc.page_key = p_page_key 
    AND pc.section_key = p_section_key
    AND pc.is_published = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default homepage content that's currently missing EditableContent
INSERT INTO page_content (page_key, section_key, content, content_type, title) VALUES
('home', 'sermons_section_description', '<p class="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base">Listen to our most recent messages to grow in your faith and biblical understanding.</p>', 'html', 'Latest Sermons Description'),
('home', 'service_times', '{"sunday_worship": "Sunday Worship: 3:00 PM - 6:00 PM", "wednesday_prayer": "Wednesday Prayer: 7:00 PM - 9:00 PM"}', 'json', 'Service Times'),
('home', 'contact_information', '{"phone": "613-400-4966", "email": "rehobothchristianchurch2022@gmail.com", "address": "Your Church Address Here"}', 'json', 'Contact Information'),
('home', 'pastor_title', '<h3 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 text-blue-900">Meet Our <span class="text-green-600">Pastor</span></h3>', 'html', 'Pastor Section Title'),
('home', 'welcome_heading', '<h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center relative text-blue-900">Welcome to <span class="text-green-600">Rehoboth</span> Christian Church<span class="absolute -bottom-1 sm:-bottom-2 left-1/2 w-16 sm:w-20 h-0.5 sm:h-1 bg-blue-600 transform -translate-x-1/2"></span></h2>', 'html', 'Welcome Heading'),
('home', 'feature_cards_titles', '{"sunday_services": "Sunday Services", "latest_sermons": "Latest Sermons", "giving_back": "Giving Back"}', 'json', 'Feature Card Titles')
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Insert sample carousel slides to replace static data
INSERT INTO page_content (page_key, section_key, content, content_type, title, metadata, sort_order) VALUES
('home', 'carousel_slide', '<div class="carousel-slide"><h1>Welcome Home to Rehoboth</h1><h2>A Place Where Faith Meets Family</h2><p>Experience authentic worship, genuine community, and transformative faith in the heart of our vibrant church family. Join us every Sunday as we grow together in God''s love.</p></div>', 'carousel', 'Welcome Home to Rehoboth', '{"subtitle": "A Place Where Faith Meets Family", "image": "/pastoral_care.jpeg", "ctas": {"primary": {"text": "Visit This Sunday", "link": "/about", "variant": "primary"}, "secondary": {"text": "Learn About Us", "link": "/about", "variant": "outline"}}, "overlay": {"gradient": "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)", "opacity": 0.6}, "textPosition": "left", "theme": "dark"}', 1),
('home', 'carousel_slide', '<div class="carousel-slide"><h1>Growing in Faith Together</h1><h2>Join Our Church Family</h2><p>Discover meaningful connections, deepen your faith, and find your purpose in our welcoming community. Every person has a place here.</p></div>', 'carousel', 'Growing in Faith Together', '{"subtitle": "Join Our Church Family", "image": "/church-family.jpg", "ctas": {"primary": {"text": "Join Us Sunday", "link": "/events", "variant": "primary"}, "secondary": {"text": "Learn More", "link": "/about", "variant": "outline"}}, "overlay": {"gradient": "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.4) 100%)", "opacity": 0.5}, "textPosition": "center", "theme": "dark"}', 2),
('home', 'carousel_slide', '<div class="carousel-slide"><h1>Serving Our Community</h1><h2>Make a Difference</h2><p>Join us in reaching out to our community through service, compassion, and love. Together, we can make a lasting impact.</p></div>', 'carousel', 'Serving Our Community', '{"subtitle": "Make a Difference", "image": "/community-service.jpg", "ctas": {"primary": {"text": "Get Involved", "link": "/get-involved", "variant": "primary"}, "secondary": {"text": "Learn How", "link": "/about#mission", "variant": "outline"}}, "overlay": {"gradient": "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)", "opacity": 0.6}, "textPosition": "right", "theme": "dark"}', 3)
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON page_content TO anon, authenticated;
GRANT ALL ON page_content TO service_role;