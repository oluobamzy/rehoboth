// src/app/auth/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import MainLayout from '@/components/common/MainLayout';
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
          metadata: { reason: 'rate_limit' }
        });
        
        setError(rateLimit.message || 'Too many password reset attempts. Please try again later.');
        return;
      }
      
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Log successful password reset request
      await logAuthEvent(AuthEvent.PASSWORD_RESET_REQUEST, {
        email,
      });

      setMessage('Check your email for a password reset link.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        
        // Log failed password reset attempt
        await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
          email,
          errorMessage: error.message
        });
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
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
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send reset instructions'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
