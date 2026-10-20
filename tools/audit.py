#!/usr/bin/env python3
"""Audit the shipped build for anything that could reach the network.
Only the files that actually ship are scanned (VCS data, the dev-only tools,
the test suite and the repository paperwork are skipped), and `fetch()` is only
reported when its argument is a remote URL - the game fetches its inline data:
URIs and its local files at start-up, which never touches the network.
Exits non-zero when anything is found, so `npm test` can gate on it."""
import os, re, sys

import os as _os
SITE = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
PATTERNS = [
    (r"https?://(?!www\.w3\.org|reactjs\.org|localhost)", "external URL"),
    (r"wss?://", "websocket URL"),
    # `fetch(r)` of a data: URI (single file) or of a local path (dev.html) is
    # fine; only a remote argument would leave the machine
    (r"""\bfetch\s*\(\s*["'`](?:https?:)?//""", "remote fetch"),
    (r"XMLHttpRequest", "XHR"),
    (r"new\s+WebSocket", "WebSocket"),
    (r"EventSource", "EventSource"),
    (r"sendBeacon", "beacon"),
    (r"serviceWorker", "service worker"),
    (r"import\s*\(", "dynamic import"),
    (r"navigator\.(share|clipboard)", "web share API"),
    (r"googletagmanager|posthog|vntsm|spacetimedb|flappybird\.io", "vendor reference"),
    (r"\bgtag\b|dataLayer", "analytics"),
]
hits = []
_SKIP = {'tools', 'testing', 'node_modules', '.git'}
# repository paperwork: never part of the shipped page
_SKIP_FILES = {'LICENSE', 'README.md', 'package.json', 'package-lock.json'}
for dirpath, _dirs, files in os.walk(SITE):
    _dirs[:] = [d for d in _dirs if d not in _SKIP]
    for f in files:
        if f in _SKIP_FILES:
            continue
        p = os.path.join(dirpath, f)
        if f.endswith((".webp", ".png", ".ico", ".mp3", ".woff2", ".md", ".txt")):
            continue
        txt = open(p, encoding="utf-8", errors="replace").read()
        for pat, label in PATTERNS:
            for m in re.finditer(pat, txt):
                line = txt.count("\n", 0, m.start()) + 1
                ctx = txt[max(0, m.start() - 45):m.start() + 45].replace("\n", " ")
                hits.append((os.path.relpath(p, SITE), line, label, ctx))
if hits:
    for h in hits:
        print("%-34s %6d  %-16s %s" % h)
else:
    print("no network-capable code found")
print(f"\n{len(hits)} finding(s)")
sys.exit(1 if hits else 0)
