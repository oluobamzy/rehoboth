// testSupabaseConnection.js
// This script tests the connection to Supabase
require('dotenv').config();

console.log('Environment variables check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');

// Get actual URL value to check format (masking most of the key)
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const maskedKey = anonKey.substring(0, 5) + '...' + anonKey.substring(anonKey.length - 5);
  console.log('Anon key format:', maskedKey);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const maskedServiceKey = serviceKey.substring(0, 5) + '...' + serviceKey.substring(serviceKey.length - 5);
  console.log('Service key format:', maskedServiceKey);
}
