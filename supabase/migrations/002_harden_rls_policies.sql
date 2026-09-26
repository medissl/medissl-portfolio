drop policy if exists "published projects are public" on public.projects;
drop policy if exists "admins can read all projects" on public.projects;
drop policy if exists "admins can insert projects" on public.projects;
drop policy if exists "admins can update projects" on public.projects;
drop policy if exists "admins can delete projects" on public.projects;

drop policy if exists "media for published projects is public" on public.project_media;
drop policy if exists "admins can read all media" on public.project_media;
drop policy if exists "admins can insert media" on public.project_media;
drop policy if exists "admins can update media" on public.project_media;
drop policy if exists "admins can delete media" on public.project_media;

drop policy if exists "admins can upload portfolio media" on storage.objects;
drop policy if exists "admins can update portfolio media" on storage.objects;
drop policy if exists "admins can delete portfolio media" on storage.objects;

drop function if exists public.is_admin(uuid);

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

create policy "published projects are public"
on public.projects for select to anon
using (published = true);

create policy "authenticated project access"
on public.projects for select to authenticated
using (
  published = true
  or exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can insert projects"
on public.projects for insert to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can update projects"
on public.projects for update to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can delete projects"
on public.projects for delete to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "published project media is public"
on public.project_media for select to anon
using (
  exists (
    select 1 from public.projects
    where projects.id = project_media.project_id
      and projects.published = true
  )
);

create policy "authenticated media access"
on public.project_media for select to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_media.project_id
      and projects.published = true
  )
  or exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can insert media"
on public.project_media for insert to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can update media"
on public.project_media for update to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can delete media"
on public.project_media for delete to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can upload portfolio media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'portfolio-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can update portfolio media"
on storage.objects for update to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'portfolio-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "admins can delete portfolio media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);
