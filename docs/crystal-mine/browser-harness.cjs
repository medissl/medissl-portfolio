// Local verification only. Proxy the production server without changing app code.
// Run after `npm run start`: node docs/crystal-mine/browser-harness.cjs
const http = require('node:http');
const harness = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Mine recovery checks</title>
<style>body{margin:0;font:14px Arial;background:#eee;color:#222}nav{padding:10px;display:flex;gap:12px}button{padding:10px}iframe{display:block;border:0;width:100%;height:calc(100vh - 62px)}</style>
<nav><button id="loss">Simulate WebGL context loss</button><button id="unavailable">Reload without WebGL</button><button id="reduced">Reload with reduced motion</button><button id="normal">Reload normally</button><output id="status" aria-live="polite">Ready</output></nav>
<iframe id="mine" title="Portfolio under test" src="/mine"></iframe>
<script>
const frame=document.getElementById('mine'),status=document.getElementById('status');
document.getElementById('loss').onclick=()=>{const canvas=frame.contentDocument.querySelector('canvas');const extension=canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context');if(extension){extension.loseContext();status.textContent='Context loss requested';}else status.textContent='Context-loss extension unavailable';};
document.getElementById('unavailable').onclick=()=>{frame.src='/mine?simulateWebGLFailure=1';status.textContent='WebGL disabled for iframe';};
document.getElementById('reduced').onclick=()=>{frame.src='/mine?simulateReducedMotion=1';status.textContent='Reduced motion for iframe';};
document.getElementById('normal').onclick=()=>{frame.src='/mine';status.textContent='Normal rendering';};
</script></html>`;
const disableWebGL = `<script>const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|^experimental-webgl/.test(type)?null:originalGetContext.call(this,type,...args)};</script>`;
const reduceMotion = `<script>const originalMatchMedia=window.matchMedia;window.matchMedia=query=>{const result=originalMatchMedia(query);if(query==='(prefers-reduced-motion: reduce)')Object.defineProperty(result,'matches',{value:true});return result};</script>`;
http.createServer((request, response) => {
  if (request.url === '/__recovery') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(harness); return; }
  const upstream = http.request({ hostname: '127.0.0.1', port: 3000, path: request.url, method: request.method, headers: { ...request.headers, 'accept-encoding': 'identity' } }, result => {
    const chunks = [];
    result.on('data', chunk => chunks.push(chunk));
    result.on('end', () => {
      let body = Buffer.concat(chunks);
      const headers = { ...result.headers }; delete headers['content-length']; delete headers['transfer-encoding'];
      if (request.url.includes('simulateWebGLFailure=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + disableWebGL));
      if (request.url.includes('simulateReducedMotion=1') && String(headers['content-type']).includes('text/html')) body = Buffer.from(body.toString().replace('<head>', '<head>' + reduceMotion));
      response.writeHead(result.statusCode, headers); response.end(body);
    });
  });
  upstream.on('error', error => { response.writeHead(502); response.end(error.message); });
  request.pipe(upstream);
}).listen(3002, '127.0.0.1', () => console.log('Local checks: http://localhost:3002/__recovery'));
