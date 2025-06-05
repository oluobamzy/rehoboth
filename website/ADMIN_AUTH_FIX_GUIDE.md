# Admin Authentication Fix Guide

This guide addresses issues with admin authentication where users with admin roles cannot access admin pages despite having the correct permissions in the database.

## The Problem

We've identified several potential issues that might prevent admin access:

1. **Cookie Format Mismatch**: The middleware can't properly read Supabase session cookies
2. **State Synchronization**: The browser's Zustand store may not be synchronized with your Supabase session
3. **User Role Issues**: Admin role not properly set in `app_metadata` or the `user_roles` table

## Recent Fixes

We've made the following fixes to address these issues:

1. **Updated Supabase Client**: Now using standard `cookieOptions` for cross-client compatibility
2. **Fixed Type Error**: Ensuring `role` is correctly typed as `'user' | 'admin'` in auth state updates
3. **Added Debugging**: Enhanced logging to troubleshoot middleware session detection
4. **Created Helper Script**: New `fix_admin_auth.js` script to properly set up admin roles

## Symptoms You Might See

1. Browser console shows successful auth but middleware logs show:
   ```
   ⏳ Middleware processing: /admin/dashboard
   ⏳ Checking session in middleware...
   ✅ Middleware: Path=/admin/dashboard, HasSession=false
   🔍 No session found. Checking for cookies...
   🍪 Has any cookies: true
   ❌ No session found. Redirecting to login.
   ```

2. Or the browser's local storage shows:
   ```json
   {
     "state": {
       "user": null,
       "isAuthenticated": false,
       "isLoading": false
     },
     "version": 0
   }
   ```
3. This causes the middleware to reject admin access even though server-side checks pass

## Solution Options

### Option 1: Run the Admin Role Fix Script (for developers)

1. Open a terminal in the project directory
2. Run the admin fix script with your email:
   ```bash
   cd /home/labber/rehoboth/website
   node scripts/fix_admin_auth.js your-admin-email@example.com
   ```
3. Follow the instructions provided by the script
4. Logout and login again

This script ensures your user has the admin role properly set in both places.

### Option 2: Fix using the browser tools (for users)

1. Navigate to `/fix_auth_session.html` in your browser
2. Follow the step-by-step process:
   - Click "Fix Auth Session" to repair cookie issues
   - If that doesn't work, click "Clear All Auth Data" to start fresh
   - Login again after the session is fixed
   - Go to the admin dashboard

This is the simplest solution and should work for most users.

### Option 3: Clear browser storage and re-login (for users)

1. Navigate to `/reset_auth.html` in your browser
2. Click "Clear ALL Browser Storage" button  
3. Click "Go to Login Page" button
4. Log in with your credentials

### Option 4: Fix with Cookie Configuration (for developers)

The updated Supabase client now uses standard cookie options for authentication:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null;
        }
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=28800; SameSite=Lax; Secure`;
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
        }
      },
    },
  },
});
```

This ensures compatibility between the browser client and middleware client.

2. Optionally, revoke all sessions to force a re-login:
   ```bash
   node scripts/revoke_sessions.js <user_id>
   ```

3. Tell the user to log in again

## Understanding the Issue

This issue occurred due to a mismatch between:
- Server-side authentication state (Supabase auth)
- Client-side cookie storage (for sessions)
- Client-side state management (Zustand store)

The core problem was the NextJS middleware couldn't read the session cookie because:
1. We had a custom cookie storage implementation that didn't match what the middleware expected
2. The cookie names and formats didn't align between client and middleware

## Technical Details

The fix addresses three key areas:

1. **Cookie Configuration**: Using Supabase's standard `cookieOptions` ensures cookies are stored with names and paths that the middleware can read.

2. **Type Safety**: Fixed a TypeScript error in how role values were passed to the Zustand store:
   ```typescript
   role: userRole === 'admin' ? 'admin' as const : 'user' as const
   ```

3. **Cookie Debugging**: Added enhanced logging to show exactly which cookies the middleware sees:
1. `rehoboth-auth-storage` - Used by the Supabase SDK
2. `auth-storage` - Used by the Zustand store

Both need to be correctly set for authentication to work properly.

## Prevention

To prevent this issue in the future:
1. Always use the authentication methods provided by the application
2. Avoid directly modifying database permissions without updating the client state
3. After admin role changes, users should log out and log back in

## Support

If you continue to experience issues, please contact the system administrator.
