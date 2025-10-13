# Church Settings Management System

This comprehensive system allows church administrators to manage all church information from a centralized admin panel, eliminating hardcoded values throughout the website.

## Features

### ✨ What's Included
- **Contact Information Management**: Address, phone, email settings
- **Social Media Integration**: Facebook, Instagram, YouTube, Twitter links
- **Service Times**: Dynamic schedule management with JSON flexibility
- **General Settings**: Church name, description, and more
- **Google Maps Integration**: Dynamic map embedding with addresses

### 🔧 Components Created

#### Backend Services
- `ChurchSettingsService` - Server-side service for CRUD operations
- `useChurchSettings` hook - Client-side hook for fetching/updating settings
- Database table `church_settings` with RLS policies

#### Frontend Components
- `/admin/settings` - Admin interface for managing all settings
- Updated `Footer` component with dynamic content
- Updated `Contact` page with dynamic information
- `SocialMediaIcons` component with dynamic URLs
- `DynamicContactInfo` and `DynamicMapSection` components

#### Database Schema
```sql
church_settings table:
- setting_key (unique identifier)
- setting_value (the actual value)
- setting_type (text, json, url, email, phone, textarea)
- category (contact, social_media, services, general)
- display_name (human-readable name)
- description (help text)
- is_active (enable/disable settings)
- audit fields (updated_at, updated_by, created_at)
```

## Installation & Setup

### 1. Apply Database Migration

**Option A: Manual SQL Execution**
1. Copy the contents of `database/create_church_settings_table.sql`
2. Paste into your Supabase SQL Editor
3. Execute the script

**Option B: Using the Migration Script**
```bash
cd /path/to/website
./apply-migration-church-settings.sh
```

### 2. Verify Installation

After applying the migration, verify by:
1. Checking the `church_settings` table exists in Supabase
2. Confirming default settings are populated
3. Testing the admin settings page at `/admin/settings`

## Usage

### Admin Panel Access
1. Navigate to `/admin/settings` (requires authentication)
2. Use the tabbed interface to manage different categories:
   - **Contact Info**: Address, phone, email
   - **Social Media**: All social platform URLs
   - **Service Times**: Weekly schedule in JSON format
   - **General**: Church name, description

### Form Validation
- Email addresses are validated for proper format
- URLs are checked for validity
- Required fields are enforced
- JSON fields are parsed and validated

### Auto-Updates
Once settings are saved, changes automatically appear on:
- Website footer
- Contact page
- Social media icons
- Google Maps integration
- Any other components using the settings

## Technical Details

### Authentication
- Uses existing Supabase authentication
- Admin access controlled at application level
- RLS policies ensure data security

### Data Flow
```
Admin Panel → ChurchSettingsService → Supabase → useChurchSettings Hook → UI Components
```

### Caching & Performance
- Settings cached in React state
- Fallback values prevent empty displays
- Loading states provide smooth UX

### Default Settings Included
The migration includes sensible defaults for:
- Church name: "Rehoboth Christian Church"
- Address: "414 Pleasant Park Road, Rehoboth, MA 02769"
- Phone: "(613) 400-4966"
- Email: "rehobothchrisitianchurch2022@gmail.com"
- Social media placeholder URLs
- Standard service times

## Customization

### Adding New Settings
1. Insert new record in `church_settings` table
2. Add to `ChurchSettings` interface in `churchSettingsService.ts`
3. Update `getFormattedSettings()` method
4. Add form field to admin interface
5. Use in components via `useChurchSettings` hook

### Service Times Format
Service times are stored as JSON for maximum flexibility:
```json
{
  "sunday": "3:00 PM - 6:00 PM",
  "wednesday": "7:00 PM - 9:00 PM (Prayer Service)",
  "friday": "Women Overnight Service",
  "saturday": "7:00 PM - 9:00 PM (Youth Prayer & Choir)"
}
```

### Validation Rules
- Email: Standard RFC format validation
- Phone: Flexible format supporting international numbers
- URL: Valid HTTP/HTTPS URLs required
- JSON: Must be valid JSON syntax

## Benefits

### For Administrators
- Single location to update all church information
- No technical knowledge required
- Real-time preview of changes
- Form validation prevents errors
- Audit trail of all changes

### For Developers
- Eliminates hardcoded values
- Centralized data management
- Type-safe interfaces
- Reusable components
- Easy to extend

### For Users
- Always up-to-date information
- Consistent data across all pages
- Professional appearance
- Reliable contact information

## Security

### Access Control
- Admin authentication required
- RLS policies at database level
- Input validation and sanitization
- Audit logging for changes

### Data Protection
- Environment variables for sensitive data
- Secure database connections
- Input sanitization
- XSS prevention

## Support

The system includes comprehensive error handling:
- Graceful fallbacks when settings unavailable
- Loading states during data fetch
- User-friendly error messages
- Automatic retry mechanisms

## Future Enhancements

Potential improvements:
- Bulk import/export functionality
- Setting categories and grouping
- Version history and rollback
- Multi-language support
- API webhooks for integrations

---

This church settings management system provides a robust, user-friendly solution for maintaining accurate church information across your entire website.