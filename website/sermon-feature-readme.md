# Sermon Management System

## Overview
The Sermon Management System is a comprehensive platform for managing, categorizing, and streaming sermon content with search capabilities and engagement tracking.

## Features
- Full sermon CRUD operations
- Media upload and processing (audio, video, thumbnails)
- Advanced media processing with FFmpeg (transcoding, optimization)
- Sermon series management
- Search and filtering capabilities
- Comprehensive engagement analytics with PostHog integration
- User-friendly media player with playback controls and progress tracking
- Secure media storage with Firebase Security Rules
- Automatic cleanup of temporary files
- Role-based access control for sermon management
- Admin analytics dashboard for sermon engagement metrics

## Technology Stack
- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Supabase, Firebase Storage
- **Media Processing**: FFmpeg (WebAssembly)
- **Analytics**: PostHog

## Database Schema
The sermon management system uses two main tables:
1. `sermon_series` - For grouping related sermons
2. `sermons` - For individual sermon entries with metadata and media links

Full-text search is enabled using PostgreSQL's tsvector capabilities.

## Components

### Frontend Components
- **SermonCard**: Reusable card for displaying sermon previews
- **SermonList**: Component for listing multiple sermons with pagination
- **SermonDetail**: Full sermon display with media playback
- **SermonPlayer**: Custom media player with analytics tracking
- **SermonSearch**: Search and filter interface
- **SermonSeries**: Component for displaying sermon series

### Admin Components
- **AdminSermonList**: Admin interface for managing sermons
- **AdminSermonForm**: Form for creating and editing sermons
- **AdminMediaUpload**: Component for uploading and processing media files
- **AdminSeriesForm**: Form for creating and editing sermon series
- **SermonDashboard**: Analytics dashboard for sermon engagement metrics

## API Routes
- `/api/sermons` - GET endpoint for listing sermons with filtering
- `/api/sermons/[id]` - GET endpoint for individual sermons
- `/api/sermons/series` - GET endpoint for listing sermon series
- `/api/sermons/series/[id]` - GET endpoint for individual series details

## Media Processing
The system includes advanced media processing capabilities:
- Audio transcoding to MP3 format
- Video transcoding for web optimization
- Automatic thumbnail extraction from videos
- Waveform generation for audio files
- Progress tracking during media processing
- Quality options (low, medium, high)

These features are implemented using FFmpeg compiled to WebAssembly, allowing client-side processing.

## Security
The system includes Firebase Storage security rules to protect sermon media files:
- Public read access for published sermon media
- Restricted write access to authenticated admin users only
- Automatic cleanup of temporary files after 24 hours
- Custom metadata for tracking and management

## Firebase Storage Structure

The sermon media files are stored in a structured format in Firebase Storage:

- `/sermons/audio/{id}.mp3` - Optimized MP3 audio files for sermons
- `/sermons/video/{id}.mp4` - Standard MP4 video files for compatibility
- `/sermons/video/{id}/` - HLS streaming files for adaptive bitrate streaming:
  - `master.m3u8` - Master playlist that references all quality variants
  - `playlist_{quality}.m3u8` - Variant playlists for different qualities (240p, 360p, 480p, 720p, 1080p)
  - `segment_{quality}_XXX.ts` - Video segments for each quality level
- `/sermons/thumbnails/{id}.jpg` - Thumbnail images extracted from videos

Each sermon has a unique ID that's used consistently across all storage paths, making it easy to associate all media files with their respective sermon database entries.

### Security Rules

Firebase Storage Rules are configured to:
- Allow public read access to all sermon media files
- Restrict write access to authenticated admin users only
- Apply appropriate cache headers to optimize delivery:
  - Audio/Video files: 1 hour cache (3600 seconds)
  - HLS manifests: 5 minutes cache (300 seconds)
  - Thumbnails: 24 hours cache (86400 seconds)

### Media Processing

Media files undergo several processing steps before being stored:
1. **Audio files**: Transcoded to optimized MP3 format with configurable bitrates
2. **Video files**: 
   - Transcoded to standard MP4 format
   - Also converted to HLS format with multiple quality variants for adaptive streaming
3. **Thumbnails**: Automatically extracted from videos at a specified timestamp

The HLS (HTTP Live Streaming) implementation allows for adaptive bitrate streaming, automatically adjusting video quality based on the viewer's network conditions and device capabilities.

## Setup Instructions

### 1. Database Setup
```bash
# Initialize database functions
npm run setup-db:init

# Set up sermon tables and sample data
npm run setup-db:sermons

# Set up authentication tables and RBAC
npm run setup-db:auth
```

### 2. User Role Management
```bash
# Add admin role to an existing user
node scripts/addAdminUser.js admin@example.com
```

### 2. FFmpeg Setup
```bash
# Downloads necessary FFmpeg core files
npm run setup-ffmpeg
```
(This is also run automatically on `npm install` via the postinstall script)

### 3. Firebase Security Rules
```bash
# Deploy Firebase storage security rules
npm run deploy:rules

# Deploy Firebase functions for temporary file cleanup
npm run deploy:functions
```

### 3. Environment Variables
Ensure the following environment variables are set in your .env.local file:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_POSTHOG_API_KEY=your-posthog-api-key
NEXT_PUBLIC_POSTHOG_HOST=your-posthog-host
```
