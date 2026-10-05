import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const dir = '/home/lyi/flappybird-dev';
const PORT = 8177;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
let atlasHits = 0;
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p.includes('atlas')) atlasHits++; let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
const b = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const page = await b.newPage();
page.on('console', m=>{ if(m.type()!=='warning') console.log('CONSOLE', m.type(), m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
const info = await page.evaluate(async () => {
  const r = await fetch('/assets/atlas-D7zSkRSP.webp');
  const buf = await r.arrayBuffer();
  let bmpOk = false, imgOk = false, imgW = 0, imgH = 0;
  try { const bm = await createImageBitmap(new Blob([buf], { type: 'image/webp' })); bmpOk = true; } catch (e) { bmpOk = 'err:' + e.name; }
  try { const im = new Image(); im.src = '/assets/atlas-D7zSkRSP.webp'; await im.decode(); imgOk = true; imgW = im.naturalWidth; imgH = im.naturalHeight; } catch (e) { imgOk = 'err:' + e.name; }
  return { bytes: buf.byteLength, head: new TextDecoder().decode(buf.slice(0, 40)), bmpOk, imgOk, imgW, imgH };
});
console.log(JSON.stringify({ atlasHits, info }, null, 2));
await page.waitForTimeout(3000);
await page.screenshot({ path: 'testing/atlas-test.png' });
await b.close(); server.close();
