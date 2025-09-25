// Test Supabase Storage upload
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testUpload() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  console.log('🔧 Using Supabase URL:', supabaseUrl);
  console.log('🔧 Using Supabase Key:', supabaseKey.substring(0, 20) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test with a small text file first
  const testContent = 'This is a test file for Supabase Storage upload';
  const testFile = new Blob([testContent], { type: 'text/plain' });
  
  console.log('\n📤 Testing upload to sermon-media bucket...');
  console.log('📁 File size:', testFile.size, 'bytes');
  console.log('📁 File type:', testFile.type);
  
  const testPath = `test-upload-${Date.now()}/test.txt`;
  console.log('📁 Upload path:', testPath);
  
  try {
    const { data, error } = await supabase.storage
      .from('sermon-media')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Upload successful:', data);
    
    // Test getting public URL
    const { data: publicData } = supabase.storage
      .from('sermon-media')
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL:', publicData.publicUrl);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('sermon-media')
      .remove([testPath]);
      
    if (deleteError) {
      console.warn('⚠️  Failed to clean up test file:', deleteError);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUpload().then(() => {
  console.log('\n✨ Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});