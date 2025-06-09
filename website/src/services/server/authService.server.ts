// src/services/server/authService.server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { User } from '@supabase/supabase-js';

// Create a cached function to get the session
export const getSession = cache(async () => {
  const supabase = createServerComponentClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
});

// Get the current user
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

// Check if a user is an admin
export const isUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = createServerComponentClient({ cookies });
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      user_email: user.email
    });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
});

// Helper function to require admin access
export async function requireAdmin() {
  const isAdmin = await isUserAdmin();
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
