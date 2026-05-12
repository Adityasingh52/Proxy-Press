# Proxy-Press

Proxy-Press is a modern, full-stack news and social networking web application.

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL via Supabase](https://supabase.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** Custom JWT-based Auth & NextAuth (OAuth)
- **Media Storage:** [Cloudinary](https://cloudinary.com/)
- **Styling:** Vanilla CSS / CSS Modules

## Features

- **Dynamic Feed:** A premium, news-app-style homepage feed with a sticky, frosted-glass header.
- **Social Features:** Profiles, Follows, Likes, Saves, and nested Comments.
- **Real-time Messaging:** Direct messaging with vanish mode, media attachments, and read receipts.
- **Stories:** Ephemeral content (images, videos, text) that disappears after 24 hours.
- **Privacy & Safety:** User blocking, muting, reporting, and customizable comment/mention privacy settings.

## Getting Started

### Prerequisites

You need Node.js installed, as well as accounts for Supabase and Cloudinary.

### Environment Variables

Rename `.env.local.example` (or create a `.env.local` file) and provide the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres.[your-project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Auth
AUTH_SECRET="generate-a-32-char-random-string"
NEXTAUTH_URL="http://localhost:3000" # Change for production
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Push the database schema to Supabase:
```bash
npx drizzle-kit push
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). Make sure to configure all environment variables in the Vercel dashboard before deploying.
