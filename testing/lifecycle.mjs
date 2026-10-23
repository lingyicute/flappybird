// Deterministic lifecycle regression checks, for both release and dev entries.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://test').pathname;
  const file = path.join(dir, pathname === '/' ? (process.env.ENTRY || 'index.html') : pathname);
  fs.readFile(file, (err, data) => {
    res.writeHead(err ? 404 : 200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(err ? 'not found' : data);
  });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Control all frame callbacks, even when the host browser throttles a tab.
  await page.addInitScript(() => {
    let next = 0;
    window.testFrames = new Map();
    window.requestAnimationFrame = cb => { const id = ++next; testFrames.set(id, cb); return id; };
    window.cancelAnimationFrame = id => testFrames.delete(id);
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => !!window.__ui && document.querySelector('.loading-overlay')?.dataset.loaded === 'true', null, { polling: 50 });
  await page.mouse.click(400, 400, { button: 'right' });
  assert.equal(await page.evaluate(() => window.__game.state), 'getready', 'right click must not start a run');
  await page.mouse.click(400, 400, { button: 'middle' });
  assert.equal(await page.evaluate(() => window.__game.state), 'getready', 'middle click must not start a run');
  await page.mouse.click(400, 400);
  assert.equal(await page.evaluate(() => window.__game.state), 'play');

  await page.evaluate(() => {
    const ui = window.__ui;
    ui.timestep.accumulator = 0.003;
    window.savedAccumulator = ui.timestep.accumulator;
    window.savedStep = window.__game.playStep;
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await page.evaluate(() => testFrames.size), 0, 'hidden pages must cancel simulation frames');
  await page.evaluate(() => {
    const ui = window.__ui;
    ui.lastTime -= 60000;
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await page.evaluate(() => testFrames.size), 1);
  assert.equal(await page.evaluate(() => window.__ui.timestep.accumulator === savedAccumulator), true, 'resume must preserve interpolation');
  assert.equal(await page.evaluate(() => window.__game.playStep === savedStep), true);
  assert.equal(await page.evaluate(() => performance.now() - window.__ui.lastTime < 1000), true, 'resume must discard background wall time');

  // Explicit persisted events cover repeated restore cycles; a real bfcache
  // admission is browser/environment dependent and not assumed here.
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    assert.equal(await page.evaluate(() => testFrames.size), 0);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    assert.equal(await page.evaluate(() => testFrames.size), 1, 'bfcache restore must restart exactly one loop');
    const paused = await page.evaluate(() => window.__ui.paused);
    await page.keyboard.press('KeyP');
    assert.equal(await page.evaluate(() => window.__ui.paused), !paused, 'restored app must retain input listeners');
    await page.keyboard.press('KeyP');
  }
  await page.evaluate(() => {
    const [id, cb] = testFrames.entries().next().value;
    testFrames.delete(id);
    cb(window.__ui.lastTime + 20);
  });
  assert.equal(await page.evaluate(() => window.__game.playStep > savedStep), true, 'restored loop must advance physics');
  assert.equal(await page.evaluate(() => testFrames.size), 1);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
  assert.equal(await page.evaluate(() => testFrames.size), 0, 'non-cached page must dispose normally');
  const paused = await page.evaluate(() => window.__ui.paused);
  await page.keyboard.press('KeyP');
  assert.equal(await page.evaluate(() => window.__ui.paused), paused, 'final disposal must remove listeners');
  assert.deepEqual(errors, []);
  console.log('RESULT: PASS');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
