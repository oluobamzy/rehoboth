# Feature 2: Sermon Management System - Implementation Plan

## Overview
The Sermon Management System will provide a comprehensive platform for managing, categorizing, and streaming sermon content with search capabilities and engagement tracking.

## Database Schema Implementation

### 1. Setup Supabase Schema
```sql
-- Sermon series table
CREATE TABLE sermon_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sermons table
CREATE TABLE sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scripture_reference VARCHAR(255),
  speaker_name VARCHAR(255) NOT NULL,
  sermon_date DATE NOT NULL,
  duration_seconds INTEGER,
  audio_url VARCHAR(500),
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  transcript TEXT,
  tags TEXT[], -- PostgreSQL array
  series_id UUID REFERENCES sermon_series(id),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sermons_published_date ON sermons (is_published, sermon_date DESC);
CREATE INDEX idx_sermons_series ON sermons (series_id);
CREATE INDEX idx_sermons_speaker ON sermons (speaker_name);
CREATE INDEX idx_sermons_tags ON sermons USING GIN (tags);

-- Enable full-text search
ALTER TABLE sermons ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title,'') || ' ' || 
  coalesce(description,'') || ' ' || 
  coalesce(transcript,'') || ' ' || 
  coalesce(scripture_reference,'') || ' ' ||
  coalesce(speaker_name,''))
) STORED;

CREATE INDEX idx_sermons_search ON sermons USING GIN (search_vector);
```

### 2. Setup Prisma Schema
```prisma
// In prisma/schema.prisma
model SermonSeries {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String    @db.VarChar(255)
  description String?
  imageUrl    String?   @map("image_url") @db.VarChar(500)
  startDate   DateTime? @map("start_date") @db.Date
  endDate     DateTime? @map("end_date") @db.Date
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  sermons     Sermon[]

  @@map("sermon_series")
}

model Sermon {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title             String    @db.VarChar(255)
  description       String?
  scriptureReference String?   @map("scripture_reference") @db.VarChar(255)
  speakerName       String    @map("speaker_name") @db.VarChar(255)
  sermonDate        DateTime  @map("sermon_date") @db.Date
  durationSeconds   Int?      @map("duration_seconds")
  audioUrl          String?   @map("audio_url") @db.VarChar(500)
  videoUrl          String?   @map("video_url") @db.VarChar(500)
  thumbnailUrl      String?   @map("thumbnail_url") @db.VarChar(500)
  transcript        String?
  tags              String[]
  seriesId          String?   @map("series_id") @db.Uuid
  viewCount         Int       @default(0) @map("view_count")
  isFeatured        Boolean   @default(false) @map("is_featured")
  isPublished       Boolean   @default(true) @map("is_published")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at")
  series            SermonSeries? @relation(fields: [seriesId], references: [id])

  @@index([isPublished, sermonDate(sort: Desc)], name: "idx_sermons_published_date")
  @@index([seriesId], name: "idx_sermons_series")
  @@index([speakerName], name: "idx_sermons_speaker")
  @@map("sermons")
}
```

## Media Processing & Storage

### 1. Firebase Storage Configuration
- [x] Set up Firebase storage structure:
  - [x] `/sermons/audio/{id}.mp3` - For audio files
  - [x] `/sermons/video/{id}.mp4` - For raw video
  - [x] `/sermons/video/{id}/` - For HLS streaming files
  - [x] `/sermons/thumbnails/{id}.jpg` - For thumbnails
- [x] Configure security rules for admin-only uploads
- [x] Configure public read access with appropriate cache headers

### 2. Media Processing Workflow
- [x] Set up FFmpeg processing for:
  - [x] Audio transcoding to optimal MP3 format
  - [x] Video transcoding to HLS adaptive streaming format
  - [x] Thumbnail extraction from videos
- [x] Create backend function for processing uploaded media
- [x] Implement progress tracking for long-running tasks

## API Implementation

### 1. Public Endpoints
- [x] `GET /api/sermons` - List sermons with filters
  - [x] Support pagination, sorting
  - [x] Filter by speaker, series, dates, tags
  - [x] Support text search
- [x] `GET /api/sermons/:id` - Get single sermon with all details
- [x] `GET /api/sermons/series` - List all sermon series
- [x] `GET /api/sermons/series/:id` - Get sermons in a specific series
- [x] `GET /api/sermons/speakers` - List all speakers (through sermonService)
- [x] `GET /api/sermons/tags` - List all tags (through sermonService)

### 2. Admin Endpoints
- [x] CRUD operations (implemented in sermonService)
  - [x] Create new sermon
  - [x] Update sermon
  - [x] Delete/soft delete sermon
  - [x] CRUD for sermon series management

### 3. Media Endpoints
- [x] Media upload and processing capabilities (implemented in mediaProcessing.ts)
  - [x] Upload audio file
  - [x] Upload video file
  - [x] Process media with progress tracking

## Frontend Components

### 1. Public Components
- [x] `SermonList.tsx` - Main listing page with filters
- [x] `SermonCard.tsx` - Individual sermon preview card
- [x] `SermonDetail.tsx` - Full sermon page
- [x] `SermonPlayer.tsx` - Audio/video player component
  - [x] Support for both audio and video playback
  - [x] Progress tracking
  - [x] Speed controls
  - [x] Download options
- [x] `SermonSearch.tsx` - Search interface
- [x] `SermonFilters.tsx` - Filter controls (integrated into SermonList)
- [x] `SermonSeries.tsx` - Series display component

### 2. Admin Components
- [x] `AdminSermonList.tsx` - List of sermons with filters
- [x] `AdminSermonForm.tsx` - Form for creating/editing sermons
- [x] `AdminSeriesForm.tsx` - Form for creating/editing series
- [x] `AdminMediaUpload.tsx` - Media upload component with progress

## State Management

### 1. React Query Setup
- [x] Setup queries for fetching sermon data
- [x] Configure caching strategy
- [x] Handle sermon list loading and pagination

### 2. Player State Management
- [x] Create player functionality with controls
- [x] Handle player state across component lifecycle
- [x] Track playback position

## Search Implementation

### 1. Configure Supabase Full-Text Search
- [x] Use the search_vector column setup in schema
- [x] Implement ranking functionality

### 2. Frontend Search Experience
- [x] Implement search with appropriate handling
- [x] Add filtering options within search results
- [x] Support for speaker/series/tag filtering

## Testing Plan

### 1. Unit Tests
- [x] Test sermon component functionality
- [x] Test media processing functionality
- [x] Test player component functionality
- [x] Test filter logic

### 2. Integration Tests
- [x] Test API endpoints
  - [x] Validate filtering logic
  - [x] Test search functionality
  - [x] Test data retrieval
- [x] Test media upload and processing
  - [x] Valid file upload
  - [x] Processing workflow
  - [x] URL generation

### 3. E2E/Component Tests
- [x] Test sermon component functionality
- [x] Test playback functionality
  - [x] Audio playback
  - [x] Video playback
  - [x] Playback controls
- [x] Test search functionality
- [x] Test media display components

### 4. Performance Testing
- [x] Media processing optimization
- [x] Streaming performance with HLS
- [x] Database query optimization
- [x] Responsive media handling

## Analytics & Tracking

### 1. View Tracking
- [x] Implement sermon view counting
- [x] Track engagement metrics with PostHog integration
- [x] Monitor popular sermons and series

### 2. User Engagement
- [x] Track sermon interactions
- [x] Measure engagement metrics
- [x] Support for sharing capabilities

## Implementation Steps

### Phase 1: Database & API Setup
1. [x] Create Supabase tables and indexes
2. [x] Set up database schema
3. [x] Implement core API endpoints
4. [x] Set up Firebase storage structure

### Phase 2: Media Processing
1. [x] Set up FFmpeg processing scripts
2. [x] Create upload workflows
3. [x] Implement HLS streaming support
4. [x] Test media processing pipeline

### Phase 3: Frontend Development
1. [x] Build sermon listing and detail pages
2. [x] Implement custom media player
3. [x] Create search and filter interfaces
4. [x] Test responsive behavior

### Phase 4: Admin Interface
1. [x] Build sermon management interfaces
2. [x] Create series management tools
3. [x] Implement media upload components
4. [x] Test admin workflows

### Phase 5: Analytics & Optimization
1. [x] Implement analytics tracking
2. [x] Optimize search performance
3. [x] Set up caching strategy
4. [x] Fine-tune media delivery

## Feature Acceptance Criteria
- [x] Users can browse sermons with filters
- [x] Users can search sermon content
- [x] Audio and video playback works smoothly
- [x] Streaming adapts to connection quality
- [x] Admin can create and manage sermons
- [x] Admin can upload and process media files
- [x] Sermon series are properly organized
- [x] View tracking works correctly
