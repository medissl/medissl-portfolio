// Read-only release gate. Never updates content or uses a service-role key.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { curatedImport } from './curated-import.mjs';
const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(base&&key,'Supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
assert.ok(key.startsWith('sb_publishable_')||key==='local-test-only','Use a publishable key, never a secret/service key');
const client=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await client.from('projects').select('*,project_media(*)');
assert.equal(error,null,error?.message);
for(const expected of curatedImport) {
  const matches=data.filter(p=>p.legacy_key===expected.legacy_key);
  assert.equal(matches.length,1,`${expected.legacy_key}: expected exactly one visible imported record`);
  const actual=matches[0];
  for(const field of Object.keys(expected).filter(k=>k!=='project_media')) assert.deepEqual(actual[field],expected[field],`${expected.slug}.${field}`);
  for(const media of expected.project_media) {
    const found=actual.project_media.find(m=>m.id===media.id);
    assert.ok(found,`${expected.slug}: missing gallery ${media.id}`);
    for(const [field,value] of Object.entries(media)) assert.deepEqual(found[field],value,`${expected.slug}.media.${field}`);
  }
  assert.equal(actual.project_media.length,expected.project_media.length,`${expected.slug}: gallery count`);
}
const website=process.env.MEDISSL_VERIFY_WEBSITE||'https://medissl-portfolio.vercel.app';
const assets=new Set(curatedImport.flatMap(p=>[p.cover_path,...p.project_media.map(m=>m.path)]).filter(Boolean));
for(const asset of assets) {
  const response=await fetch(new URL(asset,website),{method:'HEAD',signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200,asset);
}
console.log(`Read-only import verification passed: 10 projects, 5 gallery references, ${assets.size} reachable original local assets. Compare original artwork/draft IDs and paths against the private preflight backup separately.`);
