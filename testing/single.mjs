// Verify the single-file build inside a sandboxed cross-origin iframe
import http from 'node:http';
import fs from 'node:fs';
import { chromium } from 'playwright';

const FILE = 'index.html';
const A = 8191, B = 8192;
const inner = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(FILE));
});
const outer = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta charset="utf-8"><title>preview</title>
    <body style="margin:0"><iframe sandbox="allow-scripts" src="http://127.0.0.1:${B}/game.html"
      style="border:0;width:100vw;height:100vh"></iframe>`);
});
await new Promise((r) => inner.listen(B, '127.0.0.1', r));
await new Promise((r) => outer.listen(A, '127.0.0.1', r));

const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
const page = await b.newPage({ viewport: { width: 900, height: 700 } });
const errs = [], reqs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errs.push('console: ' + t); });
page.on('request', (r) => {
  const u = r.url();
  if (!u.startsWith('http://127.0.0.1:' + A) && !u.startsWith('http://127.0.0.1:' + B) && !u.startsWith('data:')) reqs.push(u);
});
await page.goto(`http://127.0.0.1:${A}/`, { waitUntil: 'load' });
await page.waitForTimeout(4500);

const frame = page.frames().find((f) => f !== page.mainFrame());
const info = await frame.evaluate(() => ({
  hasGame: !!window.__game,
  state: window.__game?.state ?? null,
  canvas: !!document.querySelector('canvas'),
  nav: [...document.querySelectorAll('.navbar__link')].map((a) => a.textContent),
}));
// fly a few flaps and check the score panel updates
for (let i = 0; i < 5; i++) { await frame.evaluate(() => window.__game.flap()); await page.waitForTimeout(250); }
await page.waitForTimeout(500);
info.afterFlaps = await frame.evaluate(() => ({ state: window.__game.state, score: window.__game.score }));
await page.screenshot({ path: 'testing/single-file.png' });
console.log(JSON.stringify({ info, errs, reqs }, null, 2));
await b.close(); inner.close(); outer.close();
