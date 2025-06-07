"use strict";

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function grantAdminRole(email) {
  try {
    // 1. Find the user by email
    console.log(`Finding user with email: ${email}`);
    const { data: users, error: userError } = await supabase
      .auth
      .admin
      .listUsers();
    
    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    console.log(`Found user: ${user.id}, ${user.email}`);

    // 2. Update the user's app_metadata
    console.log('Updating user app_metadata with admin role...');
    const { error: updateError } = await supabase
      .auth
      .admin
      .updateUserById(user.id, {
        app_metadata: { role: 'admin' }
      });

    if (updateError) {
      throw new Error(`Error updating user: ${updateError.message}`);
    }

    // 3. Also make sure there's an entry in the user_roles table (as backup)
    console.log('Checking user_roles table...');
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // Code for "no rows returned"
      throw new Error(`Error checking user_roles: ${checkError.message}`);
    }

    if (!existingRole) {
      console.log('Adding admin role to user_roles table...');
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
          created_at: new Date()
        });

      if (insertError) {
        throw new Error(`Error inserting role: ${insertError.message}`);
      }
    } else {
      console.log('User already has admin role in user_roles table');
    }

    console.log(`✅ Successfully granted admin role to ${email}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Check args
if (process.argv.length < 3) {
  console.log('Usage: node grant_admin_role.js user@example.com');
  process.exit(1);
}

const email = process.argv[2];
grantAdminRole(email);
