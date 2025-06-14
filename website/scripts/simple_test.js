// scripts/simple_test.js
// A very simple test to check basic functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log("Environment variables:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing");

// Initialize Supabase client
console.log("\nInitializing Supabase client...");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple test function
async function simpleTest() {
  try {
    console.log("\nExecuting simple query...");
    const { data, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("Success! Data:", data);
    }
  } catch (e) {
    console.error("Exception:", e.message);
  }
}

simpleTest();
