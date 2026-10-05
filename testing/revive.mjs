// Verify the one-per-run revive button (colour, hit area, state machine).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8205;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
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

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const external = new Set(), errors = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });

await page.goto(`${origin}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1200);

const box = await (await page.$('canvas')).boundingBox();
const cx = box.x + box.width / 2;
const snap = () => page.evaluate(() => ({
  state: window.__game.state, score: window.__game.score,
  best: window.__game.bestScore, revived: window.__game.wasRevived,
}));

// classify the game-over buttons by sampling two columns just off-centre
// (the button labels are drawn in the middle and split the colour band)
const scanButtons = () => page.evaluate(() => {
  const c = document.querySelector('canvas');
  const rect = c.getBoundingClientRect();
  const ctx = c.getContext('2d');
  const sy = c.height / rect.height;
  const mid = Math.round(c.width * 0.5);
  const cols = [mid - 75, mid - 50, mid - 25, mid, mid + 25, mid + 50, mid + 75];
  const at = (x, y) => {
    const d = ctx.getImageData(x, y, 1, 1).data;
    const r = d[0], g = d[1], b = d[2];
    if (g > 110 && g > r + 40 && g > b + 40) return 'green';
    if (r > 140 && g > 120 && b < 120 && Math.abs(r - g) < 70) return 'yellow';
    if (Math.abs(r - g) < 14 && Math.abs(g - b) < 14 && r > 70 && r < 190) return 'grey';
    return 'other';
  };
  const rows = [];
  for (let y = Math.round(c.height * 0.3); y < c.height; y += 2) {
    const seen = new Set();
    for (const x of cols) seen.add(at(x, y));
    let k = 'other';
    if (seen.has('green')) k = 'green';
    else if (seen.has('yellow')) k = 'yellow';
    else if (seen.has('grey')) k = 'grey';
    rows.push([y, k]);
  }
  const bands = [];
  let cur = null;
  for (const [y, k] of rows) {
    if (!cur || cur.kind !== k) { cur = { kind: k, y0: y, y1: y }; if (k !== 'other') bands.push(cur); }
    else cur.y1 = y;
  }
  // merge same-kind bands separated by a small gap (label text splits them)
  const merged = [];
  for (const bd of bands) {
    const last = merged[merged.length - 1];
    if (last && last.kind === bd.kind && bd.y0 - last.y1 <= 45) last.y1 = bd.y1;
    else merged.push({ ...bd });
  }
  return merged
    .filter((bd) => bd.y1 - bd.y0 >= 10)
    .map((bd) => ({ kind: bd.kind, y0: bd.y0, y1: bd.y1,
      cssY: rect.top + (bd.y0 + bd.y1) / 2 / sy }));
});

// pick a button band: the big panel buttons sit at the bottom of the canvas.
// green = PLAY is the topmost of them; yellow/grey REVIVE sits right below it.
const pickGreen = (bands) => bands.filter((b) => b.kind === 'green').sort((a, b) => a.y0 - b.y0)[0];
const pickBelow = (bands, kinds, above) => bands
  .filter((b) => kinds.includes(b.kind) && (!above || b.y0 >= above.y0))
  .sort((a, b) => b.y0 - a.y0)[0];

// ---- 1. play a little, then stop flapping and die -----------------------
const dieOnce = async () => {
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) {
    const s = await page.evaluate(() => ({
      state: window.__game.state, score: window.__game.score, birdY: window.__game.birdY,
      pipes: window.__game.pipes.map((p) => ({ x: p.x, gapY: p.gapY, halfGap: p.halfGap })),
    }));
    if (s.state === 'gameover') break;
    if (s.state === 'getready') { await page.mouse.click(cx, box.y + box.height * 0.5); await page.waitForTimeout(120); continue; }
    if (s.score >= 2) break;                         // scored enough, stop flapping
    const pipe = s.pipes.find((p) => p.x > -0.02);
    const target = pipe ? pipe.gapY - (pipe.halfGap ? pipe.halfGap * 0.3 : 0) : 0.05;
    if (s.birdY < target - 0.03) await page.mouse.click(cx, box.y + box.height * 0.5);
    await page.waitForTimeout(35);
  }
  // let it fall to the ground
  const t1 = Date.now();
  let s = await snap();
  while (s.state !== 'gameover' && Date.now() - t1 < 15000) { await page.waitForTimeout(200); s = await snap(); }
  await page.waitForTimeout(1800);                   // buttons become active after 1.2 s
  return s;
};

const out = {};
out.firstDeath = await dieOnce();
out.bandsBeforeRevive = await scanButtons();
await page.screenshot({ path: 'testing/r1-revive-available.png' });

const greenBefore = pickGreen(out.bandsBeforeRevive);
const yellow = pickBelow(out.bandsBeforeRevive, ['yellow'], greenBefore);
out.foundYellow = !!yellow;
if (yellow) {
  const scoreAtDeath = out.firstDeath.score;
  await page.mouse.click(cx, yellow.cssY);
  await page.waitForTimeout(500);
  out.afterReviveClick = await snap();
  out.scoreKept = out.afterReviveClick.score === scoreAtDeath;
  await page.screenshot({ path: 'testing/r2-revived-playing.png' });
}

// ---- 2. die again: the button must be grey and inert --------------------
out.secondDeath = await dieOnce();
out.bandsAfterRevive = await scanButtons();
await page.screenshot({ path: 'testing/r3-already-revived.png' });
const grey = pickBelow(out.bandsAfterRevive, ['grey'], pickGreen(out.bandsAfterRevive));
out.foundGrey = !!grey;
out.greyPick = grey ?? null;
out.yellowBeforeY = yellow ? Math.round(yellow.cssY) : null;
out.greyY = grey ? Math.round(grey.cssY) : null;
out.yellowAfterUse = !!pickBelow(out.bandsAfterRevive, ['yellow'], pickGreen(out.bandsAfterRevive));
if (grey) {
  await page.mouse.click(cx, grey.cssY);
  await page.waitForTimeout(600);
  out.afterDeadReviveClick = await snap();           // must stay "gameover"
}
// the PLAY button still works
const green = pickGreen(out.bandsAfterRevive);
if (green) {
  await page.mouse.click(cx, green.cssY);
  await page.waitForTimeout(500);
  out.afterPlay = await snap();                      // must be "getready", revive reset
}

// ---- 3. a fresh run offers the revive again ----------------------------
out.thirdDeath = await dieOnce();
out.bandsNewRun = await scanButtons();
const yellowAgainBand = pickBelow(out.bandsNewRun, ['yellow'], pickGreen(out.bandsNewRun));
out.yellowAgain = !!yellowAgainBand;

console.log(JSON.stringify({ ...out, externalRequests: [...external], errors }, null, 2));
const pass =
  out.foundYellow && out.afterReviveClick.state === 'play' && out.afterReviveClick.revived === true &&
  out.scoreKept && out.secondDeath.revived === true && out.foundGrey && !out.yellowAfterUse &&
  out.afterDeadReviveClick.state === 'gameover' &&
  out.afterPlay.state === 'getready' && out.thirdDeath.revived === false &&
  out.yellowAgain && external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
