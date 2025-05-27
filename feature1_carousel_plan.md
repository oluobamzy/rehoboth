# Feature 1: Hero Carousel System - Implementation Plan

## Overview
The Hero Carousel System will showcase church highlights, upcoming events, and key messages with smooth transitions and mobile responsiveness on the homepage.

## Database Schema Implementation

### 1. Setup Supabase Schema
```sql
-- Carousel slides table
CREATE TABLE carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url VARCHAR(500) NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_carousel_active_order ON carousel_slides (is_active, display_order);
CREATE INDEX idx_carousel_dates ON carousel_slides (start_date, end_date);
```

### 2. Setup Prisma Schema
```prisma
// In prisma/schema.prisma
model CarouselSlide {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title        String    @db.VarChar(255)
  subtitle     String?
  imageUrl     String    @db.VarChar(500) @map("image_url")
  ctaText      String?   @db.VarChar(100) @map("cta_text")
  ctaLink      String?   @db.VarChar(500) @map("cta_link")
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")
  startDate    DateTime? @map("start_date")
  endDate      DateTime? @map("end_date")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @default(now()) @map("updated_at")

  @@index([isActive, displayOrder], name: "idx_carousel_active_order")
  @@index([startDate, endDate], name: "idx_carousel_dates")
  @@map("carousel_slides")
}
```

## API Implementation

### 1. Public Endpoints
- Create API for fetching active carousel slides (`GET /api/carousel/slides`)
  - Filter by current date (if start/end date set)
  - Filter by is_active flag
  - Sort by display_order
  - Include proper caching headers

### 2. Admin Endpoints
- Create API for CRUD operations:
  - `POST /api/admin/carousel` - Create new slide
  - `GET /api/admin/carousel` - List all slides
  - `GET /api/admin/carousel/:id` - Get single slide
  - `PUT /api/admin/carousel/:id` - Update slide
  - `DELETE /api/admin/carousel/:id` - Delete slide
  - `PATCH /api/admin/carousel/order` - Update display order

## Frontend Components

### 1. Public Components
- `HeroCarousel.tsx` - Main container
  - Handle auto-play functionality
  - Manage slide transitions
  - Handle navigation controls
- `CarouselSlide.tsx` - Individual slide
  - Responsive image handling
  - Text overlay with title/subtitle
  - CTA button
- `CarouselControls.tsx` - Navigation dots and arrows
- `CarouselIndicators.tsx` - Progress indicators

### 2. Admin Components
- `AdminCarouselList.tsx` - List of slides with drag-and-drop ordering
- `AdminCarouselForm.tsx` - Form for creating/editing slides
- `AdminImageUpload.tsx` - Image upload with preview

## Image Management

### 1. Firebase Storage Setup
- Configure Firebase storage bucket for carousel images
- Set up security rules for admin access only
- Configure CORS settings

### 2. Image Upload Flow
- Create upload service to Firebase Storage
- Generate secure URLs with expiration
- Implement image optimization before upload
- Store URL in Supabase

## State Management

### 1. React Query Implementation
- Setup queries for fetching carousel data
- Configure proper caching strategy
- Handle refetching on window focus

### 2. Zustand Implementation
- Create admin carousel state store
- Handle ordering state during drag-and-drop
- Manage form state for edit/create

## Testing Plan

### 1. Unit Tests
- Test carousel hook logic
  - Auto-play functionality
  - Navigation controls
  - Touch gestures
- Test slide component rendering
  - Image fallback
  - Text overlay positioning
  - Responsive behavior
- Test admin components
  - Form validation
  - Image preview

### 2. Integration Tests
- Test API endpoints
  - Valid responses
  - Error handling
  - Validation logic
- Test image upload flow
  - Valid uploads
  - Invalid file rejection
  - Storage integration

### 3. E2E Tests
- Test full carousel interaction
  - Navigation
  - Auto-play
  - CTA button clicks
- Test admin flow
  - Create, update, delete slides
  - Change ordering
  - Preview changes

## Logging & Analytics

### 1. Error Logging
- Log API errors with context
- Track image load failures
- Monitor cache hit rates

### 2. User Interaction Tracking
- Track slide views (PostHog)
- Track CTA clicks
- Track engagement time

## Deployment Checklist
- Verify Firebase Storage CORS configuration
- Test CDN caching behavior
- Validate image loading performance
- Check responsive behavior across devices

## Feature Acceptance Criteria
- [ ] Carousel auto-plays on homepage load
- [ ] Navigation controls work (dots, arrows)
- [ ] Touch swipe works on mobile devices
- [ ] Images load properly with optimized sizes
- [ ] CTA buttons function correctly
- [ ] Admin can create, edit, delete slides
- [ ] Admin can change display order
- [ ] Active/inactive slides work correctly
- [ ] Date-based scheduling works properly
