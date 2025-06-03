// src/app/auth/mfa/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/common/MainLayout';
import MFASetup from '@/components/auth/MFASetup';
import { useAuth } from '@/services/auth';

export default function MFAPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirectUrl=/auth/mfa');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Account Security</h1>
        <MFASetup />
      </div>
    </MainLayout>
  );
}
