// Audio must start loading as soon as the critical sprites are ready. A slow,
// non-critical resource can otherwise hold back window.load; if the player has
// already started, deferring again until they leave `play` makes the whole
// first run silent. The injected image holds only the load event, not the game.
//   node audio-startup.mjs <siteDir>
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const entry = process.env.ENTRY || 'index.html';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
};

let releaseSlowResource = () => {};
const slowResource = new Promise((resolve) => { releaseSlowResource = resolve; });
let slowRequests = 0;
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://test').pathname;
  if (pathname === '/__slow_resource') {
    slowRequests += 1;
    await slowResource;
    res.writeHead(200, { 'content-type': 'image/png' });
    res.end(fs.readFileSync(path.join(dir, 'favicon-96x96.png')));
    return;
  }
  const file = path.join(dir, pathname === '/' ? entry : pathname);
  fs.readFile(file, (err, data) => {
    if (!err && path.basename(file) === entry && path.extname(file) === '.html') {
      data = Buffer.from(data.toString('utf8').replace(
        '</body>',
        '<img src="/__slow_resource" width="1" height="1" style="position:fixed;opacity:0" alt="" />\n  </body>',
      ));
    }
    res.writeHead(err ? 404 : 200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
    });
    res.end(err ? 'not found' : data);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

let browser;
try {
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__startupAudio = { decoded: 0, started: 0 };
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    const decode = AudioContextCtor.prototype.decodeAudioData;
    AudioContextCtor.prototype.decodeAudioData = function (...args) {
      const result = decode.apply(this, args);
      result.then(() => { window.__startupAudio.decoded += 1; });
      return result;
    };
    const createBufferSource = AudioContextCtor.prototype.createBufferSource;
    AudioContextCtor.prototype.createBufferSource = function (...args) {
      const source = createBufferSource.apply(this, args);
      const start = source.start.bind(source);
      source.start = (...startArgs) => {
        window.__startupAudio.started += 1;
        return start(...startArgs);
      };
      return source;
    };
  });

  await page.goto(`http://127.0.0.1:${server.address().port}/${entry}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForFunction(
    () => document.querySelector('.loading-overlay')?.dataset.loaded === 'true',
    null,
    { timeout: 20000 },
  );
  assert.equal(await page.evaluate(() => document.readyState === 'complete'), false);

  await page.mouse.click(512, 384);
  assert.equal(await page.evaluate(() => window.__game.state), 'play');
  await page.keyboard.press('KeyP'); // keep the run alive while decoding finishes
  await page.waitForFunction(() => window.__startupAudio.decoded === 5, null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => window.__game.state), 'play');
  assert.equal(await page.evaluate(() => document.readyState === 'complete'), false);

  await page.keyboard.press('KeyP');
  await page.mouse.click(512, 384);
  await page.waitForFunction(() => window.__startupAudio.started > 0, null, { timeout: 2000 });
  assert.deepEqual(errors, []);
  assert.equal(slowRequests, 1);

  console.log('RESULT: PASS');
} catch (error) {
  console.error(error);
  console.log('RESULT: FAIL');
  process.exitCode = 1;
} finally {
  releaseSlowResource();
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
