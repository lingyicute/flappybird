// Input / physics guard rails: the bird can never leave the playfield, a held key
// does not machine-gun flaps, a paused game ignores input, and a Royale revive
// clears the placement of the run that just ended.
//   node guardrails.mjs <siteDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const PORT = 8291;
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f, process.env.ENTRY || 'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const origin = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
const external = new Set(), errors = [];
const open = async (query = '', freezeLoop = false) => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.add(r.url()); });
  page.on('pageerror', (e) => errors.push(`pageerror(${query || 'solo'}): ` + e.message));
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push(`console(${query || 'solo'}): ` + t); });
  // freezeLoop stops requestAnimationFrame, so the world only moves when the test
  // calls game.step(): every assertion below is then independent of frame timing
  if (freezeLoop) await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
  });
  await page.goto(`${origin}/${query}`, { waitUntil: 'load' });
  await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  return page;
};
const key = (page, code, repeat) => page.evaluate(([c, r]) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { code: c, key: ' ', repeat: r, bubbles: true, cancelable: true })), [code, repeat]);

const out = {};

// ----------------------------------------- 1. flying off the top + key repeat
{
  const page = await open('', true);
  out.sky = await page.evaluate(() => {
    const g = window.__game;
    g.flap();                                   // getready -> play
    let maxY = -Infinity, steps = 0;
    while (g.state === 'play' && steps < 120 * 20) {
      g.flap(); g.step(1 / 120); steps += 1;    // hold flap, every single step
      maxY = Math.max(maxY, g.birdY / 1048576);
    }
    return { state: g.state, cause: g.runDeathCause, maxY: +maxY.toFixed(3), steps };
  });
  // the bird may climb out of the frame (the frame is 2.56 units tall), and it is
  // still killed by the first top pipe up there: leaving the screen is not a way
  // to skip the pipes, and it must not be turned into a ceiling either
  out.skyOk = out.sky.state === 'gameover' && out.sky.cause === 'pipeTop'
    && out.sky.maxY > 1.5;

  // a held key auto-repeats: the repeat events must be ignored, a real press not
  await page.evaluate(() => { window.__game.restart(); window.__game.flap(); });
  await page.evaluate(() => { for (let i = 0; i < 20; i++) window.__game.step(1 / 120); });
  const read = () => page.evaluate(() => ({ vy: window.__game.birdVy, flaps: window.__game.flapTrace.length }));
  const before = await read();
  for (let i = 0; i < 10; i++) await key(page, 'Space', true);
  const afterRepeats = await read();
  await key(page, 'Space', false);
  const afterPress = await read();
  out.keyRepeat = { before, afterRepeats, afterPress };
  out.keyRepeatOk = afterRepeats.vy === before.vy && afterRepeats.flaps === before.flaps
    && afterPress.vy > afterRepeats.vy;
  await page.close();
}

// -------------------------------------------------------------- 2. the pause
{
  const page = await open();
  const y = () => page.evaluate(() => window.__game.birdY);
  const vy = () => page.evaluate(() => window.__game.birdVy);
  await page.mouse.click(512, 384);                     // start with the mouse
  await page.waitForTimeout(200);
  await page.keyboard.press('KeyP');                    // pause
  await page.waitForTimeout(200);
  const y0 = await y(), vy0 = await vy();
  await page.mouse.click(512, 384);                     // must not flap
  await key(page, 'Space', false);                      // ... nor must a key press
  await page.waitForTimeout(300);
  const y1 = await y(), vy1 = await vy();
  out.pausedInput = { y0, y1, vy0, vy1 };
  out.pausedInputOk = y0 === y1 && vy0 === vy1;
  // the pause label is white text in the lower-left corner of the frame
  out.pausedLabel = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const x0 = Math.round(c.width * 0.20), y0 = Math.round(c.height * 0.70);
    const w = Math.round(c.width * 0.25), h = Math.round(c.height * 0.12);
    const d = c.getContext('2d').getImageData(x0, y0, w, h).data;
    let white = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) white += 1;
    return white;
  });
  await page.screenshot({ path: 'testing/n1-paused.png' });
  // P auto-repeat must not resume the game, a real press must
  for (let i = 0; i < 3; i++) await key(page, 'KeyP', true);
  await page.waitForTimeout(300);
  out.pausedStillFrozen = (await y()) === y0;
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(400);
  out.resumed = (await y()) !== y0;
  out.pauseOk = out.pausedInputOk && out.pausedLabel > 60 && out.pausedStillFrozen && out.resumed;
  await page.close();
}

// ------------------------------------------------------- 3. Royale + revive
{
  const page = await open('?royale');
  await page.waitForFunction('!!window.__royale', null, { timeout: 20000 });
  await page.mouse.click(512, 384);
  const deadline = Date.now() + 30000;
  let state = 'play';
  while (Date.now() < deadline) {
    state = await page.evaluate(() => window.__game.state);
    if (state === 'gameover') break;
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => {
    window.__match = window.__royale.match;
    const bot = window.__royale.match.bots.find((b) => b.alive && b.pilot);
    window.__pilotBot = bot;
    bot.pilot.pendingFlapStep = 999999;
    bot.pilot.aimOrdinal = 42;
    return { state: window.__game.state, placement: window.__royale.placement,
      alive: window.__royale.aliveBots(), feed: window.__royale.match.feed.length };
  });
  await page.evaluate(() => window.__game.revive());
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => ({
    state: window.__game.state, revived: window.__game.wasRevived,
    placement: window.__royale.placement, sameMatch: window.__match === window.__royale.match,
    alive: window.__royale.aliveBots(), feed: window.__royale.match.feed.length,
    pilotPendingStep: window.__pilotBot?.pilot?.pendingFlapStep ?? null,
  }));
  out.royaleRevive = { before, after };
  // the race must continue: same field, same eliminated birds, no stale placement, reset pilot schedule
  out.royaleReviveOk = before.state === 'gameover' && before.placement !== null
    && after.state === 'play' && after.revived && after.placement === null
    && after.sameMatch && after.alive === before.alive && after.feed === before.feed
    && after.pilotPendingStep !== 999999;
  await page.close();
}

// ----------------------------------------- 5. high-altitude pipe + 0x0 resize
{
  const page = await open('', true);
  out.highPipe = await page.evaluate(() => {
    const g = window.__game;
    g.flap();
    g.birdY = Math.round(12 * 1048576);
    g.birdVy = 0;
    g.pipes = [{ x: 0, gapY: 0, halfGap: Math.round(0.235 * 1048576), passed: false }];
    g.step(1 / 120);
    window.__ui.camera.handleResize(0, 0, 1, 0);
    const resizeZero = Number.isFinite(window.__ui.camera.frameW)
      && window.__ui.camera.frameW > 0
      && Number.isFinite(window.__ui.camera.pixelsPerUnit)
      && window.__ui.camera.pixelsPerUnit > 0;
    window.__ui.camera.handleResize(1024, 768, 1, 0);
    return { state: g.state, cause: g.runDeathCause, resizeZero };
  });
  out.highPipeOk = out.highPipe.state === 'gameover'
    && out.highPipe.cause === 'pipeTop'
    && out.highPipe.resizeZero;
  await page.close();
}

// ----------------------------------------- 6. game-over button guard + KeyR
{
  const page = await open('', true);
  await page.evaluate(() => {
    const g = window.__game;
    g.flap();
    g.score = 3;
    g.bestScore = 3;
    g.birdY = Math.round(-0.95 * 1048576);
  });
  // Press down while still in 'play', crash + settle past button delay, then release over REVIVE
  await page.mouse.move(614, 540);
  await page.mouse.down();
  await page.evaluate(() => { for (let i = 0; i < 200; i++) window.__game.step(1 / 120); });
  await page.mouse.up();
  const afterHeldRelease = await page.evaluate(() => ({
    state: window.__game.state, revived: window.__game.wasRevived,
  }));
  // Press down outside buttons, drag onto REVIVE, release
  await page.mouse.move(80, 80);
  await page.mouse.down();
  await page.mouse.move(614, 540);
  await page.mouse.up();
  const afterDragRelease = await page.evaluate(() => ({
    state: window.__game.state, revived: window.__game.wasRevived,
  }));
  await key(page, 'KeyR', false);
  const afterKeyR = await page.evaluate(() => ({
    state: window.__game.state, revived: window.__game.wasRevived,
  }));
  out.gameOverInput = { afterHeldRelease, afterDragRelease, afterKeyR };
  out.gameOverInputOk = afterHeldRelease.state === 'gameover' && !afterHeldRelease.revived
    && afterDragRelease.state === 'gameover' && !afterDragRelease.revived
    && afterKeyR.state === 'play' && afterKeyR.revived;
  await page.close();
}

// ----------------------------------------- 7. subpath deployment
{
  const SUBPORT = PORT + 1;
  const subServer = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!u.startsWith('/subpath/')) { res.writeHead(404); res.end('nf'); return; }
    let f = path.join(dir, u.slice('/subpath/'.length));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, process.env.ENTRY || 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => subServer.listen(SUBPORT, '127.0.0.1', r));
  const sub404 = [];
  const subPage = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  subPage.on('response', (r) => { if (r.status() === 404 && !r.url().endsWith('/favicon.ico')) sub404.push(r.url()); });
  await subPage.goto(`http://127.0.0.1:${SUBPORT}/subpath/`, { waitUntil: 'load' });
  await subPage.waitForFunction('document.querySelector(".loading-overlay")?.dataset.loaded === "true"', null, { timeout: 20000 });
  const subReady = await subPage.evaluate(() => !!window.__game);
  await subPage.close();
  subServer.close();
  out.subpath = { subReady, sub404 };
  out.subpathOk = subReady && sub404.length === 0;
}

out.externalRequests = [...external];
out.errors = errors;
console.log(JSON.stringify(out, null, 2));

const pass = out.skyOk && out.keyRepeatOk && out.pauseOk && out.royaleReviveOk
  && out.highPipeOk && out.gameOverInputOk && out.subpathOk
  && external.size === 0 && errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await browser.close();
server.close();
