#!/usr/bin/env bash
# run every gate from the package root; ENTRY=dev.html tests the server build
set -u
cd "$(dirname "$0")/.."
fails=0
for t in verify2 crash flappy hud revive score-font score-limit credit-audio easter-egg guardrails death-sounds font-once; do
  printf '%-14s ' "$t"
  out=$(timeout 400 node "testing/$t.mjs" . 2>&1)
  if grep -q 'RESULT: PASS' <<<"$out"; then echo PASS; else echo "FAIL"; fails=$((fails+1)); tail -3 <<<"$out"; fi
done
printf '%-14s ' verify3
out=$(timeout 500 node testing/verify3.mjs . 2>&1)
if grep -q 'RESULT: PASS' <<<"$out"; then echo "PASS ($(grep -o '"steps": [0-9]*' <<<"$out" | head -1))"; else echo FAIL; fails=$((fails+1)); tail -3 <<<"$out"; fi
printf '%-14s ' single
out=$(timeout 400 node testing/single.mjs index.html 2>&1)
if grep -q 'RESULT: PASS' <<<"$out"; then echo PASS; else echo FAIL; fails=$((fails+1)); tail -3 <<<"$out"; fi
printf '%-14s ' audit
if out=$(python3 tools/audit.py . 2>&1); then echo PASS; else echo FAIL; fails=$((fails+1)); tail -5 <<<"$out"; fi
# the committed index.html must be exactly what the packer produces right now
printf '%-14s ' packed
tmp=$(mktemp -d)
mkdir -p "$tmp/tools"
cp -r assets audio fonts sprites "$tmp/"
cp dev.html favicon-96x96.png "$tmp/"
cp tools/pack_single_file.py "$tmp/tools/"
if python3 "$tmp/tools/pack_single_file.py" >/dev/null 2>&1 && cmp -s "$tmp/index.html" index.html; then
  echo PASS
else
  echo "FAIL"; fails=$((fails+1)); echo "  index.html does not match the packer output - run python3 tools/pack_single_file.py"
fi
rm -rf "$tmp"
echo
if [ "$fails" -eq 0 ]; then
  echo "ALL GATES PASS (ENTRY=${ENTRY:-index.html})"
else
  echo "$fails GATE(S) FAILED"
  exit 1
fi
