// src/app/auth/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/services/supabase';
import Button from '@/components/common/Button';
import { logAuthEvent, AuthEvent } from '@/services/authLogger';
import { checkRateLimit } from '@/services/authRateLimiter';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      // Check rate limit before attempting password reset
      const rateLimit = await checkRateLimit(email, 'reset');
      
      if (!rateLimit.allowed) {
        // Log rate limit exceeded
        await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
          email,
          errorMessage: 'Rate limit exceeded',
        });
        
        setError(`Too many reset attempts. Please try again in ${rateLimit.retryAfter} seconds.`);
        return;
      }
      
      // Attempt to send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        // Log failure
        await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
          email,
          errorMessage: resetError.message,
        });
        
        setError(resetError.message);
      } else {
        // Log success
        await logAuthEvent(AuthEvent.PASSWORD_RESET_REQUEST, {
          email,
        });
        
        setMessage(
          'If an account exists with that email, you will receive password reset instructions shortly.'
        );
        
        // Optional: Redirect after a delay
        // setTimeout(() => {
        //   router.push('/auth/login');
        // }, 5000);
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
        email,
        errorMessage: err.message,
      });
      
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[600px] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Sending reset link...' : 'Send reset link'}
                </Button>
              </div>
              
              <div className="text-sm text-center">
                <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark">
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
