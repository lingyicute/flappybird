import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8166;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'testing/s-getready.png' });
const box = await (await page.$('canvas')).boundingBox();
const cx = box.x + box.width/2, cy = box.y + box.height/2;
await page.mouse.click(cx, cy);
// fly a little, let it die
for (let i=0;i<6;i++) { await page.mouse.click(cx, cy); await page.waitForTimeout(320); }
await page.waitForTimeout(300);
await page.screenshot({ path: 'testing/s-play.png' });
let st;
for (let i=0;i<60;i++) { st = await page.evaluate(()=>window.__game.state); if (st==='gameover') break; await page.waitForTimeout(200); }
await page.waitForTimeout(2200);
await page.screenshot({ path: 'testing/s-gameover.png' });
await page.click('a.navbar__link[href="/about"]');
await page.waitForTimeout(500);
await page.screenshot({ path: 'testing/s-about.png' });
console.log(JSON.stringify({ state: await page.evaluate(()=>window.__game.state), best: await page.evaluate(()=>window.__game.bestScore), errs }, null, 2));
await browser.close(); server.close();
