// Sprite metrics: the renderer stretches an atlas frame (or a PNG) onto the
// world box the sprite declares, so a declared size that does not keep the
// shape of its artwork silently distorts it - the pipe lip used to come out a
// quarter too tall because its frame is 206x1024 while the sprite asked for
// 26x160.
//   node sprite-aspect.mjs <siteDir>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';

const dir = path.resolve(process.argv[2] ?? '.');
const js = readFileSync(path.join(dir, 'assets/index-Dm5mUOvC.js'), 'utf8');
const ast = acorn.parse(js, { ecmaVersion: 2022, sourceType: 'module', allowAwaitOutsideFunction: true });

// pull the two literal tables out of the bundle and evaluate them: the sprite
// helpers are stubbed, so what comes back is the declared pixel size per entry
const decl = (name) => {
  for (const st of ast.body) {
    if (st.type !== 'VariableDeclaration') continue;
    const d = st.declarations.find((x) => x.id.type === 'Identifier' && x.id.name === name);
    if (d && d.init) return js.slice(st.start, st.end);
  }
  throw new Error(`${name} not found in the bundle`);
};
const SPRITES = new Function(
  'atlasSprite',
  'imageSprite',
  `${decl('SPRITES')}\nreturn SPRITES;`,
)(
  (frame, pxW, pxH) => ({ kind: 'atlas', ref: frame, pxW, pxH }),
  (src, pxW, pxH) => ({ kind: 'image', ref: src, pxW, pxH }),
);
const ATLAS_FRAMES = new Function(`${decl('ATLAS_FRAMES')}\nreturn ATLAS_FRAMES;`)();

// IHDR of a PNG: width and height are the two big-endian uint32s after the
// 8-byte signature, the 4-byte length and the 4-byte chunk type
const pngSize = (file) => {
  const b = readFileSync(path.join(dir, file));
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file} is not a PNG`);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

const TOLERANCE = 0.01; // every shipped frame is well inside this, bar rounding
const rows = [];
for (const [name, spec] of Object.entries(SPRITES)) {
  let art;
  try {
    art = spec.kind === 'atlas' ? ATLAS_FRAMES[spec.ref] : pngSize(spec.ref.replace(/^\.\//, ''));
  } catch (err) {
    rows.push({ name, error: String(err.message ?? err) });
    continue;
  }
  const scaleX = art.w / spec.pxW;
  const scaleY = art.h / spec.pxH;
  rows.push({
    name,
    from: spec.kind === 'atlas' ? `atlas ${spec.ref}` : spec.ref,
    declared: `${spec.pxW}x${spec.pxH}`,
    artwork: `${art.w}x${art.h}`,
    skew: +Math.abs(scaleX / scaleY - 1).toFixed(4),
  });
}

const bad = rows.filter((r) => r.error || r.skew > TOLERANCE);
console.log(JSON.stringify({ checked: rows.length, tolerance: TOLERANCE, bad, rows }, null, 2));
console.log(bad.length ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(bad.length ? 1 : 0);
