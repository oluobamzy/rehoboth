"use client";

import { supabase } from '@/services/supabase';

// Check if we're using placeholder values
const isUsingDefaults = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  if (isUsingDefaults) {
    return {
      connected: false,
      error: 'Using placeholder Supabase credentials',
      message: 'Database not properly configured',
      details: 'Your application is running with default Supabase credentials. Database operations will not work until you properly configure your environment variables.'
    };
  }
  
  try {
    // Try to query a simple table to check the connection
    const { error } = await supabase.from('sermon_series').select('id').limit(1);
    
    if (error) {
      return {
        connected: false,
        error: error.message,
        message: 'Database connection failed',
        details: `Error code: ${error.code}. Please check your Supabase configuration.`
      };
    }
    
    return { 
      connected: true,
      message: 'Database connected successfully',
      details: ''
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    
    return {
      connected: false,
      error: errorMessage,
      message: 'Database connection failed',
      details: 'An unexpected error occurred while connecting to the database.'
    };
  }
};

// Display warning messages in development
if (process.env.NODE_ENV === 'development' && isUsingDefaults) {
  console.warn('⚠️ Supabase URL or Anon Key not properly configured. Database functionality will not work.');
  console.info('To fix this issue:');
  console.info('1. Create a .env.local file in the root of your project');
  console.info('2. Add the following lines with your actual values:');
  console.info('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.info('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.info('3. Restart your development server');
}

// Create a mock database for development with default credentials
export const createMockData = () => {
  return {
    sermons: [],
    series: [],
    speakers: [],
    tags: []
  };
};
