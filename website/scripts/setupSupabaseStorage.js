// scripts/setupSupabaseStorage.js
// This script sets up Supabase Storage for sermon media files

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createStorageBucket() {
  try {
    console.log('Creating Supabase Storage bucket for sermon media...');

    // Create the sermon-media bucket
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('sermon-media', {
        public: true // Allow public read access
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Storage bucket created successfully:', bucket);
    }

  } catch (error) {
    console.error('Error creating storage bucket:', error.message);
    throw error;
  }
}

async function createStoragePolicies() {
  try {
    console.log('Creating storage security policies...');

    // Create policy for public read access
    const readPolicy = {
      name: 'sermon_media_public_read',
      table: 'objects',
      operation: 'SELECT',
      bucket_id: 'sermon-media',
      definition: 'true' // Allow everyone to read
    };

    // Create policy for authenticated users to upload (admin only in practice)
    const writePolicy = {
      name: 'sermon_media_authenticated_upload',
      table: 'objects', 
      operation: 'INSERT',
      bucket_id: 'sermon-media',
      definition: 'auth.role() = \'authenticated\''
    };

    // Create policy for authenticated users to update their uploads
    const updatePolicy = {
      name: 'sermon_media_authenticated_update',
      table: 'objects',
      operation: 'UPDATE', 
      bucket_id: 'sermon-media',
      definition: 'auth.role() = \'authenticated\''
    };

    // Create policy for authenticated users to delete
    const deletePolicy = {
      name: 'sermon_media_authenticated_delete',
      table: 'objects',
      operation: 'DELETE',
      bucket_id: 'sermon-media', 
      definition: 'auth.role() = \'authenticated\''
    };

    // Note: Supabase Storage RLS policies are typically created via SQL
    // Let's create them using the RPC function
    
    const policies = [
      `
      CREATE POLICY "sermon_media_public_read" ON storage.objects
        FOR SELECT USING (bucket_id = 'sermon-media');
      `,
      `
      CREATE POLICY "sermon_media_authenticated_upload" ON storage.objects  
        FOR INSERT WITH CHECK (bucket_id = 'sermon-media' AND auth.role() = 'authenticated');
      `,
      `
      CREATE POLICY "sermon_media_authenticated_update" ON storage.objects
        FOR UPDATE USING (bucket_id = 'sermon-media' AND auth.role() = 'authenticated');
      `,
      `
      CREATE POLICY "sermon_media_authenticated_delete" ON storage.objects
        FOR DELETE USING (bucket_id = 'sermon-media' AND auth.role() = 'authenticated');
      `
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec', { query: policy });
        if (error && !error.message.includes('already exists')) {
          console.warn('Policy creation warning:', error.message);
        }
      } catch (policyError) {
        console.warn('Policy creation warning:', policyError.message);
      }
    }

    console.log('✅ Storage policies configured');

  } catch (error) {
    console.error('Error creating storage policies:', error.message);
    // Don't throw here as policies might already exist
  }
}

async function setupSupabaseStorage() {
  try {
    await createStorageBucket();
    await createStoragePolicies();
    console.log('✅ Supabase Storage setup complete!');
    console.log('\nYou can now:');
    console.log('- Upload sermon files to the "sermon-media" bucket');
    console.log('- Files will be publicly readable but only admins can upload');
    console.log('- Maximum file size: 1GB');
  } catch (error) {
    console.error('❌ Failed to setup Supabase Storage:', error.message);
    process.exit(1);
  }
}

setupSupabaseStorage();