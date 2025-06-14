// scripts/test_list_sessions.js
// Simple script to test the listUserSessions function
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Output to file
const outputFile = 'session_list_results.txt';

// Clear previous results
fs.writeFileSync(outputFile, '===== SESSION LIST TEST =====\n\n');

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Write to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n');
}

async function testListSessions() {
  try {
    log('Testing admin user session listing\n');
    
    // First find the admin user
    log('1. Finding admin user:');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      log(`❌ Error listing users: ${userError.message}`);
      return;
    }
    
    const adminUser = users.users.find(u => 
      u.email === 'oluobamzy@gmail.com' || 
      (u.app_metadata && u.app_metadata.role === 'admin')
    );
    
    if (!adminUser) {
      log('❌ No admin user found');
      return;
    }
    
    log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);
    
    // Now try to list sessions for this user
    log('\n2. Attempting to list sessions:');
    log('Using supabase.auth.admin.listUserSessions...');
    
    try {
      const { data: sessions, error: sessionError } = await supabase.auth.admin.listUserSessions(adminUser.id);
      
      if (sessionError) {
        log(`❌ Error listing sessions: ${sessionError.message}`);
        log(`Error code: ${sessionError.code}`);
        log(`Error details: ${JSON.stringify(sessionError.details || {})}`);
      } else {
        if (!sessions || sessions.length === 0) {
          log('✅ Function succeeded but found no active sessions');
        } else {
          log(`✅ Success! Found ${sessions.length} sessions`);
          sessions.forEach((session, i) => {
            log(`   Session ${i+1}: Created ${new Date(session.created_at).toLocaleString()}`);
          });
        }
      }
    } catch (e) {
      log(`❌ Exception calling listUserSessions: ${e.message}`);
      log(`Stack trace: ${e.stack}`);
      
      // Check if it's because function doesn't exist
      if (e.message.includes("is not a function") || e.message.includes("Cannot read properties")) {
        log('\nThis could be due to an API version mismatch or incorrect implementation.');
        log('Checking supabase-js version...');
        
        const packageJson = require('../package.json');
        const supabaseVersion = packageJson.dependencies['@supabase/supabase-js'] || 'unknown';
        log(`supabase-js version: ${supabaseVersion}`);
        
        if (supabaseVersion.startsWith('<') || supabaseVersion.startsWith('^')) {
          log('Using a version range. Actual version may vary.');
        }
        
        log('\nRecommendation: Check if listUserSessions is available in the installed version.');
      }
    }
    
    // Try alternative approach with SQL
    log('\n3. Trying alternative SQL approach:');
    const { data: sqlData, error: sqlError } = await supabase.rpc('exec', {
      query: `
        SELECT * FROM auth.refresh_tokens 
        WHERE user_id='${adminUser.id}' 
        LIMIT 5;
      `
    });
    
    if (sqlError) {
      log(`❌ SQL approach failed: ${sqlError.message}`);
    } else {
      if (!sqlData || sqlData.length === 0) {
        log('✅ SQL query succeeded but found no tokens');
      } else {
        log(`✅ SQL query found ${sqlData.length} refresh tokens`);
        
        log('\nThis confirms session data exists in the database.');
        log('The issue is likely with the API endpoint or permissions.');
      }
    }
    
    log('\n===== SESSION LIST TEST COMPLETED =====');
    
  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`);
  }
}

testListSessions()
  .then(() => {
    console.log(`\nTest complete. Results saved to ${outputFile}`);
  })
  .catch(err => console.error('Error running test:', err));
