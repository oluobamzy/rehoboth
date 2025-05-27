# Rehoboth Christian Church - Technical Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[Landing Page]
        A --> C[Sermon Pages]
        A --> D[Events Pages]
        A --> E[Donation Flow]
        A --> F[Admin Panel]
    end
    
    subgraph "Authentication"
        G[Supabase Auth] --> H[Admin Login Only]
        H --> I[Role-Based Access]
    end
    
    subgraph "Backend Services"
        J[Supabase Database] --> K[Sermons Table]
        J --> L[Events Table]
        J --> M[Donations Table]
        J --> N[Media Storage]
        O[Prisma ORM] --> J
    end
    
    subgraph "External Services"
        P[Stripe API] --> Q[Payment Processing]
        R[PostHog] --> S[Analytics Tracking]
        T[Firebase Hosting] --> U[CDN Distribution]
    end
    
    subgraph "Security & Backup"
        V[Supabase Backup] --> W[Automated Daily Backups]
        X[Row Level Security] --> Y[Data Protection]
        Z[SSL/TLS] --> AA[Encrypted Connections]
    end
    
    A --> G
    A --> O
    A --> P
    A --> R
    F --> G
    E --> P
    A --> T
    J --> V
    J --> X
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant V as Visitor
    participant W as Website
    participant S as Supabase
    participant St as Stripe
    participant P as PostHog
    participant A as Admin
    
    Note over V,A: Visitor Journey
    V->>W: Visit Landing Page
    W->>P: Track Page View
    V->>W: Browse Sermons/Events
    W->>S: Fetch Content
    S->>W: Return Data
    V->>W: Click Donate
    W->>St: Process Payment
    St->>S: Store Donation Record
    St->>V: Send Receipt
    
    Note over V,A: Admin Content Management
    A->>W: Login to Admin Panel
    W->>S: Authenticate Admin
    S->>W: Grant Access
    A->>W: Upload Sermon/Event
    W->>S: Store Content
    S->>W: Confirm Save
    A->>W: View Analytics
    W->>P: Fetch Analytics Data
    P->>W: Return Metrics
```

## Database Schema

```mermaid
erDiagram
    SERMONS {
        uuid id PK
        string title
        text description
        string video_url
        string audio_url
        string thumbnail_url
        date sermon_date
        string speaker
        string series
        text notes
        timestamp created_at
        timestamp updated_at
        boolean published
    }
    
    EVENTS {
        uuid id PK
        string title
        text description
        datetime start_time
        datetime end_time
        string location
        string image_url
        text details
        string category
        boolean featured
        timestamp created_at
        timestamp updated_at
        boolean published
    }
    
    DONATIONS {
        uuid id PK
        decimal amount
        string currency
        string stripe_payment_id
        string donor_email
        string donor_name
        string fund_designation
        boolean recurring
        string frequency
        timestamp created_at
        json metadata
    }
    
    MEDIA {
        uuid id PK
        string filename
        string file_path
        string file_type
        integer file_size
        string alt_text
        timestamp created_at
        uuid uploaded_by FK
    }
    
    ADMINS {
        uuid id PK
        string email
        string full_name
        string role
        timestamp last_login
        timestamp created_at
        boolean active
    }
    
    ANALYTICS_EVENTS {
        uuid id PK
        string event_name
        json properties
        string session_id
        timestamp created_at
        string user_id
    }
    
    SERMONS ||--o{ MEDIA : "has_attachments"
    EVENTS ||--o{ MEDIA : "has_images"
    ADMINS ||--o{ SERMONS : "uploads"
    ADMINS ||--o{ EVENTS : "creates"
```

## Security Architecture

```mermaid
graph LR
    subgraph "Frontend Security"
        A[HTTPS Only] --> B[CSP Headers]
        B --> C[XSS Protection]
        C --> D[Input Validation]
    end
    
    subgraph "Authentication Security"
        E[Supabase Auth] --> F[JWT Tokens]
        F --> G[Admin Role Check]
        G --> H[Session Management]
    end
    
    subgraph "Data Security"
        I[Row Level Security] --> J[Encrypted Database]
        J --> K[API Rate Limiting]
        K --> L[Audit Logging]
    end
    
    subgraph "Payment Security"
        M[Stripe PCI Compliance] --> N[Tokenized Cards]
        N --> O[Secure Webhooks]
        O --> P[Fraud Detection]
    end
    
    subgraph "Infrastructure Security"
        Q[Firebase Security Rules] --> R[DDoS Protection]
        R --> S[Automated Backups]
        S --> T[Disaster Recovery]
    end
    
    A --> E
    E --> I
    I --> M
    M --> Q
```

## Backup & Disaster Recovery Plan

```mermaid
graph TD
    subgraph "Backup Strategy"
        A[Automated Daily Backups] --> B[Supabase Point-in-Time Recovery]
        B --> C[Weekly Full Database Export]
        C --> D[Monthly Archive to Cloud Storage]
    end
    
    subgraph "Critical Data Protection"
        E[Donation Records] --> F[Real-time Replication]
        F --> G[Encrypted Storage]
        G --> H[Multi-Region Backup]
    end
    
    subgraph "Recovery Procedures"
        I[RTO: 4 Hours] --> J[RPO: 1 Hour]
        J --> K[Automated Failover]
        K --> L[Manual Recovery Process]
    end
    
    subgraph "Monitoring & Alerts"
        M[Backup Health Checks] --> N[Failed Backup Alerts]
        N --> O[Recovery Testing Schedule]
        O --> P[Incident Response Plan]
    end
    
    A --> E
    E --> I
    I --> M
```

## Content Management Flow

```mermaid
graph LR
    subgraph "Sermon Management"
        A[Admin Login] --> B[Upload Sermon]
        B --> C[Add Metadata]
        C --> D[Upload Media Files]
        D --> E[Preview Content]
        E --> F[Publish/Schedule]
    end
    
    subgraph "Event Management"
        G[Create Event] --> H[Set Date/Time]
        H --> I[Add Location]
        I --> J[Upload Images]
        J --> K[Set Featured Status]
        K --> L[Publish Event]
    end
    
    subgraph "Analytics Dashboard"
        M[View Page Analytics] --> N[Donation Metrics]
        N --> O[Content Performance]
        O --> P[User Engagement]
    end
    
    F --> M
    L --> M
```

## Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        A[Local Development] --> B[Feature Branch]
        B --> C[Code Review]
        C --> D[Unit Tests]
    end
    
    subgraph "Staging"
        E[Staging Deploy] --> F[Integration Tests]
        F --> G[Performance Tests]
        G --> H[Security Scan]
    end
    
    subgraph "Production"
        I[Production Deploy] --> J[Health Checks]
        J --> K[Monitoring Active]
        K --> L[Rollback Ready]
    end
    
    subgraph "CI/CD Tools"
        M[GitHub Actions] --> N[Automated Testing]
        N --> O[Firebase Deploy]
        O --> P[Supabase Migrations]
    end
    
    D --> E
    H --> I
    M --> E
    M --> I
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Frontend Optimization"
        A[Next.js Static Generation] --> B[Image Optimization]
        B --> C[Code Splitting]
        C --> D[Lazy Loading]
    end
    
    subgraph "Database Optimization"
        E[Query Optimization] --> F[Database Indexing]
        F --> G[Connection Pooling]
        G --> H[Caching Strategy]
    end
    
    subgraph "CDN & Hosting"
        I[Firebase CDN] --> J[Global Distribution]
        J --> K[Asset Compression]
        K --> L[Cache Headers]
    end
    
    subgraph "Monitoring"
        M[Core Web Vitals] --> N[Database Performance]
        N --> O[API Response Times]
        O --> P[Error Tracking]
    end
    
    A --> E
    E --> I
    I --> M
```

## Implementation Phases

```mermaid
gantt
    title Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 - Foundation
    Project Setup           :a1, 2025-05-27, 3d
    Database Schema         :a2, after a1, 2d
    Authentication Setup    :a3, after a2, 2d
    
    section Phase 2 - Core Features
    Landing Page            :b1, after a3, 4d
    Content Management      :b2, after b1, 5d
    Admin Panel            :b3, after b2, 4d
    
    section Phase 3 - Integration
    Stripe Integration     :c1, after b3, 3d
    Analytics Setup        :c2, after c1, 2d
    Security Implementation :c3, after c2, 3d
    
    section Phase 4 - Launch
    Testing & QA           :d1, after c3, 4d
    Performance Optimization :d2, after d1, 2d
    Production Deployment   :d3, after d2, 1d
```

## API Architecture

```mermaid
graph LR
    subgraph "Public APIs"
        A[GET /api/sermons] --> B[Fetch Published Sermons]
        C[GET /api/events] --> D[Fetch Upcoming Events]
        E[POST /api/donate] --> F[Process Donation]
    end
    
    subgraph "Admin APIs"
        G[POST /api/admin/sermons] --> H[Create Sermon]
        I[PUT /api/admin/sermons/:id] --> J[Update Sermon]
        K[DELETE /api/admin/sermons/:id] --> L[Delete Sermon]
        M[GET /api/admin/analytics] --> N[Fetch Analytics]
    end
    
    subgraph "Middleware"
        O[Authentication Check] --> P[Rate Limiting]
        P --> Q[Input Validation]
        Q --> R[Error Handling]
    end
    
    A --> O
    G --> O
    E --> O
```