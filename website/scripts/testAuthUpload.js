// Test authenticated upload to Supabase Storage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthenticatedUpload() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔐 Testing authenticated upload flow...');
  
  // Check current session (should be null in this context)
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session ? 'Authenticated' : 'Anonymous');
  
  if (!session) {
    console.log('📋 This script runs without authentication.');
    console.log('📋 In the real app, users must be logged in to upload files.');
    console.log('📋 The uploadSermonMedia function now checks for authentication.');
    return;
  }
  
  // Test upload (this would only work if somehow authenticated)
  const testContent = 'Authenticated test upload';
  const testFile = new Blob([testContent], { type: 'text/plain' });
  const testPath = `auth-test-${Date.now()}/test.txt`;
  
  try {
    const { data, error } = await supabase.storage
      .from('sermon-media')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload failed:', error.message);
    } else {
      console.log('✅ Upload successful:', data);
      
      // Clean up
      await supabase.storage.from('sermon-media').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }
  } catch (error) {
    console.error('❌ Upload error:', error.message);
  }
}

testAuthenticatedUpload();