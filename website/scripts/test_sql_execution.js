// scripts/test_sql_execution.js
// This script tests direct SQL execution capabilities with Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSqlExecution() {
  console.log('===== Testing SQL Execution Options =====');
  
  // Method 1: Using supabase.rpc('exec') - the most common way in your scripts
  console.log('\n1. Testing SQL execution via exec RPC function...');
  try {
    const { data: execData, error: execError } = await supabase.rpc('exec', { 
      query: 'SELECT version() AS postgres_version;' 
    });
    
    if (execError) {
      console.log('❌ Exec function failed:', execError.message);
    } else {
      console.log('✅ Exec function worked!');
      console.log('Result:', execData);
    }
  } catch (e) {
    console.log('❌ Exception when calling exec function:', e.message);
  }
  
  // Method 2: Using direct SQL method (newer clients)
  console.log('\n2. Testing direct SQL execution via supabase.sql()...');
  try {
    // Note: This method is only available in newer versions of the Supabase JS client
    if (typeof supabase.sql === 'function') {
      const { data: sqlData, error: sqlError } = await supabase.sql('SELECT version() AS postgres_version;');
      
      if (sqlError) {
        console.log('❌ Direct SQL method failed:', sqlError.message);
      } else {
        console.log('✅ Direct SQL method worked!');
        console.log('Result:', sqlData);
      }
    } else {
      console.log('⚠️ supabase.sql() method not available in this version of supabase-js');
    }
  } catch (e) {
    console.log('❌ Exception when using direct SQL method:', e.message);
  }
  
  // Method 3: Using REST API
  console.log('\n3. Testing SQL execution via REST API...');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: 'SELECT version() AS postgres_version;'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ REST API call failed:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('✅ REST API call worked!');
      console.log('Result:', data);
    }
  } catch (e) {
    console.log('❌ Exception when using REST API:', e.message);
  }
  
  // Method 4: Using the raw SQL REST API
  console.log('\n4. Testing raw SQL API endpoint...');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: 'SELECT version() AS postgres_version;'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Raw SQL API call failed:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('✅ Raw SQL API call worked!');
      console.log('Result:', data);
    }
  } catch (e) {
    console.log('❌ Exception when using raw SQL API:', e.message);
  }
  
  console.log('\n===== SQL Execution Tests Complete =====');
}

testSqlExecution();
