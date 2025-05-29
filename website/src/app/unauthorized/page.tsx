// src/app/unauthorized/page.tsx
import React from 'react';
import MainLayout from '@/components/common/MainLayout';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function UnauthorizedPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">Unauthorized Access</h1>
          
          <p className="mt-4 text-lg text-gray-600">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          
          <div className="mt-8">
            <Link href="/">
              <Button variant="primary" size="lg">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
