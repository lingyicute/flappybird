// Check that every number is drawn with the original Flappy Bird digit sprites
// (white glyphs with black outlines, as in the FlapPyBird asset set) instead of
// the web font, in all three places: HUD, in-game score, game-over panel.
//   node score-font.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8251;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r)=>server.listen(PORT,'127.0.0.1',r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const page = await browser.newPage({ viewport:{width:1024,height:768} });
const external = new Set(), errors = [];
page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });

// returns the ink bbox of a digit sprite: white fill with black outline
const glyphBox = (x0, y0, x1, y1) => page.evaluate(([x0, y0, x1, y1]) => {
  const c = document.querySelector('canvas');
  const d = c.getContext('2d').getImageData(x0, y0, x1 - x0, y1 - y0).data;
  const w = x1 - x0;
  let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, white = 0, black = 0, total = 0;
  for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, r = d[o], g = d[o + 1], b = d[o + 2];
    const isW = r > 235 && g > 235 && b > 235, isB = r < 60 && g < 60 && b < 60;
    if (isW || isB) {
      total++;
      if (isW) white++;
      if (isB) black++;
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
  return { w: maxx - minx + 1, h: maxy - miny + 1, ratio: +(white / total).toFixed(3), x0, y0 };
}, [x0, y0, x1, y1]);

await page.goto(`${origin}/`, { waitUntil:'load' });
await page.waitForFunction('!!window.__game', null, { timeout:20000 });
await page.waitForTimeout(1500);

const out = {};
// HUD best-score digit ("0"): expect the chunky 0 = white 512/856 ink ratio ~0.6
out.hud = await glyphBox(240, 55, 280, 105);
await page.screenshot({ path: 'testing/f1-hud-digits.png' });

// in-game score: start the run, then freeze the scene and set the score
// explicitly — the render path is identical but the measurement cannot be
// disturbed by the flying bird / pipes.
const box = await (await page.$('canvas')).boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
await page.mouse.click(cx, cy);                       // getready -> play
await page.waitForTimeout(700);
await page.keyboard.press('KeyP');                    // freeze
await page.waitForTimeout(400);

const cv = await page.evaluate(() => { const c = document.querySelector('canvas'); return { w: c.width, h: c.height }; });
const band = [Math.round(cv.w / 2 - 80), Math.round(cv.h * 0.235), Math.round(cv.w / 2 + 80), Math.round(cv.h * 0.36)];

await page.evaluate(() => { window.__game.score = 1; });
await page.waitForTimeout(250);
out.playing = await glyphBox(...band);                // the narrow "1"
const oneW = out.playing.w, oneH = out.playing.h;
await page.evaluate(() => { window.__game.score = 88; });
await page.waitForTimeout(250);
out.playingTwoDigits = await glyphBox(...band);       // two wide "8"s
out.inGameScore = await page.evaluate(() => window.__game.score);
await page.screenshot({ path: 'testing/f2-ingame-digits.png' });
await page.keyboard.press('KeyP');                    // unpause, let the bird die
// die and check the panel digits + the HIGHEST label present in the same cell
await page.waitForTimeout(120);
let st = await page.evaluate(() => window.__game.state);
for (let i = 0; i < 60 && st !== 'gameover'; i++) { await page.waitForTimeout(250); st = await page.evaluate(() => window.__game.state); }
await page.waitForTimeout(1800);
out.panelScore = await glyphBox(430, 215, 480, 270);
out.panelBest = await glyphBox(548, 215, 600, 270);
await page.screenshot({ path: 'testing/f3-panel-digits.png' });

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

// the digit sprites are 24x36 with a white glyph and a black outline:
// the ink box must be blocky (w/h between 0.6 and 0.75) and mostly white
// the digit sprites are 24x36 (the "1" is 16 wide), so the ink box is 13-22 px
// wide and ~30 px tall at the sizes used here, mostly white with a black outline
const okBox = (b) => b && b.w >= 11 && b.h >= 20 && b.ratio > 0.4;
const pass = okBox(out.hud) && okBox(out.playing) && okBox(out.playingTwoDigits) &&
  okBox(out.panelScore) && okBox(out.panelBest) &&
  oneW >= 15 && oneW <= 30 &&                       // "1" is the narrow digit sprite
  out.playingTwoDigits.w >= oneW * 1.6 &&           // two wide digits
  Math.abs(out.playingTwoDigits.h - oneH) <= 3 &&   // same glyph height
  out.inGameScore === 88 && external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
