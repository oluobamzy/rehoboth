// src/app/auth/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import MainLayout from '@/components/common/MainLayout';
import Button from '@/components/common/Button';
import { logAuthEvent, AuthEvent } from '@/services/authLogger';
import { validatePassword } from '@/utils/passwordValidator';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Invalid or expired password reset link. Please request a new password reset.');
      } else {
        setHasSession(true);
      }
    };

    checkSession();
  }, []);

  const handlePasswordValidation = (value: string) => {
    const { errors } = validatePassword(value);
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (!handlePasswordValidation(password)) {
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      // Get user data to log the event
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log successful password reset
      if (user) {
        await logAuthEvent(AuthEvent.PASSWORD_RESET_SUCCESS, {
          userId: user.id,
          email: user.email,
        });
      }

      setMessage('Your password has been successfully reset.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        
        // Log failed password reset
        const { data: { user } } = await supabase.auth.getUser();
        await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
          userId: user?.id,
          email: user?.email,
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
            Set new password
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
            ) : hasSession ? (
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        handlePasswordValidation(e.target.value);
                      }}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                  </div>
                  {passwordErrors.length > 0 && (
                    <ul className="mt-1 text-sm text-red-600 list-disc pl-5">
                      {passwordErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading || passwordErrors.length > 0 || password !== confirmPassword}
                    className="w-full"
                  >
                    {isLoading ? 'Updating...' : 'Reset password'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
