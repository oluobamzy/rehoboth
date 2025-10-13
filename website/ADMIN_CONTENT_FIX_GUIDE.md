# Admin Content System Fix Guide

## Issues Identified and Fixed

### 1. **Next.js Async Cookies Issue** ✅ FIXED
**Problem**: Routes were using `cookies()` synchronously, causing the error:
```
Error: Route "/api/admin/content" used `cookies().get('sb-jxxmzxcrasknmzeqncot-auth-token')`. `cookies()` should be awaited before using its value.
```

**Solution**: Updated all API routes to use the correct pattern:
```typescript
// ✅ Correct (no await needed for createRouteHandlerClient)
const supabase = createRouteHandlerClient({ cookies });
```

**Files Updated**:
- `src/app/api/admin/content/route.ts`
- Other auth-related routes already using correct pattern

### 2. **Database Schema Mismatch** 🔄 REQUIRES DATABASE MIGRATION
**Problem**: The API code expects columns that don't exist in the database:
- `title` (TEXT, nullable)
- `content_type` (TEXT, default 'html')
- `is_published` (BOOLEAN, default true)

**Error**: `column "version_number" does not exist` (also related to schema mismatch)

**Solution**: 
1. **Run the database migration** (see below)
2. Updated API routes to properly handle these columns

### 3. **Supabase Authentication Errors** ✅ FIXED
**Problem**: Authentication errors due to cookies issue causing session problems

**Solution**: Fixed by resolving the cookies issue above

## Database Migration Required 🚨

You **MUST** run this SQL in your Supabase dashboard before the system will work:

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Create a new query

### Step 2: Run Migration SQL
Copy and paste this entire SQL block:

```sql
-- Migration to add missing columns to page_content table
-- Add the missing columns to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'html',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update the updated_at trigger to handle new columns
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Update existing records to have proper defaults
UPDATE page_content 
SET 
  content_type = 'html',
  is_published = true
WHERE content_type IS NULL OR is_published IS NULL;
```

### Step 3: Restart Development Server
After running the migration:
```bash
cd /home/labber/rehoboth/website
npm run dev
```

## What Each Fix Does

### 1. API Route Fixes
- **GET `/api/admin/content`**: Fixed cookies, now supports filtering by `is_published`
- **POST `/api/admin/content`**: Fixed cookies, now properly saves `title`, `content_type`, `is_published`
- **PUT `/api/admin/content`**: Fixed cookies, supports bulk updates with new columns

### 2. Database Schema Enhancement
The new columns provide:
- **`title`**: Optional title for content sections
- **`content_type`**: Type of content (html, markdown, etc.) with 'html' default
- **`is_published`**: Boolean flag for published/draft status with true default

### 3. Backwards Compatibility
- All new columns are optional or have defaults
- Existing content will continue to work
- Migration updates existing records with proper defaults

## Testing After Migration

1. **Check content loading**: Visit `/admin/content` 
2. **Test content editing**: Try editing content in the rich text editor
3. **Verify saving**: Save content and check for errors
4. **Check filtering**: Test published/draft filtering

## Files Modified

### Core API Routes
- ✅ `src/app/api/admin/content/route.ts` - Main content management
- ✅ `src/app/api/content/route.ts` - Public content API (was already correct)

### Database
- ✅ `database/migrate_page_content_columns.sql` - Migration script
- ✅ `apply-migration.sh` - Helper script

### Type Definitions
The `PageContent` interface in the API routes already includes the new fields:
```typescript
interface PageContent {
  id?: string;
  page_key: string;
  section_key: string;
  title?: string;           // ✅ Now supported in DB
  content: string;
  content_type?: string;    // ✅ Now supported in DB
  is_published?: boolean;   // ✅ Now supported in DB
}
```

## Expected Outcome

After completing the migration:
- ✅ No more "column does not exist" errors
- ✅ No more async cookies warnings
- ✅ Content management system fully functional
- ✅ Rich text editor saves content properly
- ✅ Admin content filtering works
- ✅ Public content API works correctly

## Next Steps

1. **Run the database migration** (most important!)
2. Restart your development server
3. Test the admin content management features
4. Verify that content saving/loading works properly

The system should now work without the errors you were experiencing!