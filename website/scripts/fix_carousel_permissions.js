// scripts/fix_carousel_permissions.js
// This script fixes issues with carousel uploads for admin users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCarouselPermissions() {
  try {
    console.log('===== Fixing Carousel Permissions =====');
    
    // Check for specific user that's having issues
    const userEmail = 'oluobamzy@gmail.com'; // The user with problems
    console.log(`\n1. Checking user ${userEmail} ...`);
    
    // Get the user using admin SQL queries instead of the admin API
    const { data: userData, error: userError } = await supabase.rpc('exec', {
      query: `
        SELECT id, email, raw_app_meta_data as metadata
        FROM auth.users
        WHERE email = '${userEmail}';
      `
    });

    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }

    if (!userData || userData.length === 0) {
      console.error('User not found');
      return;
    }

    const user = userData[0];
    console.log('User found:', user.id);
    console.log('Current metadata:', user.metadata);
    
    // Ensure user has admin role in metadata
    const hasAdminRole = user.metadata && user.metadata.role === 'admin';
    
    if (!hasAdminRole) {
      console.log('\n2. Updating user metadata to include admin role...');
      
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
      } else {
        console.log('Successfully updated user metadata with admin role');
      }
    } else {
      console.log('\n2. User already has admin role in metadata, adding test_permission flag...');
      
      const { error: metadataError } = await supabase.rpc('exec', {
        query: `
          UPDATE auth.users
          SET raw_app_meta_data = 
            raw_app_meta_data || 
            '{"test_permission": true}'::jsonb
          WHERE id = '${user.id}'
          RETURNING id;
        `
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      } else {
        console.log('Successfully updated user metadata with test_permission flag');
      }
    }

    // Check carousel_slides table
    console.log('\n3. Checking carousel_slides table...');
    
    // Check if the table exists
    const { data: tableCheck, error: tableError } = await supabase.rpc('exec', {
      query: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'carousel_slides'
      );`
    });
    
    if (tableError) {
      console.error('Error checking if carousel_slides table exists:', tableError);
      return;
    }
    
    const tableExists = tableCheck && tableCheck[0] && tableCheck[0].exists;
    console.log(`Carousel slides table exists: ${tableExists ? 'YES' : 'NO'}`);
    
    if (!tableExists) {
      console.log('Creating carousel_slides table...');
      await createCarouselTable();
    }
    
    // Grants SQL-level permissions regardless of RLS
    console.log('\n4. Updating carousel SQL permissions...');
    await grantCarouselPermissions();
    
    // Add completely new RLS policy specifically for this user
    console.log('\n5. Adding special RLS policy for the user...');
    const { error: policyError } = await supabase.rpc('exec', {
      query: `
        -- Drop existing admin policies if they exist
        DROP POLICY IF EXISTS "Direct admin bypass for specific user" ON carousel_slides;
        
        -- Create a policy specifically for this user
        CREATE POLICY "Direct admin bypass for specific user"
          ON carousel_slides
          USING (auth.uid() = '${user.id}')
          WITH CHECK (auth.uid() = '${user.id}');
      `
    });
    
    if (policyError) {
      console.error('Error creating special RLS policy:', policyError);
    } else {
      console.log('Successfully created special RLS policy for the user');
    }
    
    // Fix token refreshing issue by updating auth.refresh_tokens
    console.log('\n6. Cleaning up refresh tokens...');
    const { error: tokenError } = await supabase.rpc('exec', {
      query: `
        -- Delete old refresh tokens for this user to prevent constant refreshing
        DELETE FROM auth.refresh_tokens 
        WHERE user_id = '${user.id}'
        AND created_at < NOW() - INTERVAL '1 hour';
      `
    });
    
    if (tokenError) {
      console.error('Error cleaning up refresh tokens:', tokenError);
    } else {
      console.log('Successfully cleaned up old refresh tokens');
    }
    
    console.log('\n===== Carousel Permissions Fix Complete =====');
    console.log('Please have the user log out and back in to apply changes.');
    
  } catch (error) {
    console.error('Error fixing carousel permissions:', error);
  }
}

async function createCarouselTable() {
  try {
    const { error: tableError } = await supabase.rpc('exec', {
      query: `
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
        
        -- Add sample data if the table is empty
        INSERT INTO carousel_slides (title, subtitle, image_url, cta_text, cta_link, display_order, is_active)
        SELECT 
          'Welcome to Rehoboth Church', 
          'A Place of Restoration', 
          '/rehoboth_logo.jpg', 
          'Learn More', 
          '/about', 
          1, 
          true
        WHERE NOT EXISTS (SELECT 1 FROM carousel_slides);
      `
    });
    
    if (tableError) {
      console.error('Error creating carousel_slides table:', tableError);
    } else {
      console.log('Successfully created carousel_slides table');
    }
  } catch (error) {
    console.error('Error in createCarouselTable:', error);
  }
}

async function grantCarouselPermissions() {
  try {
    const { error: permissionsError } = await supabase.rpc('exec', {
      query: `
        -- Grant ALL permissions to authenticated users on carousel_slides
        GRANT ALL ON carousel_slides TO authenticated;
        
        -- Grant SELECT to anon for public display
        GRANT SELECT ON carousel_slides TO anon;
        
        -- Grant usage on all sequences in public schema
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        
        -- Disable RLS temporarily for testing
        ALTER TABLE carousel_slides DISABLE ROW LEVEL SECURITY;
      `
    });
    
    if (permissionsError) {
      console.error('Error granting carousel permissions:', permissionsError);
    } else {
      console.log('Successfully granted carousel permissions');
    }
  } catch (error) {
    console.error('Error in grantCarouselPermissions:', error);
  }
}

// Run the fix function
fixCarouselPermissions();
