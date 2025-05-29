# Database Configuration Setup Guide

This file helps you set up your environment variables for the Rehoboth Church Website.

## Supabase Setup
1. Create an account at [Supabase](https://supabase.io/)
2. Create a new project
3. Get your API keys from the project settings
4. Copy the content below to a file named `.env.local` in the root directory of this project
5. Replace the placeholder values with your actual credentials

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Firebase Configuration (for media storage)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# PostHog Configuration (for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Setting Up Database Tables
Once you've connected your Supabase project, you'll need to create the necessary tables:

1. Run the setup script: `npm run setup:db`
2. Or manually create tables using the SQL scripts in the `/scripts` directory

## Testing Your Setup
After setting up your environment variables, restart the development server:

```bash
npm run dev
```

Visit the sermons page to verify database connectivity.
