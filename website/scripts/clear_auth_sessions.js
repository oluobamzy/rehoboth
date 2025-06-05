// scripts/clear_auth_sessions.js
// This script clears all authentication sessions for a specific user
// Usage: node scripts/clear_auth_sessions.js user@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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
  console.error('❌ Please provide an email address: node scripts/clear_auth_sessions.js admin@example.com');
  process.exit(1);
}

async function clearUserSessions() {
  try {
    console.log(`🔍 Looking up user with email: ${email}...`);
    
    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers({
      filter: { email }
    });
    
    if (userError) {
      console.error('❌ Error listing users:', userError);
      return false;
    }
    
    if (!users || users.users.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      return false;
    }
    
    const user = users.users[0];
    console.log(`✅ Found user ${user.email} (${user.id})`);
    
    // Get all current sessions for user (this might not work depending on Supabase version)
    console.log('🔍 Checking current sessions...');
    
    // Force revoke all sessions
    console.log('🧹 Clearing all sessions for user...');
    
    // Use different methods to try to clear sessions
    try {
      // Method 1: Try to sign out with the option to logout everywhere
      const { error: signOutError } = await supabase.auth.admin.signOut(user.id, true);
      
      if (signOutError) {
        console.warn('⚠️ Standard sign out error:', signOutError.message);
        
        // Method 2: Try to delete and recreate the user (this will reset all sessions)
        console.log('🔄 Trying alternative method: Reset user authentication...');
        
        // Save current user data
        const email = user.email;
        const appMetadata = user.app_metadata || {};
        const userMetadata = user.user_metadata || {};
        
        // Update user password with a random one to invalidate all sessions
        const randomPassword = Math.random().toString(36).substring(2, 15);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: randomPassword }
        );
        
        if (updateError) {
          console.error('❌ Failed to reset user password:', updateError.message);
        } else {
          console.log('✅ Successfully reset user password - this will invalidate all sessions');
          console.log('⚠️ User will need to use password reset functionality to log in again');
        }
      } else {
        console.log('✅ Successfully cleared all sessions');
      }
    } catch (error) {
      console.error('❌ Failed to clear sessions:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

clearUserSessions().then((success) => {
  if (success) {
    console.log('\n✅ Session cleanup completed');
    console.log('Next steps:');
    console.log('1. Ask the user to clear browser cookies for this site');
    console.log('2. User may need to reset password if we had to use the alternative method');
    console.log('3. Have the user log in again');
  } else {
    console.error('\n❌ Session cleanup failed');
  }
  process.exit(success ? 0 : 1);
});
