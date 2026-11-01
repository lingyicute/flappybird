// A frame timestamp older than the stored clock reading (it happens right after
// start/resume, when lastTime comes from performance.now() but rAF reports the
// frame-start time) must be treated as a zero-length frame: a negative dt would
// push the fixed-step accumulator below zero and make the render alpha negative,
// extrapolating the bird and the pipes backwards.
//   node frame-clock.mjs <siteDir>
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const entry = process.env.ENTRY || 'index.html';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://test').pathname;
  const file = path.join(dir, pathname === '/' ? entry : pathname);
  fs.readFile(file, (err, data) => {
    res.writeHead(err ? 404 : 200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
    });
    res.end(err ? 'not found' : data);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

let browser;
try {
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/${entry}`);
  await page.waitForFunction(
    () => document.querySelector('.loading-overlay')?.dataset.loaded === 'true',
    null,
    { timeout: 20000 },
  );
  // synchronous: no real animation frame can interleave with the evaluate
  const result = await page.evaluate(() => {
    const ui = window.__ui;
    ui.timestep.accumulator = 0;
    ui.screenShake.remaining = 0.2;
    ui.lastTime = 5000;
    ui.frame(4950);
    return { accumulator: ui.timestep.accumulator, alpha: ui.timestep.alpha, shake: ui.screenShake.remaining };
  });
  assert.ok(result.accumulator >= 0, `accumulator ${result.accumulator}`);
  assert.ok(result.alpha >= 0, `alpha ${result.alpha}`);
  assert.ok(result.shake <= 0.2, `shake grew to ${result.shake}`);
  console.log('RESULT: PASS');
} catch (error) {
  console.error(error);
  console.log('RESULT: FAIL');
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
