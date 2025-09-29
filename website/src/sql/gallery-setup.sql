-- Gallery table for storing church photo gallery items
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_updated_at 
    BEFORE UPDATE ON gallery 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to gallery" ON gallery
    FOR SELECT USING (true);

-- Create policies for authenticated insert/update/delete (admin only)
CREATE POLICY "Allow authenticated users to insert gallery items" ON gallery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update gallery items" ON gallery
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete gallery items" ON gallery
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-images',
    'gallery-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public read access
CREATE POLICY "Allow public read access to gallery images" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery-images');

-- Create storage policy for authenticated upload
CREATE POLICY "Allow authenticated upload to gallery images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gallery-images' 
        AND auth.role() = 'authenticated'
    );

-- Create storage policy for authenticated delete
CREATE POLICY "Allow authenticated delete from gallery images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gallery-images' 
        AND auth.role() = 'authenticated'
    );

-- Insert some sample data to test (optional - remove if you want to start empty)
-- INSERT INTO gallery (title, description, category, image_url) VALUES
-- ('Sunday Worship', 'Beautiful worship service with our congregation', 'worship', 'https://via.placeholder.com/600x400'),
-- ('Youth Retreat', 'Annual youth retreat in the mountains', 'youth', 'https://via.placeholder.com/600x400'),
-- ('Community Outreach', 'Serving meals at the local shelter', 'community', 'https://via.placeholder.com/600x400');