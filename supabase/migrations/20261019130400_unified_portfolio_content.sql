-- Additive only. Existing records, media paths, triggers, grants and RLS stay intact.
begin;
alter table public.projects
  add column if not exists legacy_key text,
  add column if not exists platform text not null default '',
  add column if not exists features text[] not null default '{}',
  add column if not exists repository_url text,
  add column if not exists demo_url text,
  add column if not exists download_url text,
  add column if not exists action_label text not null default '',
  add column if not exists portrait boolean not null default false,
  add column if not exists mineral text not null default '',
  add column if not exists cover_alt text not null default '';

alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects add constraint projects_category_check check (category in (
  'Digital Art','Traditional Art','UI/UX','Interactive','Experimental',
  'Software','Game development','Interactive media','Experiment'
));
create unique index if not exists projects_legacy_key_idx on public.projects (legacy_key) where legacy_key is not null;
alter table public.projects add constraint projects_legacy_key_check
  check (legacy_key is null or legacy_key ~ '^[a-z0-9][a-z0-9-]*$');
alter table public.projects add constraint projects_external_links_check check (
  (repository_url is null or repository_url ~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$') and
  (demo_url is null or demo_url ~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$') and
  (download_url is null or download_url ~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$')
);
commit;
