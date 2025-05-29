#!/usr/bin/env node

// scripts/addAdminUser.js
// This script adds admin role to a specified user
// Usage: node scripts/addAdminUser.js user@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAdminRole(email) {
  try {
    // First check if email is valid
    if (!email || !email.includes('@')) {
      console.error('Please provide a valid email address');
      process.exit(1);
    }

    console.log(`Looking up user with email: ${email}...`);
    
    // Find the user by email - the auth schema is accessed differently
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error listing users: ${userError.message}`);
    }
    
    // Find the user with matching email
    const matchingUser = user?.users.find(u => u.email === email);

    if (userError) {
      throw new Error(`Error finding user: ${userError.message}`);
    }

    if (!matchingUser) {
      throw new Error(`User with email ${email} not found`);
    }

    const userId = matchingUser.id;
    console.log(`Found user with ID: ${userId}`);

    // Check if user already has admin role
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      throw new Error(`Error checking user role: ${roleError.message}`);
    }

    if (existingRole) {
      console.log(`User ${email} already has admin role`);
      return;
    }

    // Add admin role to the user
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: userId, role: 'admin' }
      ]);

    if (insertError) {
      throw new Error(`Error adding admin role: ${insertError.message}`);
    }

    console.log(`✅ Successfully added admin role to user ${email}`);

  } catch (error) {
    console.error(`❌ Error adding admin role:`, error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/addAdminUser.js user@example.com');
  process.exit(1);
}

addAdminRole(email).then(() => process.exit(0));
