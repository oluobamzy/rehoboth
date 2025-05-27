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
- Set up Firebase storage structure:
  - `/sermons/audio/{id}.mp3` - For audio files
  - `/sermons/video/{id}.mp4` - For raw video
  - `/sermons/video/{id}/` - For HLS streaming files
  - `/sermons/thumbnails/{id}.jpg` - For thumbnails
- Configure security rules for admin-only uploads
- Configure public read access with appropriate cache headers

### 2. Media Processing Workflow
- Set up FFmpeg processing for:
  - Audio transcoding to optimal MP3 format
  - Video transcoding to HLS adaptive streaming format
  - Thumbnail extraction from videos
- Create backend function for processing uploaded media
- Implement progress tracking for long-running tasks

## API Implementation

### 1. Public Endpoints
- `GET /api/sermons` - List sermons with filters
  - Support pagination, sorting
  - Filter by speaker, series, dates, tags
  - Support text search
- `GET /api/sermons/:id` - Get single sermon with all details
- `GET /api/sermons/series` - List all sermon series
- `GET /api/sermons/series/:id` - Get sermons in a specific series
- `GET /api/sermons/speakers` - List all speakers
- `GET /api/sermons/tags` - List all tags

### 2. Admin Endpoints
- `POST /api/admin/sermons` - Create new sermon
- `PUT /api/admin/sermons/:id` - Update sermon
- `DELETE /api/admin/sermons/:id` - Soft delete sermon
- CRUD endpoints for sermon series management

### 3. Media Endpoints
- `POST /api/admin/sermons/upload/audio` - Upload audio file
- `POST /api/admin/sermons/upload/video` - Upload video file
- `GET /api/admin/sermons/process/:id` - Check processing status

## Frontend Components

### 1. Public Components
- `SermonList.tsx` - Main listing page with filters
- `SermonCard.tsx` - Individual sermon preview card
- `SermonDetail.tsx` - Full sermon page
- `SermonPlayer.tsx` - Audio/video player component
  - Support for both audio and video playback
  - Progress tracking
  - Speed controls
  - Download options
- `SermonSearch.tsx` - Search interface
- `SermonFilters.tsx` - Filter controls
- `SermonSeries.tsx` - Series display component

### 2. Admin Components
- `AdminSermonList.tsx` - List of sermons with filters
- `AdminSermonForm.tsx` - Form for creating/editing sermons
- `AdminSeriesForm.tsx` - Form for creating/editing series
- `AdminMediaUpload.tsx` - Media upload component with progress

## State Management

### 1. React Query Setup
- Setup queries for fetching sermon data
- Configure caching strategy
- Handle infinite loading for sermon lists

### 2. Player State Management
- Create custom hooks for player functionality
- Handle player state across route changes
- Track and save playback position

## Search Implementation

### 1. Configure Supabase Full-Text Search
- Use the search_vector column setup in schema
- Implement ranking and highlights

### 2. Frontend Search Experience
- Implement search with debounce
- Add filtering options within search results
- Support for speaker/series/tag filtering

## Testing Plan

### 1. Unit Tests
- Test sermon model validation
- Test search query building
- Test player component functionality
- Test filter logic

### 2. Integration Tests
- Test API endpoints
  - Validate filtering logic
  - Test search functionality
  - Test pagination
- Test media upload and processing
  - Valid file upload
  - Processing workflow
  - URL generation

### 3. E2E Tests
- Test sermon browsing experience
- Test playback functionality
  - Audio playback
  - Video playback
  - Position saving
- Test search functionality
- Test admin workflow
  - Create sermon
  - Upload media
  - Edit details

### 4. Performance Tests
- Measure search response times
- Test streaming performance
- Evaluate database query performance
- Test concurrent media streaming

## Analytics & Tracking

### 1. View Tracking
- Implement sermon view counting
- Track engagement metrics (play, pause, complete)
- Monitor popular sermons and series

### 2. User Engagement
- Track search terms for content planning
- Measure average watch time
- Track sharing actions

## Implementation Steps

### Phase 1: Database & API Setup
1. Create Supabase tables and indexes
2. Set up Prisma schema
3. Implement core API endpoints
4. Set up Firebase storage structure

### Phase 2: Media Processing
1. Set up FFmpeg processing scripts
2. Create upload workflows
3. Implement HLS streaming support
4. Test media processing pipeline

### Phase 3: Frontend Development
1. Build sermon listing and detail pages
2. Implement custom media player
3. Create search and filter interfaces
4. Test responsive behavior

### Phase 4: Admin Interface
1. Build sermon management interfaces
2. Create series management tools
3. Implement media upload components
4. Test admin workflows

### Phase 5: Analytics & Optimization
1. Implement analytics tracking
2. Optimize search performance
3. Set up caching strategy
4. Fine-tune media delivery

## Feature Acceptance Criteria
- [ ] Users can browse sermons with filters
- [ ] Users can search sermon content
- [ ] Audio and video playback works smoothly
- [ ] Streaming adapts to connection quality
- [ ] Admin can create and manage sermons
- [ ] Admin can upload and process media files
- [ ] Sermon series are properly organized
- [ ] View tracking works correctly
