# Admin Events Page Fix

The admin/events page is now implemented and ready to use. To access the admin section, you need to ensure your user account has the admin role assigned.

## Accessing Admin Events Page

1. Navigate to the admin dashboard at `/admin/dashboard`
2. Click on the "Events" card or navigate directly to `/admin/events`
3. You should now see the admin events management page

## If You Cannot Access Admin Pages

If you're getting "unauthorized" errors or are redirected away from admin pages, you may need to grant your user the admin role:

1. Run the admin role grant script (if you know your user's email):

```bash
cd /home/labber/rehoboth/website
node scripts/grant_admin_role.js your-email@example.com
```

2. Alternative fix - Create a new admin user:

```bash
cd /home/labber/rehoboth/website
node scripts/createAdminUser.js your-email@example.com your-password
```

3. If the issues persist, check the browser console for middleware errors and ensure you're logged in.

## Admin Events Features

The admin events section includes:

- **Event List** (`/admin/events`): View and manage all events
- **Create Event** (`/admin/events/new`): Add new events
- **Edit Event** (`/admin/events/[id]`): Modify existing events
- **Event Registrations** (`/admin/events/[id]/registrations`): View registrations for an event

## Database Requirements

The events functionality requires the following database tables:
- `events`: Stores event information
- `event_registrations`: Stores registration data for events

If these tables don't exist, refer to the `/scripts/setupEventsSchema.js` file to set them up.
