# User Administration Guide

## Overview
This system is configured so that **all users have admin privileges**. This is appropriate for a church website where all staff members who need accounts should have full content management access.

## Current User Status
All existing users now have admin privileges and can access the admin dashboard.

## Creating New Users

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Invite a user" or "Create user"
4. Enter the user's email and temporary password
5. **After creating the user, run the auto-promotion script:**
   ```bash
   cd /home/labber/rehoboth/website
   node scripts/auto-promote-users.js
   ```

### Method 2: Email Invitation (Alternative)
1. Use the Supabase dashboard to send email invitations
2. When users complete their signup, they'll need admin privileges
3. Run the auto-promotion script to grant them admin access

## Auto-Promotion Script

The `scripts/auto-promote-users.js` script automatically grants admin privileges to any user who doesn't already have them.

### Usage:
```bash
# Navigate to the project directory
cd /home/labber/rehoboth/website

# Run the auto-promotion script
node scripts/auto-promote-users.js
```

### When to run:
- After creating new users in the Supabase dashboard
- Periodically to ensure all users have admin access
- If you notice someone can't access admin features

## User Access Verification

### Check all user privileges:
```bash
cd /home/labber/rehoboth/website
NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data: users } = await supabase.auth.admin.listUsers();
  users.users.forEach(user => {
    const hasAdmin = user.app_metadata?.role === 'admin';
    console.log(\`\${hasAdmin ? '✅' : '❌'} \${user.email} - Admin: \${hasAdmin}\`);
  });
}
checkUsers();
"
```

## How Admin Access Works

### Authentication Flow:
1. **User logs in** → Supabase authenticates credentials
2. **Middleware checks role** → Looks for `role: "admin"` in `app_metadata`
3. **If admin role found** → Redirects to `/admin/dashboard`
4. **If no admin role** → Redirects to homepage and blocks admin access

### Role Storage:
- **Primary**: `app_metadata.role` in Supabase Auth (checked by middleware)
- **Backup**: `user_roles` table (fallback if app_metadata is missing)

## Troubleshooting

### User can't access admin dashboard:
1. **Check their role status:**
   ```bash
   node scripts/auto-promote-users.js
   ```

2. **If still having issues, they should:**
   - Clear browser cache and cookies
   - Log out and log back in
   - Try visiting `/fix_auth_state.html` to repair client-side state

### New user not getting admin access:
1. **Run the auto-promotion script:**
   ```bash
   node scripts/auto-promote-users.js
   ```

2. **User should log out and back in** to refresh their session

## Security Notes

- All users in this system have admin privileges
- This is intentional for a church website where all staff need content management access
- If you need role separation in the future, modify the auto-promotion script
- The system has both `app_metadata` and `user_roles` table for redundancy

## File Locations

- **Auto-promotion script**: `/scripts/auto-promote-users.js`
- **Auth middleware**: `/src/middleware.ts`
- **Login page**: `/src/app/auth/login/page.tsx`
- **Admin layout**: `/src/app/admin/layout.tsx`
- **Auth provider**: `/src/services/auth.tsx`