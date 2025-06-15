#!/usr/bin/env node
// make_user_admin.js - Script to grant admin access to any user
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check if email argument is provided
if (process.argv.length < 3) {
  console.error('Usage: node make_user_admin.js user@example.com');
  process.exit(1);
}

const userEmail = process.argv[2];

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeUserAdmin(email) {
  try {
    console.log(`Making user ${email} an admin...`);

    // First get the user
    const { data: userData, error: userError } = await supabase.rpc('exec', {
      query: `
        SELECT id, email, raw_app_meta_data as metadata
        FROM auth.users
        WHERE email = '${email}';
      `
    });

    if (userError || !userData || userData.length === 0) {
      console.error('Error finding user:', userError || 'User not found');
      return;
    }

    const user = userData[0];
    console.log(`Found user: ${user.id}`);

    // Update app_metadata
    const { error: metadataError } = await supabase.rpc('exec', {
      query: `
        UPDATE auth.users
        SET raw_app_meta_data = 
          raw_app_meta_data || 
          '{"role": "admin", "test_permission": true}'::jsonb
        WHERE id = '${user.id}'
        RETURNING id;
      `
    });

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      return;
    }
    
    console.log('Updated user metadata with admin role');

    // Add to user_roles table
    const { error: roleError } = await supabase.rpc('exec', {
      query: `
        INSERT INTO user_roles (user_id, role)
        VALUES ('${user.id}', 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
      `
    });

    if (roleError) {
      console.error('Error adding user role:', roleError);
      
      // Try creating the user_roles table if it doesn't exist
      if (roleError.message.includes('does not exist')) {
        console.log('User_roles table may not exist. Creating it...');
        
        const { error: createTableError } = await supabase.rpc('exec', {
          query: `
            CREATE TABLE IF NOT EXISTS user_roles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              role VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, role)
            );
            
            -- Try insert again
            INSERT INTO user_roles (user_id, role)
            VALUES ('${user.id}', 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
          `
        });
        
        if (createTableError) {
          console.error('Error creating user_roles table:', createTableError);
        } else {
          console.log('Created user_roles table and added user as admin');
        }
      }
    } else {
      console.log('Added admin role to user_roles table');
    }

    // Clean up old refresh tokens for this user
    const { error: tokenError } = await supabase.rpc('exec', {
      query: `
        DELETE FROM auth.refresh_tokens 
        WHERE user_id = '${user.id}'
        AND created_at < NOW() - INTERVAL '1 hour';
      `
    });

    if (tokenError) {
      console.log('Note: Could not clean up refresh tokens. This is not critical.');
    } else {
      console.log('Cleaned up old refresh tokens');
    }

    // Grant permissions on carousel_slides
    const { error: permError } = await supabase.rpc('exec', {
      query: `
        -- Make sure table exists
        CREATE TABLE IF NOT EXISTS carousel_slides (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          image_url VARCHAR(500) NOT NULL,
          cta_text VARCHAR(100),
          cta_link VARCHAR(500),
          display_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Grant permissions
        GRANT ALL ON carousel_slides TO authenticated;
        
        -- Add direct policy for this user
        DROP POLICY IF EXISTS "Direct admin bypass for ${email}" ON carousel_slides;
        CREATE POLICY "Direct admin bypass for ${email}"
          ON carousel_slides
          FOR ALL
          USING (auth.uid() = '${user.id}')
          WITH CHECK (auth.uid() = '${user.id}');
      `
    });

    if (permError) {
      console.error('Error granting carousel permissions:', permError);
    } else {
      console.log('Granted carousel permissions');
    }

    console.log(`\n✅ SUCCESS: User ${email} is now an admin with full permissions`);
    console.log('Have the user log out and log back in to apply changes');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
makeUserAdmin(userEmail);
