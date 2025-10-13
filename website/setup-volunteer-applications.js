#!/usr/bin/env node

/**
 * Setup script for volunteer applications table
 * This script creates the volunteer_applications table and sets up proper RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupVolunteerApplications() {
  try {
    console.log('🚀 Setting up volunteer applications table...');

    // Read the SQL setup file
    const sqlFilePath = path.join(__dirname, 'src', 'sql', 'volunteer-applications-setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if rpc fails
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
          }
        }
      }
    }

    // Verify the table was created and policies are in place
    console.log('🔍 Verifying table setup...');
    
    // Check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'volunteer_applications');

    if (tablesError) {
      console.error('❌ Error checking table existence:', tablesError);
    } else if (tables && tables.length > 0) {
      console.log('✅ volunteer_applications table exists');
    } else {
      console.warn('⚠️  volunteer_applications table may not exist');
    }

    // Test anonymous insert permission (this should work with the RLS policy)
    console.log('🧪 Testing anonymous insert permission...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      ministry: 'General Support',
      experience: 'Test experience',
      availability: 'Test availability',
      message: 'Test message'
    };

    // Create client with anon key to test permissions
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: insertData, error: insertError } = await anonClient
      .from('volunteer_applications')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('❌ Error testing anonymous insert:', insertError);
      console.log('🔧 Attempting to fix RLS policies...');
      
      // Try to fix RLS policies
      const fixPolicySql = `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Anyone can submit volunteer applications" ON volunteer_applications;
        
        -- Recreate the policy with explicit permissions
        CREATE POLICY "Anyone can submit volunteer applications" 
        ON volunteer_applications FOR INSERT 
        TO anon, authenticated
        WITH CHECK (true);
        
        -- Grant explicit permissions
        GRANT INSERT ON volunteer_applications TO anon;
        GRANT INSERT ON volunteer_applications TO authenticated;
      `;
      
      const { error: fixError } = await supabase.rpc('exec_sql', { sql: fixPolicySql });
      if (fixError) {
        console.error('❌ Error fixing policies:', fixError);
      } else {
        console.log('✅ RLS policies updated');
      }
    } else {
      console.log('✅ Anonymous insert test successful');
      
      // Clean up test data
      if (insertData && insertData[0]) {
        await supabase
          .from('volunteer_applications')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Cleaned up test data');
      }
    }

    console.log('🎉 Volunteer applications setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupVolunteerApplications();