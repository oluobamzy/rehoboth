// src/app/auth/login/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/services/supabase';
import Button from '@/components/common/Button';
import { posthog } from '@/services/posthog';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if this is an admin-related login (either direct admin route or coming from admin area)
  const redirectUrl = searchParams.get('redirectUrl') || searchParams.get('returnUrl') || '/';
  const isAdminLogin = redirectUrl.includes('/admin') || redirectUrl === '/';
  
  console.log('Login page - Redirect URL:', redirectUrl, 'Is Admin Login:', isAdminLogin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use our custom auth context for login, which implements rate limiting
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for rate limit errors (429)
        if (error.status === 429 && 'retryAfter' in error) {
          const retryAfter = (error as any).retryAfter || 60;
          setError(`Too many login attempts. Please try again in ${retryAfter} seconds.`);
        } else {
          throw error;
        }
        return;
      }

      // Get the session to verify login was successful
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Login succeeded but no session was created. Please try again.');
      }
      
      // Get the user
      const user = session.user;
      
      // Debug the user's role
      console.log('User logged in:', {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        aud: user.aud
      });
      
      // Track success event
      if (user) {
        posthog.capture('user_login_success', {
          userId: user.id,
        });
      }

      console.log(`Login successful, redirecting to: ${redirectUrl}`);
      console.log('Available URL params:', {
        redirectUrl: searchParams.get('redirectUrl'),
        returnUrl: searchParams.get('returnUrl'),
        finalRedirect: redirectUrl,
        isAdminLogin
      });
      
      // Ensure the session is properly established and redirect immediately
      const { data: { session: confirmedSession } } = await supabase.auth.getSession();
      
      if (confirmedSession?.user) {
        console.log(`Authenticated as: ${confirmedSession.user.email}`);
        console.log('App metadata:', JSON.stringify(confirmedSession.user.app_metadata));
        
        // If user is admin, always redirect to admin dashboard unless specifically requesting another admin page
        const isAdmin = confirmedSession.user.app_metadata?.role === 'admin';
        let finalRedirectUrl = redirectUrl;
        
        if (isAdmin) {
          if (redirectUrl === '/' || !redirectUrl.includes('/admin')) {
            finalRedirectUrl = '/admin/dashboard';
            console.log('Admin user logging in, redirecting to admin dashboard');
          } else if (redirectUrl.includes('/admin')) {
            // Keep the specific admin page they were trying to access
            finalRedirectUrl = redirectUrl;
            console.log('Admin user returning to specific admin page:', finalRedirectUrl);
          }
        }
        
        console.log(`Final redirect URL: ${finalRedirectUrl}`);
        
        // Use router.replace to prevent back button going to login page
        router.replace(finalRedirectUrl);
      } else {
        console.warn('Login succeeded but session not immediately available, using fallback redirect');
        // Fallback: redirect after a brief delay to allow session to be established
        setTimeout(() => {
          const fallbackUrl = isAdminLogin ? '/admin/dashboard' : redirectUrl;
          console.log('Fallback redirect to:', fallbackUrl);
          router.replace(fallbackUrl);
        }, 500);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'An error occurred during login');
        posthog.capture('user_login_error', {
          error: error.message,
        });
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[600px] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
