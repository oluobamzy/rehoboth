// scripts/createExecFunction.js
// This script will create the exec function in Supabase for running SQL commands
// To run this script: node scripts/createExecFunction.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExecFunction() {
  try {
    console.log('Creating exec function in Supabase...');
    
    try {
      // Try using RPC first (if the function already exists)
      const { error } = await supabase.rpc('exec', {
        query: `
          CREATE OR REPLACE FUNCTION exec(query text) 
          RETURNS void AS $$
          BEGIN
            EXECUTE query;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (error) throw error;
    } catch (err) {
      // If the function doesn't exist yet, create it using a direct SQL command
      console.log('Attempting to create function directly with SQL...');
      const { error } = await supabase.sql(`
        CREATE OR REPLACE FUNCTION exec(query text) 
        RETURNS void AS $$
        BEGIN
          EXECUTE query;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      if (error) throw error;
    }
    
    if (error) {
      console.error('Error creating exec function:', error);
      return;
    }
    
    console.log('✅ Exec function created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

createExecFunction();
