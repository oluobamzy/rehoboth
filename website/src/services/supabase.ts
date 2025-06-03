"use client";

// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Default to a valid URL structure if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if we're using placeholder values
const isUsingDefaults = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';

if (isUsingDefaults) {
  console.warn('⚠️ Supabase URL or Anon Key not properly configured. Database functionality will not work.');
  
  if (process.env.NODE_ENV === 'development') {
    console.info('To fix this issue:');
    console.info('1. Create a .env.local file in the root directory if it doesn\'t exist');
    console.info('2. Add the following lines with your actual values:');
    console.info('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.info('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.info('3. See DATABASE_SETUP.md for full instructions');
    console.info('4. Restart your development server');
  }
}

// Create client with automatic token refresh and session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // For enhanced security, set shorter session duration (8 hours)
    // This overrides the Supabase project settings
    flowType: 'pkce',
  },
});

// Helper function to check connection status
export const checkSupabaseConnection = async () => {
  try {
    // Perform a simple query to check the connection, e.g., select the current version
    const { /*data,*/ error } = await supabase.rpc('get_postgres_version'); // 'data' is assigned a value but never used.

    if (error) throw error;
    return { connected: true };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return { 
      connected: false,
      error: isUsingDefaults ? 
        'Using placeholder Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' : 
        'Could not connect to Supabase. Check your credentials and network connection.'
    };
  }
};
