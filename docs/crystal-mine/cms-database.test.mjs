// Real isolated Postgres (PGlite), never a production connection.
// MEDISSL_PGLITE_MODULE points at a temporary installation; no app dependency.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { PGlite } = await import(pathToFileURL(process.env.MEDISSL_PGLITE_MODULE).href);
const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111';
const outsider = '22222222-2222-4222-8222-222222222222';
await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create table storage.buckets (id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant usage on schema public,auth,storage to anon,authenticated;
  alter default privileges in schema public grant all on tables to anon,authenticated;
  grant all on storage.objects to anon,authenticated;
`);
const migrations = new URL('../../supabase/migrations/', import.meta.url);
for (const file of readdirSync(migrations).filter(f=>/^00[123]_/.test(f)).sort()) {
  // PGlite includes gen_random_uuid; pgcrypto extension is unavailable in WASM.
  await db.exec(readFileSync(new URL(file,migrations),'utf8').replace('create extension if not exists pgcrypto;',''));
}
await db.exec(`insert into auth.users values ('${owner}'),('${outsider}');
  insert into public.admin_users(user_id) values ('${owner}');
  insert into public.projects(id,slug,title,category,published,cover_path) values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','old-art','Original artwork','Digital Art',true,'original/cover.jpg');
  insert into public.project_media(project_id,path) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','original/gallery.jpg');`);
for (const file of readdirSync(migrations).filter(f=>/^\d{14}_/.test(f) && !f.includes('import_curated')).sort()) await db.exec(readFileSync(new URL(file,migrations),'utf8'));
const art = (await db.query("select * from public.projects where slug='old-art'")).rows[0];
assert.equal(art.cover_path,'original/cover.jpg'); assert.equal(art.portrait,false);
assert.equal((await db.query('select * from public.project_media')).rows.length,1);
assert.equal((await db.query("select count(*)::int n from pg_policies where schemaname='public'")).rows[0].n,11);
async function as(role,user='') {await db.exec(`reset role; set role ${role}; select set_config('request.jwt.claim.sub','${user}',false);`);}
await as('authenticated',owner);
await db.exec(`insert into public.projects(slug,title,category,published,platform,repository_url,demo_url,features,portrait)
  values ('cms-software','Software test','Software',false,'Browser','https://github.com/medissl/example','https://example.com',array['Feature one'],true);`);
await as('anon'); assert.equal((await db.query('select * from public.projects')).rows.length,1,'draft hidden');
await assert.rejects(db.exec("insert into public.projects(slug,title,category) values ('bad','No','Software')"),/permission|row-level security/i);
await as('authenticated',outsider);
await assert.rejects(db.exec("select public.reorder_portfolio_stations(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid])"),/Administrator access required/);
assert.equal((await db.query("update public.projects set title='hacked' returning *")).rows.length,0);
await assert.rejects(db.exec("insert into public.projects(slug,title,category) values ('bad','No','Software')"),/row-level security/i);
await as('authenticated',owner);
await assert.rejects(db.exec("update public.projects set demo_url='javascript:alert(1)' where slug='cms-software'"),/check constraint/i);
await db.exec("update public.projects set published=true,display_order=-1 where slug='cms-software'");
await db.exec("select public.reorder_portfolio_stations(array[(select id from public.projects where slug='cms-software'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid])");
await assert.rejects(db.exec("select public.reorder_portfolio_stations(array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid])"),/Station list changed/);
await as('anon'); assert.equal((await db.query('select * from public.projects order by display_order')).rows[0].slug,'cms-software');
await as('authenticated',owner); await db.exec("update public.projects set published=false where slug='cms-software'");
await as('anon'); assert.equal((await db.query('select * from public.projects')).rows.length,1);
await as('authenticated',owner);
await db.exec("update public.projects set category='Traditional Art',title='Updated artwork' where slug='old-art'");
assert.equal((await db.query("select title from public.projects where slug='old-art'")).rows[0].title,'Updated artwork');
await db.close();
console.log('Isolated Postgres: additive schema, existing media, draft/publish/order/unpublish, artwork editing, HTTPS constraints and real RLS passed.');
