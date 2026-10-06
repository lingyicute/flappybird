<br>
<br>
<br>
<p align="center">
  <img src="./sprites/logo.png" alt="Flappy Bird logo" width="240" />
</p>
<h1 align="center">Flappy Bird - remake</h1>
<h3 align="center">One tap. One bird. Endless close calls.</h3>

<p align="center">A faithful, lightweight browser remake of the classic arcade game — self-contained, offline-ready, and ad-free.</p>
<p align="center">Made with ❤️ by <a href="https://github.com/lingyicute">lingyicute</a>.</p>
<br>
<br>
<p align="center">
  🇺🇸 English •
  <a href="https://github.com/lingyicute/flappybird">🌐 Source Code</a> •
  <a href="https://github.com/lingyicute/flappybird/issues">🐛 Report Bug</a>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-orange.svg" alt="License: AGPL-3.0"></a>
  <a href="./index.html"><img src="https://img.shields.io/badge/Single%20File-499%20KB-blue" alt="Self-contained HTML, approximately 499 KB"></a>
  <a href="https://github.com/lingyicute/flappybird"><img src="https://img.shields.io/badge/Runtime%20Setup-None-brightgreen" alt="No runtime setup"></a>
  <a href="https://github.com/lingyicute/flappybird"><img src="https://img.shields.io/badge/Network%20Requests-Zero-brightgreen" alt="Zero network requests"></a>
  <a href="https://github.com/lingyicute/flappybird"><img src="https://img.shields.io/github/stars/lingyicute/flappybird?style=flat&color=yellow" alt="GitHub Stars"></a>
</p>
<br>

## 📖 Overview

A tiny bird, a gap between pipes, and one very important tap. **Flappy Bird** brings the familiar one-button arcade challenge to your browser: flap through the pipes, build your score, and try to beat your personal best.

This remake is a **single, self-contained HTML file** with the game code, artwork, font, and sound effects built in. There is nothing to install, no account to create, and no network connection required to play the downloaded file.

<br>

## ✨ Features

- **🐤 The Classic, in One Tap**
  - Click, tap, or press a key to flap and steer the bird through the pipes.
  - Animated pixel-art bird, scrolling scenery, score display, and a classic-style medal screen.
  - A **one-time revive** is available after a crash; it keeps your score and can be used once per run.

- **🏁 Optional Offline Royale**
  - Add `?royale` to the URL to enter a **30-bird race**: you versus 29 simulated competitors.
  - Watch the remaining-bird count and elimination feed, then see your final placement.
  - All competitors are simulated locally — there are no online players or multiplayer servers.

- **📈 Personal Bests, Kept Locally**
  - Your highest score is saved in your browser, ready for your next run.
  - No account, leaderboard service, or upload is involved.

- **🔊 Sound When You Want It**
  - Familiar arcade-style sound effects for flaps, scoring, and collisions.
  - Toggle sound from the speaker icon on the start screen; your choice is remembered locally.

- **📱 Ready for Mouse, Touch, and Keyboard**
  - The responsive canvas scales to fit your screen, whether you are on desktop or mobile.
  - Keyboard controls are available alongside tap and click.

- **🔒 Offline, Private, and Ad-Free**
  - `index.html` bundles the code and runtime assets into one file, with **zero external network requests**.
  - Best score and sound preference stay in your browser's local storage.
  - No ads, analytics, or tracking services.

<br>

## 🎮 Controls

| Action | Control |
| --- | --- |
| Start / flap | Click or tap the game area, `Space`, or `↑` |
| Pause / resume | `P` |
| Restart after a crash | Click **Play**, press `Space`, or press `Enter` |
| Revive (once per run) | Click or tap **Revive** on the game-over screen |
| Toggle sound | Click or tap the speaker icon on the start screen |

<br>

## 🛠️ Why Flappy Bird? (Under the Hood)

### 1. A Complete Game in One HTML File

The release `index.html` has the markup, styles, JavaScript, sprites, font, and audio embedded. Open the file directly or host it as a static page — there is no runtime package install, asset CDN, or backend to configure.

### 2. A Familiar Feel, Carefully Recreated

The game uses a canvas renderer, animated bird sprites, scrolling pipes and scenery, arcade sound effects, score tracking, and a responsive letterboxed layout. The optional Royale mode adds a local field of simulated birds without changing the classic solo game.

### 3. Your Settings Stay on Your Device

The best score and mute preference are stored locally in the browser. Nothing is sent to a server, and the game remains playable if browser storage is unavailable (in that case, saved preferences last only for the current page session).

<br>

## 🚀 Play It Now

There is nothing to install to play the release — `index.html` is the game.

### Option 1 — Open the file

Download `index.html` and open it in a modern browser. The bundled game can run offline, directly from disk.

### Option 2 — Serve it locally

```bash
git clone https://github.com/lingyicute/flappybird.git
cd flappybird
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). To try Royale mode, visit [http://localhost:8000/?royale](http://localhost:8000/?royale).

### Option 3 — Publish it anywhere

Host the repository as a static site with GitHub Pages, Cloudflare Pages, Netlify, or any static web host. The root `index.html` is the self-contained release.

### Requirements

- **Browser:** a modern browser with Canvas and Web Audio support (Chrome, Edge, Firefox, Safari, or a mobile equivalent).
- **Network:** not required by the self-contained `index.html` once it is available locally.
- **Storage:** `localStorage` is used for the best score and sound preference; gameplay still works without it.
- **Permissions:** none.

<br>

## 🔨 Building and Testing

The repository includes two ways to run the game:

- **`index.html`** — the packed, self-contained release.
- **`dev.html`** — a development entry that loads the local files in `assets/`, `sprites/`, `audio/`, and `fonts/`.

To serve the development entry, start a static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000/dev.html](http://localhost:8000/dev.html).

### Regenerating the single-file release

The packer in `tools/pack_single_file.py` embeds the development build and its local assets into `index.html`:

```bash
python3 tools/pack_single_file.py
```

### Running the tests

The Playwright checks exercise the game and audit the single-file build. Install the development dependencies and Chromium once, then run:

```bash
npm install
npx playwright install chromium
npm test
```

To run the checks against the `dev.html` entry instead:

```bash
npm run test:dev
```

Testing requires Node.js, Python 3, Bash, and Playwright's Chromium browser. These are **development/test tools only**; they are not needed to play `index.html`.

<br>

## 🤗 Contributing

Contributions are welcome!

- **Bug Reports & Feature Requests:** open an issue in the [GitHub Issue Tracker](https://github.com/lingyicute/flappybird/issues).
- **Pull Requests:** please preserve the single-file, zero-network release and keep the classic game quick to launch.
- **Before submitting:** run `npm test` and, when relevant, `npm run test:dev`.

<br>

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [LICENSE](./LICENSE) for the full text.
