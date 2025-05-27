# Rehoboth Christian Church Website - Hosting & Deployment Guide

This document outlines the setup requirements for Firebase and Supabase hosting environments for the Rehoboth Christian Church website.

## Firebase Setup

### Firebase Project Setup
1. **Create a new Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and name it "rehoboth-church" (or similar)
   - Enable Google Analytics (recommended)
   - Choose default settings for Analytics

2. **Configure Firebase Authentication**
   - Enable Email/Password authentication method (for admin users only)
   - Add required admin user emails

3. **Set up Firebase Storage**
   - Create a Storage bucket with the default settings
   - Configure the following CORS settings in `cors.json`:
     ```json
     [
       {
         "origin": ["https://rehoboth-church.org", "http://localhost:3000"],
         "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "maxAgeSeconds": 3600,
         "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent"]
       }
     ]
     ```
   - Apply CORS configuration with Firebase CLI: 
     ```
     firebase storage:cors update cors.json
     ```

4. **Configure Storage Security Rules**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Public read access for all media files
       match /sermons/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.admin == true;
       }
       
       // Public read access for carousel images
       match /carousel/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.admin == true;
       }
       
       // Public read access for event images
       match /events/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.admin == true;
       }
       
       // Default deny
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```

5. **Set up Firebase Hosting**
   - Configure hosting with:
     ```
     firebase init hosting
     ```
   - Set public directory to `out` (for Next.js static export)
   - Configure as single-page application: Yes
   - Set up GitHub Actions for deployment (optional)

6. **Create a Service Account**
   - Go to Project Settings > Service accounts
   - Generate a new private key for Firebase Admin SDK
   - Save the JSON file securely (will be used for environment variables)

### Firebase Configuration Requirements

1. **Required Environment Variables**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
   FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
   ```

2. **Recommended Firebase Features to Enable**:
   - Firebase Performance Monitoring
   - Firebase Crashlytics
   - Firebase Remote Config (for feature flags)

## Supabase Setup

### Supabase Project Setup
1. **Create a new Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.io/)
   - Click "New project" and complete the form:
     - Name: "rehoboth-church" (or similar)
     - Database Password: Generate a secure password
     - Region: Choose closest to your target audience
     - Pricing Plan: Free tier to start, upgrade as needed

2. **Database Configuration**
   - Execute the SQL scripts for each feature to create tables
   - Run migrations using Prisma
   - Set up initial seed data

3. **Enable PostgREST API**
   - Should be enabled by default
   - Configure proper API policies

4. **Configure Authentication**
   - Enable Email auth provider
   - Set Site URL to your production URL
   - Configure email templates for auth flows
   - Set up custom claims for admin roles

5. **Set up Row Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for public/admin access
   - Example policy for carousel_slides:
     ```sql
     -- Public can read active slides
     CREATE POLICY "Public can read active slides" 
     ON carousel_slides FOR SELECT
     USING (is_active = true);
     
     -- Only authenticated admins can modify slides
     CREATE POLICY "Admins can manage slides" 
     ON carousel_slides FOR ALL
     USING (auth.role() = 'admin');
     ```

6. **Configure Storage**
   - Create buckets:
     - `public` - For public assets
     - `private` - For admin-only assets
   - Set up RLS policies on buckets

7. **Edge Functions**
   - Set up edge functions for:
     - Email sending via SendGrid
     - Payment processing with Stripe
     - Webhook handling

### Supabase Configuration Requirements

1. **Required Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project_id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
   ```

2. **Database Extensions to Enable**:
   - `pg_cron` - For scheduled tasks
   - `pg_graphql` - For GraphQL API (optional)
   - `pg_vector` - For vector embeddings (if advanced search is needed)
   - `postgis` - For geographic data (events locations)

3. **Recommended Settings**:
   - Enable database backups
   - Set up a read-only pooled connection for high-traffic queries
   - Configure JWT expiry time to 24 hours

## Additional Service Setup

### Stripe
1. **Create a Stripe account**
2. **Configure API keys**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<publishable_key>
   STRIPE_SECRET_KEY=<secret_key>
   STRIPE_WEBHOOK_SECRET=<webhook_secret>
   ```
3. **Set up webhook endpoints**
4. **Configure products for donation designations**

### SendGrid
1. **Create a SendGrid account**
2. **Verify sending domain**
3. **Set up API key**
   ```
   SENDGRID_API_KEY=<api_key>
   ```
4. **Create email templates**
5. **Configure event webhooks**

### PostHog
1. **Create a PostHog account**
2. **Set up a project**
3. **Configure API keys**
   ```
   NEXT_PUBLIC_POSTHOG_KEY=<api_key>
   NEXT_PUBLIC_POSTHOG_HOST=<host_url>
   ```

## Deployment Process

### Initial Setup
1. **Set up environment variables** in both development and production
2. **Run database migrations** with Prisma
3. **Seed initial data** for required tables

### Frontend Deployment to Firebase
1. **Build the Next.js application**:
   ```bash
   npm run build
   ```
2. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

### API Deployment to Supabase
1. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy
   ```
2. **Verify API endpoints** are functioning correctly

### Post-Deployment Verification
1. **Verify all features** are working correctly
2. **Check analytics** setup is capturing data
3. **Test authentication flows**
4. **Verify webhook endpoints** are receiving events

## Continuous Integration/Deployment

For future CI/CD implementation:

1. **GitHub Actions recommended workflow**:
   - Run tests on pull requests
   - Deploy to staging environment for review
   - Deploy to production on main branch merge

2. **Required secrets for GitHub Actions**:
   - All Firebase credentials
   - All Supabase credentials
   - Additional service API keys

## Maintenance Procedures

### Database Maintenance
- Regular backups (automated via Supabase)
- Periodic performance checks
- Index optimization as needed

### Storage Management
- Setup lifecycle rules for Firebase Storage
- Implement media cleanup for unused assets
- Monitor storage usage monthly

### Monitoring
- Set up uptime monitoring (Uptime Robot recommended)
- Configure error alerting (Sentry recommended)
- Periodic security scans

## Security Configurations

### Recommended Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com; connect-src 'self' https://*.supabase.co https://firestore.googleapis.com https://*.stripe.com; frame-src https://*.stripe.com; font-src 'self' data:;
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Firebase Security Rules
- Restrict access to authenticated users for admin functionality
- Set appropriate CORS policies
- Configure proper authentication settings

### Database Security
- Enable Row Level Security for all tables
- Use secure password policies
- Implement proper access control
