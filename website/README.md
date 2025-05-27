# Rehoboth Christian Church Website

This repository contains the source code for the Rehoboth Christian Church website. The site is built using Next.js, TypeScript, and Tailwind CSS, with Supabase for the backend and database.

## Features

The website includes the following features:

1. **Hero Carousel System** - A dynamic carousel for the homepage that showcases church highlights and upcoming events.
2. **Sermon Management System** - A system for uploading, managing, and displaying sermon recordings and notes.
3. **Event Management System** - A calendar and event management system for church activities.
4. **Donation Processing System** - Online donation capabilities with Stripe integration.
5. **Newsletter & Communication System** - Email newsletter functionality for church announcements.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (API, Auth, Storage)
- **Database**: Supabase (PostgreSQL)
- **Media Storage**: Firebase Storage
- **Payment Processing**: Stripe
- **State Management**: React Query, Zustand
- **Analytics**: PostHog
- **Testing**: Jest, React Testing Library

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # UI components
│   ├── auth/         # Authentication components
│   ├── common/       # Reusable UI components
│   ├── donations/    # Donation-related components
│   ├── events/       # Event-related components
│   ├── hero/         # Hero carousel components
│   └── sermons/      # Sermon-related components
├── hooks/            # Custom React hooks
├── services/         # API services and integrations
├── styles/           # Global styles
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Firebase project with Storage enabled
- Stripe account (for donation processing)
- PostHog account (optional, for analytics)
- SendGrid account (for newsletter functionality)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/rehoboth-church-website.git
   ```

2. Install dependencies
   ```bash
   cd rehoboth-church-website
   npm install
   ```

3. Create a `.env.local` file in the root directory based on `.env.local.example` and fill in your service credentials

4. Initialize the database schema
   ```bash
   npm run setup-db:init
   npm run setup-db:carousel
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Running Tests

Run the test suite:
```bash
npm test
```

Run tests for specific features:
```bash
npm run test:carousel
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

The application is configured for deployment on:
- Frontend: Firebase Hosting
- Backend: Supabase

Follow the deployment instructions in `hosting_setup_guide.md` for detailed steps.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Church leadership for guidance and requirements
- All contributors and volunteers who helped build and test the site
