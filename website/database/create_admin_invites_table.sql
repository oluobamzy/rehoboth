-- Create admin_invites table for managing invitation system
CREATE TABLE IF NOT EXISTS admin_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'moderator')),
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invite_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_admin_invites_status ON admin_invites(status);

-- Create index on invite_token for faster validation
CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON admin_invites(invite_token);

-- Enable RLS on admin_invites table
ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users with admin role can read invites
CREATE POLICY "Admins can view invites" ON admin_invites
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Policy: Only authenticated users with admin role can insert invites
CREATE POLICY "Admins can create invites" ON admin_invites
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Policy: Only authenticated users with admin role can update invites
CREATE POLICY "Admins can update invites" ON admin_invites
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Policy: Only authenticated users with admin role can delete invites
CREATE POLICY "Admins can delete invites" ON admin_invites
  FOR DELETE
  USING (
    auth.role() = 'authenticated' 
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user'));