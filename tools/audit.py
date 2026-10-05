#!/usr/bin/env python3
"""Audit the shipped build for anything that could reach the network.
Only the files that actually ship are scanned (tools/ and testing/ are skipped)."""
import os, re, sys

import os as _os
SITE = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
PATTERNS = [
    (r"https?://(?!www\.w3\.org|reactjs\.org|localhost)", "external URL"),
    (r"wss?://", "websocket URL"),
    (r"\bfetch\s*\(", "fetch call"),
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
_SKIP = {'tools', 'testing', 'node_modules'}
for dirpath, _dirs, files in os.walk(SITE):
    _dirs[:] = [d for d in _dirs if d not in _SKIP]
    for f in files:
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
