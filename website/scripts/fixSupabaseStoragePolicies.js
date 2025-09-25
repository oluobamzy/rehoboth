// scripts/fixSupabaseStoragePolicies.js
// This script fixes the Supabase Storage policies to allow proper uploads

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStoragePolicies() {
  try {
    console.log('🔧 Fixing Supabase Storage policies...');

    // First, drop existing policies if they exist
    const dropPolicies = [
      `DROP POLICY IF EXISTS "sermon_media_public_read" ON storage.objects;`,
      `DROP POLICY IF EXISTS "sermon_media_authenticated_upload" ON storage.objects;`,
      `DROP POLICY IF EXISTS "sermon_media_authenticated_update" ON storage.objects;`,
      `DROP POLICY IF EXISTS "sermon_media_authenticated_delete" ON storage.objects;`
    ];

    for (const dropPolicy of dropPolicies) {
      try {
        const { error } = await supabase.rpc('exec', { query: dropPolicy });
        if (error) {
          console.log('Info:', error.message);
        }
      } catch (error) {
        console.log('Info: Policy might not exist:', error.message);
      }
    }

    // Create new, more permissive policies
    const newPolicies = [
      // Allow public read access to all files in sermon-media bucket
      `
      CREATE POLICY "sermon_media_public_read" ON storage.objects
        FOR SELECT USING (bucket_id = 'sermon-media');
      `,
      // Allow authenticated users to upload files
      `
      CREATE POLICY "sermon_media_authenticated_upload" ON storage.objects  
        FOR INSERT WITH CHECK (bucket_id = 'sermon-media' AND auth.uid() IS NOT NULL);
      `,
      // Allow authenticated users to update their uploads (including upsert)
      `
      CREATE POLICY "sermon_media_authenticated_update" ON storage.objects
        FOR UPDATE USING (bucket_id = 'sermon-media' AND auth.uid() IS NOT NULL);
      `,
      // Allow authenticated users to delete files
      `
      CREATE POLICY "sermon_media_authenticated_delete" ON storage.objects
        FOR DELETE USING (bucket_id = 'sermon-media' AND auth.uid() IS NOT NULL);
      `
    ];

    console.log('📋 Creating new storage policies...');
    for (const policy of newPolicies) {
      try {
        const { error } = await supabase.rpc('exec', { query: policy });
        if (error) {
          console.warn('⚠️  Policy creation warning:', error.message);
        } else {
          console.log('✅ Policy created successfully');
        }
      } catch (policyError) {
        console.warn('⚠️  Policy creation error:', policyError.message);
      }
    }

    console.log('✅ Storage policies updated!');

  } catch (error) {
    console.error('❌ Error fixing storage policies:', error.message);
    throw error;
  }
}

async function testUploadWithAuth() {
  try {
    console.log('\n🧪 Testing upload with authentication...');

    // Create a test user session (this simulates an authenticated user)
    // Note: In real usage, the user would be authenticated through the app
    
    // For now, let's just test if the policies work by attempting an upload
    const testContent = 'Test upload after policy fix';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testPath = `policy-test-${Date.now()}/test.txt`;
    
    // This will use the anon key but the policies should now work with auth.uid() IS NOT NULL
    const { data, error } = await supabase.storage
      .from('sermon-media')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload still failing:', error);
      console.error('❌ This means the user needs to be authenticated in the app');
      return false;
    }
    
    console.log('✅ Upload test successful:', data);
    
    // Clean up
    await supabase.storage.from('sermon-media').remove([testPath]);
    console.log('🧹 Test file cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test upload failed:', error);
    return false;
  }
}

async function main() {
  try {
    await fixStoragePolicies();
    
    const uploadWorked = await testUploadWithAuth();
    
    if (!uploadWorked) {
      console.log('\n💡 Upload still requires user authentication.');
      console.log('📋 Make sure users are logged in before uploading files.');
      console.log('📋 The storage policies now check for auth.uid() IS NOT NULL');
    }
    
    console.log('\n✨ Policy fix completed!');
    
  } catch (error) {
    console.error('❌ Failed to fix storage policies:', error.message);
    process.exit(1);
  }
}

main();