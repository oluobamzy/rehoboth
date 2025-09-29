-- SQL setup for contact messages table
-- This script creates the contact_messages table with proper constraints and indexes

CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  admin_notes TEXT,
  replied_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_submitted_at ON contact_messages(submitted_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_subject ON contact_messages(subject);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit messages)
CREATE POLICY "Anyone can submit contact messages" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view messages (admin access)
CREATE POLICY "Authenticated users can view contact messages" 
ON contact_messages FOR SELECT 
TO authenticated 
USING (true);

-- Only authenticated users can update messages (admin access)
CREATE POLICY "Authenticated users can update contact messages" 
ON contact_messages FOR UPDATE 
TO authenticated 
USING (true);

-- Only authenticated users can delete messages (admin access)
CREATE POLICY "Authenticated users can delete contact messages" 
ON contact_messages FOR DELETE 
TO authenticated 
USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_messages TO authenticated;