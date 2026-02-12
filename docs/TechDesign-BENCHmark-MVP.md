# Technical Design Document: BENCHmark MVP

## Architecture Summary

### Recommended Architecture

Next.js (TypeScript) + Supabase (Auth + PostgreSQL) + Vercel

### Why This Stack

-   Ships fast with minimal backend boilerplate
-   Real authentication + secure DB with Row Level Security
-   Scales comfortably to \~1,000 users on low cost
-   Clean portfolio-quality stack
-   Easy AI-assisted development

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   Next.js (App Router, TypeScript)
-   Tailwind CSS
-   shadcn/ui components
-   React Hook Form + Zod

### Backend

-   Supabase Auth (email/password)
-   PostgreSQL database
-   Supabase Row Level Security

### Deployment

-   Vercel (free tier initially)
-   Supabase (free tier initially)

------------------------------------------------------------------------

## Data Model

### Tables

profiles - id (uuid, PK, references auth.users.id) - created_at

goals - user_id (uuid, PK) - calories_target - protein_target_g -
carbs_target_g - fat_target_g - updated_at

foods_cached - id (uuid PK) - source - source_food_id - name - brand -
serving_unit - serving_size - calories - protein_g - carbs_g - fat_g -
created_at

daily_logs - id (uuid PK) - user_id (uuid FK) - log_date (date) -
created_at

log_entries - id (uuid PK) - user_id (uuid FK) - daily_log_id (uuid
FK) - food_name_snapshot - brand_snapshot - quantity - unit -
calories_snapshot - protein_g\_snapshot - carbs_g\_snapshot -
fat_g\_snapshot - created_at - updated_at

------------------------------------------------------------------------

## Security

-   Enable RLS on all user tables
-   Policy: user_id = auth.uid()
-   Email/password authentication only
-   External food API keys stored in environment variables

------------------------------------------------------------------------

## Food Search Strategy

1.  Debounce input (250--350ms)
2.  Minimum 2--3 characters before search
3.  Search foods_cached first
4.  If not found, query food API
5.  Cache results into foods_cached
6.  Return top 10--20 matches

------------------------------------------------------------------------

## Key Pages

-   /login
-   /dashboard
-   /history
-   /settings

------------------------------------------------------------------------

## Development Plan (2 Weeks)

Days 1--2: - Project scaffold - Supabase setup - Auth working - Deploy
skeleton

Days 3--5: - DB schema - Daily logs CRUD - Totals calculations

Days 6--9: - Food search UI - API route for food search - Cache
integration

Days 10--12: - History view - Settings + macro targets - Progress bars

Days 13--14: - Performance pass - Bug fixes - Mobile polish - Production
deployment

------------------------------------------------------------------------

## Cost Breakdown

Vercel: Free tier\
Supabase: Free tier\
Food API: Free tier initially\
Target: \$0--\$20/month at start

------------------------------------------------------------------------

## Definition of Technical Success

-   Food search is fast and reliable
-   Macro totals calculate correctly
-   Historical logs persist
-   Users are authenticated securely
-   App deployed to production
-   Under budget
