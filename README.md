# BENCHmark MVP

Minimal macro tracker for serious lifters.

## Stack

- Next.js (TypeScript, App Router)
- Supabase Auth + PostgreSQL + RLS
- Tailwind CSS

## MVP Features

- Email/password auth
- Food search with cache table
- Macro calculation per entry
- Daily totals with progress bars
- Daily log history
- Goals/settings editor

## Setup

1. Install deps:
   - `npm install`
2. Copy env:
   - `cp .env.example .env.local`
3. Fill `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (reserved for future secure server routes)
   - `OPENFOODFACTS_USER_AGENT` (optional, recommended for external food search fallback)
4. Apply SQL in Supabase SQL editor:
   - `supabase/001_init.sql`
5. Run app:
   - `npm run dev`

## Routes

- `/login`
- `/dashboard`
- `/history`
- `/settings`

## Verify

- `npm run lint`
- `npm run build`
- Manual checks:
  - Sign up/sign in
  - Search food and add entry
  - Totals update instantly
  - Delete entry updates totals
  - View entries in history
  - Edit goals and see updated progress bars

## Search Behavior

- Cache-first search from `foods_cached`
- Seed fallback for first-run usability
- Optional external fallback via OpenFoodFacts when cache has no matches
