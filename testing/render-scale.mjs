// The dynamic render scale must not flip the canvas size back and forth on a
// device that cannot hold the higher scale: two bad windows lower the quality,
// two calm ones restore it, and a drop right after a recovery doubles the number
// of calm windows the next recovery needs.
//   node render-scale.mjs <siteDir>
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
  const trace = await page.evaluate(() => {
    const scale = new window.__ui.renderScale.constructor();
    // feed frames until the measuring window closes; report whether it stepped
    const windowOf = (bad) => {
      let changed = false;
      let i = 0;
      do {
        const dt = bad && i % 5 === 4 ? 0.05 : 1 / 60;
        changed = scale.record(dt) || changed;
        i += 1;
      } while (scale.windowFrames > 0);
      return changed;
    };
    const out = [];
    for (const bad of [true, true, false, false, true, true, false, false, false, false, false]) {
      out.push([bad ? 'bad' : 'good', windowOf(bad), scale.stepIndex]);
    }
    return out;
  });
  assert.deepEqual(trace, [
    ['bad', false, 0],
    ['bad', true, 1], // two bad windows: step down
    ['good', false, 1],
    ['good', true, 0], // two calm windows: recover
    ['bad', false, 0],
    ['bad', true, 1], // dropped right after recovering: the next recovery waits longer
    ['good', false, 1],
    ['good', false, 1], // two calm windows are no longer enough
    ['good', false, 1],
    ['good', true, 0], // four calm windows recover
    ['good', false, 0],
  ]);
  console.log('RESULT: PASS');
} catch (error) {
  console.error(error);
  console.log('RESULT: FAIL');
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
