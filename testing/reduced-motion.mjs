// The death shake is the one purely decorative motion in the game, so the
// OS-level "reduce motion" preference must suppress it (ScreenShake.trigger
// returns early). Nothing else pins that behaviour down: this gate dies once
// under each preference and reads the shake state on the very frame the state
// flips, before any decay could hide a triggered shake.
//   node reduced-motion.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8251;
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

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const out = {};
for (const reducedMotion of ['no-preference', 'reduce']) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'load' });
  await page.waitForFunction('!!window.__game && !!window.__ui', null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(512, 384);                       // getready -> play
  // freeze the loop on the frame the death happens, so SHAKE_DURATION decay
  // cannot mask a shake that was wrongly triggered
  await page.waitForFunction(() => {
    if (window.__game.state !== 'gameover') return false;
    window.__ui.frameLoop.stop();
    return true;
  }, null, { timeout: 20000, polling: 'raf' });
  out[reducedMotion] = await page.evaluate(() => ({
    mqMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    remaining: window.__ui.screenShake.remaining,
    offset: window.__ui.screenShake.advance(0),
  }));
  await context.close();
}
await browser.close();
server.close();

const pass =
  out['no-preference'].mqMatches === false && out['no-preference'].remaining > 0.3 &&
  (out['no-preference'].offset.x !== 0 || out['no-preference'].offset.y !== 0) &&
  out.reduce.mqMatches === true && out.reduce.remaining === 0 &&
  out.reduce.offset.x === 0 && out.reduce.offset.y === 0;
console.log(JSON.stringify(out, null, 2));
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(pass ? 0 : 1);
