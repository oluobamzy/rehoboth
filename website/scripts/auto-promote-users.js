// Auto-promote new users to admin
// Run this script periodically or after creating new users in Supabase dashboard
// Usage: node scripts/auto-promote-users.js

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function autoPromoteUsers() {
  console.log('🔍 Checking for users without admin privileges...\n');

  try {
    // Get all users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }

    const usersToPromote = users.users.filter(user => user.app_metadata?.role !== 'admin');
    
    if (usersToPromote.length === 0) {
      console.log('✅ All users already have admin privileges!');
      return;
    }

    console.log(`📋 Found ${usersToPromote.length} users to promote:`);
    usersToPromote.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });

    console.log('\n🔧 Promoting users to admin...');

    for (const user of usersToPromote) {
      console.log(`\nProcessing ${user.email}...`);
      
      try {
        // Update app_metadata to include admin role
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id, 
          { 
            app_metadata: { 
              ...user.app_metadata,
              role: 'admin',
              provider: user.app_metadata?.provider || 'email',
              providers: user.app_metadata?.providers || ['email']
            } 
          }
        );
        
        if (updateError) {
          throw new Error(`Error updating user: ${updateError.message}`);
        }
        
        console.log('  ✅ Successfully added admin role to app_metadata');
        
        // Also add to user_roles table as backup
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: user.id, 
            role: 'admin' 
          });
        
        if (roleError) {
          if (roleError.message.includes('duplicate key')) {
            console.log('  ℹ️ User already exists in user_roles table');
          } else {
            console.log('  ⚠️ Could not add to user_roles table:', roleError.message);
          }
        } else {
          console.log('  ✅ Also added to user_roles table');
        }
        
      } catch (error) {
        console.error(`  ❌ Error promoting ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Auto-promotion completed!');
    console.log('\n💡 Tip: Run this script whenever you create new users in the Supabase dashboard to automatically grant them admin privileges.');
    
  } catch (error) {
    console.error('❌ Error in auto-promotion:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  autoPromoteUsers();
}

module.exports = { autoPromoteUsers };