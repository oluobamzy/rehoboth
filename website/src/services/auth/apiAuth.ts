// src/services/auth/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserRole, hasRole, UserRole } from './roleGuard';

export async function getCurrentUser(req?: NextRequest): Promise<any> {
  try {
    // Create Supabase client for API routes
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session in getCurrentUser:', error);
      return null;
    }

    return session?.user || null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth(req?: NextRequest): Promise<any> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    console.error('Authentication required: No user found in session');
    throw new Error('Authentication required');
  }
  
  console.log('✅ User authenticated:', user.email);
  return user;
}

export async function requireRole(requiredRole: UserRole, req?: NextRequest): Promise<any> {
  const user = await requireAuth(req);
  
  console.log('🔍 Checking role for user:', user.email);
  console.log('🔍 Required role:', requiredRole);
  console.log('🔍 User app_metadata:', JSON.stringify(user.app_metadata, null, 2));
  
  if (!hasRole(user, requiredRole)) {
    console.error(`❌ Role check failed: User ${user.email} does not have required role ${requiredRole}`);
    throw new Error(`${requiredRole} role required`);
  }
  
  console.log('✅ Role check passed for user:', user.email);
  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<any> {
  try {
    console.log('🔒 Starting admin authentication check...');
    const user = await requireRole('admin', req);
    console.log('✅ Admin authentication successful for:', user.email);
    return user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Admin authentication failed:', errorMessage);
    throw error;
  }
}

export async function requireModerator(req?: NextRequest): Promise<any> {
  return requireRole('moderator', req);
}
