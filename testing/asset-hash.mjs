// The hashed asset names are an immutable-cache contract: the 8-char token in
// `index-<token>.js|css` is the first 8 chars of the base64url SHA-256 of the
// file bytes. A content change that forgets to roll the name leaves stale
// immutable caches serving the old bundle to every returning dev.html visitor,
// and nothing else in the pipeline notices (the packer, the gates and the
// analysis tools all resolve the bundle by pattern). This gate is the notice.
//   node asset-hash.mjs <siteDir>
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.resolve(process.argv[2] ?? '.');
const names = readdirSync(path.join(dir, 'assets'));
const hashed = names.filter((f) => /^index-[\w-]{8}\.(js|css)$/.test(f));
const token = (buf) => crypto.createHash('sha256').update(buf).digest('base64url').slice(0, 8);

const problems = [];
// the tools that resolve the bundle with readdir().find() silently pick one
// file when two coexist; the contract is exactly one of each kind
for (const ext of ['js', 'css']) {
  const ofKind = hashed.filter((f) => f.endsWith(`.${ext}`));
  if (ofKind.length !== 1) problems.push(`expected exactly one assets/index-*.${ext}, found ${ofKind.length}`);
}
for (const f of hashed) {
  const claimed = f.match(/^index-([\w-]{8})\./)[1];
  const actual = token(readFileSync(path.join(dir, 'assets', f)));
  if (actual !== claimed) {
    problems.push(`assets/${f}: name token ${claimed} != content hash ${actual} - roll the file name`);
  }
}
// the atlas is deliberately not checked: its name is referenced from inside the
// bundle (ATLAS_URL), so it cannot roll the way js/css do; until that coupling
// is untangled its name is a plain file name, not a cache token.

console.log(JSON.stringify({ checked: hashed, problems }, null, 2));
console.log(problems.length ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(problems.length ? 1 : 0);
