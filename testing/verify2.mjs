// End-to-end check of the offline Flappy Bird build (v2: no nav bar, revive button).
//   node verify2.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8144;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(dir, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, process.env.ENTRY || 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
const page = await ctx.newPage();

const external = new Set();
const errors = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !/Failed to load (resource|sprite)/.test(t) && !/404/.test(t)) errors.push('console: ' + t);
});

await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1200);

const snap = () => page.evaluate(() => ({
  state: window.__game.state, score: window.__game.score, best: window.__game.bestScore,
  revived: window.__game.wasRevived, path: location.pathname,
}));

const results = {};
results.first = await snap();

// ---- v2: the bottom navigation bar and the router must be gone ----------
results.shell = await page.evaluate(() => ({
  navbar: document.querySelectorAll('.navbar, nav, [class*="navbar"]').length,
  navLinks: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter(Boolean),
  aboutNode: !!document.querySelector('.page, .page__title, a[href="/about"]'),
  canvas: !!document.querySelector('canvas'),
  bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 80),
}));

// ---- autopilot: fly through the pipes ----------------------------------
const box = await (await page.$('canvas')).boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

// retry the flight (the crude autopilot sometimes clips a pipe early)
let flapped = 0;
for (let attempt = 0; attempt < 4; attempt++) {
  const st = await snap();
  if (st.state === 'gameover') {
    for (const frac of [0.707, 0.7, 0.715, 0.695]) {
      await page.mouse.click(cx, box.y + box.height * frac);
      await page.waitForTimeout(180);
      if ((await snap()).state === 'getready') break;
    }
  }
  await page.mouse.click(cx, cy); // start the run
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => ({
      state: window.__game.state, score: window.__game.score, birdY: window.__game.birdY,
      pipes: window.__game.pipes.map((p) => ({ x: p.x, gapY: p.gapY, halfGap: p.halfGap })),
    }));
    if (s.state !== 'play' || s.score >= 3) break;
    const pipe = s.pipes.find((p) => p.x > -0.02);
    const target = pipe ? pipe.gapY - (pipe.halfGap ? pipe.halfGap * 0.3 : 0) : 0.05;
    if (s.birdY < target - 0.03) { await page.mouse.click(cx, cy); flapped++; }
    await page.waitForTimeout(35);
  }
  if ((await snap()).score >= 1) break;
}
results.afterFlight = { ...(await snap()), flapped };

// ---- stop flying: the bird must die and the score must persist ---------
const died = Date.now() + 20000;
let cur = await snap();
while (cur.state !== 'gameover' && Date.now() < died) { await page.waitForTimeout(200); cur = await snap(); }
results.gameover = cur;
results.stored = await page.evaluate(() => ({
  best: localStorage.getItem('flappy_bestScore'), keys: Object.keys(localStorage),
}));
await page.screenshot({ path: 'testing/offline-gameover.png' });

// ---- pointer restart: scan the panel for the PLAY button ---------------
let restarted = false;
for (const frac of [0.707, 0.7, 0.715, 0.695, 0.72, 0.69, 0.685, 0.73, 0.68, 0.66]) {
  await page.mouse.click(cx, box.y + box.height * frac);
  await page.waitForTimeout(200);
  restarted = (await snap()).state === 'getready';
  if (restarted) break;
}
results.pointerRestart = restarted;

// ---- pause key: the world must freeze while paused --------------------
await page.mouse.click(cx, cy);                 // play
await page.waitForTimeout(400);
const y0 = await page.evaluate(() => window.__game.birdY);
await page.keyboard.press('KeyP');
await page.waitForTimeout(600);
const y1 = await page.evaluate(() => window.__game.birdY);
await page.waitForTimeout(400);
const y2 = await page.evaluate(() => window.__game.birdY);
await page.keyboard.press('KeyP');              // unpause
await page.waitForTimeout(600);
const y3 = await page.evaluate(() => window.__game.birdY);
results.pause = { y0, y1, y2, y3, froze: y1 === y2, resumed: y3 !== y2 };

// ---- let it die again, then keyboard restart --------------------------
cur = await snap();
for (let i = 0; i < 80 && cur.state !== 'gameover'; i++) { await page.waitForTimeout(250); cur = await snap(); }
results.beforeKeyboardRestart = cur;
await page.waitForTimeout(1700);            // the panel accepts input ~1.2 s after death
for (let i = 0; i < 3; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
  if ((await snap()).state === 'getready') break;
}
results.keyboardRestart = (await snap()).state === 'getready';

// ---- offline: reload with every off-origin request blocked -------------
await ctx.route('**/*', (route) => {
  route.request().url().startsWith(origin) ? route.continue() : route.abort();
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2500);
const box2 = await (await page.$('canvas')).boundingBox();
await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
await page.waitForTimeout(400);
results.offlineReload = { ...(await snap()) };
results.offlineReloadBestStored = await page.evaluate(() => localStorage.getItem('flappy_bestScore'));

console.log(JSON.stringify({ ...results, externalRequests: [...external], errors }, null, 2));
await browser.close();
server.close();
const pass =
  results.shell.navbar === 0 && !results.shell.aboutNode && results.shell.canvas &&
  results.shell.navLinks.length === 0 &&
  results.first.path === '/' &&
  results.afterFlight.score >= 1 &&
  results.gameover.state === 'gameover' && results.gameover.best >= results.afterFlight.score &&
  results.gameover.revived === false &&
  results.pointerRestart &&
  results.pause.froze && results.pause.resumed &&
  results.keyboardRestart &&
  results.offlineReload.path === '/' &&
  results.offlineReload.best === results.gameover.best &&
  results.offlineReloadBestStored === String(results.gameover.best) &&
  external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
