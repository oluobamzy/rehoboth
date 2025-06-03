// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Create a response with enhanced security headers
  const res = NextResponse.next({
    headers: {
      // Content Security Policy to prevent XSS attacks
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://app.posthog.com https://*.supabase.co; connect-src 'self' https://*.supabase.co https://app.posthog.com; frame-src 'self' https://*.supabase.co; img-src 'self' data: https://*.supabase.co https://www.gravatar.com; style-src 'self' 'unsafe-inline';",
      
      // Prevent browsers from MIME-sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Strict Transport Security to enforce HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Frame protection to prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Browser XSS filter
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy to disable potentially risky browser features
      'Permissions-Policy': 'geolocation=(self), microphone=(), camera=(), fullscreen=(self)'
    }
  });
  
  // Create Supabase client
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
