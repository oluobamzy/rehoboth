const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Creating profiles table via SQL API...');
    
    // Using the SQL REST API to create the table directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            avatar_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          -- Create user_roles table if it doesn't exist
          CREATE TABLE IF NOT EXISTS user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, role)
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles (id);
          CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
          CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);
        `
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('✅ Profiles tables created/updated successfully');
    } else {
      console.error('Failed to create profiles table:', result);
    }
  } catch (error) {
    console.error('Error creating profiles table:', error);
  }
})();
