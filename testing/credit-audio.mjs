// (a) the credit line shows on the home screen only, (b) the single-file build
// can actually decode and play the inlined sound effects.
//   node credit-audio.mjs <siteDir> [singleFileHtml]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const single = process.argv[3] ?? 'index.html';
const PORT = 8381, PORT_SINGLE = 8382;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const serve = (root, port) => new Promise((r) => {
  const s = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(root,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
  s.listen(port, '127.0.0.1', () => r(s));
});
const srvDir = await serve(dir, PORT);
const srvSingle = await serve(path.dirname(single), PORT_SINGLE);
const nameSingle = path.basename(single);

const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage'] });  // no --mute-audio
const out = {};

// ---------------------------------------------------------------- credit line ---
const page = await browser.newPage({ viewport:{width:1024,height:768} });
const errors = [], external = new Set();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });
page.on('request', (r) => { if (!r.url().startsWith(`http://127.0.0.1:${PORT}`) && !r.url().startsWith('data:')) external.add(r.url()); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await page.waitForFunction('!!window.__game', null, { timeout:20000 });
await page.waitForTimeout(1500);

// the credit text is white with a black outline, centred, low on the frame
const creditInk = () => page.evaluate(() => {
  const c = document.querySelector('canvas');
  const y0 = Math.round(c.height * 0.93), h = c.height - y0;
  const d = c.getContext('2d').getImageData(0, y0, c.width, h).data;
  const w = c.width;
  // only the white glyph fill is unique to the credit line (the ground is dark as well)
  let minx=1e9,miny=1e9,maxx=-1,maxy=-1,white=0,black=0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y*w + x)*4, r=d[o], g=d[o+1], b=d[o+2];
    if (r>235 && g>235 && b>235) {
      white++;
      if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
    }
  }
  // black outline pixels that touch the white box (sanity: the text is outlined)
  if (white) for (let y = Math.max(0,miny-2); y <= Math.min(h-1,maxy+2); y++) for (let x = Math.max(0,minx-2); x <= Math.min(w-1,maxx+2); x++) {
    const o = (y*w + x)*4, r=d[o], g=d[o+1], b=d[o+2];
    if (r<40 && g<40 && b<40) black++;
  }
  return white ? { white, black, w: maxx-minx+1, h: maxy-miny+1, cx: (minx+maxx)/2,
           topPct: (y0+miny)/c.height, botPct: (y0+maxy)/c.height } : null;
});
out.creditHome = await creditInk();
await page.screenshot({ path: 'testing/l1-credit-long.png' });

// credit must disappear once the run starts
await page.mouse.click(512, 384);
await page.waitForTimeout(600);
out.creditPlaying = await creditInk();
out.statePlaying = await page.evaluate(() => window.__game.state);

// and must come back on the home screen after a restart
let st = await page.evaluate(() => window.__game.state);
for (let i = 0; i < 60 && st !== 'gameover'; i++) { await page.waitForTimeout(250); st = await page.evaluate(() => window.__game.state); }
await page.waitForTimeout(1600);
for (const frac of [0.707, 0.7, 0.715, 0.695]) {
  await page.mouse.click(512, 768 * frac);
  await page.waitForTimeout(180);
  if ((await page.evaluate(() => window.__game.state)) === 'getready') break;
}
out.stateAfterRestart = await page.evaluate(() => window.__game.state);
out.creditHomeAgain = await creditInk();
await page.screenshot({ path: 'testing/l2-credit-again.png' });
out.externalRequests = [...external];
out.errors = errors;
await page.close();

// ---------------------------------------------------------------- single file audio ---
const sp = await browser.newPage({ viewport:{width:1024,height:768} });
const sErrors = [], sExternal = new Set();
sp.on('pageerror', (e) => sErrors.push('pageerror: ' + e.message));
sp.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) sErrors.push('console: ' + t); });
sp.on('request', (r) => { if (!r.url().startsWith(`http://127.0.0.1:${PORT_SINGLE}`) && !r.url().startsWith('data:')) sExternal.add(r.url()); });
await sp.addInitScript(() => {
  window.__audio = { decoded: [], started: [], errors: [] };
  const AC = window.AudioContext || window.webkitAudioContext;
  const origDecode = AC.prototype.decodeAudioData;
  AC.prototype.decodeAudioData = function (...args) {
    const p = origDecode.apply(this, args);
    p.then((buf) => window.__audio.decoded.push(buf.duration)).catch((e) => window.__audio.errors.push(String(e)));
    return p;
  };
  const origCreate = AC.prototype.createBufferSource;
  AC.prototype.createBufferSource = function () {
    const src = origCreate.call(this);
    const origStart = src.start.bind(src);
    src.start = (...a) => { window.__audio.started.push(1); return origStart(...a); };
    return src;
  };
});
await sp.goto(`http://127.0.0.1:${PORT_SINGLE}/${nameSingle}`, { waitUntil:'load' });
await sp.waitForFunction('!!window.__game', null, { timeout:20000 });
await sp.waitForTimeout(1500);

// click to start (this is the user gesture that unlocks audio) and flap a bit
await sp.mouse.click(512, 384);
await sp.waitForTimeout(900);
for (let i = 0; i < 4; i++) { await sp.mouse.click(512, 384); await sp.waitForTimeout(300); }
out.singleAudio = await sp.evaluate(() => ({ decoded: window.__audio.decoded.length, durations: window.__audio.decoded.map(d => +d.toFixed(2)), started: window.__audio.started.length, audioErrors: window.__audio.errors, muted: window.__game.snapshot ? false : false }));
out.singleState = await sp.evaluate(() => window.__game.state);
out.singleExternal = [...sExternal];
out.singleRequestedAudio = [...sExternal].concat([]).filter((u) => /audio|\.mp3/.test(u)).length;
out.singleErrors = sErrors;
await sp.screenshot({ path: 'testing/l3-single-audio.png' });
await sp.close();

console.log(JSON.stringify(out, null, 2));
await browser.close();
srvDir.close(); srvSingle.close();

const cr = out.creditHome, cp = out.creditPlaying, c2 = out.creditHomeAgain;
const visible = (i) => i && i.white > 150 && i.black > 100 && i.w > 120 && i.h > 8;
const hidden = (i) => !i || i.white < 40;
const pass =
  visible(cr) && Math.abs(cr.cx - 512) < 6 && cr.botPct > 0.92 && cr.botPct < 0.965 && cr.topPct > 0.915 &&
  hidden(cp) && out.statePlaying === 'play' &&
  visible(c2) && out.stateAfterRestart === 'getready' &&
  out.singleAudio.decoded >= 5 && out.singleAudio.audioErrors.length === 0 &&
  out.singleAudio.started >= 1 &&
  out.externalRequests.length === 0 && out.errors.length === 0 &&
  out.singleExternal.length === 0 && out.singleErrors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
