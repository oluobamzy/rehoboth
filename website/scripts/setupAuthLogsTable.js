// scripts/setupAuthLogsTable.js
// This script sets up the authentication logs table
// To run this script: node scripts/setupAuthLogsTable.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAuthLogsTable() {
  try {
    console.log('Setting up auth logs table...');

    // Read SQL from file
    const sqlPath = path.join(__dirname, 'setup_auth_logs.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Check if exec function exists
    const { error: checkError } = await supabase.rpc('exec', { query: 'SELECT 1;' });
    
    if (checkError) {
      console.error('Error: exec function not set up. Please run setupDBExecFunction.js first.');
      console.error(checkError);
      process.exit(1);
    }

    // Split SQL into separate statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec', { query: statement + ';' });
      
      if (error) {
        // Special handling for the pg_cron statement which might fail if extension is not enabled
        if (statement.includes('cron.schedule')) {
          console.warn('Warning: Could not schedule automatic cleanup - pg_cron extension may not be enabled.');
          continue;
        }
        
        throw new Error(`Error executing SQL: ${error.message}\nStatement: ${statement}`);
      }
    }

    console.log('✅ Auth logs table and policies created successfully');
  } catch (error) {
    console.error('Error setting up auth logs:', error.message);
    process.exit(1);
  }
}

setupAuthLogsTable();
