#!/usr/bin/env python3
"""Pack the build into one self-contained .html file.
Usage: python3 tools/pack_single_file.py [output_html_path]"""
import base64
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = ROOT
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
UNINLINED_REF_RE = re.compile(r"(?<!data:)(?:(?:\.\.?/)?|\b)(?:sprites|audio|assets|fonts)/")


def data_uri(path, mime):
    with open(os.path.join(SITE, path), "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def replace_once(text, old, new):
    assert text.count(old) == 1, f"expected exactly one {old!r}"
    return text.replace(old, new)


def find_asset(pattern):
    """Resolve a hashed asset name: the hash is a cache-busting token that
    rolls with the content, so the build must never spell it out."""
    matches = sorted(glob.glob(os.path.join(SITE, "assets", pattern)))
    assert len(matches) == 1, f"expected exactly one assets/{pattern}, found {len(matches)}"
    return matches[0]


atlas = data_uri("assets/atlas-D7zSkRSP.webp", "image/webp")
logo = data_uri("sprites/logo.png", "image/png")
font = data_uri("fonts/Jersey10-Regular.woff2", "font/woff2")
icon = data_uri("favicon-96x96.png", "image/png")

# ------------------------------------------------------------------- CSS ---
css_path = find_asset("index-*.css")
css_name = os.path.basename(css_path)
css = open(css_path, encoding="utf-8").read()
css = re.sub(
    r"src:\s*url\([^)]*Jersey10-Regular\.woff2\)[^;]*;",
    f'src: url({font}) format("woff2");',
    css,
    flags=re.S,
)
assert "Jersey10-Regular" not in css and ".woff2" not in css, "un-inlined font reference left in CSS"

# -------------------------------------------------------------------- JS ---
js_path = find_asset("index-*.js")
js_name = os.path.basename(js_path)
js = open(js_path, encoding="utf-8").read()

# The font is deliberately not in this map: the stylesheet declares
# @font-face Jersey10 and owns the one and only copy of the font file. The
# bundle asks for that face by name, so the font is inlined exactly once.
asset_map = {
    # sprites/logo.png is deliberately not in this map: the boot splash <img>
    # in the HTML carries the one and only copy, and the bundle reads it back
    # from the DOM. Inlining it here as well would duplicate the payload in
    # every single-file build.
    "assets/atlas-D7zSkRSP.webp": atlas,
    "sprites/sound-on.png": data_uri("sprites/sound-on.png", "image/png"),
    "sprites/sound-off.png": data_uri("sprites/sound-off.png", "image/png"),
    "sprites/message.png": data_uri("sprites/message.png", "image/png"),
    "sprites/bird-upflap.png": data_uri("sprites/bird-upflap.png", "image/png"),
    "sprites/bird-midflap.png": data_uri("sprites/bird-midflap.png", "image/png"),
    "sprites/bird-downflap.png": data_uri("sprites/bird-downflap.png", "image/png"),
    "audio/sfx_wing.mp3": data_uri("audio/sfx_wing.mp3", "audio/mpeg"),
    "audio/sfx_point.mp3": data_uri("audio/sfx_point.mp3", "audio/mpeg"),
    "audio/sfx_hit.mp3": data_uri("audio/sfx_hit.mp3", "audio/mpeg"),
    "audio/sfx_die.mp3": data_uri("audio/sfx_die.mp3", "audio/mpeg"),
    "audio/sfx_swooshing.mp3": data_uri("audio/sfx_swooshing.mp3", "audio/mpeg"),
}
for digit in range(10):
    asset_map[f"sprites/number-{digit}.png"] = data_uri(
        f"sprites/number-{digit}.png", "image/png"
    )

for rel_path, uri in asset_map.items():
    pattern = re.compile(r'"(?:\./|/)?' + re.escape(rel_path) + r'"')
    matches = len(pattern.findall(js))
    assert matches == 1, f"expected 1 reference to {rel_path}, found {matches}"
    js = pattern.sub(f'"{uri}"', js)

m = UNINLINED_REF_RE.search(js)
assert m is None, f"asset ref {m.group(0)!r} left in JS"
assert "Jersey10-Regular" not in js and ".woff2" not in js, "font reference left in JS"
assert "</script" not in js, "inline script would be terminated early"

# ------------------------------------------------------------------ HTML ---
html = open(os.path.join(SITE, "dev.html"), encoding="utf-8").read()
html = re.sub(r'    <link rel="icon"[^>]*/>\n', "", html)
html = re.sub(r'    <link rel="manifest"[^>]*/>\n', "", html)
html = re.sub(
    r'    <link\s+rel="preload"\s+href="[^"]*Jersey10-Regular\.woff2"[^>]*/>\n',
    "",
    html,
)
html = replace_once(html, "<style>", "<style>\n/* inlined by tools/pack_single_file.py */")
html = replace_once(html, "</style>", "</style>\n    <style>\n" + css + "\n    </style>")
# dev.html keeps the stylesheet ahead of the module script (a preceding
# stylesheet blocks module execution, so the @font-face is registered before
# the bundle asks document.fonts for Jersey10); strip both lines here.
html = re.sub(
    r'    <link rel="stylesheet" crossorigin href="[^"]*' + re.escape(css_name) + r'">\n'
    r'    <script type="module" crossorigin src="[^"]*' + re.escape(js_name) + r'"></script>\n',
    "",
    html,
)
html = re.sub(r'src="(?:\./|/)?sprites/logo\.png"', f'src="{logo}"', html)
html = replace_once(
    html, "</head>", "    <script type=\"module\">\n" + js + "\n    </script>\n  </head>"
)
html = replace_once(
    html,
    "</head>",
    f'    <link rel="icon" type="image/png" sizes="96x96" href="{icon}" />\n  </head>',
)
m = UNINLINED_REF_RE.search(html)
assert m is None, f"asset ref {m.group(0)!r} left in HTML"
assert "Jersey10-Regular" not in html and ".woff2" not in html, "font reference left in HTML"

open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("wrote", OUT, len(html), "bytes")
