// src/services/auth.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from './store';
import { setupTokenRefresher } from './tokenRefresher';
import { checkRateLimit } from './authRateLimiter';
import { logAuthEvent, AuthEvent } from './authLogger';


// Define public and admin paths
const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/about', '/contact']; // Add other public paths
const adminPaths = ['/admin']; // Prefixes for admin routes

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setIsLoading } = useAuthStore();
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Setup token refresher
    const { initRefresher, cleanupRefresher } = setupTokenRefresher();
    
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          // const user = await fetchUserProfile(currentSession.user.id); // 'user' is assigned a value but never used.
          // setUserRole(user?.role || null);
          // If you have a way to get the role directly or from the session, use that.
          setUserRole(currentSession.user.app_metadata?.role || null);
          
          // Initialize token refresher when we have a session
          initRefresher();
        } else {
          setUserRole(null);
        }
      } catch (e /*: any*/) { // Explicitly type e as any or a more specific error type
        console.error("Error fetching session:", e);
        setSession(null);
        setUserRole(null);
      }
      setIsLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setSupabaseUser(newSession?.user ?? null); // Keep supabaseUser in sync
      if (newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id);
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe(); // Correct way to unsubscribe
      cleanupRefresher(); // Clean up token refresher
    };
  }, [setIsLoading]); // Removed user, setUser from dependencies as they come from zustand and should not cause re-runs of this effect.

  useEffect(() => {
    if (!isLoading && !session && !publicPaths.includes(pathname) && pathname !== '/auth/login') {
      // console.log('Redirecting to login from AuthProvider');
      // router.push('/auth/login'); // Let middleware handle this
    } else if (!isLoading && session && userRole !== 'admin' && adminPaths.some((p: string) => pathname.startsWith(p))) { // Add type for p
      // console.log('Redirecting to unauthorized from AuthProvider');
      // router.push('/unauthorized'); // Let middleware handle this
    }
  }, [session, userRole, isLoading, pathname, router]); // Add router to dependency array

  const signIn = async (email: string, password: string) => {
    // Check rate limit before attempting login
    const rateLimit = await checkRateLimit(email, 'login');
    
    if (!rateLimit.allowed) {
      // Log rate limit exceeded
      await logAuthEvent(AuthEvent.LOGIN_FAILURE, {
        email,
        errorMessage: 'Rate limit exceeded',
        metadata: { reason: 'rate_limit' }
      });
      
      return { 
        error: {
          message: rateLimit.message || 'Too many login attempts. Please try again later.',
          status: 429,
          retryAfter: rateLimit.retryAfter
        }
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Log failed login attempt
      await logAuthEvent(AuthEvent.LOGIN_FAILURE, {
        email,
        errorMessage: error.message,
        metadata: { code: error.code }
      });
    } else if (data.user) {
      // Log successful login
      await logAuthEvent(AuthEvent.LOGIN_SUCCESS, {
        userId: data.user.id,
        email: data.user.email
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Check rate limit before attempting signup
    const rateLimit = await checkRateLimit(email, 'signup');
    
    if (!rateLimit.allowed) {
      // Log rate limit exceeded for signup
      await logAuthEvent(AuthEvent.SIGNUP_FAILURE, {
        email,
        errorMessage: 'Rate limit exceeded',
        metadata: { reason: 'rate_limit' }
      });
      
      return { 
        data: null,
        error: {
          message: rateLimit.message || 'Too many signup attempts. Please try again later.',
          status: 429,
          retryAfter: rateLimit.retryAfter
        }
      };
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      // Log signup failure
      await logAuthEvent(AuthEvent.SIGNUP_FAILURE, {
        email,
        errorMessage: error.message,
        metadata: { code: error.code }
      });
    } else if (data.user) {
      // Log signup success
      await logAuthEvent(AuthEvent.SIGNUP_SUCCESS, {
        userId: data.user.id,
        email: data.user.email,
        metadata: { emailConfirmed: !!data.user.email_confirmed_at }
      });
    }
    
    return { data, error };
  };

  const signOut = async () => {
    // Get user info before signing out
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.auth.signOut();
    
    // Log logout event
    if (user) {
      await logAuthEvent(AuthEvent.LOGOUT, {
        userId: user.id,
        email: user.email
      });
    }
    
    setUser(null);
    setSupabaseUser(null); // Clear supabaseUser on signout
    setUserRole(null); // Clear userRole on signout
  };

  const value = {
    signIn,
    signUp,
    signOut,
    user: supabaseUser, // Use supabaseUser which is updated on auth state change
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to fetch user profile (including role)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchUserProfile(userId: string): Promise<{ role: string | null } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      // console.error('Error fetching user profile:', error); // 'error' is assigned a value but never used.
      return null;
    }
    return data ? { role: data.role } : null;
  } catch (e: any) { // Explicitly type e as any or a more specific error type
    console.error('Exception fetching user profile:', e);
    return null;
  }
}
