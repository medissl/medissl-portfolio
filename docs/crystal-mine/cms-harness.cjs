// Isolated, in-memory Supabase API double. No writes are forwarded upstream.
// Start with the isolated build on port 3006; see PHASE-5.md.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const original = JSON.parse(fs.readFileSync(path.join(root,'src/components/mine/published-art.json'),'utf8'));
const {curatedImport} = require('./curated-import.mjs');
let records = [...curatedImport.map(p=>({...p,created_at:'2026-10-19T00:00:00Z',updated_at:'2026-10-19T00:00:00Z'})), ...original.map((p,i)=>({...p,published:true,featured:false,display_order:i,carousel_order:i,created_at:`2026-09-${26-i}T00:00:00Z`,updated_at:'2026-09-26T00:00:00Z'}))];
let media = records.flatMap(p=>p.project_media);
const owner = {id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'owner@local.test',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
const outsider = {...owner,id:'22222222-2222-4222-8222-222222222222',email:'outsider@local.test'};
const tokens = new Map(), writes = [];
let uploads = 0;
let feedMode = 'normal';
const upstreamPort = Number(process.env.MINE_TEST_PORT || 3006);
function json(res,data,status=200) { res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data)); }
const clientProbe = `<script>${fs.readFileSync(path.join(__dirname,'audio-probe.js'),'utf8')}</script><script>
const context=HTMLCanvasElement.prototype.getContext;let contextCount=0;
HTMLCanvasElement.prototype.getContext=function(type,...args){if(/^webgl/.test(type)){contextCount++;document.documentElement.dataset.webglContexts=String(contextCount);if(new URLSearchParams(location.search).get('test-webgl')==='off')return null;}return context.call(this,type,...args);};
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data!=='refresh-catalog')return;Object.defineProperty(document,'hidden',{configurable:true,value:false});window.dispatchEvent(new Event('focus'));});
</script>`;
const page = `<!doctype html><title>Isolated CMS verification</title><style>body{margin:0;font:14px Arial;background:#eee;color:#222}nav{padding:8px;display:flex;gap:12px;align-items:center}button,a{padding:8px}iframe{border:0;width:100%;height:720px;display:block}</style><nav><strong>LOCAL MOCK DATA ONLY</strong><a href="/admin" target="_blank">Open isolated admin</a><button id="refresh">Refresh visible collection</button><button id="state">Report mock state</button><output id="result"></output></nav><iframe id="mine" title="Living CMS portfolio" src="/?mock=1"></iframe><script>const frame=document.getElementById('mine');document.getElementById('refresh').onclick=()=>frame.contentWindow.postMessage('refresh-catalog',location.origin);document.getElementById('state').onclick=async()=>{document.getElementById('result').textContent=JSON.stringify(await(await fetch('/__mock/state')).json());};</script>`;
const server = http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost:3005');
  if(/^\/(auth|rest|storage)\/v1\//.test(url.pathname)) url.pathname='/__mock'+url.pathname;
  if(url.pathname==='/__cms') {res.writeHead(200,{'Content-Type':'text/html'});res.end(page);return;}
  if(url.pathname==='/__mock/state') {json(res,{projects:records.map(p=>({id:p.id,title:p.title,slug:p.slug,published:p.published,order:p.display_order,cover:Boolean(p.cover_path)})),uploads,writes});return;}
  if(req.method==='GET'&&url.pathname.startsWith('/__mock/storage/v1/object/public/')||url.pathname==='/_next/image'&&url.searchParams.get('url')?.startsWith('http://localhost:3005/storage/')) {
    const source=url.searchParams.get('url')||url.pathname;
    const image=source.includes('5bc8345e-cafc-4ad2-9d03-1681928dd8dd')?'marina-takopi-fanart.webp':source.includes('8be03496-b30e-4eb1-a049-556670796573')?'virgin-mary-fanart.webp':source.includes('ab96a4ba-d03f-4010-9018-286ce38a6ede')?'quick-self-potrait-sketch.webp':'sakiko-menu.webp';
    res.writeHead(200,{'Content-Type':'image/webp'});res.end(fs.readFileSync(path.join(root,'public/mine',image)));return;
  }
  if(url.pathname.startsWith('/__mock/')) {
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    let body={};try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{/* Multipart upload body, not JSON. */}
    if(url.pathname==='/__mock/scenario'&&req.method==='POST') {
      if(!['normal','empty','outage'].includes(body.mode)) {json(res,{message:'Unknown isolated scenario'},400);return;}
      feedMode=body.mode;json(res,{mode:feedMode});return;
    }
    if(url.pathname==='/__mock/auth/v1/token') {
      if(body.password!=='local-test-only') {json(res,{error:'invalid_grant',error_description:'Invalid mock credentials'},400);return;}
      const user=body.email===owner.email?owner:outsider;
      const token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated',email:user.email})).toString('base64url'),'local-test-only'].join('.');
      tokens.set(token,user);json(res,{access_token:token,refresh_token:'local-test-only',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user});return;
    }
    const user=tokens.get(String(req.headers.authorization||'').replace('Bearer ',''));
    if(url.pathname==='/__mock/auth/v1/user') {json(res,user||{message:'No mock session'},user?200:401);return;}
    if(url.pathname==='/__mock/auth/v1/logout') {json(res,{});return;}
    if(url.pathname==='/__mock/rest/v1/rpc/reorder_portfolio_stations') {
      if(user?.id!==owner.id) {json(res,{message:'Administrator access required'},403);return;}
      const ids=body.ordered_ids;
      if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!records.some(p=>p.id===id&&p.published))) {json(res,{message:'Station list changed'},400);return;}
      ids.forEach((id,index)=>Object.assign(records.find(p=>p.id===id),{display_order:index,carousel_order:index}));
      writes.push({method:req.method,table:'reorder',ids});json(res,null);return;
    }
    if(url.pathname.startsWith('/__mock/storage/')) {
      if(user?.id!==owner.id) {json(res,{message:'Mock authorization denied'},403);return;}
      uploads++;writes.push({method:req.method,path:'storage'});json(res,{Key:url.pathname.split('/object/')[1],Id:randomUUID()});return;
    }
    const table=url.pathname.split('/').pop();
    if(table==='admin_users') {json(res,user?.id===owner.id?[{user_id:owner.id}]:[]);return;}
    if(!['projects','project_media'].includes(table)) {json(res,{message:'Unknown mock endpoint'},404);return;}
    const all=table==='projects'?records:media;
    const matches=p=>[...url.searchParams].every(([key,value])=>value.startsWith('eq.')?String(p[key])===value.slice(3):value.startsWith('neq.')?String(p[key])!==value.slice(4):true);
    let rows=all.filter(matches);
    if(req.method==='GET') {
      if(table==='projects'&&user?.id!==owner.id&&feedMode==='outage') {json(res,{message:'Isolated feed outage'},503);return;}
      if(table==='projects'&&user?.id!==owner.id&&feedMode==='empty') rows=[];
      if(user?.id!==owner.id) rows=rows.filter(p=>table==='projects'?p.published:records.some(r=>r.id===p.project_id&&r.published));
      if(table==='projects') rows=rows.map(p=>({...p,project_media:media.filter(m=>m.project_id===p.id)}));
      const order=(url.searchParams.get('order')||'').split(',').filter(Boolean);
      rows.sort((a,b)=>{for(const field of order){const [name,direction]=field.split('.');const d=typeof a[name]==='number'?a[name]-b[name]:String(a[name]).localeCompare(String(b[name]));if(d)return direction==='desc'?-d:d;}return 0;});
      json(res,req.headers.accept?.includes('vnd.pgrst.object')?rows[0]||null:rows);return;
    }
    if(user?.id!==owner.id) {json(res,{message:'Mock authorization denied'},403);return;}
    if(req.method==='POST') {
      const list=Array.isArray(body)?body:[body];
      if(table==='projects'&&list.some(p=>records.some(r=>r.slug===p.slug))) {json(res,{message:'This slug is already in use.',code:'23505'},409);return;}
      rows=list.map(p=>({id:randomUUID(),display_order:0,carousel_order:0,cover_path:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...p}));all.push(...rows);
    } else if(req.method==='PATCH') {for(const row of rows)Object.assign(row,body,{updated_at:new Date().toISOString()});}
    else if(req.method==='DELETE') {if(table==='projects')records=records.filter(p=>!matches(p));else media=media.filter(p=>!matches(p));}
    else {json(res,{message:'Unsupported mock method'},405);return;}
    writes.push({method:req.method,table,ids:rows.map(p=>p.id)});
    json(res,req.headers.accept?.includes('vnd.pgrst.object')?rows[0]:rows,req.method==='POST'?201:200);return;
  }
  if(!['GET','HEAD'].includes(req.method)) {json(res,{message:'No writes can leave this test proxy'},403);return;}
  const upstream=http.request({hostname:'127.0.0.1',port:upstreamPort,path:req.url,method:req.method,headers:{...req.headers,'accept-encoding':'identity'}},result=>{
    const chunks=[];result.on('data',c=>chunks.push(c));result.on('end',()=>{
      let body=Buffer.concat(chunks);const headers={...result.headers};delete headers['content-length'];delete headers['transfer-encoding'];
      if(String(headers['content-type']).includes('text/html'))body=Buffer.from(body.toString().replace('<head>','<head>'+clientProbe));
      res.writeHead(result.statusCode,headers);res.end(body);
    });
  });upstream.on('error',e=>json(res,{message:e.message},502));req.pipe(upstream);
});
const harnessPort=Number(process.env.CMS_HARNESS_PORT||3005);
server.listen(harnessPort,'127.0.0.1',()=>console.log(`Isolated CMS verification: http://localhost:${harnessPort}/__cms`));
