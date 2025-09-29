// src/middleware/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { getUserRole, canAccessAdminPanel, canManageUsers } from '@/services/auth/roleGuard';

export async function authMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Define protected routes
  const adminRoutes = ['/admin'];
  const userManagementRoutes = ['/admin/users'];

  // Check if current path requires authentication
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isUserManagementRoute = userManagementRoutes.some(route => pathname.startsWith(route));

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/invite', '/', '/about', '/contact'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // If it's a public route, allow access
  if (isPublicRoute) {
    return res;
  }

  // If no session and trying to access protected route, redirect to login
  if (!session && (isAdminRoute || pathname.startsWith('/protected'))) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If we have a session, check role-based permissions
  if (session?.user) {
    const user = session.user;

    // Check admin panel access
    if (isAdminRoute && !canAccessAdminPanel(user)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Check user management access
    if (isUserManagementRoute && !canManageUsers(user)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res;
}

// Helper function to check if path requires authentication
export function requiresAuth(pathname: string): boolean {
  const protectedPaths = ['/admin', '/profile', '/dashboard'];
  return protectedPaths.some(path => pathname.startsWith(path));
}