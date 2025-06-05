// scripts/simpleGrantAdmin.js
// This script adds a user to the admin role in the user_roles table
// Run with: node scripts/simpleGrantAdmin.js user_email@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get the email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address: node scripts/simpleGrantAdmin.js user_email@example.com');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantAdminRole() {
  try {
    console.log(`Granting admin role to user: ${email}`);
    
    // First, ensure the user_roles table exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: createTableError } = await supabase.rpc('exec', { query: createTableSQL });
    if (createTableError) {
      console.warn(`Note: Could not create table: ${createTableError.message}`);
    } else {
      console.log('✅ User roles table confirmed');
    }
    
    // Get User ID from email
    const getUserSQL = `SELECT id FROM auth.users WHERE email = '${email}';`;
    
    const { data: userData, error: userError } = await supabase.rpc('exec', { query: getUserSQL });
    
    if (userError || !userData || userData.length === 0) {
      console.error(`❌ Could not find user with email: ${email}`);
      console.error(`Error: ${userError?.message || 'No results returned'}`);
      process.exit(1);
    }
    
    const userId = userData[0].id;
    console.log(`Found user with ID: ${userId}`);
    
    // Add role to user_roles table
    const insertRoleSQL = `
      INSERT INTO user_roles (user_id, role)
      VALUES ('${userId}', 'admin')
      ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW();
    `;
    
    const { error: insertError } = await supabase.rpc('exec', { query: insertRoleSQL });
    
    if (insertError) {
      console.error(`❌ Error adding admin role: ${insertError.message}`);
      process.exit(1);
    }
    
    console.log(`✅ Admin role granted to ${email} (${userId})`);
    console.log('Please sign out and sign back in for the changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

grantAdminRole();
