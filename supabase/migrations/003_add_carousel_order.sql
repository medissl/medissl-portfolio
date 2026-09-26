alter table public.projects
  add column if not exists carousel_order integer not null default 0;

with ranked as (
  select
    id,
    row_number() over (order by created_at desc) - 1 as position
  from public.projects
  where featured = true
)
update public.projects as p
set carousel_order = ranked.position
from ranked
where p.id = ranked.id;

create index if not exists projects_featured_carousel_order_idx
  on public.projects (published, featured, carousel_order, created_at desc);
