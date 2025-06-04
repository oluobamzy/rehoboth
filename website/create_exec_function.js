const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('Creating exec function in Supabase via SQL API...');
    
    // Using the SQL REST API to create the function directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: `
          CREATE OR REPLACE FUNCTION exec(query text) 
          RETURNS void AS $$
          BEGIN
            EXECUTE query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
    });
    
    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Exec function created successfully');
    } else {
      console.error('Failed to create exec function:', result);
    }
  } catch (error) {
    console.error('Error creating exec function:', error);
  }
})();
