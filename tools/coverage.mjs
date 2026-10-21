// Runtime coverage of the shipped bundle: drives the game through every state
// the gates touch, then reports which top-level declarations never executed.
//   node tools/coverage.mjs <siteDir>
import http from 'node:http';
import fs, { writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const dir = path.resolve(process.argv[2] ?? '.');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(dir, p);
  // Serve `dev.html` so V8 reports coverage against `assets/index-Dm5mUOvC.js`
  // rather than an anonymous inline script in `index.html`.
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'dev.html');
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const fns = [];
const collect = async (p) => {
  const c = await p.coverage.stopJSCoverage();
  for (const e of c) {
    if (e.url.includes('index-Dm5mUOvC.js')) {
      fns.push(...e.functions.map((f) => [
        f.ranges[0].startOffset, f.ranges[0].endOffset, f.ranges[0].count, f.functionName || '',
      ]));
    }
  }
};

await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: true });
await page.goto(origin, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1200);

// 10 quick taps on the speaker icon -> Easter egg modal + synthesized chime, then close
for (let i = 0; i < 10; i++) {
  await page.mouse.click(747, 60);
  await page.waitForTimeout(70);
}
await page.waitForTimeout(250);
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// A real run: flap, score, die on a pipe, revive, die on ground, pause/resume, restart
await page.mouse.click(512, 500);
for (let i = 0; i < 140; i++) {
  const s = await page.evaluate(() => ({
    state: window.__game.state, score: window.__game.score,
    birdY: window.__game.birdY, pipes: window.__game.pipes,
  }));
  if (s.state !== 'play' || s.score >= 2) break;
  const pipe = s.pipes.find((p) => p.x > -20000);
  const target = pipe ? pipe.gapY - pipe.halfGap * 0.3 : 50000;
  if (s.birdY < target - 30000) await page.mouse.click(512, 500);
  await page.waitForTimeout(35);
}
await page.waitForTimeout(2200);
await page.evaluate(() => { try { window.__game.revive(); } catch {} });
await page.waitForTimeout(800);
await page.evaluate(() => { window.__game.birdY = Math.round(-0.8 * 1048576); });
await page.waitForTimeout(2000);
await page.keyboard.press('KeyP');
await page.waitForTimeout(150);
await page.keyboard.press('KeyP');

// Resize across portrait and wide viewports while in gameover so both layouts run
for (const vp of [
  { width: 390, height: 844 },
  { width: 1920, height: 400 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  await page.setViewportSize(vp);
  await page.waitForTimeout(200);
}
await page.mouse.click(512, 540);
await page.waitForTimeout(500);
await collect(page);

// Royale mode: fly long enough for bots to dodge pipes and populate the feed
const p2 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
await p2.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: true });
await p2.goto(`${origin}/?royale`, { waitUntil: 'load' });
await p2.waitForFunction('!!window.__royale', null, { timeout: 20000 });
await p2.waitForTimeout(800);
await p2.mouse.click(512, 384);
for (let i = 0; i < 240; i++) {
  const s = await p2.evaluate(() => ({
    state: window.__game.state, score: window.__game.score,
    birdY: window.__game.birdY, pipes: window.__game.pipes,
  }));
  if (s.state !== 'play' || s.score >= 5) break;
  const pipe = s.pipes.find((p) => p.x > -20000);
  const target = pipe ? pipe.gapY - pipe.halfGap * 0.3 : 50000;
  if (s.birdY < target - 30000) await p2.mouse.click(512, 384);
  await p2.waitForTimeout(35);
}
await p2.waitForTimeout(1800);
console.log('royale steps(alive):', await p2.evaluate(() => [
  window.__royale.matchSteps(), window.__royale.aliveBots(),
]));
await collect(p2);
await browser.close();
server.close();
writeFileSync('.cov.json', JSON.stringify(fns));

// ---- map to the bundle and report per-declaration coverage
const bundlePath = path.join(dir, 'assets/index-Dm5mUOvC.js');
const src = fs.readFileSync(bundlePath, 'utf8');
const decls = JSON.parse(execSync(`node tools/decls.mjs ${bundlePath}`).toString());
const never = [];
let deadBytes = 0;
let partial = [];
for (const d of decls) {
  const inside = fns.filter(([a]) => a >= d.start && a < d.end);
  const called = inside.filter(([, , c]) => c > 0).length;
  d.fns = inside.length;
  d.called = called;
  if (inside.length && called === 0) {
    never.push(d);
    deadBytes += d.end - d.start;
  } else if (inside.length > 1 && called < inside.length) {
    partial.push({ ...d, frac: called / inside.length });
  }
}
console.log(`declarations: ${decls.length}   never called: ${never.length}   coverage functions: ${fns.length}`);
console.log(`unexecuted declaration bytes: ${deadBytes} of ${src.length} (${(100 * deadBytes / src.length).toFixed(1)}%)`);
for (const d of never.sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
  console.log(`${String(d.end - d.start).padStart(7)}  L${String(d.line).padStart(5)}  fns=${d.fns}  ${d.names.join(',')}  :: ${src.slice(d.start, d.start + 90).split('\n')[0]}`);
}
partial = partial.sort((a, b) => a.frac - b.frac);
console.log(`\npartially called declarations (some functions never called): ${partial.length}`);
for (const d of partial.slice(0, 18)) {
  console.log(`  ${d.called}/${d.fns} fns  L${String(d.line).padStart(5)}  ${d.names.join(',')}`);
}
