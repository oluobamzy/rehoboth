// src/components/auth/MFASetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import Button from '@/components/common/Button';

export default function MFASetup() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);

  useEffect(() => {
    checkExistingMFA();
  }, []);

  async function checkExistingMFA() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        throw error;
      }
      
      // Handle potentially null data with a fallback empty array
      const enrolledFactors = data?.totp || [];
      setHasMFA(enrolledFactors.length > 0);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  }

  async function setupMFA() {
    setIsLoading(true);
    setError(null);
    try {
      // Enroll for TOTP (Time-based One-Time Password)
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      
      if (error) {
        throw error;
      }
      
      // Set the factor ID and QR code for verification
      setFactorId(data.id);
      setQr(data.totp.qr_code);
    } catch (error: any) {
      setError(error.message || 'Failed to set up MFA');
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyMFA() {
    if (!factorId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      setHasMFA(true);
    } catch (error: any) {
      setError(error.message || 'Failed to verify MFA code');
    } finally {
      setIsLoading(false);
    }
  }

  async function disableMFA() {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      // Handle potentially null data with a fallback empty object
      const factor = data?.totp?.[0];
      
      if (factor?.id) {
        const { error } = await supabase.auth.mfa.unenroll({ 
          factorId: factor.id 
        });
        
        if (error) {
          throw error;
        }
        
        setHasMFA(false);
        setSuccess(false);
        setQr(null);
        setFactorId(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  }

  if (hasMFA) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Two-factor authentication is enabled</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your account is secured with two-factor authentication.
        </p>
        <div className="mt-4">
          <Button
            onClick={disableMFA}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Disabling...' : 'Disable two-factor authentication'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">Set up two-factor authentication</h3>
      <p className="mt-2 text-sm text-gray-500">
        Add an extra layer of security to your account by requiring a verification code in addition to your password.
      </p>
      
      {!qr ? (
        <div className="mt-4">
          <Button onClick={setupMFA} disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Set up two-factor authentication'}
          </Button>
        </div>
      ) : success ? (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-green-700">
            Two-factor authentication has been successfully set up!
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-4 text-sm text-gray-700">
            Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password).
          </p>
          
          <div className="flex justify-center mb-4">
            <img src={qr} alt="QR Code" className="w-48 h-48" />
          </div>
          
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          
          <Button onClick={verifyMFA} disabled={isLoading || verifyCode.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify and enable'}
          </Button>
        </div>
      )}
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
