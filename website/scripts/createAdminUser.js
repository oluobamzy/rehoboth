#!/usr/bin/env node

// scripts/createAdminUser.js
// This script creates an admin user and adds admin role to them
// Usage: node scripts/createAdminUser.js user@example.com password

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser(email, password) {
  try {
    // First check if email is valid
    if (!email || !email.includes('@')) {
      console.error('Please provide a valid email address');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('Please provide a password (minimum 8 characters)');
      process.exit(1);
    }

    console.log(`Checking if user with email: ${email} already exists...`);
    
    // Check if the user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);
    
    let userId;
    
    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating...`);
      userId = existingUser.id;
      
      // Update user's password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updateError) {
        throw new Error(`Error updating user password: ${updateError.message}`);
      }
      
      console.log(`✅ Updated password for user ${email}`);
    } else {
      console.log(`Creating new user with email: ${email}...`);
      
      // Create a new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });
      
      if (createError) {
        throw new Error(`Error creating user: ${createError.message}`);
      }
      
      userId = newUser.user.id;
      console.log(`✅ Created new user with email ${email}`);
    }
    
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
    console.log('\nYou can now log into your application using:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error(`❌ Error creating admin user:`, error.message);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide both email and password');
  console.error('Usage: node scripts/createAdminUser.js user@example.com password');
  process.exit(1);
}

createAdminUser(email, password).then(() => process.exit(0));
