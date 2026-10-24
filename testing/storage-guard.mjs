// Cached scores are untrusted input. Only non-negative safe integers have an
// exact, plain-decimal representation that the digit renderer can lay out;
// malformed or unsafe values must fall back to zero instead of feeding NaN
// coordinates to Canvas (String(1e21) contains "e" and "+").
//   node storage-guard.mjs <siteDir>
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
  const cases = [
    { stored: '999999999999999999999', expected: 0 },
    { stored: '12oops', expected: 0 },
    { stored: '-20', expected: 0 },
    { stored: '42', expected: 42 },
    { stored: String(Number.MAX_SAFE_INTEGER), expected: Number.MAX_SAFE_INTEGER },
  ];
  for (const testCase of cases) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript((stored) => {
      localStorage.setItem('flappy_bestScore', stored);
      window.__nonFiniteTransforms = 0;
      const translate = CanvasRenderingContext2D.prototype.translate;
      CanvasRenderingContext2D.prototype.translate = function (x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) window.__nonFiniteTransforms += 1;
        return translate.call(this, x, y);
      };
    }, testCase.stored);
    await page.goto(`http://127.0.0.1:${server.address().port}/${entry}`);
    await page.waitForFunction(
      () => document.querySelector('.loading-overlay')?.dataset.loaded === 'true',
      null,
      { timeout: 20000 },
    );
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__game.bestScore), testCase.expected, testCase.stored);
    assert.equal(await page.evaluate(() => window.__nonFiniteTransforms), 0, testCase.stored);
    assert.deepEqual(errors, [], testCase.stored);
    await page.close();
  }
  console.log('RESULT: PASS');
} catch (error) {
  console.error(error);
  console.log('RESULT: FAIL');
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
