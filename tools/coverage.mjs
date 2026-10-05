// Runtime coverage of the shipped bundle: drives the game through every state
// the gates touch, then reports which top-level declarations never executed.
//   node tools/coverage.mjs <siteDir>
import http from 'node:http';
import fs, { writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const dir = path.resolve(process.argv[2] ?? '.');
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(dir,p); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f,'index.html'); if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;} res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
await new Promise((r)=>server.listen(0,'127.0.0.1',r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage','--mute-audio'] });
const page = await browser.newPage({ viewport:{width:1024,height:768} });
const spans = []; const fns = [];
const collect = async (p) => { const c = await p.coverage.stopJSCoverage(); for (const e of c) if (e.url.includes('index-Dm5mUOvC.js')) { spans.push(...e.functions.flatMap(f => f.ranges.map(r => [r.startOffset, r.endOffset, r.count]))); fns.push(...e.functions.map(f => [f.ranges[0].startOffset, f.ranges[0].endOffset, f.ranges[0].count, f.functionName||''])); } };

await page.coverage.startJSCoverage({ resetOnNavigation:false, reportAnonymousScripts:true });
await page.goto(origin, { waitUntil:'load' });
await page.waitForFunction('!!window.__game', null, { timeout:20000 });
await page.waitForTimeout(1500);
// sound toggle (top-right) both ways
await page.mouse.click(747, 60); await page.waitForTimeout(150); await page.mouse.click(747, 60); await page.waitForTimeout(150);
// a real run: flap, score, die on a pipe, revive, die again, restart
await page.mouse.click(512, 500); await page.waitForTimeout(200);
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => window.__game.state);
  if (s !== 'play') break;
  const y = await page.evaluate(() => window.__game.birdY);
  if (y < 0.4) await page.mouse.click(512, 500);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(2500);
await page.evaluate(() => { try { window.__game.revive(); } catch {} });
await page.waitForTimeout(1500);
await page.evaluate(() => { window.__game.birdY = -0.80; });            // ground death after revive
await page.waitForTimeout(2500);
await page.keyboard.press('KeyP'); await page.waitForTimeout(200); await page.keyboard.press('KeyP');
await page.mouse.click(512, 516); await page.waitForTimeout(800);      // PLAY
await page.waitForTimeout(600);
// resize across the guards
for (const vp of [{width:390,height:844},{width:1920,height:400},{width:768,height:1024},{width:1024,height:768}]) { await page.setViewportSize(vp); await page.waitForTimeout(400); }
await collect(page);
// royale mode (separate page, same bundle)
const p2 = await browser.newPage({ viewport:{width:1024,height:768} });
await p2.coverage.startJSCoverage({ resetOnNavigation:false, reportAnonymousScripts:true });
await p2.goto(`${origin}/?royale`, { waitUntil:'load' });
await p2.waitForFunction('!!window.__royale', null, { timeout:20000 });
await p2.waitForTimeout(1000);
const box2 = await (await p2.$('canvas')).boundingBox();
await p2.mouse.click(box2.x + box2.width/2, box2.y + box2.height/2);   // start the match
await p2.waitForTimeout(12000);
console.log('royale steps(alive):', await p2.evaluate(() => [window.__royale.matchSteps(), window.__royale.aliveBots()]));
await collect(p2);
await browser.close(); server.close();
writeFileSync('.cov.json', JSON.stringify(fns));

// ---- map to the bundle and report per-declaration coverage
const src = fs.readFileSync(path.join(dir,'assets/index-Dm5mUOvC.js'), 'utf8');

const ranges = spans.filter(([a,b,c]) => b > a).sort((x,y) => x[0]-y[0] || y[1]-x[1]);
// innermost range count at an offset: the containing range with the largest start
const countAt = (off) => {
  let best = null;
  for (const r of ranges) {
    if (r[0] > off) break;
    if (off < r[1]) { if (!best || r[0] > best[0] || (r[0] === best[0] && r[1] < best[1])) best = r; }
  }
  return best ? best[2] : 0;
};
const decls = JSON.parse(execSync(`node tools/decls.mjs ${path.join(dir,'assets/index-Dm5mUOvC.js')}`).toString());
const never = []; let deadBytes = 0; let partial = [];
for (const d of decls) {
  const inside = fns.filter(([a,b]) => a >= d.start && a < d.end);
  const called = inside.filter(([, , c]) => c > 0).length;
  d.fns = inside.length; d.called = called;
  if (inside.length && called === 0) { never.push(d); deadBytes += d.end - d.start; }
  else if (inside.length > 1 && called < inside.length) partial.push({ ...d, frac: called / inside.length });
}
console.log(`declarations: ${decls.length}   never called: ${never.length}   coverage functions: ${fns.length}`);
console.log(`unexecuted declaration bytes: ${deadBytes} of ${src.length} (${(100*deadBytes/src.length).toFixed(1)}%)`);
for (const d of never.sort((a,b)=>(b.end-b.start)-(a.end-a.start))) {
  console.log(`${String(d.end-d.start).padStart(7)}  L${String(d.line).padStart(5)}  fns=${d.fns}  ${d.names.join(',')}  :: ${src.slice(d.start, d.start+90).split('\n')[0]}`);
}
partial = partial.sort((a,b)=>a.frac-b.frac);
console.log(`\npartially called declarations (some functions never called): ${partial.length}`);
for (const d of partial.slice(0,18)) console.log(`  ${d.called}/${d.fns} fns  L${String(d.line).padStart(5)}  ${d.names.join(',')}`);
