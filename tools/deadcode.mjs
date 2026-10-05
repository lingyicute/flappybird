// Dead-code reachability report for the shipped bundle.
//   node tools/deadcode.mjs <bundle.js>
// Top level of the bundle is a flat list of declarations; everything runs once.
// A binding is LIVE when some top-level statement outside a declaration, or some
// declaration that is itself live, references it. The rest is unreachable code.
import { readFileSync } from 'node:fs';
import * as acorn from 'acorn';

const file = process.argv[2] ?? 'assets/index-Dm5mUOvC.js';
const src = readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'module', allowAwaitOutsideFunction: true, locations: true, ranges: true });

const walk = (node, fn, parent = null) => {
  if (!node || typeof node.type !== 'string') return;
  fn(node, parent);
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'range' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => walk(c, fn, node));
    else if (v && typeof v.type === 'string') walk(v, fn, node);
  }
};

// ---- top-level declarations and the bindings they introduce
const decls = [];               // {names, start, end, line, text}
const nameToDecl = new Map();
for (const st of ast.body) {
  const names = [];
  if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') names.push(st.id.name);
  else if (st.type === 'VariableDeclaration') for (const d of st.declarations) {
    if (d.id.type === 'Identifier') names.push(d.id.name);
    else walk(d.id, (n) => { if (n.type === 'Identifier') names.push(n.name); });   // destructuring
  }
  if (!names.length) continue;
  const rec = { names, start: st.start, end: st.end, line: st.loc.start.line, declNode: st };
  decls.push(rec);
  for (const n of names) if (!nameToDecl.has(n)) nameToDecl.set(n, rec);
}

// ---- references (identifiers that read a binding)
const refs = [];                // {name, start}
const isDeclId = (node, parent) => {
  if (!parent) return false;
  if ((parent.type === 'FunctionDeclaration' || parent.type === 'ClassDeclaration' || parent.type === 'FunctionExpression') && parent.id === node) return true;
  if (parent.type === 'VariableDeclarator' && parent.id === node) return true;
  if (parent.type === 'Property' && parent.key === node && !parent.computed && !parent.shorthand) return true;
  if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) return true;
  if (parent.type === 'MethodDefinition' && parent.key === node && !parent.computed) return true;
  if (parent.type === 'PropertyDefinition' && parent.key === node && !parent.computed) return true;
  if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') return true;
  if (parent.type === 'ExportSpecifier' || parent.type === 'ImportSpecifier') return true;
  return false;
};
walk(ast, (node, parent) => {
  if (node.type === 'Identifier' && !isDeclId(node, parent)) refs.push({ name: node.name, start: node.start });
});

// ---- map each reference to its enclosing top-level declaration (or null = top level)
const sorted = [...decls].sort((a, b) => a.start - b.start);
const ownerOf = (offset) => {
  let lo = 0, hi = sorted.length - 1, found = null;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (sorted[mid].start <= offset) { found = sorted[mid]; lo = mid + 1; } else hi = mid - 1; }
  return found && offset < found.end ? found : null;
};

const refsBy = new Map();       // decl -> Set(name)
const roots = new Set();
for (const r of refs) {
  const owner = ownerOf(r.start);
  if (!owner) { roots.add(r.name); continue; }
  if (!refsBy.has(owner)) refsBy.set(owner, new Set());
  refsBy.get(owner).add(r.name);
}

// ---- transitive reachability
const live = new Set();
const queue = [...roots];
while (queue.length) {
  const n = queue.pop();
  if (live.has(n)) continue;
  live.add(n);
  const d = nameToDecl.get(n);
  if (d) for (const m of refsBy.get(d) ?? []) queue.push(m);
}

// ---- report
const dead = decls.filter((d) => !d.names.some((n) => live.has(n)));
const bytes = dead.reduce((a, d) => a + (d.end - d.start), 0);
console.log(`# ${file}`);
console.log(`top-level declarations: ${decls.length}  live: ${decls.length - dead.length}  unreachable: ${dead.length}`);
console.log(`unreachable bytes: ${bytes} of ${src.length} (${(100 * bytes / src.length).toFixed(1)}%)`);
console.log('');
for (const d of dead.sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
  const snippet = src.slice(d.start, Math.min(d.end, d.start + 100)).split('\n')[0];
  console.log(`${String(d.end - d.start).padStart(7)}  L${String(d.line).padStart(5)}  ${d.names.join(',')}  :: ${snippet.slice(0, 100)}`);
}
