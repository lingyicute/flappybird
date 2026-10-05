// Layout guard check: while playing, the current-score digits may never sit
// higher than three quarters of the viewport height (measured from the bottom),
// i.e. the top of the glyphs stays at or below 25% of the viewport height —
// for any viewport size / aspect ratio.
//   node score-limit.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8271;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r)=>server.listen(PORT,'127.0.0.1',r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const external = new Set(), errors = [];

// the score is centred in the x band around the middle and (after the guard)
// lives between 22% and 42% of the viewport height; the sun sits above that
// band and the bird starts at ~50%, so a white/black ink scan there is the score
const measure = (page) => page.evaluate(() => {
  const c = document.querySelector('canvas');
  const rect = c.getBoundingClientRect();
  const sx = c.width / rect.width, sy = c.height / rect.height;
  const ctx = c.getContext('2d');
  const black = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return d[0] < 40 && d[1] < 40 && d[2] < 40; };
  // the app letterboxes the 16:9-ish game frame with #111111 bars: find the frame
  let fl = 0, fr = c.width - 1, ft = 0, fb = c.height - 1;
  const my = Math.round(c.height * 0.5);
  while (fl < c.width && black(fl, my)) fl++;
  while (fr > fl && black(fr, my)) fr--;
  const cx0 = Math.round((fl + fr) / 2);
  while (ft < c.height && black(cx0, ft)) ft++;
  while (fb > ft && black(cx0, fb)) fb--;
  const fw = fr - fl, fh = fb - ft;
  const x0 = Math.round(fl + fw * 0.35), x1 = Math.round(fl + fw * 0.65);
  // the guarded score line occupies [25%, 25% + glyph height] of the frame,
  // i.e. ~[0.25, 0.32] * fh: keep the scan band tight so that scenery (sun,
  // clouds) cannot leak into the ink bounding box
  const y0 = Math.round(ft + fh * 0.245), y1 = Math.round(ft + fh * 0.335);
  const w = x1 - x0, h = y1 - y0;
  const d = c.getContext('2d').getImageData(x0, y0, w, h).data;
  let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, white = 0, ink = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, r = d[o], g = d[o + 1], b = d[o + 2];
    const isW = r > 235 && g > 235 && b > 235, isB = r < 60 && g < 60 && b < 60;
    if (isW || isB) {
      ink++; if (isW) white++;
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
  if (maxx < 0) return null;
  const topCss = (rect.top + (y0 + miny)) / sy, botCss = (rect.top + (y0 + maxy)) / sy;
  const leftCss = (rect.left + (x0 + minx)) / sx, rightCss = (rect.left + (x0 + maxx)) / sx;
  return { vh: rect.height, vw: rect.width,
    topCss, botCss, leftCss, rightCss,
    widthCss: rightCss - leftCss, heightCss: botCss - topCss,
    topPct: +(topCss / rect.height).toFixed(4),
    whiteRatio: +(white / ink).toFixed(3) };
});

const sizes = [[1024, 768], [1440, 900], [800, 600], [390, 844], [1920, 400], [640, 1000]];
const out = { cases: [] };

for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
  page.on('pageerror', (e) => errors.push(`pageerror(${w}x${h}): ` + e.message));
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push(`console(${w}x${h}): ` + t); });

  await page.goto(`${origin}/`, { waitUntil: 'load' });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.mouse.click(w / 2, h / 2);                 // getready -> play
  await page.waitForTimeout(500);
  await page.keyboard.press('KeyP');                    // freeze the scene
  await page.waitForTimeout(400);

  const caseOut = { size: `${w}x${h}`, state: await page.evaluate(() => window.__game.state) };

  // one digit, then three digits (a longer number must keep the same top edge)
  await page.evaluate(() => { window.__game.score = 8; });
  await page.waitForTimeout(250);
  const one = await measure(page);
  await page.evaluate(() => { window.__game.score = 188; });
  await page.waitForTimeout(250);
  const three = await measure(page);
  caseOut.oneDigit = one;
  caseOut.threeDigits = three;
  caseOut.limitPct = 0.25;

  if (w === 1024) await page.screenshot({ path: 'testing/g1-score-limit-1024x768.png' });
  if (w === 390) await page.screenshot({ path: 'testing/g2-score-limit-390x844.png' });
  if (w === 1920) await page.screenshot({ path: 'testing/g3-score-limit-1920x400.png' });

  caseOut.ok =
    caseOut.state === 'play' && !!one && !!three &&
    one.topPct >= 0.25 - 0.004 && three.topPct >= 0.25 - 0.004 &&   // never above the 3/4 line
    one.topPct <= 0.30 && three.topPct <= 0.30 &&                   // the guard is actually active
    Math.abs(one.topCss - three.topCss) <= 4 &&                     // top edge independent of the number
    three.widthCss > one.widthCss * 2 &&                            // 3 glyphs wider than 1
    one.heightCss > h * 0.02 && one.heightCss < h * 0.14 &&         // digit-sized ink, not scenery
    one.whiteRatio > 0.4 && three.whiteRatio > 0.4;                 // white glyph + black outline
  out.cases.push(caseOut);
  await page.close();
}

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));
const pass = out.cases.every((c) => c.ok) && external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
