-- One statement, one transaction; a partial reorder must never reach the catalog.
create or replace function public.reorder_portfolio_stations(ordered_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.admin_users where user_id = (select auth.uid())) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  perform 1 from public.projects where id = any(ordered_ids) for update;
  if ordered_ids is null or cardinality(ordered_ids) = 0 or
    cardinality(ordered_ids) <> (select count(distinct id) from unnest(ordered_ids) as t(id)) or
    cardinality(ordered_ids) <> (select count(*) from public.projects where id = any(ordered_ids) and published and slug <> 'mewdi-pixel-sprite') then
    raise exception 'Station list changed. Reload the collection and try again.' using errcode = '22023';
  end if;
  update public.projects p set display_order = t.position::int - 1, carousel_order = t.position::int - 1
  from unnest(ordered_ids) with ordinality as t(id,position) where p.id = t.id;
end;
$$;
revoke all on function public.reorder_portfolio_stations(uuid[]) from public, anon;
grant execute on function public.reorder_portfolio_stations(uuid[]) to authenticated;
