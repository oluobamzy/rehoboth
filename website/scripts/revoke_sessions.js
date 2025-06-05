#!/usr/bin/env node

// scripts/revoke_sessions.js
// This script revokes all sessions for a user, forcing them to log in again
// Usage: node scripts/revoke_sessions.js <user_id>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function revokeSessions(userId) {
  try {
    if (!userId) {
      console.error('❌ Please provide a user ID');
      console.error('Usage: node scripts/revoke_sessions.js <user_id>');
      process.exit(1);
    }

    console.log(`🔍 Looking up sessions for user ID: ${userId}`);
    
    // List all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUserSessions(userId);
    
    if (sessionsError) {
      throw new Error(`Error listing sessions: ${sessionsError.message}`);
    }
    
    if (!sessions || sessions.length === 0) {
      console.log('ℹ️ No active sessions found for this user.');
      return;
    }
    
    console.log(`Found ${sessions.length} active sessions.`);
    
    // Revoke all refresh tokens for the user
    console.log('🔒 Revoking all sessions...');
    const { error: revokeError } = await supabase.auth.admin.deleteUser(userId, true);
    
    if (revokeError) {
      throw new Error(`Error revoking sessions: ${revokeError.message}`);
    }
    
    console.log('✅ Successfully revoked all sessions.');
    console.log('👤 User will need to log in again with their credentials.');

  } catch (error) {
    console.error(`❌ Error revoking sessions: ${error.message}`);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.error('Usage: node scripts/revoke_sessions.js <user_id>');
  process.exit(1);
}

revokeSessions(userId).then(() => process.exit(0));
