// Original home-screen artwork + original bird sprite + sound-toggle position.
//   node flappy.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8351;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r)=>server.listen(PORT,'127.0.0.1',r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const page = await browser.newPage({ viewport:{width:1024,height:768} });
const external = new Set(), errors = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });

await page.goto(`${origin}/`, { waitUntil:'load' });
await page.waitForFunction('!!window.__game', null, { timeout:20000 });
await page.waitForTimeout(1800);

// ---------------------------------------------------------------- helpers ---
// colour bands (in canvas px) inside the letterboxed game frame
const bands = (target, minHits, tol) => page.evaluate(([target, minHits, tol]) => {
  const c = document.querySelector('canvas');
  const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const near = (o) => Math.abs(d[o]-target[0])<=tol && Math.abs(d[o+1]-target[1])<=tol && Math.abs(d[o+2]-target[2])<=tol;
  const counts = [];
  for (let y = 0; y < c.height; y++) {
    let n = 0;
    for (let x = 0; x < c.width; x += 2) { const o = (y*c.width + x)*4; if (near(o)) n++; }
    counts.push(n);
  }
  const out = []; let s = null;
  counts.forEach((n, y) => { if (n > minHits) { if (s === null) s = y; } else if (s !== null) { out.push([s, y-1]); s = null; } });
  if (s !== null) out.push([s, c.height-1]);
  // frame bounds: the app letterboxes with #111111 bars
  const mid = Math.round(c.height / 2);
  const black = (x) => { const o = (mid*c.width + x)*4; return d[o] < 40 && d[o+1] < 40 && d[o+2] < 40; };
  let fl = 0, fr = c.width-1;
  while (fl < c.width && black(fl)) fl++;
  while (fr > fl && black(fr)) fr--;
  return { bands: out, frame: { left: fl, right: fr, w: fr - fl } };
}, [target, minHits, tol]);

// bbox of a colour family, as a share of the frame height
const bbox = (target, tol, region) => page.evaluate(([target, tol, region]) => {
  const c = document.querySelector('canvas');
  const rx0 = region ? region[0] : 0, ry0 = region ? region[1] : 0;
  const rx1 = region ? region[2] : c.width, ry1 = region ? region[3] : c.height;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const near = (o) => Math.abs(d[o]-target[0])<=tol && Math.abs(d[o+1]-target[1])<=tol && Math.abs(d[o+2]-target[2])<=tol;
  let minx=1e9,miny=1e9,maxx=-1,maxy=-1,n=0;
  for (let y = ry0; y < ry1; y++) for (let x = rx0; x < rx1; x++) {
    const o = (y*c.width + x)*4;
    if (near(o)) { n++; if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
  }
  return n ? { n, minx, miny, maxx, maxy, cx: (minx+maxx)/2, cy: (miny+maxy)/2 } : null;
}, [target, tol, region || null]);

const GRAY   = [215, 215, 215];   // original artwork grey (logo + ghost bird)
const GREEN  = [94, 226, 112];    // "Get Ready!"
const RED    = [245, 50, 35];     // TAP arrows
const YELLOW = [248, 183, 51];    // live bird body
const SPEAKER= [73, 174, 245];    // sound-toggle speaker icon (from sound-on.png)

const out = {};
const frames = await bands(GREEN, 6, 40);
out.frame = frames.frame;
const fh = null; // frame height = canvas height (vertical bars only)

out.greenBand = frames.bands;
out.tapBands = (await bands(RED, 6, 40)).bands;
out.splashGray = await bbox(GRAY, 12, [345, 0, 760, 400]);   // logo + ghost bird (skip the HUD text)
out.birdYellowBeforeStart = (await bbox(YELLOW, 26) || { n: 0 }).n;
out.speaker = await bbox(SPEAKER, 14, [700, 0, 830, 140]);  // sound-toggle icon, top-right corner
out.stateBeforeStart = await page.evaluate(() => window.__game.state);
await page.screenshot({ path: 'testing/j1-getready.png' });

// Reference geometry from the original 288x512 window: the artwork is drawn
// 1:1 (52% height) with its top at 12% of the window, so
//   logo        top          61/512  = 0.119
//   Get Ready!  167..206 px  0.326..0.402
//   TAP arrows  298..311 px  0.582..0.607
const H = 768;
const pct = (b) => [ +(b[0] / H).toFixed(4), +(b[1] / H).toFixed(4) ];
out.greenPct = out.greenBand.map(pct);
out.tapPct = out.tapBands.map(pct);
out.speakerPctOfH = out.speaker ? +(out.speaker.cy / H).toFixed(4) : null;
out.speakerX = out.speaker ? out.speaker.cx : null;

// ---------------------------------------------------------------- flap -----
await page.mouse.click(512, 384);                        // start the run
await page.waitForTimeout(120);
const seen = new Set();
for (let i = 0; i < 60; i++) {
  const f = await page.evaluate(() => window.__game.snapshot.birdFrame);
  seen.add(f);
  if (seen.size >= 3) break;
  await page.waitForTimeout(40);
}
out.framesSeen = [...seen].sort();
out.birdYellowWhilePlaying = (await bbox(YELLOW, 26) || { n: 0 }).n;
await page.screenshot({ path: 'testing/j2-play-bird.png' });

// ------------------------------------------------- sound toggle position ----
out.speakerIsLower = out.speaker ? out.speaker.cy > 52 && out.speaker.cy < 70 : false;
out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

// the "Get Ready!" band is the topmost green band (bushes are green as well)
const g = out.greenPct.filter((b) => b[0] < 0.5)[0];
const t = out.tapPct[0];
const near = (v, ref, tol = 0.02) => Math.abs(v - ref) < tol;
const pass =
  out.stateBeforeStart === 'getready' &&
  g && t &&
  near(g[0], 0.326) && near(g[1], 0.402) &&        // Get Ready! exactly where the original puts it
  near(t[0], 0.582) && near(t[1], 0.607) &&        // TAP arrows
  out.splashGray && near(out.splashGray.miny / H, 0.119, 0.025) &&  // logo 12% below the top
  out.birdYellowBeforeStart === 0 &&               // no live bird on the splash
  out.birdYellowWhilePlaying > 60 &&               // original yellow bird while playing
  out.framesSeen.join(',') === '0,1,2' &&          // upflap/midflap/downflap cycle
  out.speakerIsLower &&                            // sound toggle moved down
  out.speakerX > 700 &&                            // ... and still top-right
  external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
