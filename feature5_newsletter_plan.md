# Feature 5: Newsletter & Communication System - Implementation Plan

## Overview
The Newsletter & Communication System will implement comprehensive email marketing and communication capabilities with segmentation, automation, and engagement tracking for church community outreach.

## Database Schema Implementation

### 1. Setup Supabase Schema
```sql
-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  preferences JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- 'active', 'pending', 'unsubscribed'
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  template_id VARCHAR(100),
  content JSONB,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'canceled'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign audience segments
CREATE TABLE campaign_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  name VARCHAR(100) NOT NULL,
  filter_criteria JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign statistics
CREATE TABLE campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  emails_sent INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  subject VARCHAR(255),
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscribers_email ON newsletter_subscribers (email);
CREATE INDEX idx_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX idx_campaigns_status ON email_campaigns (status);
CREATE INDEX idx_campaigns_scheduled ON email_campaigns (scheduled_at);
```

### 2. Setup Prisma Schema
```prisma
// In prisma/schema.prisma
model NewsletterSubscriber {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String    @unique @db.VarChar(255)
  firstName         String?   @map("first_name") @db.VarChar(100)
  lastName          String?   @map("last_name") @db.VarChar(100)
  preferences       Json      @default("{}")
  status            String    @default("pending") @db.VarChar(20)
  verificationToken String?   @map("verification_token") @db.VarChar(255)
  verifiedAt        DateTime? @map("verified_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at")

  @@index([email], name: "idx_subscribers_email")
  @@index([status], name: "idx_subscribers_status")
  @@map("newsletter_subscribers")
}

model EmailCampaign {
  id            String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name          String            @db.VarChar(255)
  subject       String            @db.VarChar(255)
  previewText   String?           @map("preview_text") @db.VarChar(255)
  templateId    String?           @map("template_id") @db.VarChar(100)
  content       Json?
  status        String            @default("draft") @db.VarChar(20)
  scheduledAt   DateTime?         @map("scheduled_at")
  sentAt        DateTime?         @map("sent_at")
  createdBy     String            @map("created_by") @db.Uuid
  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @default(now()) @updatedAt @map("updated_at")
  segments      CampaignSegment[]
  statistics    CampaignStat?

  @@index([status], name: "idx_campaigns_status")
  @@index([scheduledAt], name: "idx_campaigns_scheduled")
  @@map("email_campaigns")
}

model CampaignSegment {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  campaignId     String       @map("campaign_id") @db.Uuid
  name           String       @db.VarChar(100)
  filterCriteria Json         @map("filter_criteria")
  createdAt      DateTime     @default(now()) @map("created_at")
  campaign       EmailCampaign @relation(fields: [campaignId], references: [id])

  @@map("campaign_segments")
}

model CampaignStat {
  id           String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  campaignId   String       @unique @map("campaign_id") @db.Uuid
  emailsSent   Int          @default(0) @map("emails_sent")
  opens        Int          @default(0)
  uniqueOpens  Int          @default(0) @map("unique_opens")
  clicks       Int          @default(0)
  uniqueClicks Int          @default(0) @map("unique_clicks")
  unsubscribes Int          @default(0)
  bounces      Int          @default(0)
  complaints   Int          @default(0)
  updatedAt    DateTime     @default(now()) @updatedAt @map("updated_at")
  campaign     EmailCampaign @relation(fields: [campaignId], references: [id])

  @@map("campaign_stats")
}

model EmailTemplate {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @db.VarChar(100)
  description String?
  subject     String?  @db.VarChar(255)
  htmlContent String   @map("html_content")
  textContent String?  @map("text_content")
  variables   Json?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  @@map("email_templates")
}
```

## SendGrid Integration

### 1. SendGrid Account Setup
- Set up SendGrid account with domain verification
- Configure sender identity
- Set up domain authentication (DKIM, SPF)
- Create tracking settings for opens and clicks
- Set up webhook event handling

### 2. Email Template Management
- Create base HTML templates in SendGrid
- Set up dynamic templates with Handlebars
- Design responsive email layouts
- Create standard templates for:
  - Newsletter
  - Welcome/Verification
  - Event notifications
  - Sermon digests

## API Implementation

### 1. Public Endpoints
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `GET /api/newsletter/verify/:token` - Verify subscription
- `DELETE /api/newsletter/unsubscribe/:token` - Unsubscribe from newsletter
- `PUT /api/newsletter/preferences` - Update subscription preferences

### 2. Admin Endpoints
- `GET /api/admin/newsletter/subscribers` - List subscribers with filtering
- `POST /api/admin/newsletter/campaigns` - Create campaign
- `GET /api/admin/newsletter/campaigns` - List campaigns
- `GET /api/admin/newsletter/campaigns/:id` - Get campaign details
- `PUT /api/admin/newsletter/campaigns/:id` - Update campaign
- `POST /api/admin/newsletter/campaigns/:id/schedule` - Schedule campaign
- `POST /api/admin/newsletter/campaigns/:id/send` - Send campaign immediately
- `DELETE /api/admin/newsletter/campaigns/:id` - Delete draft campaign
- CRUD endpoints for template and segment management

### 3. Webhook Endpoint
- `POST /api/webhooks/sendgrid` - Handle SendGrid events:
  - `delivered`
  - `open`
  - `click`
  - `unsubscribe`
  - `bounce`
  - `spam_report`

## Frontend Components

### 1. Public Components
- `NewsletterSubscribe.tsx` - Newsletter signup form
- `PreferencesForm.tsx` - Subscription preferences form
- `VerificationPage.tsx` - Email verification page
- `UnsubscribePage.tsx` - Unsubscribe page with feedback

### 2. Admin Components
- `AdminSubscriberList.tsx` - List of subscribers with filtering
- `AdminSubscriberDetail.tsx` - Detailed view of subscriber
- `AdminCampaignList.tsx` - List of campaigns with status
- `AdminCampaignEditor.tsx` - Campaign creation and editing interface
- `AdminTemplateEditor.tsx` - Template editing interface with preview
- `AdminSegmentBuilder.tsx` - Audience segment builder
- `AdminCampaignStats.tsx` - Campaign performance analytics

## Email Template Editor

### 1. WYSIWYG Editor
- Implement visual editor for email templates
- Support for basic formatting
- Component-based layout building
- Image upload and management
- Mobile preview

### 2. Variable Management
- Support for dynamic content via variables
- Preview with sample data
- Variable validation

## Subscriber Management

### 1. Double Opt-in Implementation
- Generate verification tokens
- Send verification emails
- Handle verification process
- Track verification status

### 2. Preference Center
- Create subscription preference management
- Allow category/frequency selection
- Enable granular content preferences
- Support for unsubscribe with reasons

## Audience Segmentation

### 1. Segment Builder
- Create UI for building subscriber segments
- Support filtering by:
  - Subscriber data (name, email domain)
  - Engagement metrics (opens, clicks)
  - Preferences
  - Custom attributes
- Save and reuse segments

### 2. Dynamic Lists
- Implement automatic list updates based on criteria
- Support for inclusion/exclusion rules
- Create segment preview functionality

## Campaign Management

### 1. Campaign Creation Flow
- Multi-step campaign creation process:
  1. Basic details (name, subject)
  2. Template selection
  3. Content editing
  4. Audience selection
  5. Preview and test
  6. Schedule or send

### 2. Email Scheduling
- Implement send-time scheduling
- Support for timezone adjustments
- Add optimal send time suggestions

## Analytics & Reporting

### 1. Campaign Performance Tracking
- Track email delivery and engagement metrics
- Create visual reports and dashboards
- Implement comparative analysis

### 2. Subscriber Insights
- Track subscriber engagement over time
- Identify most engaged subscribers
- Flag inactive subscribers for re-engagement

## Testing Plan

### 1. Unit Tests
- Test email validation logic
- Test token generation and verification
- Test template rendering
- Test segment query building

### 2. Integration Tests
- Test subscription workflow
- Test campaign creation and sending
- Test webhook event handling
- Test email delivery pipeline

### 3. E2E Tests
- Complete subscription and verification flow
- Template editing and preview
- Campaign creation, scheduling, and sending
- Unsubscribe flow

### 4. Email Rendering Tests
- Test templates across email clients
- Test responsive behavior
- Test with and without images
- Test plain text fallback

## Compliance Implementation

### 1. CAN-SPAM Compliance
- Include physical address in emails
- Implement clear unsubscribe mechanism
- Honor opt-out requests promptly
- Use accurate From, To, Reply-to headers

### 2. GDPR Implementation
- Implement explicit consent capture
- Store consent records
- Add data export functionality
- Create data deletion process

## Implementation Steps

### Phase 1: Database & API Setup
1. Create Supabase tables and indices
2. Set up Prisma schema
3. Implement core API endpoints
4. Configure SendGrid account settings

### Phase 2: Subscription Management
1. Build subscription form components
2. Implement verification process
3. Create preference management
4. Set up unsubscribe flow

### Phase 3: Template System
1. Design base email templates
2. Create template editor
3. Implement variable management
4. Test rendering across devices

### Phase 4: Campaign Management
1. Build campaign creation workflow
2. Implement segment builder
3. Create scheduling functionality
4. Set up SendGrid integration

### Phase 5: Analytics & Reporting
1. Implement webhook handling
2. Create analytics dashboard
3. Build performance reports
4. Test tracking accuracy

## Feature Acceptance Criteria
- [ ] Users can subscribe to the newsletter
- [ ] Double opt-in verification works correctly
- [ ] Users can manage their subscription preferences
- [ ] Admin can create and edit email templates
- [ ] Admin can build audience segments
- [ ] Admin can create, schedule and send campaigns
- [ ] Email tracking properly records engagement
- [ ] Campaign performance data is accurately reported
- [ ] Compliance requirements are fully met

## Security & Compliance Checklist
- [ ] Email addresses are properly secured
- [ ] Verification tokens are securely generated
- [ ] Unsubscribe links are properly authenticated
- [ ] CAN-SPAM compliance is maintained
- [ ] GDPR compliance is implemented
- [ ] Email authentication is properly configured (SPF, DKIM)
- [ ] Personal data is properly protected
