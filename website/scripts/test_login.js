// scripts/test_login.js
// This script tests the login flow and verifies the session is working correctly
// Usage: node scripts/test_login.js user@example.com password

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with anon key (like browser would use)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get the email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Please provide both email and password: node scripts/test_login.js admin@example.com password');
  process.exit(1);
}

async function testLogin() {
  try {
    console.log(`🔑 Testing login for: ${email}...`);
    
    // Log in with provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
    
    console.log('✅ Login successful!');
    
    // Verify we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError.message);
      return false;
    }
    
    if (!session) {
      console.error('❌ No session found after login');
      return false;
    }
    
    console.log('✅ Session verified!');
    console.log('Session details:');
    console.log(`- User ID: ${session.user.id}`);
    console.log(`- Email: ${session.user.email}`);
    console.log(`- Role: ${session.user.app_metadata?.role || 'none'}`);
    console.log(`- Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    
    // Verify admin role in user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'admin');
    
    if (rolesError) {
      console.error('❌ Error checking admin role:', rolesError.message);
    } else if (!userRoles || userRoles.length === 0) {
      console.warn('⚠️ No admin role found in user_roles table');
    } else {
      console.log('✅ Admin role confirmed in user_roles table');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

testLogin().then((success) => {
  if (success) {
    console.log('\n✅ Login test completed successfully');
  } else {
    console.error('\n❌ Login test failed');
  }
  process.exit(success ? 0 : 1);
});
