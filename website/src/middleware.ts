// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access admin routes, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectUrl', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // For admin routes, check if the user has admin role
  if (session && req.nextUrl.pathname.startsWith('/admin')) {
    // Get user role from user_roles table
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    // If not an admin, redirect to unauthorized page
    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
