// src/app/auth/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import Button from '@/components/common/Button';
import Link from 'next/link';
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
      // Check for error in URL hash first
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      
      if (error) {
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          setError('Password reset link has expired. Please request a new password reset.');
        } else {
          setError(`Reset failed: ${errorDescription || error}`);
        }
        return;
      }

      // Check for session
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
    
    if (!handlePasswordValidation(password)) {
      setError('Please fix the password issues before continuing.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({ 
        password
      });
      
      if (updateError) {
        await logAuthEvent(AuthEvent.PASSWORD_RESET_FAILURE, {
          errorMessage: updateError.message
        });
        
        throw updateError;
      }
      
      // Log successful password reset
      await logAuthEvent(AuthEvent.PASSWORD_RESET_SUCCESS, {});
      
      setMessage('Your password has been reset successfully.');
      
      // Optional: Sign out the user after password reset
      await supabase.auth.signOut();
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  />
                </div>
                {password !== confirmPassword && confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Setting New Password...' : 'Set New Password'}
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
  );
}
