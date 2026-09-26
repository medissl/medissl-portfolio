# Medianto Susilo — Creative Portfolio

A live portfolio and lightweight CMS for my art, UI/UX, interactive media, and creative experiments.

## Why I built it

I wanted the portfolio itself to be part of the portfolio: not just a static gallery, but a small publishing system I can keep using as my work changes.

The public site is intentionally visual and minimal. A private admin area lets me add projects, upload artwork, keep drafts unpublished, feature selected work, and update the site without editing source code.

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS
- Motion
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Vercel

## Features

- Responsive dark / electric-blue visual system
- Art and project gallery with category filters
- Dynamic project detail pages
- Optional process galleries for sketches, wireframes, and iterations
- Private admin login
- Draft / publish workflow
- Featured-project controls
- Direct image uploads to Supabase Storage
- Row Level Security for project and media writes
- Reduced-motion support
- SEO metadata and accessible navigation

## Local development

```bash
npm install
npm run dev
```

The app ships with its Supabase project URL and publishable key as safe public fallbacks. You can override them locally:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Never put a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable.

## First admin setup

The CMS deliberately has no public sign-up button.

1. Create the portfolio owner's Auth user in the Supabase dashboard.
2. Copy that user's UUID.
3. Add it to `public.admin_users`:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

After that, sign in at `/admin`.

## Database

The initial schema and RLS policies are in:

`supabase/migrations/001_initial_portfolio_schema.sql`

The live Supabase project was initialized with the same migration.
