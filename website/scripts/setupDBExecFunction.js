// scripts/setupDBExecFunction.js
// This script creates the exec function in Supabase for executing SQL directly
// To run this script: node scripts/setupDBExecFunction.js

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

    // Try to call exec function first - it will fail if the function doesn't exist
    let execError;
    try {
      const response = await supabase.rpc('exec', {
        query: `
          CREATE OR REPLACE FUNCTION exec(query text) 
          RETURNS void AS $$
          BEGIN
            EXECUTE query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });
      execError = response.error;
    } catch (err) {
      // If the function doesn't exist yet, this will throw
      execError = { message: 'Function does not exist yet' };
    }

    if (execError) {
      console.log('Exec function doesn\'t exist yet, creating it directly...');
      
      // Try direct SQL approach
      try {
        // Use supabase.sql if available (newer SDK versions)
        const response = await supabase.sql(`
          CREATE OR REPLACE FUNCTION exec(query text) 
          RETURNS void AS $$
          BEGIN
            EXECUTE query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        
        console.log('✅ Exec function created successfully via SQL');
      } catch (sqlError) {
        console.log('Unable to create via direct SQL, trying alternative method...');
        
        // Test if the function was created or already exists
        try {
          console.log('Testing exec function...');
          const { error: testError } = await supabase.rpc('exec', {
            query: 'SELECT 1;'
          });
          
          if (!testError) {
            console.log('✅ Exec function is working');
          } else {
            console.error('Failed to create exec function:', testError.message);
            console.error('You may need to manually create the exec function in the Supabase dashboard.');
            console.error('Please run this SQL in the SQL Editor:');
            console.error(`
              CREATE OR REPLACE FUNCTION exec(query text) 
              RETURNS void AS $$
              BEGIN
                EXECUTE query;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
            `);
          }
        } catch (testError) {
          console.error('Error testing exec function:', testError.message);
          console.error('You need to manually create the exec function in the Supabase dashboard.');
          console.error('Please run this SQL in the SQL Editor:');
          console.error(`
            CREATE OR REPLACE FUNCTION exec(query text) 
            RETURNS void AS $$
            BEGIN
              EXECUTE query;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `);
        }
      }
    } else {
      console.log('✅ Exec function already exists');
    }
  } catch (error) {
    console.error('Error creating exec function:', error.message || error);
    console.error('You may need to manually create the exec function in the Supabase dashboard.');
    console.error('Please run this SQL in the SQL Editor:');
    console.error(`
      CREATE OR REPLACE FUNCTION exec(query text) 
      RETURNS void AS $$
      BEGIN
        EXECUTE query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }
}

createExecFunction();
