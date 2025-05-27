# Feature 3: Event Management System - Implementation Plan

## Overview
The Event Management System will enable comprehensive management of church events with registration, calendar integration, capacity management, and automated communications.

## Database Schema Implementation

### 1. Setup Supabase Schema
```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'service', 'study', 'social', 'outreach'
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  location_name VARCHAR(255),
  location_address TEXT,
  location_coordinates POINT, -- PostGIS for geo data
  max_capacity INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP,
  cost_cents INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  category VARCHAR(100)
);

-- Event registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  attendee_name VARCHAR(255) NOT NULL,
  attendee_email VARCHAR(255) NOT NULL,
  attendee_phone VARCHAR(20),
  party_size INTEGER DEFAULT 1,
  special_requests TEXT,
  registration_status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'waitlist', 'cancelled'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  payment_intent_id VARCHAR(255), -- Stripe payment intent
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_datetime ON events (start_datetime, is_published);
CREATE INDEX idx_events_type ON events (event_type);
CREATE INDEX idx_events_featured ON events (is_featured, start_datetime);
CREATE INDEX idx_registrations_event ON event_registrations (event_id);
CREATE INDEX idx_registrations_email ON event_registrations (attendee_email);

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Setup Prisma Schema
```prisma
// In prisma/schema.prisma
model Event {
  id                  String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title               String             @db.VarChar(255)
  description         String?
  eventType           String             @map("event_type") @db.VarChar(50)
  startDatetime       DateTime           @map("start_datetime")
  endDatetime         DateTime           @map("end_datetime")
  locationName        String?            @map("location_name") @db.VarChar(255)
  locationAddress     String?            @map("location_address")
  locationCoordinates Unsupported("POINT")? @map("location_coordinates")
  maxCapacity         Int?               @map("max_capacity")
  registrationRequired Boolean           @default(false) @map("registration_required")
  registrationDeadline DateTime?         @map("registration_deadline")
  costCents           Int                @default(0) @map("cost_cents")
  imageUrl            String?            @map("image_url") @db.VarChar(500)
  contactEmail        String?            @map("contact_email") @db.VarChar(255)
  contactPhone        String?            @map("contact_phone") @db.VarChar(20)
  isFeatured          Boolean            @default(false) @map("is_featured")
  isPublished         Boolean            @default(true) @map("is_published")
  category            String?            @db.VarChar(100)
  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @default(now()) @updatedAt @map("updated_at")
  registrations       EventRegistration[]

  @@index([startDatetime, isPublished], name: "idx_events_datetime")
  @@index([eventType], name: "idx_events_type")
  @@index([isFeatured, startDatetime], name: "idx_events_featured")
  @@map("events")
}

model EventRegistration {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  eventId           String    @map("event_id") @db.Uuid
  attendeeName      String    @map("attendee_name") @db.VarChar(255)
  attendeeEmail     String    @map("attendee_email") @db.VarChar(255)
  attendeePhone     String?   @map("attendee_phone") @db.VarChar(20)
  partySize         Int       @default(1) @map("party_size")
  specialRequests   String?   @map("special_requests")
  registrationStatus String    @default("confirmed") @map("registration_status") @db.VarChar(20)
  paymentStatus     String    @default("pending") @map("payment_status") @db.VarChar(20)
  paymentIntentId   String?   @map("payment_intent_id") @db.VarChar(255)
  registeredAt      DateTime  @default(now()) @map("registered_at")
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at")
  event             Event     @relation(fields: [eventId], references: [id])

  @@index([eventId], name: "idx_registrations_event")
  @@index([attendeeEmail], name: "idx_registrations_email")
  @@map("event_registrations")
}
```

## API Implementation

### 1. Public Endpoints
- `GET /api/events` - List upcoming events with filters
  - Support for date range, category, type filters
  - Support for pagination
  - Featured events filter
- `GET /api/events/:id` - Get single event details
- `GET /api/events/calendar` - iCal format for calendar integration
- `POST /api/events/:id/register` - Register for an event
- `DELETE /api/events/:id/register/:registrationId` - Cancel registration (with token validation)

### 2. Admin Endpoints
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events` - List all events (including unpublished)
- `GET /api/admin/events/:id` - Get single event with all details
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event or set unpublished
- `GET /api/admin/events/:id/registrations` - List all registrations for an event
- `PUT /api/admin/events/registrations/:id` - Update registration status

### 3. Payment Integration
- `POST /api/events/:id/payment-intent` - Create payment intent for paid events
- `POST /api/webhooks/stripe` - Handle Stripe webhook for payment status updates

## Calendar Integration

### 1. iCal Feed Generation
- Implement RFC5545 compliant iCal generation
- Support for individual event export
- Support for full calendar export
- Include proper timezone handling

### 2. Calendar Integration Interfaces
- Add "Add to Calendar" button with multiple options:
  - Google Calendar
  - Apple Calendar
  - Microsoft Outlook
  - Download .ics file

## Frontend Components

### 1. Public Components
- `EventList.tsx` - Main event listing page
- `EventCard.tsx` - Individual event preview card
- `EventDetail.tsx` - Full event page
- `EventCalendar.tsx` - Calendar view of events
- `RegistrationForm.tsx` - Form for event registration
- `EventFilters.tsx` - Filter controls
- `PaymentForm.tsx` - Form for handling payments (paid events)

### 2. Admin Components
- `AdminEventList.tsx` - List of events with filters
- `AdminEventForm.tsx` - Form for creating/editing events
- `AdminRegistrationList.tsx` - List of registrations per event
- `AdminRegistrationDetail.tsx` - Detailed view of registration

## Location & Maps Integration

### 1. Google Maps Integration
- Set up Google Maps API for location selection
- Implement map display on event pages
- Add directions functionality

### 2. Location Management
- Add address autocomplete
- Store and display geographical coordinates
- Support for multiple venues/locations

## Email Notifications

### 1. SendGrid Integration
- Set up SendGrid templates for:
  - Registration confirmation
  - Event reminder (24h before)
  - Registration cancellation
  - Event update notification
  - Waitlist status updates

### 2. Notification Triggers
- Implement email sending on:
  - New registration
  - Status change (confirmed to waitlist or vice versa)
  - Event details update
  - Event cancellation

## Registration System

### 1. Capacity Management
- Implement capacity tracking
- Add waitlist functionality
- Handle party size in capacity calculations

### 2. Registration Workflow
- Create registration form with validation
- Handle special requests
- Process payments for paid events
- Generate confirmation codes
- Send confirmation emails

## State Management

### 1. React Query Setup
- Set up queries for event data
- Configure proper caching
- Handle refetching and mutations

### 2. Zustand for Form State
- Manage multi-step registration form state
- Handle payment process state

## Realtime Updates

### 1. Supabase Realtime Configuration
- Set up realtime subscriptions for:
  - Registration count updates
  - Event status updates
  - Waitlist movement

### 2. Frontend Implementation
- Show realtime capacity updates
- Implement waitlist position tracking
- Display "almost full" warnings

## Testing Plan

### 1. Unit Tests
- Test event model validation
- Test registration validation
- Test capacity calculation
- Test waitlist logic
- Test iCal generation

### 2. Integration Tests
- Test API endpoints
  - Filtering logic
  - Registration workflow
  - Payment processing
- Test email sending
- Test calendar integration

### 3. E2E Tests
- Test complete registration flow
  - Free event registration
  - Paid event registration
  - Waitlist process
- Test admin event management
- Test registration management

### 4. Load Tests
- Test concurrent registration handling
- Test capacity limit enforcement
- Test waitlist management under load

## Implementation Steps

### Phase 1: Database & API Setup
1. Create Supabase tables and indexes
2. Set up Prisma schema
3. Enable PostGIS extension
4. Implement core API endpoints

### Phase 2: Event Display & Management
1. Build event listing and filtering UI
2. Create event detail page
3. Implement admin event management
4. Add location and map support

### Phase 3: Registration System
1. Build registration form
2. Implement capacity management
3. Create waitlist functionality
4. Set up email notifications

### Phase 4: Calendar Integration
1. Implement iCal feed generation
2. Add "Add to Calendar" functionality
3. Create calendar view component

### Phase 5: Payment Integration
1. Set up Stripe integration
2. Create payment flow for paid events
3. Implement webhook handling
4. Test payment scenarios

## Feature Acceptance Criteria
- [ ] Users can browse and filter upcoming events
- [ ] Event details page shows all relevant information
- [ ] Users can register for events with proper validation
- [ ] Capacity limits and waitlist function correctly
- [ ] Calendar integration works with major calendar providers
- [ ] Payment processing works for paid events
- [ ] Email notifications send at appropriate times
- [ ] Admin can create and manage events
- [ ] Admin can view and manage registrations
