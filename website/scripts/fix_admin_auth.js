// scripts/fix_admin_auth.js
// This script helps diagnose admin authentication issues by checking session data
// Run with: node scripts/fix_admin_auth.js your-admin-email@example.com

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create admin client with service role key (has elevated permissions)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const adminEmail = process.argv[2];
  
  if (!adminEmail) {
    console.error('❌ Please provide an admin email address');
    console.log('Usage: node scripts/fix_admin_auth.js your-admin-email@example.com');
    process.exit(1);
  }
  
  try {
    console.log(`🔍 Checking user with email: ${adminEmail}`);
    
    // Get user by email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(adminEmail);
    
    if (userError) {
      throw new Error(`Error getting user: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error(`No user found with email ${adminEmail}`);
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      app_metadata: user.app_metadata || {},
      user_metadata: user.user_metadata || {}
    });
    
    // Check if user has admin role in app_metadata
    const hasAdminRole = user.app_metadata?.role === 'admin';
    
    if (hasAdminRole) {
      console.log('✅ User already has admin role in app_metadata');
    } else {
      // Set admin role in app_metadata
      console.log('⚠️ User does not have admin role in app_metadata. Adding it now...');
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id, 
        { app_metadata: { role: 'admin', provider: user.app_metadata?.provider || 'email', providers: user.app_metadata?.providers || ['email'] } }
      );
      
      if (updateError) {
        throw new Error(`Error updating user: ${updateError.message}`);
      }
      
      console.log('✅ Added admin role to app_metadata');
    }
    
    // Check user_roles table as fallback
    console.log('🔍 Checking user_roles table...');
    
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
      
    if (rolesError) {
      if (rolesError.message.includes('does not exist')) {
        console.log('⚠️ user_roles table does not exist. Creating it...');
        
        // Create user_roles table
        const { error: createTableError } = await supabaseAdmin.rpc('exec', {
          query: `
            CREATE TABLE IF NOT EXISTS user_roles (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              role VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
          `
        });
        
        if (createTableError) {
          console.log('❌ Failed to create user_roles table:', createTableError.message);
        } else {
          console.log('✅ Created user_roles table');
        }
      } else {
        console.log('❌ Error checking user_roles:', rolesError.message);
      }
    } else {
      // Check if user has admin role in user_roles table
      const hasAdminRoleInTable = userRoles?.some(r => r.role === 'admin');
      
      if (hasAdminRoleInTable) {
        console.log('✅ User already has admin role in user_roles table');
      } else {
        console.log('⚠️ User does not have admin role in user_roles table. Adding it now...');
        
        // Add admin role to user_roles table
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });
          
        if (insertError) {
          console.log('❌ Failed to add admin role to user_roles table:', insertError.message);
        } else {
          console.log('✅ Added admin role to user_roles table');
        }
      }
    }
    
    // Revoke all sessions to force re-login with new metadata
    console.log('🔄 Revoking sessions to force refresh...');
    const { error: revokeError } = await supabaseAdmin.auth.admin.revokeAllSessionsForUser(user.id);
    
    if (revokeError) {
      console.log('❌ Failed to revoke sessions:', revokeError.message);
    } else {
      console.log('✅ All sessions revoked. User will need to login again.');
    }
    
    console.log('\n🎉 Admin role setup complete! Please have the user login again.');
    console.log('\n📋 Instructions for the user:');
    console.log('1. Logout from the application');
    console.log('2. Clear browser cookies for your site');
    console.log('3. Login again with your credentials');
    console.log('4. Try accessing the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
