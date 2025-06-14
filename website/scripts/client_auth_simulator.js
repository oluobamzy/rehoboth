// scripts/client_auth_simulator.js
// This script simulates how client-side authentication would work
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Initialize Supabase client with anon key (like browser would)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to append results to a file
function appendToFile(message) {
  fs.appendFileSync('client_auth_results.txt', message + '\n');
  console.log(message);
}

async function simulateClientAuth() {
  try {
    // Clear previous results file
    fs.writeFileSync('client_auth_results.txt', '===== CLIENT AUTH SIMULATION =====\n\n');
    appendToFile('Simulating client-side authentication behavior...\n');

    // Step 1: Test if we can sign in
    const adminEmail = 'oluobamzy@gmail.com';
    
    // This is just a simulation - we don't have the actual password
    // So we'll check if the user exists using service role
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: users, error: userError } = await serviceClient.auth.admin.listUsers();
    
    if (userError) {
      appendToFile(`❌ Error listing users: ${userError.message}`);
      return;
    }
    
    const adminUser = users.users.find(u => u.email === adminEmail);
    
    if (!adminUser) {
      appendToFile(`❌ Admin user ${adminEmail} not found`);
      return;
    }
    
    appendToFile(`✅ Found admin user: ${adminUser.email}`);
    
    // Step 2: Check app_metadata on this user (which would be in the JWT token)
    appendToFile(`\nChecking user metadata (would be in JWT on client):`);
    const appMetadata = adminUser.app_metadata || {};
    appendToFile(`App metadata: ${JSON.stringify(appMetadata, null, 2)}`);
    
    const hasAdminRole = appMetadata.role === 'admin';
    appendToFile(`Admin role in app_metadata: ${hasAdminRole ? '✅ YES' : '❌ NO'}`);
    
    // Step 3: Simulate how middleware would check this session
    appendToFile('\nSimulating middleware session check:');
    appendToFile('1. Middleware would extract JWT token from cookies/headers');
    appendToFile('2. Middleware would verify the JWT token with Supabase');
    
    if (hasAdminRole) {
      appendToFile('3. Middleware would find admin role in app_metadata ✅');
      appendToFile('4. Middleware would ALLOW access to admin routes ✅');
    } else {
      appendToFile('3. Middleware would NOT find admin role in app_metadata ❌');
      appendToFile('4. Middleware would check user_roles table as fallback');
      
      // Actually check user_roles table to simulate middleware
      const { data: userRoles, error: rolesError } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', adminUser.id);
        
      if (rolesError) {
        appendToFile(`❌ Error checking user_roles: ${rolesError.message}`);
      } else if (!userRoles || userRoles.length === 0) {
        appendToFile('5. Middleware would NOT find admin role in user_roles table ❌');
        appendToFile('6. Middleware would DENY access to admin routes ❌');
      } else {
        const hasRoleInTable = userRoles.some(r => r.role === 'admin');
        if (hasRoleInTable) {
          appendToFile('5. Middleware would find admin role in user_roles table ✅');
          appendToFile('6. Middleware would ALLOW access to admin routes ✅');
        } else {
          appendToFile('5. Middleware would NOT find admin role in user_roles table ❌');
          appendToFile('6. Middleware would DENY access to admin routes ❌');
        }
      }
    }
    
    // Step 4: Test issue with listUserSessions
    appendToFile('\nTesting listUserSessions function:');
    try {
      const { data: sessions, error: sessionError } = await serviceClient.auth.admin.listUserSessions(adminUser.id);
      
      if (sessionError) {
        appendToFile(`❌ listUserSessions failed: ${sessionError.message}`);
        appendToFile('This matches the error seen in test_admin_auth.js');
      } else {
        appendToFile(`✅ listUserSessions succeeded: Found ${sessions.length} sessions`);
        sessions.forEach((session, i) => {
          appendToFile(`Session ${i+1}: Created at ${new Date(session.created_at).toLocaleString()}`);
        });
      }
    } catch (e) {
      appendToFile(`❌ Exception in listUserSessions: ${e.message}`);
      appendToFile('This matches the error seen in test_admin_auth.js');
    }
    
    // Step 5: Recommendations
    appendToFile('\nRecommendations for client-side auth:');
    if (hasAdminRole) {
      appendToFile('✅ User has admin role in app_metadata - client session will have admin privileges');
    } else {
      const { data: roles } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', adminUser.id);
      
      const hasRoleInTable = roles && roles.some(r => r.role === 'admin');
      
      if (hasRoleInTable && !hasAdminRole) {
        appendToFile('⚠️ User has admin role only in user_roles table, not in app_metadata');
        appendToFile('   This means client-side admin checks may fail while server-side checks work');
        appendToFile('   Run: node scripts/fix_admin_auth.js to sync these permissions');
      } else if (!hasRoleInTable && !hasAdminRole) {
        appendToFile('❌ User does not have admin role in either location');
        appendToFile('   Run: node scripts/addAdminUser.js to grant admin privileges');
      }
    }
    
    appendToFile('\n===== SIMULATION COMPLETE =====');
    
  } catch (error) {
    appendToFile(`\n❌ Unexpected error: ${error.message}`);
  }
}

simulateClientAuth()
  .then(() => {
    console.log('\nSimulation complete. Results written to client_auth_results.txt');
  })
  .catch(err => console.error('Error running simulation:', err));
