create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('Digital Art','Traditional Art','UI/UX','Interactive','Experimental')),
  short_description text not null default '',
  description text not null default '',
  year int not null default extract(year from now())::int,
  tools text[] not null default '{}',
  cover_path text,
  featured boolean not null default false,
  published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path text not null,
  caption text not null default '',
  alt_text text not null default '',
  section text not null default 'gallery' check (section in ('gallery','process')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_published_order_idx on public.projects (published, display_order, created_at desc);
create index if not exists project_media_project_order_idx on public.project_media (project_id, section, display_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = check_user);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;

create policy "admins can read own admin record" on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "published projects are public" on public.projects for select to anon, authenticated using (published = true);
create policy "admins can read all projects" on public.projects for select to authenticated using (public.is_admin(auth.uid()));
create policy "admins can insert projects" on public.projects for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "admins can update projects" on public.projects for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins can delete projects" on public.projects for delete to authenticated using (public.is_admin(auth.uid()));

create policy "media for published projects is public" on public.project_media for select to anon, authenticated using (
  exists (select 1 from public.projects where projects.id = project_media.project_id and projects.published = true)
);
create policy "admins can read all media" on public.project_media for select to authenticated using (public.is_admin(auth.uid()));
create policy "admins can insert media" on public.project_media for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "admins can update media" on public.project_media for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins can delete media" on public.project_media for delete to authenticated using (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media','portfolio-media',true,15728640,array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "portfolio media is publicly readable" on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio-media');
create policy "admins can upload portfolio media" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_admin(auth.uid()));
create policy "admins can update portfolio media" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and public.is_admin(auth.uid())) with check (bucket_id = 'portfolio-media' and public.is_admin(auth.uid()));
create policy "admins can delete portfolio media" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_admin(auth.uid()));
