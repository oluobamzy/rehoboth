// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  console.log(`⏳ Middleware processing: ${req.nextUrl.pathname}`);
  
  // Create a response with enhanced security headers
  const res = NextResponse.next({
    headers: {
      // Content Security Policy to prevent XSS attacks
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://app.posthog.com https://*.supabase.co https://apis.google.com https://*.googleapis.com; script-src-elem 'self' 'unsafe-inline' https://app.posthog.com https://*.supabase.co https://apis.google.com https://*.googleapis.com; connect-src 'self' https://*.supabase.co https://app.posthog.com https://*.googleapis.com; frame-src 'self' https://*.supabase.co https://*.googleapis.com; img-src 'self' data: https://*.supabase.co https://www.gravatar.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
      
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

  try {  
    // Refresh session if expired - required for Server Components
    console.log('⏳ Checking session in middleware...');
    
    // Debug cookie contents in detail
    const allCookies = req.cookies.getAll();
    const cookieDebug = allCookies.map(c => `${c.name}: ${c.value.substring(0, 10)}...`).join(', ');
    console.log('🍪 Debug cookies:', cookieDebug || 'No cookies');
    
    // Look specifically for auth-related cookies
    const authCookies = allCookies.filter(c => c.name.startsWith('sb-') || c.name === 'sb-auth');
    if (authCookies.length > 0) {
      console.log('🔑 Auth cookies found:', authCookies.map(c => c.name).join(', '));
    } else {
      console.log('⚠️ No auth cookies found with expected prefixes (sb-, sb-auth)');
    }
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Detailed session logging
    if (session) {
      console.log('✅ Session found for user:', session.user.email);
      console.log('👤 User role in session:', session.user.app_metadata?.role || 'none');
      console.log('⏰ Session expires at:', new Date((session.expires_at || 0) * 1000).toISOString());
    } else {
      console.log('❌ No valid session found');
    }
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    }
    
    // Enhanced debug logging
    console.log(`✅ Middleware: Path=${req.nextUrl.pathname}, HasSession=${!!session}`);
    if (session) {
      console.log(`👤 User: ${session.user.email}, Role=${session.user.app_metadata?.role || 'none'}`);
      // Log cookies for debugging
      console.log('🍪 Auth cookies present:', 
        !!req.cookies.get('sb-access-token') || 
        !!req.cookies.get('sb-refresh-token') || 
        !!req.cookies.get('rehoboth-auth-storage'));
    } else {
      console.log('🔍 No session found. Checking for cookies...');
      const hasCookies = Object.entries(req.cookies.getAll()).length > 0;
      console.log(`🍪 Has any cookies: ${hasCookies}`);
      if (hasCookies) {
        const cookieNames = req.cookies.getAll().map(c => c.name).join(', ');
        console.log(`🍪 Cookie names: ${cookieNames}`);
      }
    }
    
    // If no session and trying to access admin routes, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    console.log(`❌ No session found. Redirecting to login.`);
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectUrl', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // For admin routes, check if the user has admin role
  if (session && req.nextUrl.pathname.startsWith('/admin')) {
    try {
      console.log(`🔍 Checking admin role for user: ${session.user.email}`);
      
      // Check if the admin session cookie is set for bypassing the checks (temporary solution)
      const adminBypass = req.cookies.get('admin_bypass')?.value;
      if (adminBypass === session.user.id) {
        console.log('✅ Admin bypass cookie found. Allowing access.');
        return res;
      }
      
      // First check for admin role in app_metadata (from Supabase Auth)
      if (session.user?.app_metadata?.role === 'admin') {
        console.log(`✅ Admin role found in app_metadata: ${session.user.app_metadata.role}`);
        
        // Set a short-lived bypass cookie for subsequent requests
        const adminRes = NextResponse.next();
        adminRes.cookies.set({
          name: 'admin_bypass',
          value: session.user.id,
          maxAge: 60 * 60, // 1 hour
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        
        return adminRes;
      } else {
        console.log(`⚠️ No admin role in app_metadata.`);
        if (session.user?.app_metadata) {
          console.log('Current metadata:', JSON.stringify(session.user.app_metadata));
        }
      }
      
      // If not in app_metadata, check user_roles table as fallback
      console.log('🔍 Checking user_roles table...');
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Error fetching user role:', error);
        
        // Try to check if table exists (might be permissions issue)
        const { error: tableError } = await supabase.rpc('exec', {
          query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles');"
        });
        
        if (tableError) {
          console.error('❌ Cannot check if table exists:', tableError.message);
        }
      }

      // Check if any of the roles is 'admin'
      const isAdmin = userRoles && userRoles.some(role => role.role === 'admin');
      console.log(`🔍 User role from database: ${isAdmin ? '✅ admin' : '❌ not admin'}`);

      // If admin role found, allow access
      if (isAdmin) {
        console.log('✅ Admin role found in user_roles table. Allowing access.');
        
        // Set a short-lived bypass cookie for subsequent requests
        const adminRes = NextResponse.next();
        adminRes.cookies.set({
          name: 'admin_bypass',
          value: session.user.id,
          maxAge: 60 * 60, // 1 hour
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
        
        return adminRes;
      }

      // If not an admin, redirect to unauthorized page
      console.log(`❌ User is not an admin. Redirecting to unauthorized.`);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    } catch (error) {
      console.error('❌ Error checking admin permissions:', error);
      // On error, redirect to login for security
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectUrl', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

    return res;
  } catch (error) {
    console.error('❌ Error in middleware:', error);
    return res;
  }
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
