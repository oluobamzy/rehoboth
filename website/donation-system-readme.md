# Donation Processing System

This document provides an overview of the donation processing system implemented for Rehoboth Church.

## Features

### Donation Processing
- One-time donations via credit/debit card
- Recurring donations with different frequency options (weekly, biweekly, monthly, quarterly, annually)
- Fund designation selection (General Fund, Building Fund, Missions, etc.)
- Email receipts for donations
- Year-end donation summaries for tax purposes

### Admin Interface
- View and filter donation records
- View donation statistics and reports
- Manage recurring donations (pause, cancel)
- Configure donation designation options
- Export donation data to CSV

### User Account Features
- View personal donation history
- Manage recurring donations
- Download tax receipts

## Architecture

### Database Schema
- `donations` - Stores all donation transactions
- `donation_designations` - Stores available fund designations
- `recurring_donations` - Stores recurring donation subscriptions

### API Routes
- `/api/donations` - Process one-time donations
- `/api/donations/recurring` - Manage recurring donations
- `/api/donations/designations` - Manage fund designations
- `/api/webhooks/stripe` - Handle Stripe webhook events
- `/api/admin/donations/*` - Admin-only API endpoints

### Components
- `DonationForm` - Main donation form component
- `DonationAmountSelector` - Donation amount selection
- `DonationDesignation` - Fund selection
- `RecurringOptions` - Recurring donation options
- `DonorInfoForm` - Donor information collection
- `PaymentMethodForm` - Payment method collection
- `AdminDonationList` - Admin donation management
- `AdminDonationStats` - Donation statistics and reporting

## Security Measures
- Rate limiting for donation API endpoints
- Stripe webhook signature verification
- Donation amount validation
- Supabase Row-Level Security policies
- Input validation and sanitization
- CSRF protection
- Access control for admin functions

## Configuration

### Required Environment Variables
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
EMAIL_USER=donations@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=donations@example.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
```

## Testing

### Stripe Test Cards
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0341` - Failed payment
- `4000 0000 0000 3220` - 3D Secure authentication required

## Deployment Notes

1. Set up required environment variables
2. Run the database schema setup script:
   ```
   npm run setup-db:donations
   ```
3. Configure Stripe webhook endpoint in the Stripe dashboard
4. Set the webhook endpoint to: `https://your-domain.com/api/webhooks/stripe`
5. Sign in as an admin to access donation management features

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Documentation](https://supabase.com/docs)
