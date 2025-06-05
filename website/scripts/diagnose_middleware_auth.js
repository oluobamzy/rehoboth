// scripts/diagnose_middleware_auth.js
// Script to diagnose and fix issues with middleware authentication
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create admin client if service key is available
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

async function main() {
  console.log('🔍 Diagnosing middleware authentication issues...');
  console.log('===============================================\n');

  // 1. Check middleware.ts 
  console.log('1. Checking middleware.ts configuration...');
  
  try {
    const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    // Check for createMiddlewareClient
    if (middlewareContent.includes('createMiddlewareClient')) {
      console.log('✅ middleware.ts uses createMiddlewareClient');
    } else {
      console.log('❌ middleware.ts does not use createMiddlewareClient');
    }
    
    // Check for cookie checks
    if (middlewareContent.includes('req.cookies.get')) {
      console.log('✅ middleware.ts accesses request cookies');
    } else {
      console.log('❌ middleware.ts does not access request cookies');
    }
    
    console.log('');
  } catch (err) {
    console.error('❌ Error reading middleware.ts:', err.message);
  }
  
  // 2. Check supabase.ts
  console.log('2. Checking supabase.ts configuration...');
  
  try {
    const supabasePath = path.join(process.cwd(), 'src', 'services', 'supabase.ts');
    const supabaseContent = fs.readFileSync(supabasePath, 'utf8');
    
    // Check for cookieOptions
    if (supabaseContent.includes('cookieOptions')) {
      console.log('✅ supabase.ts uses cookieOptions');
      
      // Extract cookieOptions configuration
      const cookieOptionsMatch = supabaseContent.match(/cookieOptions:\s*{([^}]*)}/s);
      if (cookieOptionsMatch) {
        console.log('📋 Cookie configuration:');
        const options = cookieOptionsMatch[1].trim().split('\n').map(line => line.trim()).join('\n  ');
        console.log(`  ${options}`);
      }
    } else {
      console.log('❌ supabase.ts does not use cookieOptions');
    }
    
    console.log('');
  } catch (err) {
    console.error('❌ Error reading supabase.ts:', err.message);
  }
  
  // 3. Check current admin users
  console.log('3. Checking admin users in the database...');
  
  if (supabaseAdmin) {
    try {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      const adminUsers = users.users.filter(user => 
        user.app_metadata?.role === 'admin'
      );
      
      if (adminUsers.length === 0) {
        console.log('❌ No users found with admin role in app_metadata');
      } else {
        console.log(`✅ Found ${adminUsers.length} users with admin role:`);
        adminUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.id})`);
        });
      }
      
      console.log('');
    } catch (err) {
      console.error('❌ Error listing users:', err.message);
    }
  } else {
    console.log('⚠️ Cannot check admin users: SUPABASE_SERVICE_ROLE_KEY not set');
    console.log('');
  }
  
  // 4. Suggest fixes
  console.log('4. Recommendations:');
  console.log('------------------');
  console.log('1. Update supabase.ts to use standard cookie configuration:');
  console.log(`
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      cookieOptions: {
        name: 'sb-auth',
        lifetime: 60 * 60 * 8, // 8 hours
        domain: '',
        path: '/',
        sameSite: 'lax'
      },
    },
  });`);
  
  console.log('\n2. Run the admin user fix script:');
  console.log('   node scripts/fix_admin_auth.js your-admin-email@example.com');
  
  console.log('\n3. Clear browser cookies and local storage, then log in again');
  
  console.log('\n4. Use the debug tool:');
  console.log('   Open /fix_auth_session.html in your browser');
  
  console.log('\n5. Check middleware logs to see if session is detected');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
