# Carousel Upload and Auth Token Refresh Fix Guide

This guide addresses two issues:
1. Carousel uploads failing with "forbidden" errors despite admin user role
2. Constant token refreshing in the auth.tsx file

## Issues and Solutions

### Issue 1: Carousel Upload Permissions

**Symptoms:**
- User has admin role but gets "forbidden" error when uploading carousels
- Authentication logs show correct admin role in app_metadata

**Fixes:**

1. **Fix user's admin role:**
   ```bash
   # Run the script to fix carousel permissions
   cd /home/labber/rehoboth/website
   node scripts/fix_carousel_permissions.js
   ```

   This script:
   - Ensures the user has the admin role in app_metadata
   - Updates the user_roles table if needed
   - Grants explicit database permissions for carousel operations
   - Creates a special RLS policy just for your user
   - Temporarily disables RLS for testing

2. **Log out and log back in:**
   After running the fix script, have the user log out and log back in to refresh their JWT token with the updated permissions.

3. **If issues persist, try direct SQL permissions:**

   ```sql
   -- Connect to your database and run:
   ALTER TABLE carousel_slides DISABLE ROW LEVEL SECURITY;
   ```

   Note: Remember to re-enable RLS once testing is complete:
   ```sql
   ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
   ```

### Issue 2: Constant Token Refreshing

**Symptoms:**
- Logs show repeated "Auth state change detected: TOKEN_REFRESHED" messages 
- Continuous token refreshes causing potential performance issues

**Fixes:**

1. **Fixed tokenRefresher.ts implementation:**
   - The token refresher now has rate limiting to prevent excessive refreshes
   - Added a minimum 5-minute gap between refreshes
   - Added tracking of when the last refresh happened 
   - Improved refresh scheduling logic based on token expiry

2. **Clear old tokens:**
   The fix_carousel_permissions.js script also cleans up old refresh tokens from the database,
   which helps prevent issues with constant refreshing.

## How to Test If Fixes Worked

1. Logout and login again to apply changes and get a fresh token

2. Check browser console logs - you should see:
   - Fewer "TOKEN_REFRESHED" messages
   - At least 5-minute gaps between token refreshes

3. Try uploading a carousel slide:
   - Navigate to Admin > Carousel
   - Create a new slide with title, text and image
   - If uploads work, the fix was successful

## Additional Troubleshooting

If issues persist:

1. **Check RLS Policies:**
   ```bash
   node scripts/test_carousel_access.js
   ```

2. **Inspect JWTs:**
   In the browser console, run:
   ```javascript
   // Get the current access token
   const accessToken = JSON.parse(localStorage.getItem('sb-<project-ref>-auth-token')).access_token;
   
   // Decode it to check claims (including role)
   console.log(JSON.parse(atob(accessToken.split('.')[1])));
   ```

3. **Review the fix_carousel_permissions.js script** to understand and troubleshoot the specific fixes applied.

## Prevention for Future Issues

1. Use proper database migrations for table creation and permissions
2. Test RLS policies thoroughly before deploying
3. Set up appropriate logging to catch permission issues early
4. Consider implementing a JWT token inspection tool for debugging

## Reference

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Token Debugging Tools](https://jwt.io/)
