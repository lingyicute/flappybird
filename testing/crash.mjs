// Crash landing: after a hit the bird must fall nose-down and end up resting on
// the ground with its beak pointing straight down (rot = -90 deg), for every
// kind of death, however short the fall is.
//   node crash.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8371;
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
await page.waitForTimeout(1500);

const BOX = await (await page.$('canvas')).boundingBox();
const cx = BOX.x + BOX.width / 2, cy = BOX.y + BOX.height / 2;
const M90 = -Math.PI / 2;
const snap = () => page.evaluate(() => ({
  state: window.__game.state, rot: window.__game.birdRot, vy: window.__game.birdVy,
  y: window.__game.birdY, grounded: window.__game.birdGrounded, revived: window.__game.wasRevived,
}));

// the bird sprite (34x24) rotated 90 deg is taller than wide: measure the ink
// around the resting bird to confirm the nose really points down
// Measure the resting bird from its own colours only (yellow body, orange belly,
// red beak). The game-over veil fades the scene by an arbitrary amount between
// the hit and the freeze, so a pixel matches when it is proportional to a family
// colour at ANY brightness between 0.33x and 1.05x.
const birdInkOn = (pg) => pg.evaluate(() => {
  const c = document.querySelector('canvas');
  const x0 = Math.round(c.width / 2 - 100), y0 = Math.round(c.height * 0.74);
  const w = 200, h = Math.round(c.height * 0.255);
  const d = c.getContext('2d').getImageData(x0, y0, w, h).data;
  const fams = [[248,183,51], [224,128,44], [252,56,0]];
  let minx=1e9,miny=1e9,maxx=-1,maxy=-1,n=0, warm=0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y*w + x)*4, px=[d[o],d[o+1],d[o+2]];
    let hit = -1;
    for (let f = 0; f < fams.length; f++) {
      const t = fams[f];
      // average the ratios over the non-zero components only: the beak family is
      // (252,56,0) and a plain /t[2] would make k NaN and silently drop the beak
      const ks = []; for (let i = 0; i < 3; i++) if (t[i]) ks.push(px[i] / t[i]);
      const k = ks.reduce((a, b) => a + b, 0) / ks.length;
      if (k < 0.33 || k > 1.05) continue;
      if (Math.abs(px[0]-k*t[0]) <= 18 && Math.abs(px[1]-k*t[1]) <= 18 && Math.abs(px[2]-k*t[2]) <= 18) { hit = f; break; }
    }
    if (hit < 0) continue;
    n++;
    if (hit === 0) warm++;
    if (x<minx) minx=x; if (x>maxx) maxx=x; if (y<miny) miny=y; if (y>maxy) maxy=y;
  }
  return n ? { n, w: maxx-minx+1, h: maxy-miny+1, warm, bbox:[minx+x0,miny+y0], rot:+window.__game.birdRot.toFixed(6), st:window.__game.state } : null;
});

const out = {};

// ---------------------------------------------------------------- 1. pipe hit, long fall
// fly until a pipe collision happens on its own (autopilot), then watch the fall
await page.mouse.click(cx, cy);                     // start
const rotTrace = [];
let landed = null;
const t0 = Date.now();
while (Date.now() - t0 < 45000) {
  const s = await page.evaluate(() => ({
    state: window.__game.state, rot: window.__game.birdRot, vy: window.__game.birdVy,
    grounded: window.__game.birdGrounded, score: window.__game.score, y: window.__game.birdY,
    pipes: window.__game.pipes.map((p) => ({ x: p.x, gapY: p.gapY, halfGap: p.halfGap })),
  }));
  if (s.state === 'gameover') {
    rotTrace.push(s.rot);
    if (s.grounded) {
      landed = s;
      await page.waitForTimeout(150);      // settled: prevRot is nose-down too
      break;
    }
  } else if (s.state === 'play') {
    // fly until the first point, then stop flapping on purpose so the bird hits a
    // pipe (deterministic crash instead of hoping the autopilot collides)
    if (s.score < 1) {
      const pipe = s.pipes.find((p) => p.x > -0.02);
      const target = pipe ? pipe.gapY - (pipe.halfGap ? pipe.halfGap * 0.3 : 0) : 0.05;
      if (s.y < target - 0.03) await page.mouse.click(cx, cy);
    }
    await page.waitForTimeout(35);
  } else break;
}
out.pipeCrash = landed;
out.pipeScore = landed ? (await snap()).state : null;
out.pipeLandedRot = landed ? landed.rot : null;
out.rotNeverWentUp = rotTrace.every((r, i) => i === 0 || r <= rotTrace[i-1] + 1e-9);
// frozen frame: pause before the game-over dim reaches the bird, then measure the ink
await page.keyboard.press('KeyP');
await page.waitForTimeout(300);
out.pipeInk = await birdInkOn(page);
await page.screenshot({ path: 'testing/k1-crash-pipe.png' });
out.pipeResting = await snap();                      // must still be beak-down
out.pipeRotStaysDown = out.pipeResting.rot === M90;

// ---------------------------------------------------------------- 2. short fall (ground hit)
// fresh page: no leftovers from phase 1, so the timing is exactly death -> ground
const page2 = await browser.newPage({ viewport:{width:1024,height:768} });
page2.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page2.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page2.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });
await page2.goto(`${origin}/`, { waitUntil:'load' });
await page2.waitForFunction('!!window.__game', null, { timeout:20000 });
await page2.waitForTimeout(1200);
await page2.mouse.click(cx, cy);                     // start the run
await page2.waitForTimeout(250);
await page2.evaluate(() => { window.__game.birdY = -0.80; });   // ~0.1 units above the ground trigger
let short = null;
const t1 = Date.now();
while (Date.now() - t1 < 8000) {
  const s = await page2.evaluate(() => ({ state: window.__game.state, rot: window.__game.birdRot,
    grounded: window.__game.birdGrounded, elapsedState: window.__game.stateElapsed }));
  if (s.state === 'gameover' && s.grounded) { short = s; break; }
  await page2.waitForTimeout(20);
}
out.shortFall = short;
out.shortFallRot = short ? short.rot : null;
out.shortDeathElapsed = short ? +short.elapsedState.toFixed(3) : null;
// freeze right away: the game-over overlay fades in at death+1.2 s and would cover
// the resting bird (it sits behind the REVIVE button in that layout)
await page2.keyboard.press('KeyP');
await page2.waitForTimeout(120);
const yFrozen = await page2.evaluate(() => window.__game.birdY);
await page2.waitForTimeout(260);
out.freezeHeld = (await page2.evaluate(() => window.__game.birdY)) === yFrozen;
out.shortInk = await birdInkOn(page2);
await page2.screenshot({ path: 'testing/k2-crash-ground.png' });
out.shortInkCheck = await birdInkOn(page2);   // second read: shape must stay beak-down
out.shortRotStaysDown = (await page2.evaluate(() => window.__game.birdRot)) === M90;

// ---------------------------------------------------------------- 3. revive still works
await page2.keyboard.press('KeyP');
await page2.waitForTimeout(150);
out.revivedState = await page2.evaluate(() => {
  const g = window.__game;
  g.revive();
  return { state: g.state, rot: g.birdRot, grounded: g.birdGrounded };
});
await page2.waitForTimeout(800);
out.afterRevive = await page2.evaluate(() => ({ state: window.__game.state, rot: window.__game.birdRot,
  grounded: window.__game.birdGrounded, revived: window.__game.wasRevived }));
await page2.screenshot({ path: 'testing/k3-after-revive.png' });
await page2.close();

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

const near = (v, ref, tol = 1e-9) => v !== null && Math.abs(v - ref) <= tol;
// rotated 90 deg the sprite is taller than wide (24 x 34), the beak ends up at the bottom
const beakDown = (ink) => !!ink && ink.h > ink.w * 1.15 && ink.n > 90 && ink.w < 40 && ink.h > 25;
// the veil keeps ramping after the hit, so the pixel count drifts a little; what
// must hold for every read is the shape: taller than wide, i.e. the beak is down
const pass =
  out.pipeCrash && out.pipeCrash.grounded &&
  near(out.pipeLandedRot, M90) && out.rotNeverWentUp && out.pipeRotStaysDown &&
  beakDown(out.pipeInk) &&
  beakDown(out.shortInkCheck) &&
  out.shortFall && near(out.shortFallRot, M90) && out.shortRotStaysDown && out.freezeHeld && beakDown(out.shortInk) &&
  out.revivedState.state === 'play' && !out.revivedState.grounded && near(out.revivedState.rot, Math.PI / 8, 1e-9) &&
  external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
