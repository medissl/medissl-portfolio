// Real isolated Postgres (PGlite), never a production connection.
// MEDISSL_PGLITE_MODULE points at a temporary installation; no app dependency.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { curatedImport, importSql } from './curated-import.mjs';
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
await as('postgres');
const seed = readFileSync(new URL('20261019130926_import_curated_portfolio.sql',migrations),'utf8');
assert.equal(seed.replaceAll('\r\n','\n'),importSql(),'seed is reproducible from preserved source');
await db.exec(seed);
const imported = (await db.query('select * from public.projects where legacy_key is not null order by display_order')).rows;
assert.equal(imported.length,10);
for (let i=0;i<imported.length;i++) {
  for (const key of ['id','legacy_key','slug','title','description','category','tools','cover_path','platform','features','repository_url','demo_url','portrait','display_order','mineral','cover_alt']) assert.deepEqual(imported[i][key],curatedImport[i][key],key);
}
assert.equal((await db.query('select * from public.project_media')).rows.length,6);
await db.exec("update public.projects set title='Owner edit',published=false,slug='renamed-sakiko' where legacy_key='sakiko'");
await db.exec("delete from public.project_media where project_id=(select id from public.projects where legacy_key='sakiko')");
await db.exec(seed);
assert.equal((await db.query("select title,published from public.projects where legacy_key='sakiko'")).rows[0].title,'Owner edit');
assert.equal((await db.query("select published from public.projects where legacy_key='sakiko'")).rows[0].published,false);
assert.equal((await db.query('select * from public.project_media')).rows.length,4,'repeat seed cannot resurrect deleted gallery images');
assert.equal((await db.query("select cover_path from public.projects where slug='old-art'")).rows[0].cover_path,'original/cover.jpg');
await db.exec("update public.projects set slug='jellink-collision' where legacy_key='jellink'; insert into public.projects(slug,title,category) values ('jellink','Existing content','Software')");
await assert.rejects(db.exec(seed),/conflicts with existing content/);
await db.exec('rollback');
await db.close();
console.log('Isolated Postgres: additive schema, existing media, draft/publish/order/unpublish, artwork editing, HTTPS constraints and real RLS passed.');
console.log('Curated import: exact equivalence, repeated execution, preserved admin edits/unpublish/deletions, untouched artwork and conflict abort passed.');
