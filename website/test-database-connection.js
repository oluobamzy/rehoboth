// test-database-connection.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and checking table schema...');
  
  try {
    // Test 1: Check table schema
    console.log('\n1. Checking page_content table schema...');
    const { data: contentData, error: contentError } = await supabase
      .from('page_content')
      .select('*')
      .limit(1);
    
    if (contentError) {
      console.error('❌ Error accessing page_content:', contentError);
    } else {
      console.log('✅ Successfully accessed page_content table');
      if (contentData && contentData[0]) {
        console.log('📋 Table columns:', Object.keys(contentData[0]));
      }
    }

    // Test 2: Check if we can read from user_roles (this was causing recursion)
    console.log('\n2. Testing user_roles table access...');
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (rolesError) {
      console.error('❌ Error accessing user_roles:', rolesError);
      if (rolesError.message?.includes('infinite recursion')) {
        console.error('🔄 RLS recursion still exists! Please run the SQL fix in Supabase dashboard.');
      }
    } else {
      console.log('✅ Successfully accessed user_roles table');
      console.log(`   Found ${rolesData?.length || 0} records`);
    }

    // Test 3: Test upsert operation
    console.log('\n3. Testing upsert operation...');
    const testContent = {
      page_key: 'test',
      section_key: 'test_section',
      content: 'Test content from connection test',
      content_type: 'html',
      is_published: false
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('page_content')
      .upsert(testContent, { onConflict: 'page_key,section_key' })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error with upsert operation:', upsertError);
    } else {
      console.log('✅ Upsert operation successful');
      console.log('   Created/updated test content');
      
      // Clean up test content
      await supabase
        .from('page_content')
        .delete()
        .eq('page_key', 'test')
        .eq('section_key', 'test_section');
      console.log('   Cleaned up test content');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConnection();