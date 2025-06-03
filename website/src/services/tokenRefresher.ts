'use client';

import { supabase } from './supabase';

export const setupTokenRefresher = () => {
  // Set up automatic token refresh before expiry
  let refreshTimeout: NodeJS.Timeout | null = null;

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        return;
      }
      
      if (data.session) {
        const expiresIn = new Date(data.session.expires_at || 0).getTime() - Date.now();
        const refreshDelay = Math.max(5000, expiresIn - (60 * 1000)); // Refresh 1 minute before expiry
        
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        refreshTimeout = setTimeout(refreshSession, refreshDelay);
      }
    } catch (error) {
      console.error('Error in token refresh:', error);
    }
  };

  // Initialize the first refresh cycle
  const initRefresher = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const expiresIn = new Date(data.session.expires_at || 0).getTime() - Date.now();
      const refreshDelay = Math.max(5000, expiresIn - (60 * 1000)); // Refresh 1 minute before expiry
      
      refreshTimeout = setTimeout(refreshSession, refreshDelay);
    }
  };

  // Clean up on component unmount
  const cleanupRefresher = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  };

  return { initRefresher, cleanupRefresher };
};
