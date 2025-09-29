// src/services/auth/apiAuth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUserRole, hasRole, UserRole } from './roleGuard';

export async function getCurrentUser(req?: NextRequest): Promise<any> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    // Import the server supabase instance
    const { serverSupabase } = await import('../server/eventService.server');
    
    if (!accessToken && !refreshToken) {
      return null;
    }

    // Try to get user with access token first
    if (accessToken) {
      const { data: { user }, error } = await serverSupabase.auth.getUser(accessToken);
      
      if (error || !user) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    }

    return null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth(req?: NextRequest): Promise<any> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireRole(requiredRole: UserRole, req?: NextRequest): Promise<any> {
  const user = await requireAuth(req);
  
  if (!hasRole(user, requiredRole)) {
    throw new Error(`${requiredRole} role required`);
  }
  
  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<any> {
  return requireRole('admin', req);
}

export async function requireModerator(req?: NextRequest): Promise<any> {
  return requireRole('moderator', req);
}
