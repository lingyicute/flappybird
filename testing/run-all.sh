#!/usr/bin/env bash
# run every gate from the package root; ENTRY=dev.html tests the server build
set -u
cd "$(dirname "$0")/.."
fails=0
for t in verify2 crash flappy hud revive score-font score-limit credit-audio; do
  printf '%-14s ' "$t"
  out=$(timeout 400 node "testing/$t.mjs" . 2>&1)
  if grep -q 'RESULT: PASS' <<<"$out"; then echo PASS; else echo "FAIL"; fails=$((fails+1)); tail -3 <<<"$out"; fi
done
printf '%-14s ' verify3
out=$(timeout 500 node testing/verify3.mjs . 2>&1)
if grep -q '"royale"' <<<"$out"; then echo "PASS ($(grep -o '"steps": [0-9]*' <<<"$out" | head -1))"; else echo FAIL; fails=$((fails+1)); fi
printf '%-14s ' single
out=$(timeout 400 node testing/single.mjs index.html 2>&1)
if grep -q '"errs": \[\]' <<<"$out"; then echo PASS; else echo FAIL; fails=$((fails+1)); fi
printf '%-14s ' audit
out=$(python3 tools/audit.py . 2>&1)
echo "$(tail -1 <<<"$out")"
echo
if [ "$fails" -eq 0 ]; then echo "ALL GATES PASS (ENTRY=${ENTRY:-index.html})"; else echo "$fails GATE(S) FAILED"; fi
