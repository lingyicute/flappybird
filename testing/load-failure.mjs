// A required asset failing must never fade the loading overlay out over an
// unplayable field. Before this gate the atlas fetch was swallowed inside
// loadAll(), so `loaded` flipped to true, the overlay vanished and the player
// got an empty sky with invisible pipes, ground and buttons - and, since input
// is gated on isLoaded(), not even a way to notice. The overlay must instead
// stay up, say what happened, and a tap must retry and recover.
// Only the dev entry can fail an asset fetch (the single-file build inlines
// every asset as a data URI), so this gate skips itself for index.html.
//   ENTRY=dev.html node load-failure.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

if ((process.env.ENTRY ?? 'index.html') !== 'dev.html') {
  console.log('RESULT: PASS (skipped: the single-file build inlines every asset)');
  process.exit(0);
}

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8249;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(dir, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'dev.html');
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });

const out = {};
await page.route('**/atlas-*.webp', (r) => r.fulfill({ status: 500, body: 'nope' }));
await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game && !!window.__ui', null, { timeout: 20000 });
await page.waitForTimeout(1200);

const overlayState = () => page.evaluate(() => {
  const o = document.querySelector('.loading-overlay');
  const cs = getComputedStyle(o);
  return {
    loaded: window.__ui.renderer.isLoaded(),
    dataLoaded: o.dataset.loaded,
    dataError: o.dataset.error,
    label: document.querySelector('.loading-overlay__label').textContent,
    visible: cs.visibility === 'visible' && Number(cs.opacity) > 0.9,
    spinnerStopped: getComputedStyle(document.querySelector('.loading-overlay__spinner')).animationName === 'none',
    atlasSprites: ['background', 'pipeUp', 'buttonGreen'].filter((k) => window.__ui.renderer.images.has(k)),
  };
});

out.failed = await overlayState();
await page.keyboard.press('Space');                 // input must stay dead
await page.waitForTimeout(300);
out.stateWhileFailed = await page.evaluate(() => window.__game.state);

await page.mouse.click(512, 384);                   // retry while still broken
await page.waitForTimeout(600);
out.retryWhileBroken = await overlayState();

await page.unroute('**/atlas-*.webp');              // the asset starts answering
await page.mouse.click(512, 384);                   // retry for real
await page.waitForFunction('window.__ui.renderer.isLoaded()', null, { timeout: 20000 });
await page.waitForTimeout(600);                     // let the fade-out finish
out.recovered = await overlayState();
await page.mouse.click(512, 384);                   // the game is playable again
await page.waitForTimeout(200);
out.stateAfterRecovery = await page.evaluate(() => window.__game.state);
await page.screenshot({ path: 'testing/lf-recovered.png' });

await browser.close();
server.close();

const pass =
  out.failed.loaded === false && out.failed.dataLoaded === 'false' && out.failed.dataError === 'true' &&
  /RETRY/.test(out.failed.label) && out.failed.visible && out.failed.spinnerStopped &&
  out.failed.atlasSprites.length === 0 &&
  out.stateWhileFailed === 'getready' &&
  out.retryWhileBroken.loaded === false && out.retryWhileBroken.dataError === 'true' &&
  out.recovered.loaded === true && out.recovered.dataLoaded === 'true' && out.recovered.dataError === 'false' &&
  !out.recovered.visible && out.recovered.atlasSprites.length === 3 &&
  out.stateAfterRecovery === 'play' &&
  errors.length === 0;
console.log(JSON.stringify({ ...out, errors }, null, 2));
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(pass ? 0 : 1);
