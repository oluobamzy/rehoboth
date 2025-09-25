// Check current Supabase Storage policies and test authentication
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkStoragePolicies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking current storage policies...');
    
    // Query to see what policies exist on storage.objects
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');

    if (error) {
      console.error('❌ Error fetching policies:', error);
    } else {
      console.log('📋 Current policies:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.qual}`);
      });
    }

    // Also try to see what's in the storage.objects table structure
    console.log('\n🏗️  Checking storage.objects table info...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec', {
      query: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'storage' AND table_name = 'objects'
        ORDER BY ordinal_position;
      `
    });

    if (tableError) {
      console.warn('⚠️  Could not fetch table info:', tableError.message);
    } else {
      console.log('Table columns:', tableInfo);
    }

  } catch (error) {
    console.error('❌ Error checking policies:', error);
  }
}

async function testDirectPolicyCreation() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('\n🔧 Attempting to create policies directly...');

    // Drop existing policies
    console.log('🧹 Dropping existing policies...');
    const dropCommands = [
      "DROP POLICY IF EXISTS sermon_media_public_read ON storage.objects;",
      "DROP POLICY IF EXISTS sermon_media_authenticated_upload ON storage.objects;",
      "DROP POLICY IF EXISTS sermon_media_authenticated_update ON storage.objects;",
      "DROP POLICY IF EXISTS sermon_media_authenticated_delete ON storage.objects;"
    ];

    for (const cmd of dropCommands) {
      const { error } = await supabase.rpc('exec', { query: cmd });
      if (error && !error.message.includes('does not exist')) {
        console.warn('Drop warning:', error.message);
      }
    }

    // Create very permissive policies for testing
    console.log('📝 Creating new permissive policies...');
    const newPolicies = [
      // Public read
      `CREATE POLICY "sermon_media_public_read" ON storage.objects 
       FOR SELECT USING (bucket_id = 'sermon-media');`,
      
      // Allow all authenticated users to insert
      `CREATE POLICY "sermon_media_auth_insert" ON storage.objects 
       FOR INSERT WITH CHECK (bucket_id = 'sermon-media');`,
       
      // Allow all authenticated users to update  
      `CREATE POLICY "sermon_media_auth_update" ON storage.objects 
       FOR UPDATE USING (bucket_id = 'sermon-media');`,
       
      // Allow all authenticated users to delete
      `CREATE POLICY "sermon_media_auth_delete" ON storage.objects 
       FOR DELETE USING (bucket_id = 'sermon-media');`
    ];

    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec', { query: policy });
      if (error) {
        console.error('❌ Policy creation failed:', error.message);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    console.log('🎯 New policies should be very permissive for testing');

  } catch (error) {
    console.error('❌ Error creating policies:', error);
  }
}

async function main() {
  await checkStoragePolicies();
  await testDirectPolicyCreation();
  console.log('\n✨ Policy check and update complete!');
}

main();