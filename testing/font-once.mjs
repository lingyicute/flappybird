// The pixel font must be inlined exactly once in the single-file build (the
// stylesheet declares it, the bundle must not pull it in a second time) and
// the canvas really has to draw with it.
//   node font-once.mjs <siteDir> [singleFileHtml]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve(process.argv[2] ?? '.');
const single = process.argv[3] ?? 'index.html';
const PORT = 8391;
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

const out = {};
// ------------------------------------------------------- 1. the release file --
const html = fs.readFileSync(path.resolve(dir, single), 'utf8');
out.fontPayloads = (html.match(/data:font\/woff2;base64,/g) || []).length;
// the bundle must not reference the font file any more: the stylesheet owns it
const bundle = fs.readFileSync(path.join(dir, 'assets/index-Dm5mUOvC.js'), 'utf8');
out.bundleFontRefs = (bundle.match(/\/fonts\//g) || []).length;

// ------------------------------------------------------------ 2. in the page --
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load|404/.test(t)) errors.push('console: ' + t); });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.waitForFunction('!!window.__game', null, { timeout: 20000 });
await page.waitForTimeout(1200);
out.font = await page.evaluate(() => {
  const c = document.createElement('canvas').getContext('2d');
  const width = (font) => { c.font = font; return +c.measureText('PLAY').width.toFixed(2); };
  return {
    loaded: document.fonts.check('100px Jersey10'),
    withFont: width('100px Jersey10, sans-serif'),
    withoutFont: width('100px sans-serif'),
    families: [...document.fonts].map((f) => f.family),
  };
});
await browser.close();
server.close();

console.log(JSON.stringify(out, null, 2));
// exactly one copy of the font in the release, none left in the bundle, the
// font is loaded and the canvas measures a different width with it than with
// the fallback (so the text really is drawn in the pixel font)
const pass =
  out.fontPayloads === 1 &&
  out.bundleFontRefs === 0 &&
  out.font.loaded === true &&
  out.font.withFont !== out.font.withoutFont &&
  out.font.families.filter((f) => f === 'Jersey10').length === 1 &&
  errors.length === 0;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
if (!pass) console.log('errors:', errors);
process.exit(pass ? 0 : 1);
