// Death sounds: "hit" belongs to the impact, "die" is the sound of the fall.
// A pipe hit plays "hit" at once and "die" only once the bird is on its way
// down, never on the same frame; a bird that dies on the ground is already down
// and gets no fall sound at all.
//   node death-sounds.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8293;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });   // audio must stay on
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });
// record every decoded buffer and every playback: the buffer duration is a
// stable fingerprint for which of the five sound effects was played
await page.addInitScript(() => {
  window.__snd = { decoded: [], played: [] };
  const AC = window.AudioContext || window.webkitAudioContext;
  const decode = AC.prototype.decodeAudioData;
  AC.prototype.decodeAudioData = function (...args) {
    const p = decode.apply(this, args);
    p.then((buf) => window.__snd.decoded.push(+buf.duration.toFixed(3))).catch(() => window.__snd.decoded.push('error'));
    return p;
  };
  const create = AC.prototype.createBufferSource;
  AC.prototype.createBufferSource = function () {
    const src = create.call(this);
    const start = src.start.bind(src);
    src.start = (...args) => {
      window.__snd.played.push(+(src.buffer?.duration ?? 0).toFixed(3));
      return start(...args);
    };
    return src;
  };
});
await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
// the effects are fetched and decoded at start-up; let them finish before the
// loop is frozen (the loader is driven by the running game)
await page.waitForFunction('window.__snd.decoded.length >= 5', null, { timeout: 20000 });
await page.evaluate(() => {
  window.requestAnimationFrame = () => 0;                 // freeze the loop
  window.cancelAnimationFrame = () => {};
});

const out = {};
out.decoded = await page.evaluate(() => window.__snd.decoded.slice().sort());

// ------------------------------------------------------------- 1. pipe hit ---
out.pipe = await page.evaluate(() => {
  const g = window.__game, S = window.__snd;
  g.flap();                                               // getready -> play
  S.played.length = 0;                                    // the wing sound is not under test
  g.birdVy = 0;
  g.birdY = 0.45;                                         // already inside the lower pipe
  g.pipes = [{ x: 0, gapY: 0.6, halfGap: 0.12, passed: false }];
  const res = { impact: [], dieAt: null, dyingSpeedDown: null, stillAirborne: null };
  let hitStep = -1;
  for (let i = 0; i < 400; i++) {
    g.step(1 / 120);
    if (hitStep < 0 && g.state === 'gameover') {
      hitStep = i;
      res.cause = g.runDeathCause;
      res.impact = S.played.slice();                      // what played on the impact frame
    } else if (hitStep >= 0 && S.played.length > res.impact.length) {
      res.dieAt = i - hitStep;
      res.dyingSpeedDown = g.birdVy <= 0;
      res.stillAirborne = !g.birdGrounded;
      break;
    }
    if (hitStep >= 0 && g.birdGrounded) break;
  }
  res.all = S.played.slice();
  return res;
});

// ----------------------------------------------------------- 2. ground hit ---
out.ground = await page.evaluate(() => {
  const g = window.__game, S = window.__snd;
  g.restart();                                            // gameover -> getready
  g.flap();
  S.played.length = 0;
  g.birdVy = 0;
  g.birdY = -0.95;                                        // on the ground trigger
  for (let i = 0; i < 240; i++) g.step(1 / 120);
  return { state: g.state, cause: g.runDeathCause, played: S.played.slice() };
});

out.errors = errors;
console.log(JSON.stringify(out, null, 2));

const hit = out.pipe.impact;
const pass =
  out.pipe.cause === 'pipeBottom' &&
  hit.length === 1 &&                                     // the impact plays "hit" only
  out.pipe.all.length === 2 &&                            // ... and the fall sound later
  out.pipe.all[0] === hit[0] &&
  out.pipe.all[1] !== hit[0] &&                           // a different effect: "die"
  // "hit" is still at ~80 % of its peak a tenth of a second in, so a fall sound
  // that starts that early sounds like one stacked effect; by 0.3 s it is down
  // to ~11 % and by 0.35 s to ~2 %, which is where the gap has to be
  out.pipe.dieAt !== null && out.pipe.dieAt >= 36 &&
  out.pipe.dieAt <= 120 &&
  out.pipe.dyingSpeedDown && out.pipe.stillAirborne &&
  out.ground.state === 'gameover' && out.ground.cause === 'ground' &&
  out.ground.played.length === 1 &&                       // already down: no fall sound
  out.ground.played[0] === hit[0] &&
  errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
