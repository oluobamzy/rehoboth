# How to Fix Carousel Upload Permissions

This guide provides two methods to fix carousel upload permission issues and ensure all admin users have the correct permissions.

## Method 1: Supabase SQL Editor (Recommended)

This method applies all fixes directly in the database and sets up automatic handling of future users.

1. **Log in to your Supabase dashboard**

2. **Open the SQL Editor**:
   - Click on "SQL Editor" in the left sidebar

3. **Run the comprehensive fix script**:
   - Copy the contents of `scripts/comprehensive_fix_carousel_permissions.sql` 
   - Paste it into the SQL editor
   - Click "Run" to execute the script

4. **Make a user admin**:
   - After running the script, you can easily make any user an admin with:
   ```sql
   SELECT make_user_admin('user@example.com');
   ```

5. **Have users log out and log back in** to refresh their JWT tokens and get the new permissions.

## Method 2: Run Local Script

This method is good for quickly fixing individual users.

1. **Make sure Node.js is installed**

2. **Make the script executable** (Linux/Mac):
   ```bash
   chmod +x scripts/make_user_admin.js
   ```

3. **Run the script with a user's email**:
   ```bash
   node scripts/make_user_admin.js user@example.com
   ```

4. **Have the user log out and log back in** to refresh their JWT token.

## What These Scripts Do

Both methods implement these fixes:

1. **Fix user's admin role** in both app_metadata and user_roles table
2. **Grant database permissions** for carousel_slides table
3. **Set up RLS policies** that properly recognize admin users
4. **Clean up refresh tokens** to fix the continuous token refresh issue
5. **Create automation** so all future admin users get the right permissions

## Verifying the Fix

After applying either fix method:

1. Have the user log out and log back in
2. Try uploading a carousel from the admin panel
3. Check browser console for token refresh messages - they should be less frequent

## Troubleshooting

If issues persist after applying these fixes:

1. **Check if RLS is enabled**: 
   ```sql
   SELECT relname, relrowsecurity 
   FROM pg_class 
   WHERE relname = 'carousel_slides';
   ```

2. **Temporarily disable RLS for testing**:
   ```sql
   ALTER TABLE carousel_slides DISABLE ROW LEVEL SECURITY;
   ```
   
   Remember to re-enable after testing:
   ```sql
   ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
   ```

3. **Verify user's admin status**:
   ```sql
   SELECT email, raw_app_meta_data->>'role' as role
   FROM auth.users
   WHERE email = 'user@example.com';
   ```

For further assistance, contact your database administrator.
