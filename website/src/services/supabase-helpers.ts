"use client";

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Modified to accept an optional context
// This function is intended for server-side use (e.g., Route Handlers, Server Components, middleware)
// For client-side, use the global `supabase` client directly.
export function createSupabaseServerClient(context?: { req: any; res: any }) {
  if (context) {
    return createPagesServerClient(context);
  }
  // This fallback is for App Router server components/actions where context isn't passed explicitly
  // but relies on `cookies()` from `next/headers`. This is the part that can be tricky.
  // The library might not fully support this usage pattern as it's geared towards Pages Router.
  const cookieStore = cookies(); 
  return createPagesServerClient({ cookies: () => cookieStore } as any); // Casting to any to bypass strict type checks
}

// Helper function to check connection status
export const checkSupabaseConnection = async () => {
  try {
    // Try to query a simple table - this will be replaced with an appropriate table in your DB
    const { error } = await supabase.from('sermon_series').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return { 
        connected: false, 
        error: error.message || 'Could not connect to database'
      };
    }
    
    return { connected: true };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    
    return { 
      connected: false,
      error: errorMessage
    };
  }
};

// Helper to improve error messages from Supabase
export const formatSupabaseError = (error: any): string => {
  if (!error) return 'Unknown error';
  
  // Format common Supabase errors
  if (error.code === 'PGRST116') {
    return 'No rows returned from the query. The requested resource might not exist.';
  }
  
  if (error.code === '23505') {
    return 'A record with this information already exists.';
  }
  
  if (error.code === '42P01') {
    return 'Database table not found. The database schema might be missing.';
  }
  
  if (error.message?.includes('FetchError')) {
    return 'Network error. Could not connect to the database.';
  }
  
  // Return the original error message if available
  return error.message || 'An unknown database error occurred';
};

export async function getSupabaseUser(): Promise<User | null> { 
    try {
        // When calling from a server context where req/res are available (e.g. an old API route),
        // you would pass the context: getSupabaseUser({ req, res })
        // For App Router server components/actions, we rely on the cookies() fallback.
        const supabaseClient = createSupabaseServerClient(); 
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    } catch (e: any) { 
        console.error("Error getting Supabase user (server client):", e.message);
        // Fallback to client-side supabase instance if server-side fails or in client context
        try {
          const { data: { user: clientUser } } = await supabase.auth.getUser();
          if (clientUser) return clientUser;
        } catch (clientError: any) {
          console.error("Error getting Supabase user (client fallback):", clientError.message);
        }
        return null;
    }
}
