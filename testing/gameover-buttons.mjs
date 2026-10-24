// The game-over buttons fade in from BUTTONS_APPEAR_DELAY (1.2 s) over
// FADE_DURATION (0.35 s). They must not swallow a press at any point of that
// fade: a button at alpha 0.03 is invisible, and pressing it used to restart
// the run. This gate freezes the frame loop so stateElapsed stays put, then
// presses the PLAY button at chosen points of the fade and checks that only a
// fully faded-in button accepts the press.
//   node gameover-buttons.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8247;
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

const BUTTONS_APPEAR_DELAY = 1.2;   // keep in sync with the bundle constants
const FADE_DURATION = 0.35;
const INVISIBLE = [1.0, 1.21, 1.4, BUTTONS_APPEAR_DELAY + FADE_DURATION - 0.01];
const VISIBLE = [BUTTONS_APPEAR_DELAY + FADE_DURATION + 0.01, 1.8];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const external = new Set(), errors = [];
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });
await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game && !!window.__ui', null, { timeout: 20000 });
await page.waitForTimeout(1200);

const cx = 512, cy = 384;
const reachGameOver = async () => {
  await page.evaluate(() => window.__ui.frameLoop.restart());
  if ((await page.evaluate(() => window.__game.state)) === 'getready') await page.mouse.click(cx, cy);
  await page.waitForFunction('window.__game.state === "gameover"', null, { timeout: 20000 });
  await page.waitForTimeout(50);
  await page.evaluate(() => window.__ui.frameLoop.stop());   // freeze stateElapsed
};

// screen point of the centre of the PLAY button, from the live layout
const playButtonPoint = () => page.evaluate(() => {
  const cam = window.__ui.camera;
  const wy = window.__ui.inputRouter.currentGameOverLayout().buttonY;
  return {
    x: (0 * cam.pixelsPerUnit + cam.offsetX + cam.framePxW / 2) / cam.dpr,
    y: (-wy * cam.pixelsPerUnit + cam.offsetY + cam.framePxH / 2) / cam.dpr,
  };
});
const pressAt = async (target) => {
  const info = await page.evaluate((t) => {
    const g = window.__game;
    g.stateEnteredElapsed = g.elapsed - t;
    return {
      stateElapsed: +g.stateElapsed.toFixed(4),
      alpha: +Math.min(1, Math.max(0, (g.stateElapsed - 1.2) / 0.35)).toFixed(3),
    };
  }, target);
  const pt = await playButtonPoint();
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.down();
  const pressed = await page.evaluate(() => window.__ui.inputRouter.pressedGameOverButton);
  await page.mouse.up();
  await page.waitForTimeout(60);
  return { ...info, pressed, stateAfter: await page.evaluate(() => window.__game.state) };
};

const out = { invisible: [], visible: [] };
await reachGameOver();
for (const t of INVISIBLE) out.invisible.push(await pressAt(t));
for (const t of VISIBLE) {
  out.visible.push(await pressAt(t));
  if (out.visible.at(-1).stateAfter !== 'gameover') await reachGameOver();
}

await browser.close();
server.close();

const invisibleOk = out.invisible.every((s) => s.pressed === null && s.stateAfter === 'gameover');
const visibleOk = out.visible.every((s) => s.pressed === 'play' && s.stateAfter === 'getready');
const pass = invisibleOk && visibleOk && external.size === 0 && errors.length === 0;
console.log(JSON.stringify({ ...out, invisibleOk, visibleOk, externalRequests: [...external], errors }, null, 2));
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(pass ? 0 : 1);
