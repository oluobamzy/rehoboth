'use client';

import { supabase } from './supabase';

export const setupTokenRefresher = () => {
  // Set up automatic token refresh before expiry
  let refreshTimeout: NodeJS.Timeout | null = null;
  let lastRefreshTime = 0; // Track last refresh time to prevent too frequent refreshes

  const refreshSession = async () => {
    try {
      // Prevent refreshing too frequently
      const now = Date.now();
      if (now - lastRefreshTime < 5 * 60 * 1000) { // Don't refresh more often than every 5 minutes
        console.log('Skipping refresh as last refresh was less than 5 minutes ago');
        return;
      }
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        return;
      }
      
      if (data.session) {
        lastRefreshTime = now;
        
        // Calculate time until token expiry
        const expiresIn = new Date(data.session.expires_at || 0).getTime() - Date.now();
        
        // Refresh 5 minutes before expiry, but not sooner than 30 minutes from now
        // This ensures we're not refreshing too often
        const refreshDelay = Math.max(30 * 60 * 1000, expiresIn - (5 * 60 * 1000));
        
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        console.log(`Next token refresh scheduled in ${Math.round(refreshDelay/60000)} minutes`);
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
      
      // Only schedule refresh if token expires in less than 30 minutes
      // Otherwise, schedule refresh for 30 minutes before expiration
      const refreshDelay = expiresIn < 30 * 60 * 1000 
        ? Math.max(60 * 1000, expiresIn - (2 * 60 * 1000)) // 2 minutes before expiry if expiring soon
        : Math.max(5 * 60 * 1000, expiresIn - (30 * 60 * 1000)); // 30 minutes before expiry
      
      console.log(`First token refresh scheduled in ${Math.round(refreshDelay/60000)} minutes`);
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
