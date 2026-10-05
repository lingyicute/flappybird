// Check the v3 HUD layout (HIGHEST SCORE top-left, sound toggle top-right) and
// the widened revive button.
//   node hud.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8221;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
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
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const external = new Set(), errors = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });

await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1500);

const out = {};
const snap = () => page.evaluate(() => ({
  state: window.__game.state, score: window.__game.score, revived: window.__game.wasRevived,
  muted: String(window.localStorage.getItem('flappy_muted')),
}));

// world frame geometry for a 1024x768 viewport: ppu = min(w/1.44, h/2.56) = 300
// frame width = 1.92 world units = 576 css px, centred -> x = 224 .. 800
const PPU = 300;
const LEFT = 1024 / 2 - 576 / 2;                       // 224
const RIGHT = 1024 / 2 + 576 / 2;                      // 800
const TOP = 768 / 2 - (2.56 / 2 - 0.12) * PPU;         // 36: HUD label row
// the sound toggle sits lower than the label: world y = frameH/2 - 0.2 -> 60 px
const SOUND = { x: RIGHT - 0.28 * PPU / 2, y: 0.2 * PPU + 4 }; // centre of the 0.28x0.22 hit box

out.initial = await snap();
await page.screenshot({ path: 'testing/h1-hud-getready.png' });

// ---- 1. the sound toggle must sit in the top-right corner ---------------
await page.mouse.click(SOUND.x, SOUND.y);
await page.waitForTimeout(400);
out.afterSoundClick1 = await snap();
await page.screenshot({ path: 'testing/h2-hud-muted.png' });
await page.mouse.click(SOUND.x, SOUND.y);
await page.waitForTimeout(400);
out.afterSoundClick2 = await snap();
out.iconTapDidNotFlap = out.afterSoundClick1.state === 'getready' && out.afterSoundClick2.state === 'getready';

// ---- 2. tapping the old (left) corner must NOT toggle mute --------------
await page.mouse.click(LEFT + 30, TOP + 4);
await page.waitForTimeout(400);
out.afterLeftCornerClick = await snap();       // mute untouched; the tap starts the run

// ---- 3. revive button width -------------------------------------------
const box = await (await page.$('canvas')).boundingBox();
const cx = box.x + box.width / 2;

const dieOnce = async () => {
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) {
    const s = await page.evaluate(() => ({
      state: window.__game.state, score: window.__game.score, birdY: window.__game.birdY,
      pipes: window.__game.pipes.map((p) => ({ x: p.x, gapY: p.gapY, halfGap: p.halfGap })),
    }));
    if (s.state === 'gameover') break;
    if (s.state === 'getready') { await page.mouse.click(cx, box.y + box.height * 0.5); await page.waitForTimeout(120); continue; }
    if (s.score >= 2) break;
    const pipe = s.pipes.find((p) => p.x > -0.02);
    const target = pipe ? pipe.gapY - (pipe.halfGap ? pipe.halfGap * 0.3 : 0) : 0.05;
    if (s.birdY < target - 0.03) await page.mouse.click(cx, box.y + box.height * 0.5);
    await page.waitForTimeout(35);
  }
  const t1 = Date.now(); let s = await snap();
  while (s.state !== 'gameover' && Date.now() - t1 < 15000) { await page.waitForTimeout(200); s = await snap(); }
  await page.waitForTimeout(1800);
  return s;
};
out.death = await dieOnce();

// measure the horizontal extent of the green (PLAY) and yellow (REVIVE) buttons
const measure = () => page.evaluate(() => {
  const c = document.querySelector('canvas');
  const rect = c.getBoundingClientRect();
  const ctx = c.getContext('2d');
  const sy = c.height / rect.height, sx = c.width / rect.width;
  const mid = Math.round(c.width * 0.5);
  const cls = (x, y) => {
    const d = ctx.getImageData(x, y, 1, 1).data, r = d[0], g = d[1], b = d[2];
    if (g > 110 && g > r + 40 && g > b + 40) return 'green';
    if (r > 140 && g > 120 && b < 120 && Math.abs(r - g) < 70) return 'yellow';
    return null;
  };
  const spans = {};
  for (const kind of ['green', 'yellow']) {
    let best = null;
    for (let y = Math.round(c.height * 0.55); y < c.height; y += 2) {
      for (const x of [mid - 75, mid - 50, mid - 25, mid, mid + 25, mid + 50, mid + 75]) {
        if (cls(x, y) !== kind) { best = null; continue; }
        let lo = x, hi = x;
        while (lo > 2 && cls(lo - 2, y) === kind) lo -= 2;
        while (hi < c.width - 3 && cls(hi + 2, y) === kind) hi += 2;
        if (!best || hi - lo > best.hi - best.lo) best = { lo, hi, y };
      }
      if (best && best.y === y) break;
    }
    spans[kind] = best
      ? { widthCss: (best.hi - best.lo + 2) / sx, leftCss: rect.left + best.lo / sx,
          rightCss: rect.left + best.hi / sx, centreXCss: rect.left + (best.lo + best.hi) / 2 / sx,
          centreYCss: rect.top + best.y / sy }
      : null;
  }
  return spans;
});
out.buttons = await measure();
await page.screenshot({ path: 'testing/h3-revive-wide.png' });

// the widened hit box must reach the new outer edges: click near its right end
let edgeRevive = null;
if (out.buttons.yellow) {
  const y = out.buttons.yellow.centreYCss;
  const x = out.buttons.yellow.rightCss - 10;
  await page.mouse.click(x, y);
  await page.waitForTimeout(500);
  edgeRevive = await snap();
  if (edgeRevive.state !== 'play') {           // retry a little further in
    await page.mouse.click(x - 20, y);
    await page.waitForTimeout(500);
    edgeRevive = await snap();
  }
}
out.edgeReviveClick = edgeRevive;

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

const pass =
  out.initial.muted !== 'true' &&
  out.afterSoundClick1.muted === 'true' && out.afterSoundClick2.muted === 'false' &&
  out.iconTapDidNotFlap && out.afterLeftCornerClick.muted !== 'true' &&
  out.afterLeftCornerClick.state === 'play' &&
  !!out.buttons.green && !!out.buttons.yellow &&
  out.buttons.yellow.widthCss > out.buttons.green.widthCss * 1.25 &&
  Math.abs(out.buttons.yellow.widthCss - 216) < 12 &&
  edgeRevive && edgeRevive.state === 'play' &&
  external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
