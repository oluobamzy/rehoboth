const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Fixing profiles table structure and RLS...');
    
    // Using the SQL REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: `
          -- Drop and recreate the profiles table with the correct structure
          DROP TABLE IF EXISTS profiles CASCADE;
          
          -- Create profiles table
          CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            avatar_url VARCHAR(500),
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          -- Enable Row Level Security
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create security policies
          CREATE POLICY "Users can read any profile"
            ON profiles FOR SELECT
            TO authenticated
            USING (true);
            
          CREATE POLICY "Users can update their own profile"
            ON profiles FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);
            
          CREATE POLICY "Users can insert their own profile"
            ON profiles FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
        `
      })
    });
    
    const result = await response.json();
    console.log('Profiles table fix result:', result);
    
    if (response.ok) {
      console.log('✅ Profiles table structure fixed successfully');
      
      // Try to check if we can access the profiles table now
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) {
        console.error('Error accessing profiles table:', error);
      } else {
        console.log('Successfully accessed profiles table:', data);
      }
    } else {
      console.error('Failed to fix profiles table:', result);
    }
  } catch (error) {
    console.error('Error fixing profiles table:', error);
  }
})();
