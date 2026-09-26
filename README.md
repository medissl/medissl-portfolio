# Medianto Susilo — Creative Portfolio

A live portfolio and lightweight CMS for my art, UI/UX, interactive media, games, and creative experiments.

**Live site:** https://medissl-portfolio.vercel.app

## Why I built it

I wanted the portfolio itself to be part of the portfolio: not just a static gallery, but a small publishing system I can keep using as my work changes.

The public site is intentionally visual and minimal, with a dark electric-blue identity, animated multilingual hero typography, interactive motion, project showcases, and responsive layouts.

Behind it is a private CMS where I can add and edit projects, upload artwork, keep drafts unpublished, feature selected work, manually reorder the homepage carousel, and update the portfolio without editing source code for every change.

## Stack

- Next.js 16 + App Router
- React 19
- TypeScript
- Tailwind CSS
- Motion
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Vercel
- GitHub Actions

## Features

### Public portfolio

- Responsive dark / electric-blue visual system
- Animated multilingual hero headline
- Interactive hero graphic and motion effects
- Featured-work homepage carousel
- Manual carousel ordering from the CMS
- Art and project gallery with category filters
- Dynamic project detail pages
- Gallery and process sections for finished work, sketches, wireframes, and iterations
- Responsive layouts tuned separately for desktop, tablet, and mobile
- Reduced-motion support
- SEO metadata and accessible navigation

### Admin / CMS

- Private email/password admin login
- No public account registration flow
- Draft / publish workflow
- Featured-project controls
- Manual homepage carousel ordering
- Direct image uploads to Supabase Storage
- Browser draft persistence for unsaved form data and selected files
- Project editing and deletion
- Public visibility controls
- Row Level Security protecting project and media writes

## How the CMS is protected

The browser-side admin interface is not the security boundary.

Supabase Row Level Security protects database writes, and write access is limited to authenticated users whose UUID exists in `public.admin_users`. The Supabase key used by the frontend is a publishable key and is safe to expose in browser code.

Never commit a Supabase secret or service-role key to the repository.

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app ships with its Supabase project URL and publishable key as public fallbacks. You can override them locally:

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

Database schema and security changes are tracked in:

- `supabase/migrations/001_initial_portfolio_schema.sql` — initial tables, storage setup, indexes, and RLS
- `supabase/migrations/002_harden_rls_policies.sql` — security policy hardening
- `supabase/migrations/003_add_carousel_order.sql` — manual homepage carousel ordering

The live Supabase project is kept aligned with these migrations.

## Deployment

Pushes to `main` run lint/build checks through GitHub Actions and trigger a Vercel deployment.

Production:

https://medissl-portfolio.vercel.app
