// scripts/enhanced_auth_test.js
// An enhanced test to diagnose authentication and admin role issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with error handling
console.log("Environment variables:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Step 1: Test basic connectivity
async function testConnection() {
  try {
    console.log("\n--- TESTING BASIC CONNECTIVITY ---");
    const { data, error } = await supabase.rpc('get_postgres_version');
    
    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    } else {
      console.log("✅ Connection successful");
      return true;
    }
  } catch (e) {
    console.error("❌ Connection exception:", e.message);
    return false;
  }
}

// Step 2: Test admin user retrieval
async function testAdminUserRetrieval(email = 'oluobamzy@gmail.com') {
  try {
    console.log(`\n--- TESTING ADMIN USER RETRIEVAL (${email}) ---`);
    console.log("Trying to list users with auth.admin.listUsers...");
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("❌ Could not list users:", error.message);
      console.log("Trying alternative approach with SQL query...");
      
      // Try a direct SQL query as fallback
      const { data: sqlData, error: sqlError } = await supabase.from('auth.users')
        .select('id, email, app_metadata')
        .eq('email', email)
        .limit(1);
      
      if (sqlError) {
        console.error("❌ SQL query failed:", sqlError.message);
        return null;
      } else if (!sqlData || sqlData.length === 0) {
        console.log(`❌ User with email ${email} not found via SQL query`);
        return null;
      } else {
        console.log("✅ User found via SQL query:", sqlData[0]);
        return sqlData[0];
      }
    } else {
      const user = data?.users?.find(u => u.email === email);
      if (!user) {
        console.log(`❌ User with email ${email} not found in user list`);
        return null;
      } else {
        console.log("✅ User found:", user.email);
        console.log("User ID:", user.id);
        console.log("App metadata:", JSON.stringify(user.app_metadata, null, 2));
        return user;
      }
    }
  } catch (e) {
    console.error("❌ User retrieval exception:", e.message);
    return null;
  }
}

// Step 3: Check user_roles table
async function testUserRolesTable(userId) {
  if (!userId) {
    console.log("\n❌ Cannot check user_roles table without a user ID");
    return null;
  }
  
  try {
    console.log("\n--- TESTING USER_ROLES TABLE ---");
    
    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'user_roles')
      .limit(1);
    
    if (tableError) {
      console.error("❌ Error checking if table exists:", tableError.message);
    } else if (!tableCheck || tableCheck.length === 0) {
      console.error("❌ user_roles table not found in database");
      return null;
    } else {
      console.log("✅ user_roles table exists");
    }
    
    // Check user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error("❌ Error checking user_roles:", rolesError.message);
      return null;
    } else if (!roles || roles.length === 0) {
      console.log("❌ No roles found for user");
      return [];
    } else {
      console.log("✅ User roles found:", roles);
      return roles;
    }
  } catch (e) {
    console.error("❌ User roles exception:", e.message);
    return null;
  }
}

// Step 4: Test session handling
async function testSessionHandling(userId) {
  if (!userId) {
    console.log("\n❌ Cannot check sessions without a user ID");
    return null;
  }
  
  try {
    console.log("\n--- TESTING USER SESSION HANDLING ---");
    console.log("Trying to list user sessions...");
    
    // Try with explicit error handling
    try {
      const { data, error } = await supabase.auth.admin.listUserSessions(userId);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("ℹ️ No active sessions found for user");
        return [];
      } else {
        console.log(`✅ Found ${data.length} active sessions`);
        return data;
      }
    } catch (sessionError) {
      console.error("❌ Failed to list sessions:", sessionError.message);
      console.log("Trying alternative approach...");
      
      // Try a direct SQL query to see if we can access session data
      const { data: refreshTokens, error: tokenError } = await supabase
        .from('auth.refresh_tokens')
        .select('*')
        .eq('user_id', userId)
        .limit(5);
      
      if (tokenError) {
        console.error("❌ Cannot access refresh tokens:", tokenError.message);
      } else {
        console.log(`ℹ️ Found ${refreshTokens?.length || 0} refresh tokens`);
      }
      
      return null;
    }
  } catch (e) {
    console.error("❌ Session handling exception:", e.message);
    return null;
  }
}

// Main function to run all tests
async function runTests(email = 'oluobamzy@gmail.com') {
  console.log("=".repeat(50));
  console.log(`TESTING AUTH SYSTEM FOR USER: ${email}`);
  console.log("=".repeat(50));
  
  // Step 1: Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error("\n❌ Cannot continue tests without database connection");
    process.exit(1);
  }
  
  // Step 2: Get user
  const user = await testAdminUserRetrieval(email);
  
  // Step 3: Check roles
  if (user && user.id) {
    await testUserRolesTable(user.id);
  }
  
  // Step 4: Check sessions
  if (user && user.id) {
    await testSessionHandling(user.id);
  }
  
  console.log("\n=".repeat(50));
  console.log("TESTS COMPLETED");
  console.log("=".repeat(50));
}

// Get email from command line or use default
const email = process.argv[2] || 'oluobamzy@gmail.com';
runTests(email);
