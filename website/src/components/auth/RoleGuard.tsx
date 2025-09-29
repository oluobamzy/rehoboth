// src/components/auth/RoleGuard.tsx
'use client';

import React from 'react';
import { useAuth } from '@/services/auth';
import { getUserRole, hasRole, UserRole } from '@/services/auth/roleGuard';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please sign in to access this content.</p>
        <Link 
          href="/auth/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!hasRole(user, requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-4">
          You need {requiredRole} privileges to access this content.
        </p>
        <p className="text-sm text-gray-500">
          Current role: {getUserRole(user)}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminGuard({ children, fallback }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ModeratorGuard({ children, fallback }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="moderator" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}