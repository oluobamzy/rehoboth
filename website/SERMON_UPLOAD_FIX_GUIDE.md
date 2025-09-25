# Sermon Upload Fix Guide

## Problem Summary
The sermon upload is failing with two main issues:
1. **RLS Policy Violation**: "new row violates row-level security policy" - The sermons table and sermon-media storage bucket are missing proper Row-Level Security policies
2. **CORS/Origin Issues**: External video URLs are blocked by COEP (Cross-Origin Embedder Policy)

## Solution Overview
✅ **Fixed Files:**
- `/scripts/fix_sermon_permissions.sql` - Complete RLS policy setup for sermons
- `/scripts/test_admin_setup.sql` - Test script to verify setup
- `/src/components/sermons/admin/AdminSermonForm.tsx` - Improved error handling
- `/next.config.ts` - More flexible CORS policy for external resources

## Implementation Steps

### Step 1: Fix RLS Policies (Critical - Do This First)

1. Go to your Supabase dashboard at https://app.supabase.io
2. Navigate to **SQL Editor**
3. Create a new query and paste the content from `/scripts/fix_sermon_permissions.sql`
4. Click **Run** to execute the script

**What this does:**
- Creates sermon tables with proper structure
- Sets up RLS policies for sermons and sermon_series tables
- Creates storage bucket `sermon-media` with proper policies
- Sets up admin role system
- Creates helper function `make_user_admin()`

### Step 2: Make Your User an Admin

**Option A: Using the helper function**
1. In the Supabase SQL Editor, run:
```sql
SELECT make_user_admin('your-email@example.com');
```
Replace `your-email@example.com` with your actual email address.

**Option B: Manual approach**
```sql
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### Step 3: Verify the Setup

1. Run the test script `/scripts/test_admin_setup.sql` in the SQL Editor
2. This will check:
   - All required tables exist
   - Storage bucket is configured
   - RLS policies are in place
   - Your admin status

Expected results:
```
table_name     | status
sermons        | EXISTS
sermon_series  | EXISTS
user_roles     | EXISTS

Bucket: sermon-media | PUBLIC access

Multiple RLS policies should be listed for sermons and storage
Your user should show as admin
```

### Step 4: Update and Restart Your App

1. The code changes have been applied to:
   - `AdminSermonForm.tsx` (better error messages)
   - `next.config.ts` (flexible CORS policy)

2. Restart your development server:
```bash
npm run dev
```

3. **Important**: Log out and log back in to your admin panel to refresh your JWT token

### Step 5: Test the Upload

1. Navigate to your admin panel
2. Try creating a new sermon
3. Upload audio, video, and thumbnail files
4. The upload should now work without RLS violations

## Troubleshooting

### Common Issues and Solutions

**1. "You don't have permission to upload files"**
- Verify admin status: Run the test script
- Log out and back in to refresh JWT token
- Check that user_roles table has your user with 'admin' role

**2. "Upload failed: new row violates row-level security policy"**
- The RLS policies weren't applied correctly
- Re-run the `/scripts/fix_sermon_permissions.sql` script
- Verify storage policies exist for 'sermon-media' bucket

**3. "Storage bucket not found"**
- The script should create it automatically
- Manually create bucket named 'sermon-media' with public access
- File size limit: 50MB

**4. External videos still blocked (CORS)**
- Restart the development server after updating next.config.ts
- For production, external videos may still be blocked for security
- Consider hosting videos locally instead of linking externally

### Manual Verification Commands

**Check your admin status:**
```sql
SELECT 
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() -> 'app_metadata' ->> 'role' as role,
  CASE WHEN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN 'YES' ELSE 'NO' END as is_admin;
```

**List all admin users:**
```sql
SELECT u.email, u.raw_app_meta_data ->> 'role' as role
FROM auth.users u
WHERE u.raw_app_meta_data ->> 'role' = 'admin';
```

**Test storage permissions:**
```sql
SELECT bucket_id, name, owner
FROM storage.objects 
WHERE bucket_id = 'sermon-media' 
LIMIT 5;
```

## Success Indicators

✅ **Setup Complete When:**
- Test script shows all tables exist
- Storage bucket 'sermon-media' is public
- RLS policies are listed for sermons and storage
- Your user shows admin status
- File uploads work without errors
- Published sermons are visible to public users

## Next Steps

After successful implementation:
1. **Test thoroughly**: Upload different file types and sizes
2. **Check public access**: Verify non-admin users can view published sermons  
3. **Monitor storage**: Keep track of storage usage and costs
4. **Backup strategy**: Consider automated backups for sermon data
5. **Performance**: Monitor upload speeds for large video files

## Need Help?

If issues persist:
1. Run the test script and share the output
2. Check browser console for specific error messages
3. Verify Supabase project settings and quotas
4. Consider reaching out with specific error messages and test script results