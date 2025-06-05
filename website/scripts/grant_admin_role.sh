#!/bin/bash
# scripts/grant_admin_role.sh
# This script grants admin role to a user using the Supabase CLI
# Usage: ./scripts/grant_admin_role.sh user@example.com

# Check if email parameter is provided
if [ -z "$1" ]; then
  echo "❌ Error: Email address is required."
  echo "Usage: ./scripts/grant_admin_role.sh user@example.com"
  exit 1
fi

EMAIL=$1
echo "Setting admin role for user: $EMAIL"

# Create a temporary SQL file
TMP_SQL=$(mktemp)

cat > "$TMP_SQL" << EOF
-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);

-- Grant admin role to user
DO \$\$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id FROM auth.users WHERE email = '$EMAIL';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', '$EMAIL';
  END IF;
  
  -- Update app_metadata
  UPDATE auth.users 
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE id = user_id;
  
  -- Add to user_roles table
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW();
  
  RAISE NOTICE 'Admin role granted to user: %', '$EMAIL';
END \$\$;
EOF

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Error: Supabase CLI is not installed."
  echo "Please run the SQL script manually in the Supabase dashboard SQL editor."
  echo "The SQL file is saved at: $TMP_SQL"
  exit 1
fi

# Run the SQL script using Supabase CLI
echo "Running SQL script with Supabase CLI..."
supabase db execute --file="$TMP_SQL"

# Clean up
rm "$TMP_SQL"

echo "✅ Command executed. Please check the output for any errors."
echo "Now sign out and sign back in for the changes to take effect."
