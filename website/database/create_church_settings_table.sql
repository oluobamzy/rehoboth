-- Create church_settings table for managing church information
-- This table will store all configurable church information like contact details, social media links, etc.

CREATE TABLE IF NOT EXISTS church_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'text', -- text, json, url, email, phone, textarea
  category VARCHAR(100) NOT NULL, -- contact, social_media, services, general
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_church_settings_category ON church_settings(category);
CREATE INDEX IF NOT EXISTS idx_church_settings_key ON church_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_church_settings_active ON church_settings(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for church_settings
-- Allow authenticated users to read all settings
DROP POLICY IF EXISTS "Allow authenticated users to read church settings" ON church_settings;
CREATE POLICY "Allow authenticated users to read church settings" ON church_settings
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update settings (admin check handled at application level)
DROP POLICY IF EXISTS "Allow authenticated users to update church settings" ON church_settings;
CREATE POLICY "Allow authenticated users to update church settings" ON church_settings
  FOR ALL TO authenticated USING (true);

-- Insert default church settings
INSERT INTO church_settings (setting_key, setting_value, setting_type, category, display_name, description) 
VALUES 
  -- Contact Information
  ('church_name', 'Rehoboth Christian Church', 'text', 'contact', 'Church Name', 'Official name of the church'),
  ('address_line_1', '414 Pleasant Park Road', 'text', 'contact', 'Address Line 1', 'Street address'),
  ('address_line_2', '', 'text', 'contact', 'Address Line 2', 'Additional address information (optional)'),
  ('city', 'Rehoboth', 'text', 'contact', 'City', 'City name'),
  ('state', 'MA', 'text', 'contact', 'State', 'State abbreviation'),
  ('zip_code', '02769', 'text', 'contact', 'ZIP Code', 'Postal code'),
  ('phone_main', '(613) 400-4966', 'phone', 'contact', 'Main Phone', 'Primary church phone number'),
  ('email_main', 'rehobothchrisitianchurch2022@gmail.com', 'email', 'contact', 'Main Email', 'Primary church email address'),
  ('email_contact', 'rehobothchrisitianchurch2022@gmail.com', 'email', 'contact', 'Contact Form Email', 'Email for contact form submissions'),
  
  -- Social Media
  ('facebook_url', 'https://facebook.com/rehobothcchurch', 'url', 'social_media', 'Facebook URL', 'Church Facebook page'),
  ('instagram_url', 'https://instagram.com/rehobothcchurch', 'url', 'social_media', 'Instagram URL', 'Church Instagram profile'),
  ('youtube_url', 'https://youtube.com/rehobothcchurch', 'url', 'social_media', 'YouTube URL', 'Church YouTube channel'),
  ('twitter_url', 'https://twitter.com/rehobothcchurch', 'url', 'social_media', 'Twitter URL', 'Church Twitter profile'),
  ('youtube_channel_id', 'UC-yUYcusNxkfA2qyjQMFblA', 'text', 'social_media', 'YouTube Channel ID', 'YouTube channel ID for live streaming'),
  ('youtube_handle', '@OfficiallRCC', 'text', 'social_media', 'YouTube Handle', 'YouTube channel handle'),
  
  -- Service Times (stored as JSON for flexibility)
  ('service_times', '{
    "sunday": "3:00 PM - 6:00 PM",
    "wednesday": "7:00 PM - 9:00 PM (Prayer Service)",
    "friday": "Women Overnight Service",
    "saturday": "7:00 PM - 9:00 PM (Youth Prayer & Choir)"
  }', 'json', 'services', 'Service Times', 'Weekly service schedule'),
  
  -- General Settings
  ('church_description', 'Join us for worship and fellowship as we grow together in faith.', 'textarea', 'general', 'Church Description', 'Brief description of the church'),
  ('google_maps_url', 'https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=414%20Pleasant%20Park%20Road,%20Rehoboth,%20MA%2002769&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed', 'url', 'contact', 'Google Maps Embed URL', 'Google Maps embed URL for location')

ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_church_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_church_settings_updated_at ON church_settings;
CREATE TRIGGER trigger_update_church_settings_updated_at
  BEFORE UPDATE ON church_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_church_settings_updated_at();

-- Verify the table was created successfully
SELECT 'church_settings table created successfully' as status, count(*) as total_settings FROM church_settings;