'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface InviteDetails {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  invited_by_email: string;
  invited_by_name?: string;
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (token) {
      validateInvite();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/auth/invite/validate?token=${token}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvite(data.invite);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid or expired invitation');
      }
    } catch (err) {
      console.error('Failed to validate invite:', err);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setAcceptLoading(true);

    try {
      // Step 1: Validate the invitation
      const validateResponse = await fetch('/api/auth/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          fullName,
        }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        alert(`Failed to validate invitation: ${errorData.error}`);
        return;
      }

      const { invitation } = await validateResponse.json();

      // Step 2: Sign up the user using Supabase client
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        alert(`Failed to create account: ${signUpError.message}`);
        return;
      }

      if (!signUpData.user) {
        alert('Failed to create account. Please try again.');
        return;
      }

      // Step 3: Complete the invitation (assign role)
      const completeResponse = await fetch('/api/auth/invite/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          fullName,
        }),
      });

      if (completeResponse.ok) {
        alert('Account created successfully! Your admin role has been assigned. You can now sign in.');
        router.push('/auth/login');
      } else {
        const errorData = await completeResponse.json();
        alert(`Account created but failed to assign role: ${errorData.error}. Please contact support.`);
        router.push('/auth/login');
      }
    } catch (err) {
      console.error('Failed to accept invite:', err);
      alert('Failed to create account. Please try again.');
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/auth/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Admin Invitation</h2>
          <p className="text-gray-600 mt-2">
            You've been invited to join as {invite?.role}
          </p>
        </div>

        {invite && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {invite.email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Role:</strong> {invite.role}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Invited by:</strong> {invite.invited_by_name || invite.invited_by_email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Expires:</strong> {new Date(invite.expires_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <form onSubmit={acceptInvite} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={acceptLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptLoading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}