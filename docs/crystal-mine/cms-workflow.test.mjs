// Run only with cms-harness.cjs and the optimized CMS-only test build.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { curatedImport } from './curated-import.mjs';
const base=process.env.MEDISSL_CMS_TEST_URL||'http://localhost:3009';
const url=new URL(base);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname),'Never run this workflow against production');
const client=createClient(base,'local-test-only',{auth:{persistSession:false,autoRefreshToken:false}});
const success=result=>{assert.equal(result.error,null,result.error?.message);return result.data;};
success(await client.auth.signInWithPassword({email:'owner@local.test',password:'local-test-only'}));
const feed=async()=>{const r=await fetch(`${base}/api/mine`);assert.equal(r.status,200);const f=await r.json();assert.equal(f.savedArtwork,false);return f.projects;};
const baseline=await feed();
for(const category of ['Software','Digital Art']) {
  const slug=`isolated-${category==='Software'?'software':'art'}-${Date.now()}`;
  const record=success(await client.from('projects').insert({title:`${category} workflow`,slug,category,year:2026,tools:['TypeScript'],description:'Workflow verification',short_description:'Summary',published:false,featured:false,display_order:100,
    platform:category==='Software'?'Browser':'',features:category==='Software'?['Feature one']:[],repository_url:category==='Software'?'https://github.com/medissl/example':null,demo_url:category==='Software'?'https://example.com':null,portrait:true}).select('*').single());
  assert.ok(!(await feed()).some(p=>p.id===record.id),'draft hidden');
  const path=`local-test/${record.id}/cover.webp`;
  success(await client.storage.from('portfolio-media').upload(path,new Blob(['local-test-image'],{type:'image/webp'})));
  success(await client.from('projects').update({cover_path:path}).eq('id',record.id));
  for(let i=0;i<2;i++) {
    const gallery=`local-test/${record.id}/gallery-${i}.webp`;
    success(await client.storage.from('portfolio-media').upload(gallery,new Blob(['local-test-image'],{type:'image/webp'})));
    success(await client.from('project_media').insert({project_id:record.id,path:gallery,alt_text:'Test gallery',caption:`Caption ${i}`,section:i?'process':'gallery',display_order:i}));
  }
  success(await client.from('projects').update({published:true}).eq('id',record.id));
  let projects=await feed(), p=projects.find(p=>p.id===record.id);
  assert.ok(p);assert.equal(projects.length,baseline.length+1);assert.equal(p.media.length,2);assert.equal(p.portrait,true);
  assert.equal(p.kind,category==='Software'?'project':'artwork');
  if(category==='Software'){assert.equal(p.repository,'https://github.com/medissl/example');assert.equal(p.link,'https://example.com');}
  success(await client.from('projects').update({title:'Edited live',platform:'Updated platform',features:['Edited feature']}).eq('id',record.id));
  p=(await feed()).find(p=>p.id===record.id); assert.equal(p.title,'Edited live');assert.deepEqual(p.features,['Edited feature']);
  const rows=success(await client.from('projects').select('id,slug,published,display_order').eq('published',true).neq('slug','mewdi-pixel-sprite').order('display_order'));
  success(await client.rpc('reorder_portfolio_stations',{ordered_ids:[record.id,...rows.filter(p=>p.id!==record.id).map(p=>p.id)]}));
  assert.equal((await feed())[0].id,record.id,'atomic reorder controls public station order');
  success(await client.from('projects').update({published:false}).eq('id',record.id));
  assert.ok(!(await feed()).some(p=>p.id===record.id),'unpublish removes the station');
  assert.equal(success(await client.from('projects').select('id').eq('id',record.id).single()).id,record.id,'underlying draft remains');
}
const projects=await feed();
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length,'no duplicate stations');
for(const id of ['sakiko','jellink','maucuan','shoot','wildfeast','rundori','lantern-lot','bncc','jakarta-flood','portfolio']) assert.ok(projects.some(p=>p.id===id),id);
const guest=createClient(base,'local-test-only',{auth:{persistSession:false,autoRefreshToken:false}});
assert.ok((await guest.from('projects').insert({title:'Denied',slug:'denied'})).error);
success(await guest.auth.signInWithPassword({email:'outsider@local.test',password:'local-test-only'}));
assert.ok((await guest.from('projects').update({title:'Denied'}).eq('slug','sakiko')).error);
// Restore the imported fixture's original order after exercising reorder, so
// the strict initial-import equivalence gate can run against the same fixture.
for(const p of curatedImport) success(await client.from('projects').update({display_order:p.display_order,carousel_order:p.carousel_order}).eq('id',p.id));
console.log('Optimized app/API workflow: software + artwork create, cover/gallery upload, publish, live edit, reorder, unpublish, retained drafts, all curated stations, deduplication and unauthorized denial passed.');
