// scripts/file_output_test.js
// This script writes output to a file
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const outputPath = './supabase_test_output.txt';
const log = (message) => {
  fs.appendFileSync(outputPath, message + '\n');
};

// Clear previous log file
fs.writeFileSync(outputPath, '--- Supabase Test Output ---\n');

// Log environment variables
log(`Environment variables:`);
log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}`);
log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}`);
log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing"}`);

// Initialize Supabase client
log(`\nInitializing Supabase client...`);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple test function
async function fileOutputTest() {
  try {
    // Test 1: Basic table query
    log(`\n1. Testing basic table query...`);
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .limit(1);
      
      if (error) {
        log(`❌ Basic query failed: ${error.message}`);
      } else {
        log(`✅ Basic query successful!`);
        log(`Data: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      log(`❌ Exception during basic query: ${e.message}`);
    }
    
    // Test 2: SQL execution via exec function
    log(`\n2. Testing SQL execution via exec RPC function...`);
    try {
      const { data: execData, error: execError } = await supabase.rpc('exec', { 
        query: 'SELECT version() AS postgres_version;' 
      });
      
      if (execError) {
        log(`❌ Exec function failed: ${execError.message}`);
      } else {
        log(`✅ Exec function worked!`);
        log(`Result: ${JSON.stringify(execData)}`);
      }
    } catch (e) {
      log(`❌ Exception when calling exec function: ${e.message}`);
    }
    
    // Test 3: Auth admin functions
    log(`\n3. Testing Auth Admin API...`);
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
        limit: 5
      });

      if (usersError) {
        log(`❌ Auth Admin API access failed: ${usersError.message}`);
      } else {
        log(`✅ Auth Admin API access successful!`);
        log(`Found ${users.users.length} users:`);
        users.users.forEach((user, i) => {
          log(`  User ${i+1}: ${user.email} (${user.id})`);
          log(`    Role: ${user.app_metadata?.role || 'No role'}`);
        });
      }
    } catch (e) {
      log(`❌ Exception accessing Auth Admin API: ${e.message}`);
    }
    
    log(`\n--- Test completed ---`);
  } catch (e) {
    log(`\nUnhandled error: ${e.message}`);
  }
}

fileOutputTest().then(() => {
  log('\nTest finished.');
});
