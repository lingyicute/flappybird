// Autopilot + royale-bot playability check.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8155;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
const origin = `http://127.0.0.1:${PORT}`;
const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const out = {};

// ---- 1. human-style autopilot ------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const external = new Set();
  page.on('request', r=>{ if(!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
  await page.goto(`${origin}/`, { waitUntil:'load' });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  const box = await (await page.$('canvas')).boundingBox();
  const cx = box.x + box.width/2, cy = box.y + box.height/2;
  await page.mouse.click(cx, cy);
  const t0 = Date.now();
  let flaps = 0, best = 0, s = null;
  while (Date.now() - t0 < 40000) {
    s = await page.evaluate(() => ({ state: window.__game.state, score: window.__game.score, best: window.__game.bestScore, birdY: window.__game.birdY, pipes: window.__game.pipes.map(p=>({x:p.x, gapY:p.gapY, halfGap:p.halfGap})) }));
    if (s.state !== 'play') break;
    best = Math.max(best, s.score);
    if (s.score >= 5) break;
    const pipe = s.pipes.find(p => p.x > -0.02);
    const target = pipe ? pipe.gapY - (pipe.halfGap ? pipe.halfGap*0.3 : 0) : 0.05;
    if (s.birdY < target - 0.03) { await page.mouse.click(cx, cy); flaps++; }
    await page.waitForTimeout(35);
  }
  out.autopilot = { state: s.state, score: s.score, best, flaps, seconds: Math.round((Date.now()-t0)/1000) };
  out.autopilotExternal = [...external];
  await page.screenshot({ path: 'testing/offline-autopilot.png' });
  await page.close();
}

// ---- 2. royale bots (same engine, self-playing) -------------------------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.goto(`${origin}/?royale`, { waitUntil:'load' });
  await page.waitForFunction('!!window.__royale', null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  const box = await (await page.$('canvas')).boundingBox();
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  await page.waitForTimeout(12000);
  out.royale = await page.evaluate(() => ({
    steps: window.__royale.matchSteps(),
    alive: window.__royale.aliveBots(),
    playersScore: window.__game.score,
    feed: (window.__royale.match?.feed ?? []).slice(-6),
  }));
  await page.screenshot({ path: 'testing/offline-royale.png' });
  await page.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close(); server.close();
