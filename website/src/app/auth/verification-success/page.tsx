// src/app/auth/verification-success/page.tsx
import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/common/MainLayout';

export default function VerificationSuccessPage() {
  return (
    <MainLayout>
      <div className="flex min-h-[600px] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Email Verified
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="text-sm text-green-700">
                    Your email has been successfully verified. You can now sign in to your account.
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
