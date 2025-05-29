// scripts/setupAuthTables.js
// This script sets up the authentication tables for the Rehoboth Church website
// To run this script: node scripts/setupAuthTables.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAuthTables() {
  try {
    console.log('Creating authentication tables...');

    // Create profiles table to extend Supabase auth users
    const createProfilesSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Create user_roles table for role-based access control
    const createUserRolesSQL = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'editor')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, role)
      );
    `;

    // Create indexes for faster lookups
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);
    `;

    // Execute the SQL queries
    const { error: profilesError } = await supabase.rpc('exec', { query: createProfilesSQL });
    if (profilesError) throw new Error(`Error creating profiles table: ${profilesError.message}`);
    
    const { error: userRolesError } = await supabase.rpc('exec', { query: createUserRolesSQL });
    if (userRolesError) throw new Error(`Error creating user_roles table: ${userRolesError.message}`);
    
    const { error: indexesError } = await supabase.rpc('exec', { query: createIndexesSQL });
    if (indexesError) throw new Error(`Error creating indexes: ${indexesError.message}`);

    console.log('✅ Authentication tables and indexes created successfully');
  } catch (error) {
    console.error('Error creating authentication tables:', error.message);
  }
}

async function createTriggers() {
  try {
    console.log('Creating authentication triggers and functions...');

    // Create function to handle new user signups
    const createUserHandlerFunctionSQL = `
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Create an entry in the profiles table
        INSERT INTO profiles (id, first_name, last_name)
        VALUES (NEW.id, '', '');
        
        -- Set default role to 'user'
        INSERT INTO user_roles (user_id, role)
        VALUES (NEW.id, 'user');
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Create trigger for new user signups
    const createUserTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `;

    // Execute the SQL queries
    const { error: functionError } = await supabase.rpc('exec', { query: createUserHandlerFunctionSQL });
    if (functionError) throw new Error(`Error creating user handler function: ${functionError.message}`);
    
    const { error: triggerError } = await supabase.rpc('exec', { query: createUserTriggerSQL });
    if (triggerError) throw new Error(`Error creating user trigger: ${triggerError.message}`);

    console.log('✅ Authentication triggers and functions created successfully');
  } catch (error) {
    console.error('Error creating authentication triggers:', error.message);
  }
}

async function setupRBAC() {
  try {
    console.log('Setting up Row Level Security policies...');

    // Enable RLS on profiles
    const enableProfilesRLSSQL = `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    `;

    // Create profile policies
    const createProfilePoliciesSQL = `
      -- Profile read policy (users can read their own profile)
      CREATE POLICY IF NOT EXISTS "Users can read own profile"
        ON profiles FOR SELECT
        USING (auth.uid() = id);
        
      -- Profile update policy (users can update their own profile)
      CREATE POLICY IF NOT EXISTS "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
    `;

    // Enable RLS on user_roles
    const enableUserRolesRLSSQL = `
      ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    `;

    // Create user_roles policies
    const createUserRolesPoliciesSQL = `
      -- Users can read their own roles
      CREATE POLICY IF NOT EXISTS "Users can read own roles"
        ON user_roles FOR SELECT
        USING (auth.uid() = user_id);
        
      -- Only admin users can insert/update/delete roles
      CREATE POLICY IF NOT EXISTS "Admins can manage all roles"
        ON user_roles FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
    `;

    // Execute the SQL queries
    const { error: enableProfilesRLSError } = await supabase.rpc('exec', { query: enableProfilesRLSSQL });
    if (enableProfilesRLSError) throw new Error(`Error enabling RLS on profiles: ${enableProfilesRLSError.message}`);
    
    const { error: profilePoliciesError } = await supabase.rpc('exec', { query: createProfilePoliciesSQL });
    if (profilePoliciesError) throw new Error(`Error creating profile policies: ${profilePoliciesError.message}`);
    
    const { error: enableUserRolesRLSError } = await supabase.rpc('exec', { query: enableUserRolesRLSSQL });
    if (enableUserRolesRLSError) throw new Error(`Error enabling RLS on user_roles: ${enableUserRolesRLSError.message}`);
    
    const { error: userRolesPoliciesError } = await supabase.rpc('exec', { query: createUserRolesPoliciesSQL });
    if (userRolesPoliciesError) throw new Error(`Error creating user_roles policies: ${userRolesPoliciesError.message}`);

    console.log('✅ Row Level Security policies created successfully');
  } catch (error) {
    console.error('Error setting up RBAC:', error.message);
  }
}

// Main function to execute setup
async function main() {
  try {
    // Check if exec function exists, create if not
    const { data: functionExists, error: checkError } = await supabase.rpc('exec', { query: 'SELECT 1' });
    
    if (checkError && checkError.message.includes('function exec does not exist')) {
      console.log('Creating exec function for SQL execution...');
      
      // Create the exec function
      const { error: createFunctionError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION exec(query text)
          RETURNS VOID AS $$
          BEGIN
            EXECUTE query;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (createFunctionError) {
        // If the exec_sql function doesn't exist either, we need to create it first
        const { error } = await supabase.sql(`
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS JSONB AS $$
          BEGIN
            EXECUTE sql;
            RETURN '{"success": true}'::JSONB;
          END;
          $$ LANGUAGE plpgsql;
        `);
        
        if (error) throw new Error(`Error creating exec_sql function: ${error.message}`);
        
        // Now create the exec function
        const { error: retryError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION exec(query text)
            RETURNS VOID AS $$
            BEGIN
              EXECUTE query;
            END;
            $$ LANGUAGE plpgsql;
          `
        });
        
        if (retryError) throw new Error(`Error creating exec function: ${retryError.message}`);
      }
      
      console.log('✅ SQL execution function created');
    }

    // Run the setup functions
    await createAuthTables();
    await createTriggers();
    await setupRBAC();
    
    console.log('✓✓ Authentication system setup complete');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
