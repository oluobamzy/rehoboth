// scripts/check_middleware.js
// This script simulates how the middleware checks admin privileges
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to append results to a file for easier viewing
function appendToFile(message) {
  fs.appendFileSync('middleware_check_results.txt', message + '\n');
  console.log(message);
}

async function checkMiddlewareAuth() {
  try {
    // Clear previous results file
    fs.writeFileSync('middleware_check_results.txt', '===== MIDDLEWARE CHECK RESULTS =====\n\n');
    appendToFile('Checking middleware auth functionality...\n');

    // 1. List all users
    appendToFile('Step 1: Listing users');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      appendToFile(`❌ Error listing users: ${userError.message}`);
      return;
    }
    
    appendToFile(`✅ Found ${users?.users?.length || 0} users in the system`);
    
    // 2. Find our admin user
    const adminEmail = 'oluobamzy@gmail.com';
    const adminUser = users.users.find(u => u.email === adminEmail);
    
    if (!adminUser) {
      appendToFile(`❌ Admin user ${adminEmail} not found`);
      return;
    }
    
    appendToFile(`\nAdmin user information:`);
    appendToFile(`Email: ${adminUser.email}`);
    appendToFile(`User ID: ${adminUser.id}`);
    appendToFile(`Created at: ${new Date(adminUser.created_at).toLocaleString()}`);
    
    // 3. Check app_metadata
    appendToFile(`\nChecking app_metadata (used by middleware):`);
    const appMetadata = adminUser.app_metadata || {};
    appendToFile(`App metadata: ${JSON.stringify(appMetadata, null, 2)}`);
    
    const hasAdminRole = appMetadata.role === 'admin';
    appendToFile(`Admin role in app_metadata: ${hasAdminRole ? '✅ YES' : '❌ NO'}`);
    
    // 4. Check user_roles table (middleware fallback)
    appendToFile(`\nChecking user_roles table (middleware fallback):`);
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id);
    
    if (rolesError) {
      appendToFile(`❌ Error checking user_roles: ${rolesError.message}`);
    } else if (!userRoles || userRoles.length === 0) {
      appendToFile(`❌ No roles found for user in user_roles table`);
    } else {
      appendToFile(`✅ User roles: ${JSON.stringify(userRoles, null, 2)}`);
      const hasRoleInTable = userRoles.some(r => r.role === 'admin');
      appendToFile(`Admin role in table: ${hasRoleInTable ? '✅ YES' : '❌ NO'}`);
    }
    
    // 5. Simulate middleware auth check logic
    appendToFile(`\nSimulating middleware auth check logic:`);
    
    // First check app_metadata (like middleware does)
    if (hasAdminRole) {
      appendToFile(`✅ Middleware would ALLOW access based on app_metadata`);
    } else {
      appendToFile(`❌ Middleware would DENY access based on app_metadata`);

      // Then check user_roles as fallback (like middleware does)
      const isAdminInRoles = userRoles && userRoles.some(r => r.role === 'admin');
      if (isAdminInRoles) {
        appendToFile(`✅ Middleware would ALLOW access based on user_roles table fallback`);
      } else {
        appendToFile(`❌ Middleware would DENY access completely`);
      }
    }
    
    // 6. Summary
    appendToFile(`\nSummary:`);
    const middleware_allows_access = hasAdminRole || (userRoles && userRoles.some(r => r.role === 'admin'));
    appendToFile(`Middleware would: ${middleware_allows_access ? '✅ ALLOW' : '❌ DENY'} admin access`);
    
    if (!hasAdminRole && !userRoles?.some(r => r.role === 'admin')) {
      appendToFile(`\nRecommended fixes:`);
      appendToFile(`1. Run: node scripts/fix_admin_auth.js ${adminEmail}`);
      appendToFile(`2. Have user log out and log back in to refresh session state`);
    }
    
    appendToFile(`\n===== CHECK COMPLETED =====`);
    
  } catch (error) {
    appendToFile(`\n❌ Error: ${error.message}`);
  }
}

checkMiddlewareAuth()
  .then(() => {
    console.log('\nCheck complete. Results written to middleware_check_results.txt');
  })
  .catch(err => console.error('Error running check:', err));
