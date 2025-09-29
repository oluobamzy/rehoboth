-- SQL setup for volunteer applications table
-- This script creates the volunteer_applications table with proper constraints and indexes

CREATE TABLE volunteer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  ministry VARCHAR(255) NOT NULL,
  experience TEXT,
  availability TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined')),
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  admin_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX idx_volunteer_applications_submitted_at ON volunteer_applications(submitted_at DESC);
CREATE INDEX idx_volunteer_applications_ministry ON volunteer_applications(ministry);
CREATE INDEX idx_volunteer_applications_email ON volunteer_applications(email);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_volunteer_applications_updated_at
    BEFORE UPDATE ON volunteer_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit applications)
CREATE POLICY "Anyone can submit volunteer applications" 
ON volunteer_applications FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view applications (admin access)
CREATE POLICY "Authenticated users can view volunteer applications" 
ON volunteer_applications FOR SELECT 
TO authenticated 
USING (true);

-- Only authenticated users can update applications (admin access)
CREATE POLICY "Authenticated users can update volunteer applications" 
ON volunteer_applications FOR UPDATE 
TO authenticated 
USING (true);

-- Only authenticated users can delete applications (admin access)
CREATE POLICY "Authenticated users can delete volunteer applications" 
ON volunteer_applications FOR DELETE 
TO authenticated 
USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteer_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteer_applications TO authenticated;