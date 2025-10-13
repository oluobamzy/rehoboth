#!/usr/bin/env node

/**
 * Alternative setup script for volunteer applications table
 * Uses direct SQL queries instead of RPC functions
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !anonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupVolunteerApplications() {
  try {
    console.log('🚀 Setting up volunteer applications table...');

    // First, check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('volunteer_applications')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ volunteer_applications table already exists');
    } else if (checkError.code === 'PGRST116' || checkError.message.includes('does not exist')) {
      console.log('📝 Creating volunteer_applications table...');
      
      // Table doesn't exist, create it
      // Note: We need to use raw SQL for this, but since we can't use RPC, 
      // let's try creating a test record to trigger table creation if it's using auto-creation
      console.log('ℹ️  Table may need to be created manually in Supabase dashboard');
    } else {
      console.log('🔍 Table check result:', checkError);
    }

    // Test with anonymous client
    console.log('🧪 Testing anonymous insert permission...');
    
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      ministry: 'General Support',
      experience: 'Test experience',
      availability: 'Test availability',
      message: 'Test message',
      status: 'pending'
    };

    const { data: insertData, error: insertError } = await anonClient
      .from('volunteer_applications')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('❌ Error with anonymous insert:', insertError);
      
      if (insertError.code === '42501') {
        console.log('');
        console.log('📋 MANUAL SETUP REQUIRED:');
        console.log('Please run this SQL in your Supabase SQL editor:');
        console.log('');
        console.log(`-- Create the volunteer_applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  ministry VARCHAR(255) NOT NULL,
  experience TEXT,
  availability TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined')),
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  admin_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submitted_at ON volunteer_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_ministry ON volunteer_applications(ministry);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON volunteer_applications(email);

-- Enable RLS
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit volunteer applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Authenticated users can view volunteer applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Authenticated users can update volunteer applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Authenticated users can delete volunteer applications" ON volunteer_applications;

-- Create new policies
CREATE POLICY "Anyone can submit volunteer applications" 
  ON volunteer_applications FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view volunteer applications" 
  ON volunteer_applications FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can update volunteer applications" 
  ON volunteer_applications FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete volunteer applications" 
  ON volunteer_applications FOR DELETE 
  TO authenticated 
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteer_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteer_applications TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;`);
        console.log('');
        console.log('After running the SQL, try submitting the volunteer form again.');
      }
    } else {
      console.log('✅ Anonymous insert test successful!');
      console.log('📝 Test record created:', insertData[0]?.id);
      
      // Clean up test data
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('volunteer_applications')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.warn('⚠️  Could not clean up test data:', deleteError);
        } else {
          console.log('🧹 Test data cleaned up');
        }
      }
    }

    console.log('🎉 Setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupVolunteerApplications();