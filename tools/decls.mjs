// dump top-level declaration ranges of a bundle as JSON (shared by the analysis tools)
import { readFileSync } from 'node:fs';
import * as acorn from 'acorn';
const src = readFileSync(process.argv[2], 'utf8');
const ast = acorn.parse(src, { ecmaVersion:2022, sourceType:'module', allowAwaitOutsideFunction:true, locations:true });
const out = [];
for (const st of ast.body) {
  const names = [];
  if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') names.push(st.id.name);
  else if (st.type === 'VariableDeclaration') for (const d of st.declarations) {
    const ids = [];
    const walk = (n) => { if (!n || typeof n.type !== 'string') return; if (n.type === 'Identifier') ids.push(n.name);
      for (const k of Object.keys(n)) { if (['loc','start','end'].includes(k)) continue; const v = n[k];
        if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); } };
    walk(d.id); names.push(...ids);
  }
  if (names.length) out.push({ names, start: st.start, end: st.end, line: st.loc.start.line });
}
console.log(JSON.stringify(out));
