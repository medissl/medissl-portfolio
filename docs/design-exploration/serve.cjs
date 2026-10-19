const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.ttf':'font/ttf','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(err?'Not found':data)})}).listen(port,'0.0.0.0',()=>console.log('Local concept review: http://localhost:'+port));
