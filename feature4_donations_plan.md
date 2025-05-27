# Feature 4: Donation Processing System - Implementation Plan

## Overview
The Donation Processing System will implement secure, user-friendly donation handling with multiple payment methods, recurring donations, and comprehensive financial reporting.

## Database Schema Implementation

### 1. Setup Supabase Schema
```sql
-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_id VARCHAR(255),
  donor_email VARCHAR(255),
  donor_name VARCHAR(255),
  fund_designation VARCHAR(100),
  is_recurring BOOLEAN DEFAULT false,
  frequency VARCHAR(20),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Donation designations/funds
CREATE TABLE donation_designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  target_amount_cents INTEGER,
  current_amount_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recurring donation management
CREATE TABLE recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_email VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fund_designation VARCHAR(100),
  frequency VARCHAR(20) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  next_payment_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_donations_date ON donations (created_at DESC);
CREATE INDEX idx_donations_email ON donations (donor_email);
CREATE INDEX idx_donations_payment_id ON donations (stripe_payment_id);
CREATE INDEX idx_recurring_email ON recurring_donations (donor_email);
CREATE INDEX idx_recurring_subscription ON recurring_donations (stripe_subscription_id);
```

### 2. Setup Prisma Schema
```prisma
// In prisma/schema.prisma
model Donation {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  amount            Decimal  @db.Decimal(10,2)
  currency          String   @default("USD") @db.VarChar(3)
  stripePaymentId   String?  @map("stripe_payment_id") @db.VarChar(255)
  donorEmail        String?  @map("donor_email") @db.VarChar(255)
  donorName         String?  @map("donor_name") @db.VarChar(255)
  fundDesignation   String?  @map("fund_designation") @db.VarChar(100)
  isRecurring       Boolean  @default(false) @map("is_recurring")
  frequency         String?  @db.VarChar(20)
  stripeSubscriptionId String? @map("stripe_subscription_id") @db.VarChar(255)
  createdAt         DateTime @default(now()) @map("created_at")
  metadata          Json?

  @@index([createdAt(sort: Desc)], name: "idx_donations_date")
  @@index([donorEmail], name: "idx_donations_email")
  @@index([stripePaymentId], name: "idx_donations_payment_id")
  @@map("donations")
}

model DonationDesignation {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String   @unique @db.VarChar(100)
  description       String?
  targetAmountCents Int?     @map("target_amount_cents")
  currentAmountCents Int     @default(0) @map("current_amount_cents")
  isActive          Boolean  @default(true) @map("is_active")
  displayOrder      Int      @default(0) @map("display_order")
  createdAt         DateTime @default(now()) @map("created_at")

  @@map("donation_designations")
}

model RecurringDonation {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  donorEmail        String   @map("donor_email") @db.VarChar(255)
  donorName         String?  @map("donor_name") @db.VarChar(255)
  amount            Decimal  @db.Decimal(10,2)
  currency          String   @default("USD") @db.VarChar(3)
  fundDesignation   String?  @map("fund_designation") @db.VarChar(100)
  frequency         String   @db.VarChar(20)
  stripeSubscriptionId String @map("stripe_subscription_id") @db.VarChar(255)
  stripeCustomerId  String   @map("stripe_customer_id") @db.VarChar(255)
  nextPaymentDate   DateTime? @map("next_payment_date")
  status            String   @default("active") @db.VarChar(20)
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  metadata          Json?

  @@index([donorEmail], name: "idx_recurring_email")
  @@index([stripeSubscriptionId], name: "idx_recurring_subscription")
  @@map("recurring_donations")
}
```

## Stripe Integration

### 1. Stripe Account Setup
- Set up Stripe account with proper business information
- Configure webhooks for payment events
- Set up proper tax settings
- Create products for each donation designation

### 2. Stripe API Integration
- Implement payment intent creation
- Set up subscription management
- Configure webhook handling
- Implement idempotency for payment operations

## API Implementation

### 1. Public Endpoints
- `POST /api/donations` - Process one-time donation
- `POST /api/donations/recurring` - Set up recurring donation
- `GET /api/donations/designations` - List active donation designations
- `PUT /api/donations/recurring/:id` - Update recurring donation (with validation)
- `DELETE /api/donations/recurring/:id` - Cancel recurring donation (with validation)

### 2. Admin Endpoints
- `GET /api/admin/donations` - List all donations with filtering
- `GET /api/admin/donations/recurring` - List all recurring donations
- `GET /api/admin/donations/statistics` - Get donation statistics
- CRUD endpoints for donation designations

### 3. Webhook Endpoints
- `POST /api/webhooks/stripe` - Handle Stripe events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

## Frontend Components

### 1. Public Components
- `DonationForm.tsx` - Main donation form container
- `DonationAmountSelector.tsx` - Amount selection with presets and custom input
- `DonationDesignation.tsx` - Fund selection component
- `DonorInfoForm.tsx` - Personal information collection
- `PaymentMethodForm.tsx` - Stripe Elements integration
- `RecurringOptions.tsx` - Frequency selection for recurring donations
- `DonationSummary.tsx` - Review step before submission
- `DonationConfirmation.tsx` - Thank you page with receipt

### 2. Admin Components
- `AdminDonationList.tsx` - List of donations with filtering
- `AdminDonationDetail.tsx` - Detailed view of donation
- `AdminRecurringDonations.tsx` - Management of recurring donations
- `AdminDonationStats.tsx` - Financial reporting dashboard
- `AdminDesignationForm.tsx` - Form for creating/editing designations

## Receipt Generation

### 1. Email Receipts
- Design receipt email template
- Implement receipt number generation
- Set up SendGrid templates
- Implement receipt PDF generation

### 2. Tax Receipt Management
- Create year-end donation summary
- Generate tax receipts for donors
- Implement donation history for logged-in donors

## Recurring Donation Management

### 1. Subscription Management
- Set up Stripe subscription creation
- Implement subscription update logic
- Handle subscription cancellation
- Process subscription payment failures

### 2. User Management Interface
- Create subscription management interface for donors
- Implement payment method updates
- Add donation history view
- Create subscription pause/resume functionality

## State Management

### 1. Donation Form State
- Create multi-step form state management
- Implement form validation logic
- Store temporary state during payment process

### 2. Payment Processing State
- Manage Stripe Elements state
- Handle payment processing status
- Implement loading/success/error states

## Security Implementation

### 1. PCI Compliance
- Use Stripe Elements for secure card collection
- Implement proper CSP headers
- Ensure no card data touches our servers

### 2. Data Protection
- Implement Row Level Security for donor information
- Set up proper data access patterns
- Configure field-level encryption for sensitive data
- Implement GDPR compliance patterns

## Testing Plan

### 1. Unit Tests
- Test donation amount validation
- Test recurring frequency calculations
- Test receipt number generation
- Test email formatting

### 2. Integration Tests
- Test Stripe API integration
  - Payment intent creation
  - Subscription setup
  - Webhook handling
- Test email sending flow
- Test database operations

### 3. E2E Tests
- Complete donation workflow
  - One-time donation
  - Recurring donation setup
  - Donation management
- Test admin interfaces
- Test receipt generation and delivery

### 4. Security Tests
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Payment security checks

## Implementation Steps

### Phase 1: Database & API Setup
1. Create Supabase tables and indices
2. Set up Prisma schema
3. Implement core API endpoints
4. Configure Stripe account settings

### Phase 2: Donation Flow
1. Build donation form components
2. Integrate Stripe Elements
3. Implement payment processing
4. Create donation confirmation flow

### Phase 3: Recurring Donations
1. Set up subscription management
2. Implement webhook handling
3. Create recurring donation interfaces
4. Test subscription lifecycle

### Phase 4: Admin & Reporting
1. Build admin donation management
2. Implement financial reporting
3. Create designation management
4. Set up data export functionality

### Phase 5: Receipts & Compliance
1. Design and implement receipt emails
2. Create PDF generation for tax receipts
3. Implement year-end summary functionality
4. Test regulatory compliance

## Feature Acceptance Criteria
- [ ] Users can make one-time donations with credit card
- [ ] Users can set up recurring donations
- [ ] Donation designations/funds are selectable
- [ ] Receipts are generated and emailed automatically
- [ ] Recurring donations are properly managed
- [ ] Admin can view all donation activity
- [ ] Donation statistics are properly calculated
- [ ] Payment failures are handled gracefully
- [ ] All financial data is properly secured
- [ ] Tax receipts are generated correctly

## Security Requirements
- All payment data must be processed via Stripe directly
- No credit card information should ever touch our servers
- Donor information must be protected with Row Level Security
- Webhook endpoints must validate Stripe signatures
- HTTPS must be enforced for all transactions
- PII should be minimized and protected

## Compliance Checklist
- [ ] PCI DSS compliance via Stripe
- [ ] GDPR compliant data storage
- [ ] Tax receipt requirements
- [ ] Financial record keeping requirements
- [ ] Data retention policies
- [ ] Privacy policy updates
