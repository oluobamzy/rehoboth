// scripts/fixUserRoles.js
// This script ensures the user_roles table exists and sets up admin roles
// Run this script with: node scripts/fixUserRoles.js admin@example.com

const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Required environment variables are missing. Please check .env.local file.');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get the email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address: node scripts/fixUserRoles.js admin@example.com');
  process.exit(1);
}

async function fixUserRoles() {
  try {
    console.log('Checking for user_roles table...');

    // First check if the table exists
    const { error: checkError, data: tableExists } = await supabase.rpc('exec', {
      query: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_roles'
      );`
    });

    if (checkError) {
      throw new Error(`Error checking if table exists: ${checkError.message}`);
    }

    // If table doesn't exist, create it
    if (!tableExists || tableExists[0].exists === false) {
      console.log('User roles table not found. Creating it...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, role)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);
      `;
      
      const { error: createError } = await supabase.rpc('exec', { query: createTableSQL });
      if (createError) {
        throw new Error(`Error creating user_roles table: ${createError.message}`);
      }
      
      console.log('✅ User roles table created successfully');
    } else {
      console.log('✅ User roles table already exists');
    }

    // Find the user by email using the available methods
    try {
      // First try to get users directly from auth.users table
      // Using RPC to execute SQL since we can't query auth.users directly
      const { data: users, error: usersError } = await supabase.rpc('exec', { 
        query: `SELECT id FROM auth.users WHERE email = '${email}';`
      });

      if (usersError) {
        console.warn(`Couldn't query auth.users directly: ${usersError.message}`);
      }

      if (users && users.length > 0) {
        const userId = users[0].id;
        console.log(`Found user with ID: ${userId}`);
        
        // Set the admin role in both app_metadata and user_roles table
        await setAdminRole(userId);
        return;
      }
      
      // If that fails, try to get the current user (works if you're signed in as that user)
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email === email) {
        console.log(`Found user via current session: ${session.user.id}`);
        await setAdminRole(session.user.id);
        return;
      }

      // As a last resort, try to query the profiles table to find the user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) {
        throw new Error(`Error finding user: ${profileError.message}`);
      }

      console.log(`Found user through profiles: ${profile.id}`);
      await setAdminRole(profile.id);
    } catch (error) {
      throw new Error(`Could not find user with email ${email}: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function setAdminRole(userId) {
  try {
    // 1. Update app_metadata in auth.users
    // Using RPC to execute SQL since we don't have admin.updateUserById
    const updateMetadataSQL = `
      UPDATE auth.users 
      SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
      WHERE id = '${userId}';
    `;
    
    const { error: metadataError } = await supabase.rpc('exec', { query: updateMetadataSQL });
    
    if (metadataError) {
      console.warn(`Could not update app_metadata directly: ${metadataError.message}`);
      console.log('Will continue with user_roles table update...');
    } else {
      console.log('✅ Updated app_metadata with admin role');
    }
    
    // 2. Add to user_roles table - this should always work
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role: 'admin',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, role' }
      );
    
    if (roleError) {
      throw new Error(`Error adding admin role: ${roleError.message}`);
    }
    
    console.log(`✅ Admin role granted to user ID: ${userId} in user_roles table`);
    console.log('Please sign out and sign back in for the changes to take effect.');
  } catch (error) {
    throw error;
  }
}

fixUserRoles();
