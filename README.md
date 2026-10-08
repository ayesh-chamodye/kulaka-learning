# Kulaka Learning

An independent video learning platform built with Next.js, Supabase, Mux, and Vercel Blob.

## Features

- Browse and purchase individual videos
- Secure checkout flow with mock payments
- Watch purchased videos via Mux streaming
- Seller dashboard for uploading videos
- User profiles with avatar uploads via Vercel Blob
- Comments, likes, playlists, and watch history
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Video Hosting**: Mux
- **File Storage**: Vercel Blob (avatars/resources); video files streamed through Mux
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+
- Supabase account
- Mux account
- Vercel account

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd kulaka-learning
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`
- `BLOB_READ_WRITE_TOKEN`

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/20250101000000_initial_schema.sql`
3. Enable Google Auth in Supabase Auth settings
4. Copy your Supabase URL and anon key to `.env.local`

### 4. Set Up Mux

1. Create a Mux account
2. Get your Mux Token ID and Token Secret
3. Add them to `.env.local`
4. Configure Mux webhook URL: `https://<your-domain>/api/mux/webhook`

### 5. Set Up Vercel Blob

1. Create a Vercel Blob store
2. Copy the `BLOB_READ_WRITE_TOKEN` to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database schema is defined in `supabase/migrations/20250101000000_initial_schema.sql`. It includes:

- `profiles` - User profiles linked to Supabase Auth
- `categories` - Video categories
- `videos` - Independent video metadata with Mux IDs
- `tags` and `video_tags` - Video tagging
- `video_progress` - Watch progress tracking
- `watch_history` - Watch history
- `video_likes` - Video likes
- `comments` - Nested comments on videos
- `playlists` and `playlist_videos` - User playlists
- `video_resources` - Downloadable resources (stored on Vercel Blob)
- `orders` - Purchase records for mock checkout

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Project Structure

```
app/
  api/
    checkout/route.ts      # Mock checkout API
    upload/route.ts        # Mux direct upload helper for video files
  auth/callback/page.tsx   # OAuth callback
  cart/page.tsx            # Shopping cart
  checkout/page.tsx        # Checkout page
  login/page.tsx           # Login page
  signup/page.tsx          # Signup page
  seller/
    page.tsx               # Seller dashboard
    upload/page.tsx        # Video upload form
  watch/[id]/page.tsx      # Video watch page
  page.tsx                 # Landing page
  layout.tsx               # Root layout
components/
  Navbar.tsx               # Navigation
  Footer.tsx               # Footer
  Providers.tsx            # Auth provider wrapper
contexts/
  AuthContext.tsx          # Auth state management
lib/
  supabase/
    client.ts              # Browser Supabase client
    server.ts              # Server Supabase client
  mux.ts                   # Mux API utilities
supabase/
  migrations/
    20250101000000_initial_schema.sql
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

The `vercel.json` file is configured for Vercel deployment.

### Supabase

- Run migrations in the Supabase SQL Editor or use the Supabase CLI
- Enable required auth providers in Supabase dashboard

## License

MIT
