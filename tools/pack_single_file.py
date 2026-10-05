#!/usr/bin/env python3
"""Pack the build into one self-contained .html file.
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = ROOT
OUT = os.path.join(ROOT, "index.html")

BS = chr(92)  # backslash


def data_uri(path, mime):
    with open(os.path.join(SITE, path), "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


atlas = data_uri("assets/atlas-D7zSkRSP.webp", "image/webp")
logo = data_uri("sprites/logo.png", "image/png")
font = data_uri("fonts/Jersey10-Regular.woff2", "font/woff2")
sound_on = data_uri("sprites/sound-on.png", "image/png")
sound_off = data_uri("sprites/sound-off.png", "image/png")
numbers = {d: data_uri(f"sprites/number-{d}.png", "image/png") for d in range(10)}
message = data_uri("sprites/message.png", "image/png")
bird_up = data_uri("sprites/bird-upflap.png", "image/png")
bird_mid = data_uri("sprites/bird-midflap.png", "image/png")
bird_down = data_uri("sprites/bird-downflap.png", "image/png")

# ------------------------------------------------------------------- CSS ---
css = open(os.path.join(SITE, "assets/index-CsU9WTOK.css")).read()
css = re.sub(
    r'src:.*?url[(]/fonts/Jersey10-Regular[.]woff2[)].*?url[(]/fonts/Jersey10-Regular[.]ttf[)][^;]*;',
    f'src: url({font}) format("woff2");',
    css,
    flags=re.S,
)
assert "/fonts/" not in css, "un-inlined font reference left in CSS"

# -------------------------------------------------------------------- JS ---
js = open(os.path.join(SITE, "assets/index-Dm5mUOvC.js")).read()
repl = [
    ('Nf = "/assets/atlas-D7zSkRSP.webp"', f'Nf = "{atlas}"'),
    ('ci("/sprites/sound-on.png", 14', f'ci("{sound_on}", 14'),
    ('ci("/sprites/sound-off.png", 14', f'ci("{sound_off}", 14'),
]
repl += [
    (f'ci("/sprites/number-{d}.png", {24 if d != 1 else 16}',
     f'ci("{numbers[d]}", {24 if d != 1 else 16}') for d in range(10)
]
repl += [
    ('ci("/sprites/message.png", 92', f'ci("{message}", 92'),
    ('ci("/sprites/bird-upflap.png", 17', f'ci("{bird_up}", 17'),
    ('ci("/sprites/bird-midflap.png", 17', f'ci("{bird_mid}", 17'),
    ('ci("/sprites/bird-downflap.png", 17', f'ci("{bird_down}", 17'),
    ('src: "/sprites/logo.png"', f'src: "{logo}"'),
    ('url(/fonts/Jersey10-Regular.woff2)', f'url({font})'),
]
for old, new in repl:
    js = js.replace(old, new)
# the sound effects are inlined as data: URIs (they are fetched with fetch() and
# decoded with decodeAudioData at run time, so a data URI works unchanged)
sfx = {
    "sfx_wing.mp3": data_uri("audio/sfx_wing.mp3", "audio/mpeg"),
    "sfx_point.mp3": data_uri("audio/sfx_point.mp3", "audio/mpeg"),
    "sfx_hit.mp3": data_uri("audio/sfx_hit.mp3", "audio/mpeg"),
    "sfx_die.mp3": data_uri("audio/sfx_die.mp3", "audio/mpeg"),
    "sfx_swooshing.mp3": data_uri("audio/sfx_swooshing.mp3", "audio/mpeg"),
}
inlined = 0
for name, uri in sfx.items():
    needle = '"/audio/%s"' % name
    assert js.count(needle) == 1, f"expected exactly one {needle} in the bundle"
    js = js.replace(needle, '"%s"' % uri)
    inlined += 1
assert inlined == 5, f"expected 5 audio entries, inlined {inlined}"
# the bundle keeps an innerHTML string that would close an inline <script>
js = js.replace('"<script></script>"', '"<script><' + BS + "/script>\"")
assert "/audio/" not in js and "/sprites/" not in js and "/assets/" not in js, (
    "asset refs left in JS"
)
assert "</script" not in js, "inline script would be terminated early"

# ------------------------------------------------------------------ HTML ---
html = open(os.path.join(SITE, "dev.html")).read()
html = re.sub(r'    <link rel="icon"[^>]*/>\n', "", html)
html = re.sub(r'    <link rel="manifest"[^>]*/>\n', "", html)
# the tab icon is inlined too, so the single file keeps the bird favicon
icon = data_uri("favicon-96x96.png", "image/png")
html = re.sub(
    r"    <link\n      rel=\"preload\"\n      href=\"/fonts/Jersey10-Regular\.woff2\"\n      as=\"font\"\n      type=\"font/woff2\"\n      crossorigin\n    />\n",
    "",
    html,
)
html = html.replace("<style>", "<style>\n/* inlined by tools/pack_single_file.py */", 1)
html = html.replace("</style>", "</style>\n    <style>\n" + css + "\n    </style>", 1)
html = html.replace(
    '    <script type="module" crossorigin src="/assets/index-Dm5mUOvC.js"></script>\n'
    '    <link rel="stylesheet" crossorigin href="/assets/index-CsU9WTOK.css">\n',
    "",
)
html = html.replace('src="/sprites/logo.png"', f'src="{logo}"')
html = html.replace(
    "</head>", '    <script type="module">\n' + js + "\n    </script>\n  </head>"
)
html = html.replace(
    "</head>",
    '    <link rel="icon" type="image/png" sizes="96x96" href="%s" />\n  </head>' % icon,
    1,
)
assert "/sprites/" not in html and "/assets/" not in html and "/fonts/" not in html
open(OUT, "w").write(html)
print("wrote", OUT, len(html), "bytes")
