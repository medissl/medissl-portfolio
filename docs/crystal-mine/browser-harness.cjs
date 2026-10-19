// Local verification only. Proxy the production server without changing app code.
// Run after `npm run start`: node docs/crystal-mine/browser-harness.cjs
const http = require('node:http');
const upstreamPort = Number(process.env.MINE_TEST_PORT || 3000);
const audioProbe = `<script>
const OriginalAudio=window.Audio,audioVoices=[];
window.Audio=function(src){const voice=new OriginalAudio(src);audioVoices.push(voice);return voice;};
window.mineAudioTest={report(){return audioVoices.map(v=>({src:v.getAttribute('src'),paused:v.paused,time:v.currentTime,ready:v.readyState,error:v.error?.code||null}));},hidden(value){Object.defineProperty(document,'hidden',{configurable:true,value});document.dispatchEvent(new Event('visibilitychange'));}};
</script>`;
const harness = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Mine recovery checks</title>
<style>body{margin:0;font:14px Arial;background:#eee;color:#222}nav{padding:10px;display:flex;gap:12px}button{padding:10px}iframe{display:block;border:0;width:100%;height:calc(100vh - 62px)}</style>
<nav><button id="loss">Simulate WebGL context loss</button><button id="unavailable">Reload without WebGL</button><button id="reduced">Reload with reduced motion</button><button id="normal">Reload normally</button><button id="freeze">Freeze animation</button><button id="step">Step 0.2 seconds</button><output id="status" aria-live="polite">Ready</output></nav>
<iframe id="mine" title="Portfolio under test" src="/mine?profile=1"></iframe>
<script>
const frame=document.getElementById('mine'),status=document.getElementById('status');
document.getElementById('loss').onclick=()=>{const canvas=frame.contentDocument.querySelector('canvas');const extension=canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context');if(extension){extension.loseContext();status.textContent='Context loss requested';}else status.textContent='Context-loss extension unavailable';};
document.getElementById('unavailable').onclick=()=>{frame.src='/mine?simulateWebGLFailure=1';status.textContent='WebGL disabled for iframe';};
document.getElementById('reduced').onclick=()=>{frame.src='/mine?simulateReducedMotion=1';status.textContent='Reduced motion for iframe';};
document.getElementById('normal').onclick=()=>{frame.src='/mine?profile=1';status.textContent='Normal rendering';};
document.getElementById('freeze').onclick=()=>{frame.contentWindow.mineTest.freeze();status.textContent='Animation frozen';};
document.getElementById('step').onclick=()=>{frame.contentWindow.mineTest.step();status.textContent='Stepped 0.2 seconds';};
</script></html>`;
const disableWebGL = `<script>const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|^experimental-webgl/.test(type)?null:originalGetContext.call(this,type,...args)};</script>`;
const reduceMotion = `<script>const originalMatchMedia=window.matchMedia;window.matchMedia=query=>{const result=originalMatchMedia(query);if(query==='(prefers-reduced-motion: reduce)')Object.defineProperty(result,'matches',{value:true});return result};</script>`;
// Test-only clock and rolling frame samples; never included in the application.
const profile = `<script>
const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);let frozen=false,clock=0,previous=0,testId=1000000;const waiting=new Map(),frames=[],work=[];
window.requestAnimationFrame=callback=>{if(frozen){const id=++testId;waiting.set(id,callback);return id;}let id;id=raf(time=>{if(frozen){waiting.set(id,callback);return;}clock=time;const start=performance.now();callback(time);if(previous&&time-previous<250){frames.push(time-previous);work.push(performance.now()-start);if(frames.length>180){frames.shift();work.shift();}if(frames.length%30===0){const a=[...frames].sort((x,y)=>x-y),b=[...work].sort((x,y)=>x-y);document.documentElement.dataset.profile=JSON.stringify({samples:a.length,frameMedian:a[Math.floor(a.length*.5)],frameP95:a[Math.floor(a.length*.95)],callbackP95:b[Math.floor(b.length*.95)]});}}previous=time;});return id;};
window.cancelAnimationFrame=id=>{waiting.delete(id);cancel(id);};
window.mineTest={freeze(){frozen=true;},step(){frozen=true;for(let i=0;i<4;i++){const tasks=[...waiting.values()];waiting.clear();clock+=50;tasks.forEach(callback=>callback(clock));} },};
</script>`;
http.createServer((request, response) => {
  if (request.url === '/__loading') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>Actual loading screen verification</title><button onclick="document.getElementById(\'loading\').src=\'/mine?loadingProbe=1\'">Load portfolio with delayed scripts</button><iframe id="loading" title="Loading portfolio" style="display:block;border:0;width:100%;height:844px"></iframe>'); return;
  }
  if (request.url === '/__mobile') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>390px mobile viewport</title><style>body{margin:0;background:#ddd}iframe{display:block;width:390px;height:844px;border:0}</style><iframe title="390px portfolio" src="/mine"></iframe>'); return;
  }
  if (request.url === '/__audio') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`<!doctype html><title>Audio verification</title><button id="decode">Decode audio assets</button><button id="hide">Simulate hidden tab</button><button id="show">Simulate visible tab</button><button id="report">Report playback</button><pre id="result">Ready</pre><iframe id="mine" title="Audio portfolio under test" src="/mine?audioProbe=1" style="width:100%;height:720px;border:0"></iframe><script>
const frame=document.getElementById('mine'),result=document.getElementById('result');
document.getElementById('decode').onclick=async()=>{const c=new AudioContext(),rows=[];try{for(const file of ['cave.ogg','motor.mp3','impactMining_000.ogg','impactMining_001.ogg','impactMetal_light_000.ogg','impactBell_heavy_000.ogg']){const b=await c.decodeAudioData(await(await fetch('/mine/audio/'+file)).arrayBuffer());const data=b.getChannelData(0);let sum=0;for(const x of data)sum+=x*x;rows.push({file,seconds:b.duration,rms:Math.sqrt(sum/data.length)});}result.textContent=JSON.stringify(rows);}catch(e){result.textContent=String(e);}finally{c.close();}};
document.getElementById('hide').onclick=()=>{frame.contentWindow.mineAudioTest.hidden(true);result.textContent='Simulated hidden';};
document.getElementById('show').onclick=()=>{frame.contentWindow.mineAudioTest.hidden(false);result.textContent='Simulated visible';};
document.getElementById('report').onclick=()=>{result.textContent=JSON.stringify(frame.contentWindow.mineAudioTest.report());};
</script>`); return;
  }
  if (request.url === '/__recovery') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(harness); return; }
  const upstream = http.request({ hostname: '127.0.0.1', port: upstreamPort, path: request.url, method: request.method, headers: { ...request.headers, 'accept-encoding': 'identity' } }, result => {
    const chunks = [];
    result.on('data', chunk => chunks.push(chunk));
    result.on('end', () => {
      let body = Buffer.concat(chunks);
      const headers = { ...result.headers }; delete headers['content-length']; delete headers['transfer-encoding'];
      if (request.url.includes('loadingProbe=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace(/(\/_next\/static\/[^"\s]+\.js)/g, '$1?loadingProbe=1'));
      if (request.url.includes('audioProbe=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + audioProbe));
      if (request.url.includes('profile=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + profile));
      if (request.url.includes('simulateWebGLFailure=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + disableWebGL));
      if (request.url.includes('simulateReducedMotion=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + reduceMotion));
      const deliver = () => { response.writeHead(result.statusCode, headers); response.end(body); };
      if (String(request.headers.referer).includes('loadingProbe=1') && request.url.startsWith('/_next/static/')) setTimeout(deliver, 8000);
      else deliver();
    });
  });
  upstream.on('error', error => { response.writeHead(502); response.end(error.message); });
  request.pipe(upstream);
}).listen(3002, '127.0.0.1', () => console.log('Local checks: http://localhost:3002/__recovery'));
