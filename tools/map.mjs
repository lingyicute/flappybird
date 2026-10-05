// architecture map: top-level declarations sorted by size with their call coverage
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const file = process.argv[2] ?? 'assets/index-Dm5mUOvC.js';
const src = readFileSync(file, 'utf8');
const decls = JSON.parse(execSync(`node tools/decls.mjs ${file}`).toString());
const cov = JSON.parse(readFileSync('.cov.json', 'utf8'));   // [start,end,count,name] from coverage.mjs
const inside = (a, b) => cov.filter(([s]) => s >= a && s < b);
console.log('   bytes   line  called/total  name');
for (const d of decls.sort((x, y) => (y.end - y.start) - (x.end - x.start)).slice(0, 45)) {
  const f = inside(d.start, d.end);
  const called = f.filter(([, , c]) => c > 0).length;
  console.log(`${String(d.end - d.start).padStart(8)}  ${String(d.line).padStart(5)}  ${String(called).padStart(4)}/${String(f.length).padEnd(4)}     ${d.names.join(',').slice(0, 42)}`);
}
