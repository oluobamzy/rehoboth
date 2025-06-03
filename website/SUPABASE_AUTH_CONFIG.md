# Supabase Auth Security Configuration Guide

This guide outlines the recommended security settings for your Supabase project's authentication system.

## Access Supabase Auth Settings

1. Go to the Supabase dashboard: https://app.supabase.io
2. Select your project
3. Click on "Authentication" in the left sidebar
4. Go to the "Settings" tab

## General Settings

1. **Site URL**: Set to your production URL (e.g., `https://example.com`)
   - This is crucial for security to prevent redirect attacks

2. **Disable Email Signup**: If not needed, consider disabling (set to `false`)
   - For this project, keep email signup enabled

3. **Disable Phone Signup**: Should be set to `true` unless specifically needed

## Email Auth Settings

1. **Email Confirmations**:
   - Set "Enable email confirmations" to `true`
   - This prevents unauthorized signups using others' email addresses

2. **Email Link Expiration**:
   - Recommended: 24 hours (86400 seconds)

3. **Security Key Settings**:
   - Enable PKCE (Proof Key for Code Exchange)
   - Set "Require PKCE with Auth Code Grant" to `true`

## Password Settings

1. **Minimum Password Length**: Set to 10

2. **Custom Password Pattern**: Enable and set to:
   ```
   ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$
   ```
   This enforces at least one uppercase letter, lowercase letter, number, and special character.

## Access Token Settings

1. **Access Token Expiration**: 3600 seconds (1 hour)
   - Shorter expiration times enhance security

2. **Refresh Token Expiration**: 43200 seconds (12 hours)
   - This balances security and user experience

## Rate Limiting

1. **Email Rate Limits**:
   - Set "Enable Email Rate Limits" to `true`
   - Max email per hour: 5
   - Max emails per day: 10

2. **SMS Rate Limits**:
   - Set "Enable SMS Rate Limits" to `true`
   - Max SMS per hour: 3
   - Max SMS per day: 5

## User Management

1. **Auto-confirm Users**: Set to `false`
   - Requires email verification

2. **Auto-confirm Phone Numbers**: Set to `false`

## Advanced Settings

1. **JWT Algorithm**: RS256 (default and recommended)

2. **Custom SMTP settings**:
   - Configure for production environments to ensure email deliverability
   - Use your organization's email domain for better sender reputation

## Email Templates

Customize the following email templates with your organization's branding:
- Confirmation
- Invitation
- Magic Link
- Recovery (Password Reset)
- Email Change

## Row Level Security (RLS)

Ensure RLS is enabled and properly configured for your authentication-related tables:
- profiles
- user_roles
- auth_logs

## Security Checklist

- [x] Set proper JWT expiration times
- [x] Enable email confirmation
- [x] Configure strong password policies
- [x] Set up rate limiting
- [x] Enable Row Level Security
- [x] Customize email templates
- [x] Set up MFA (Multi-Factor Authentication)
- [x] Configure proper redirect URLs
- [x] Set up auth event logging
