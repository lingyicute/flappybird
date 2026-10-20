// The speaker-icon easter egg: ten quick taps open the "You found an Easter egg"
// card, it plays a synthesised triangle "ting", it leaves the sound switch exactly
// as the player had it, it swallows input while it is up, NOT NOW closes it and
// SWITCH reloads the page in the other mode.
//   node easter-egg.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8241;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
  '.png': 'image/png', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
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

// no --mute-audio: the chime is a real Web Audio graph, and the stub below counts
// the oscillators it starts
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const external = new Set(), errors = [];
const open = async (query = '', muted = null) => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  if (muted !== null) await page.addInitScript((m) => window.localStorage.setItem('flappy_muted', String(m)), muted);
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
  page.on('pageerror', (e) => errors.push(`pageerror(${query || 'solo'}): ` + e.message));
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push(`console(${query || 'solo'}): ` + t); });
  await page.goto(`${origin}/${query}`, { waitUntil: 'load' });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  return page;
};
const OSC = () => {
  window.__osc = [];
  const P = (window.AudioContext || window.webkitAudioContext).prototype, make = P.createOscillator;
  P.createOscillator = function () {
    const o = make.call(this), start = o.start;
    o.start = (...a) => (window.__osc.push({ f: +o.frequency.value.toFixed(1), type: o.type }), start.apply(o, a));
    return o;
  };
};
// the speaker hit box, in css pixels, straight from the camera
const icon = (page) => page.evaluate(() => {
  const c = window.__ui.camera, d = c.dpr;
  const wx = c.frameW / 2 - 0.14, wy = c.frameH / 2 - 0.2;
  return { x: (c.offsetX + c.framePxW / 2 + wx * c.pixelsPerUnit) / d,
           y: (c.offsetY + c.framePxH / 2 - wy * c.pixelsPerUnit) / d };
});
const tap = async (page, n, gap = 90) => {
  const p = await icon(page);
  for (let i = 0; i < n; i++) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(gap); }
};
// the card's two buttons: positions from the page, plus one colour check that the
// green one really is painted where the card says it is (a column a little off
// centre, clear of the button's label)
const cardButtons = (page) => page.evaluate(() => {
  const ui = window.__ui, c = ui.camera, d = c.dpr, l = ui.eggButtons();
  const css = (wy) => ({ x: (c.offsetX + c.framePxW / 2 + l.x * c.pixelsPerUnit) / d,
                         y: (c.offsetY + c.framePxH / 2 - wy * c.pixelsPerUnit) / d });
  const canvas = document.querySelector('canvas'), rect = canvas.getBoundingClientRect();
  const x = Math.round(canvas.width * 0.5 - 60 * d);
  const px = canvas.getContext('2d').getImageData(Math.max(0, x), 0, 1, canvas.height).data;
  let run = 0, best = 0;
  for (let y = 0; y < canvas.height; y++) {
    const g = px[y * 4 + 1] > 120 && px[y * 4 + 1] > px[y * 4] + 50 && px[y * 4 + 1] > px[y * 4 + 2] + 50;
    run = g ? run + 1 : 0; best = Math.max(best, run);
  }
  return { x: css(l.switchY).x, greenY: css(l.switchY).y, grayY: css(l.notNowY).y,
           greenH: best * rect.height / canvas.height };
});
const snap = (page) => page.evaluate(() => ({
  open: !!window.__ui.easterEgg, state: window.__game.state,
  flaps: window.__game.flapTrace.length, muted: String(window.localStorage.getItem('flappy_muted')),
  osc: (window.__osc ?? []).map((o) => o.f), royale: window.__ui.royale.active,
}));

const out = {};

// ------------------------------- 1. ten taps, sound off before and after ------
{
  const page = await open('', false);                  // starts with sound on
  await page.evaluate(OSC);
  await tap(page, 9);
  out.nineTaps = await snap(page);
  await tap(page, 1);
  await page.waitForTimeout(400);
  out.tenTaps = await snap(page);
  await page.screenshot({ path: 'testing/e1-easter-egg.png' });
  const b = await cardButtons(page);
  out.buttons = b;

  // the card swallows input: a tap on its empty bottom is not a flap and starts
  // no run (and is not taken for either button)
  await page.mouse.click(b.x, b.grayY + 40);
  await page.waitForTimeout(200);
  out.clickCard = await snap(page);
  await page.screenshot({ path: 'testing/e2-easter-egg-pop.png' });

  // NOT NOW closes it, and the sound switch is where the player left it (off)
  await page.mouse.click(b.x, b.grayY);
  await page.waitForTimeout(300);
  out.notNow = await snap(page);
  // ...and one ordinary tap still mutes, exactly as before
  await tap(page, 1, 120);
  out.singleTapAfter = await snap(page);
  await page.close();
}

// --------------------- 2. sound already off: ten taps must not turn it on -----
{
  const page = await open('', true);
  await page.evaluate(OSC);
  await tap(page, 10);
  await page.waitForTimeout(300);
  out.tenTapsMuted = await snap(page);
  // a slow poke at the speaker never adds up: 6 taps 0.9 s apart (each one
  // further apart than the burst gap), and it is still not open
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await tap(page, 6, 900);
  await page.waitForTimeout(600);
  out.slowTaps = await snap(page);
  // nine more quick taps do not reach ten either
  await tap(page, 9);
  await page.waitForTimeout(200);
  out.nineMore = await snap(page);
  await page.close();
}

// ------------------------------ 3. the card leads to the other mode ----------
{
  const page = await open('', false);
  await tap(page, 10);
  await page.waitForTimeout(300);
  const b = await cardButtons(page);
  await page.mouse.click(b.x, b.greenY);
  await page.waitForURL((u) => u.search.includes('royale'), { timeout: 15000 });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  out.switchedToRoyale = { url: page.url(), royale: await page.evaluate(() => window.__ui.royale.active) };

  // in royale the egg offers the way back out
  await tap(page, 10);
  await page.waitForTimeout(300);
  const back = await cardButtons(page);
  await page.mouse.click(back.x, back.greenY);
  await page.waitForURL((u) => !u.search.includes('royale'), { timeout: 15000 });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  out.switchedBack = { url: page.url(), royale: await page.evaluate(() => window.__ui.royale.active) };
  await page.close();
}

// -------- 4. one deliberate tap, a pause, then the burst: still that setting ---
{
  const page = await open('', false);
  await tap(page, 1);                       // mute on purpose
  await page.waitForTimeout(800);           // a pause: the next taps are a new burst
  out.afterSingle = await snap(page);
  await tap(page, 10);
  await page.waitForTimeout(300);
  out.burstAfterSingle = await snap(page);
  const b = await cardButtons(page);
  await page.mouse.click(b.x, b.grayY);     // NOT NOW
  await page.waitForTimeout(300);
  out.afterBurstClose = await snap(page);
  await page.close();
}

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

const chime = out.tenTaps.osc;
const pass =
  out.nineTaps.open === false && out.nineTaps.muted === 'true' &&      // 9 flips = muted
  out.tenTaps.open === true && out.tenTaps.muted === 'false' &&        // the tenth gives it back
  chime.length === 4 && Math.abs(chime[0] - 1480) < 1 && chime[3] > 12000 &&
  // a slow, ordinary poking at the speaker must never open it
  out.slowTaps.open === false && out.nineMore.open === false &&
  // the card really paints the green button where the layout puts it, and it is
  // a button-sized thing rather than a sliver
  out.buttons.greenY > 0 && out.buttons.grayY > out.buttons.greenY &&
  out.buttons.greenH > 20 &&
  // while it is up nothing behind it reacts: no flap, no new run
  out.clickCard.open === true && out.clickCard.state === 'getready' &&
  out.clickCard.flaps === out.tenTaps.flaps &&
  out.notNow.open === false && out.notNow.muted === 'false' &&
  out.singleTapAfter.muted === 'true' &&
  // sound already off: still off after the egg, and after closing it
  out.tenTapsMuted.open === true && out.tenTapsMuted.muted === 'true' &&
  // one deliberate tap, a pause, then a burst: the burst hands back that setting
  out.afterSingle.muted === 'true' &&
  out.burstAfterSingle.open === true && out.burstAfterSingle.muted === 'true' &&
  out.afterBurstClose.open === false && out.afterBurstClose.muted === 'true' &&
  out.switchedToRoyale.royale === true && out.switchedToRoyale.url.endsWith('/?royale') &&
  out.switchedBack.royale === false && out.switchedBack.url.endsWith('/') &&
  external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
