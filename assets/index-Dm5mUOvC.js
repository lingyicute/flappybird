// Storage shim: plain `localStorage` throws in sandboxed / opaque-origin
// documents (e.g. a `sandbox="allow-scripts"` iframe), so fall back to an
// in-memory map when persistent storage is unavailable.
const storage = (() => {
  try {
    const ls = window.localStorage;
    ls.getItem("__probe__");
    return ls;
  } catch {
    const mem = new Map();
    return {
      getItem: (key) => (mem.has(key) ? mem.get(key) : null),
      setItem: (key, value) => mem.set(key, String(value)),
      removeItem: (key) => mem.delete(key),
    };
  }
})();

// ------------------------------------------------------------ tiny store ---

function reportListenerError(err) {
  typeof reportError == "function" ? reportError(err) : console.error(err);
}

function createStore(initialValue, isEqual) {
  let current = initialValue;
  const listeners = new Set();
  return {
    publish(next) {
      if (!isEqual?.(current, next)) {
        current = next;
        for (const listener of listeners) {
          try {
            listener();
          } catch (err) {
            reportListenerError(err);
          }
        }
      }
    },
    getSnapshot() {
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function samePublishedState(a, b) {
  return a.state === b.state && a.score === b.score && a.bestScore === b.bestScore;
}

const gameStateStore = createStore(
  { state: "getready", score: 0, bestScore: 0 },
  samePublishedState,
);
const assetsLoadedStore = createStore(false, (a, b) => a === b);

function afterWindowLoad(task) {
  const defer = () => setTimeout(task, 0);
  if (document.readyState === "complete") defer();
  else window.addEventListener("load", defer, { once: true });
}

function runOutsidePlay(task) {
  if (gameStateStore.getSnapshot().state !== "play") {
    task();
    return;
  }
  const unsubscribe = gameStateStore.subscribe(() => {
    if (gameStateStore.getSnapshot().state !== "play") {
      unsubscribe();
      task();
    }
  });
}

function schedulePostLoad(task) {
  afterWindowLoad(() => runOutsidePlay(task));
}

// --------------------------------------------------- simulation constants ---

const SIM_CONFIG = {
  gravity: 5,
  flapVelocity: 1.55,
  flapVelocityV3: 1.4,
  fallCapV3: 1.5,
  fallCapV4: 2.2,
  lowestHeight: -0.975,
  radius: 0.068,
  displacement: 0.01,
  speed: 0.6,
  startX: 1.2,
  endX: -1.2,
  pipeGap: 0.47,
  openingPipeGaps: [0.62, 0.59, 0.56, 0.53, 0.5],
  pipeSpacing: 1,
  pipeMinY: -0.2,
  pipeMaxY: 0.8,
};

// Fixed-point format Q44.20 (1 world unit = 2^20 integer ticks) for deterministic
// physics and cross-platform Royale bot reproduction.
const FP_SCALE = 1 << 20;
const SIM_HZ = 120;
const SIM_DT = 1 / SIM_HZ;
const FIRST_PIPE_STEP = 180;
const DEFAULT_SIM_VERSION = 4;

function toFixed(worldUnits) {
  return Math.round(worldUnits * FP_SCALE);
}

function toWorld(fixedUnits) {
  return fixedUnits / FP_SCALE;
}

function perSimStep(fixedPerSecond) {
  return Math.trunc(fixedPerSecond / SIM_HZ);
}

const GRAVITY_STEP = perSimStep(toFixed(SIM_CONFIG.gravity));
const FLAP_VY_LEGACY = toFixed(SIM_CONFIG.flapVelocity);
const FLAP_VY_V3 = toFixed(SIM_CONFIG.flapVelocityV3);
const FALL_CAP_V3 = toFixed(SIM_CONFIG.fallCapV3);
const FALL_CAP_V4 = toFixed(SIM_CONFIG.fallCapV4);
const GROUND_Y = toFixed(SIM_CONFIG.lowestHeight);
const BIRD_RADIUS = toFixed(SIM_CONFIG.radius);
const PIXEL_UNIT_FP = toFixed(SIM_CONFIG.displacement);
const SCROLL_SPEED = toFixed(SIM_CONFIG.speed);
const SCROLL_STEP = perSimStep(SCROLL_SPEED);
const PIPE_START_X = toFixed(SIM_CONFIG.startX);
const PIPE_END_X = toFixed(SIM_CONFIG.endX);
const PIPE_GAP_FP = toFixed(SIM_CONFIG.pipeGap);
const HALF_PIPE_GAP = Math.trunc(PIPE_GAP_FP / 2);
const OPENING_HALF_GAPS = SIM_CONFIG.openingPipeGaps.map((gap) =>
  Math.trunc(toFixed(gap) / 2),
);
const PIPE_SPACING = toFixed(SIM_CONFIG.pipeSpacing);
const PIPE_MIN_Y = toFixed(SIM_CONFIG.pipeMinY);
const PIPE_MAX_Y = toFixed(SIM_CONFIG.pipeMaxY);
const PIPE_Y_SPAN = PIPE_MAX_Y - PIPE_MIN_Y;
const PIPE_WIDTH = 26 * PIXEL_UNIT_FP;
const PIPE_HALF_WIDTH = Math.trunc(PIPE_WIDTH / 2);
const BIRD_RADIUS_SQ = BIRD_RADIUS * BIRD_RADIUS;

function flapImpulseFor(simVersion) {
  return simVersion < 3 ? FLAP_VY_LEGACY : FLAP_VY_V3;
}

function fallSpeedCapFor(simVersion) {
  return simVersion < 3 ? null : simVersion < 4 ? FALL_CAP_V3 : FALL_CAP_V4;
}

function pipeHalfGapFor(simVersion, spawnIndex) {
  if (simVersion < 2) return HALF_PIPE_GAP;
  return spawnIndex < OPENING_HALF_GAPS.length
    ? OPENING_HALF_GAPS[spawnIndex]
    : HALF_PIPE_GAP;
}

// ------------------------------------------------------ persistent prefs ---

const MUTE_STORAGE_KEY = "flappy_muted";
const BEST_SCORE_STORAGE_KEY = "flappy_bestScore";

function readStoredMuted() {
  return String(storage.getItem(MUTE_STORAGE_KEY)) === "true";
}

function writeStoredMuted(muted) {
  storage.setItem(MUTE_STORAGE_KEY, String(muted));
}

function readStoredBestScore() {
  try {
    const parsed = parseInt(storage.getItem(BEST_SCORE_STORAGE_KEY) ?? "0", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeStoredBestScore(score) {
  try {
    storage.setItem(BEST_SCORE_STORAGE_KEY, score.toString());
  } catch {
    return;
  }
}

const muteBackingStore = createStore(readStoredMuted());
const soundPrefs = {
  getSnapshot: muteBackingStore.getSnapshot,
  subscribe: muteBackingStore.subscribe,
  setMuted(muted) {
    if (muteBackingStore.getSnapshot() !== muted) {
      writeStoredMuted(muted);
      muteBackingStore.publish(muted);
    }
  },
};

// ------------------------------------------------------ sprites & atlas ---

const PIXEL_TO_WORLD = SIM_CONFIG.displacement;

const spriteBox = (pxW, pxH, anchorX, anchorY) => ({
  worldW: pxW * PIXEL_TO_WORLD,
  worldH: pxH * PIXEL_TO_WORLD,
  anchor: { x: anchorX, y: anchorY },
});

const atlasSprite = (frame, pxW, pxH, anchorX = 0.5, anchorY = 0.5) => ({
  source: { kind: "atlas", frame },
  ...spriteBox(pxW, pxH, anchorX, anchorY),
});

const imageSprite = (src, pxW, pxH, anchorX = 0.5, anchorY = 0.5) => ({
  source: { kind: "image", src },
  ...spriteBox(pxW, pxH, anchorX, anchorY),
});

const ATLAS_URL = "./assets/atlas-D7zSkRSP.webp";
// The boot splash in the HTML owns the only copy of the logo: the packer
// inlines it there so the artwork is on screen before this bundle is parsed.
// Read it back from that element instead of carrying a second copy of the same
// data URI inside the bundle.
const bootLogoUrl = () => document.querySelector(".boot-splash__logo")?.src ?? "";

const SPRITES = {
  background: atlasSprite("bg", 144, 256, 0.5, 0.5),
  cityline: atlasSprite("cityline", 144, 110, 0.5, 0),
  ground: atlasSprite("ground", 144, 53, 0.5, 1),
  // The frame is 206x1024: a 4x upscale of the 52x256 pipe art (lip = the top
  // 104 rows, shaft = 176 columns = 44 art px), so the sprite is 26x128 world
  // px. At 160 it was a quarter taller than the art and the lip came out 1.35
  // bird heights instead of one; every other frame keeps its atlas aspect.
  pipeUp: atlasSprite("pipe_new", 26, 128, 0.5, 1),
  pipeDown: atlasSprite("pipe_new", 26, 128, 0.5, 1),
  bird0: imageSprite("./sprites/bird-upflap.png", 17, 12, 0.5, 0.5),
  bird1: imageSprite("./sprites/bird-midflap.png", 17, 12, 0.5, 0.5),
  bird2: imageSprite("./sprites/bird-downflap.png", 17, 12, 0.5, 0.5),
  message: imageSprite("./sprites/message.png", 92, 133.5, 0.5, 0.5),
  buttonGreen: atlasSprite("button-green", 62, 20, 0.5, 0.5),
  buttonYellow: atlasSprite("button-yellow", 62, 20, 0.5, 0.5),
  buttonGray: atlasSprite("button-gray", 62, 20, 0.5, 0.5),
  soundOn: imageSprite("./sprites/sound-on.png", 14, 12, 0.5, 0.5),
  soundOff: imageSprite("./sprites/sound-off.png", 14, 12, 0.5, 0.5),
  number0: imageSprite("./sprites/number-0.png", 24, 36, 0.5, 0.5),
  number1: imageSprite("./sprites/number-1.png", 16, 36, 0.5, 0.5),
  number2: imageSprite("./sprites/number-2.png", 24, 36, 0.5, 0.5),
  number3: imageSprite("./sprites/number-3.png", 24, 36, 0.5, 0.5),
  number4: imageSprite("./sprites/number-4.png", 24, 36, 0.5, 0.5),
  number5: imageSprite("./sprites/number-5.png", 24, 36, 0.5, 0.5),
  number6: imageSprite("./sprites/number-6.png", 24, 36, 0.5, 0.5),
  number7: imageSprite("./sprites/number-7.png", 24, 36, 0.5, 0.5),
  number8: imageSprite("./sprites/number-8.png", 24, 36, 0.5, 0.5),
  number9: imageSprite("./sprites/number-9.png", 24, 36, 0.5, 0.5),
  gameOver: atlasSprite("game-over", 100, 18.3, 0.5, 0.5),
  newBadge: atlasSprite("new-badge", 18, 8, 0.5, 0.5),
  panelOutside: atlasSprite("panel-outside", 110, 128.9, 0.5, 0.5),
  panelInside: atlasSprite("panel-inside", 99.3, 62.6, 0.5, 0.5),
  medalEmpty: atlasSprite("medal-empty", 22, 22, 0.5, 0.5),
  medalBronze: atlasSprite("medal-bronze", 22, 22, 0.5, 0.5),
  medalSilver: atlasSprite("medal-silver", 22, 22, 0.5, 0.5),
  medalGold: atlasSprite("medal-gold", 22, 22, 0.5, 0.5),
  medalPlatinum: atlasSprite("medal-platinum", 22, 22, 0.5, 0.5),
};

const BIRD_SPRITE_KEYS = ["bird0", "bird1", "bird2"];

const ATLAS_FRAMES = {
  bg: { x: 4, y: 4, w: 1440, h: 2560 },
  "button-gray": { x: 3096, y: 1112, w: 520, h: 168 },
  "button-green": { x: 3120, y: 1856, w: 520, h: 168 },
  "button-yellow": { x: 3233, y: 2342, w: 520, h: 168 },
  cityline: { x: 2568, y: 4, w: 1440, h: 1100 },
  "game-over": { x: 2136, y: 2342, w: 1089, h: 199 },
  ground: { x: 1012, y: 2572, w: 1440, h: 530 },
  "medal-bronze": { x: 3616, y: 2056, w: 220, h: 220 },
  "medal-empty": { x: 3844, y: 2056, w: 220, h: 220 },
  "medal-gold": { x: 1452, y: 2342, w: 220, h: 220 },
  "medal-platinum": { x: 1680, y: 2342, w: 220, h: 220 },
  "medal-silver": { x: 1908, y: 2342, w: 220, h: 220 },
  "new-badge": { x: 3262, y: 2572, w: 206, h: 92 },
  "panel-inside": { x: 4, y: 2572, w: 1000, h: 630 },
  "panel-outside": { x: 1452, y: 4, w: 1108, h: 1298 },
  pipe_new: { x: 1452, y: 1310, w: 206, h: 1024 },
};

const loadImageElement = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });

const loadBitmap = async (url) => {
  if (typeof createImageBitmap != "function") return loadImageElement(url);
  try {
    const blob = await (await fetch(url)).blob();
    return await createImageBitmap(blob);
  } catch {
    return loadImageElement(url);
  }
};

const fullImageRegion = (image) => ({
  image,
  sx: 0,
  sy: 0,
  sw: ("naturalWidth" in image && image.naturalWidth) || image.width,
  sh: ("naturalHeight" in image && image.naturalHeight) || image.height,
});

const NINE_SLICE_CAP_FRACTION = 0.1;
const NINE_SLICE_SEAM_OVERLAP = 0.002;

class SpriteRenderer {
  images = new Map();
  tintCache = new Map();
  loaded = false;

  async loadAll() {
    // The stylesheet already declares @font-face Jersey10, so loading that face
    // is all it takes. Registering a second FontFace here would put the very
    // same font file into the single-file release a second time.
    const fontTask = document.fonts
      .load("100px Jersey10")
      .then((faces) => {
        if (!faces.length) {
          console.warn("Jersey10 font not available, falling back to sans-serif");
        }
      })
      .catch((err) => {
        console.warn("Failed to load Jersey10 font, falling back to sans-serif", err);
      });

    const entries = Object.entries(SPRITES);
    const atlasTask = loadBitmap(ATLAS_URL)
      .then((atlasImage) => {
        for (const [name, spec] of entries) {
          if (spec.source.kind !== "atlas") continue;
          const rect = ATLAS_FRAMES[spec.source.frame];
          this.images.set(name, {
            image: atlasImage,
            sx: rect.x,
            sy: rect.y,
            sw: rect.w,
            sh: rect.h,
          });
        }
      })
      .catch(() => {
        console.error(`Failed to load sprite atlas: ${ATLAS_URL}`);
      });

    const spriteTasks = entries
      .filter(([, spec]) => spec.source.kind === "image")
      .map(([name, spec]) =>
        loadBitmap(spec.source.src)
          .then((img) => {
            this.images.set(name, fullImageRegion(img));
          })
          .catch(() => {
            console.error(`Failed to load sprite: ${name}`);
          }),
      );

    await Promise.all([atlasTask, ...spriteTasks, fontTask]);
    this.loaded = true;
  }

  isLoaded() {
    return this.loaded;
  }

  drawSprite(ctx, name, x, y, options = {}) {
    if (!this.loaded) return;
    const region = this.images.get(name);
    if (!region) return;
    const spec = SPRITES[name];
    const { rot = 0, scale = 1, flipX = false, flipY = false, tint } = options;
    const { image, sx, sy, sw, sh } = tint
      ? this.getTinted(name, region, tint)
      : region;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale * (flipX ? -1 : 1), -scale * (flipY ? -1 : 1));
    const drawX = -spec.worldW * spec.anchor.x;
    const drawY = -spec.worldH * (1 - spec.anchor.y);
    ctx.drawImage(image, sx, sy, sw, sh, drawX, drawY, spec.worldW, spec.worldH);
    ctx.restore();
  }

  drawStretchedSprite(ctx, name, x, y, options) {
    if (!this.loaded) return;
    const region = this.images.get(name);
    if (!region) return;
    const spec = SPRITES[name];
    const { scale = 1, tint } = options;
    const { image, sx, sy, sw, sh } = tint
      ? this.getTinted(name, region, tint)
      : region;

    const srcCapW = sw * NINE_SLICE_CAP_FRACTION;
    const dstCapW = spec.worldW * NINE_SLICE_CAP_FRACTION * scale;
    const totalW = Math.max(options.width, dstCapW * 2);
    const totalH = spec.worldH * scale;
    const leftX = -totalW * spec.anchor.x;
    const topY = -totalH * (1 - spec.anchor.y);
    const centerW = totalW - dstCapW * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, -1);
    ctx.drawImage(image, sx, sy, srcCapW, sh, leftX, topY, dstCapW, totalH);
    ctx.drawImage(
      image,
      sx + srcCapW,
      sy,
      sw - srcCapW * 2,
      sh,
      leftX + dstCapW - NINE_SLICE_SEAM_OVERLAP,
      topY,
      centerW + NINE_SLICE_SEAM_OVERLAP * 2,
      totalH,
    );
    ctx.drawImage(
      image,
      sx + sw - srcCapW,
      sy,
      srcCapW,
      sh,
      leftX + totalW - dstCapW,
      topY,
      dstCapW,
      totalH,
    );
    ctx.restore();
  }

  fillPipeShaft(ctx, name, x, yStart, yEnd) {
    if (!this.loaded || yEnd <= yStart) return;
    const region = this.images.get(name);
    if (!region) return;
    const spec = SPRITES[name];
    ctx.drawImage(
      region.image,
      region.sx,
      region.sy + region.sh - 1,
      region.sw,
      1,
      x - spec.worldW * spec.anchor.x,
      yStart,
      spec.worldW,
      yEnd - yStart,
    );
  }

  getTinted(name, region, color) {
    const key = `${name}:${color}`;
    const cached = this.tintCache.get(key);
    if (cached) return cached;

    const offscreen = document.createElement("canvas");
    offscreen.width = region.sw;
    offscreen.height = region.sh;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return region;

    offCtx.drawImage(
      region.image,
      region.sx,
      region.sy,
      region.sw,
      region.sh,
      0,
      0,
      region.sw,
      region.sh,
    );
    offCtx.globalCompositeOperation = "multiply";
    offCtx.fillStyle = color;
    offCtx.fillRect(0, 0, region.sw, region.sh);
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(
      region.image,
      region.sx,
      region.sy,
      region.sw,
      region.sh,
      0,
      0,
      region.sw,
      region.sh,
    );

    const tinted = { image: offscreen, sx: 0, sy: 0, sw: region.sw, sh: region.sh };
    this.tintCache.set(key, tinted);
    return tinted;
  }
}

// --------------------------------------------------- world & HUD drawing ---

const PIPE_SPAWN_LEFT_EDGE = SIM_CONFIG.startX - SPRITES.pipeUp.worldW / 2;
const LEAD_MARGIN = 0.02;
const MAX_WORLD_LEAD_X = 0.33;
const SHAKE_DURATION = 0.45;
const SHAKE_AMPLITUDE = 0.035;
const SHAKE_CYCLES = 4;
const SHAKE_Y_RATIO = 0.7;

function computeWorldLeadX(frameW) {
  return Math.min(Math.max(PIPE_SPAWN_LEFT_EDGE - frameW / 2 - LEAD_MARGIN, 0), MAX_WORLD_LEAD_X);
}

const GROUND_FILL_COLOR = "#d8a96b";
const GROUND_TOP_OFFSET = 0.21;
const CITY_PARALLAX = 0.5;
const CITY_SCALE = 1.15;
const CITY_Y_OFFSET = 0.15;
const CITY_TILE_OVERLAP = 0.01;

function renderWorld(ctx, renderer, snap, frameW, frameH, shake) {
  renderBackground(ctx, renderer, frameW, frameH, shake);
  const leadX = computeWorldLeadX(frameW);
  ctx.save();
  ctx.translate(-leadX, 0);
  renderCityline(ctx, renderer, snap.scrollX, frameW);
  renderPipes(ctx, renderer, snap.pipes, frameH);
  renderGround(ctx, renderer, snap.scrollX, frameW);
  if (snap.state !== "getready") {
    renderer.drawSprite(ctx, BIRD_SPRITE_KEYS[snap.birdFrame], 0, snap.birdY, {
      rot: snap.birdRot,
    });
  }
  ctx.restore();
}

function renderBackground(ctx, renderer, frameW, frameH, shake) {
  const bleedW = frameW + Math.abs(shake.x) * 2;
  const bleedH = frameH + Math.abs(shake.y) * 2;
  const scale = Math.max(
    bleedW / SPRITES.background.worldW,
    bleedH / SPRITES.background.worldH,
  );
  renderer.drawSprite(ctx, "background", 0, 0, { scale });
}

function renderCityline(ctx, renderer, scrollX, frameW) {
  const scaledTileW = SPRITES.cityline.worldW * CITY_SCALE;
  const stride = scaledTileW - CITY_TILE_OVERLAP;
  const offset = (scrollX * CITY_PARALLAX) % stride;
  const startX = -frameW / 2 - offset + scaledTileW / 2;
  const count = Math.ceil(frameW / stride) + 2;
  const y = SIM_CONFIG.lowestHeight - CITY_Y_OFFSET;
  for (let i = 0; i < count; i++) {
    renderer.drawSprite(ctx, "cityline", startX + i * stride, y, { scale: CITY_SCALE });
  }
}

function renderPipes(ctx, renderer, pipes, frameH) {
  const pipeCapH = SPRITES.pipeUp.worldH;
  const overscan = SHAKE_AMPLITUDE * 2;
  const topY = frameH / 2 + overscan;
  const bottomY = -frameH / 2 - overscan;
  for (const pipe of pipes) {
    const lowerLip = pipe.gapY - pipe.halfGap;
    const upperLip = pipe.gapY + pipe.halfGap;
    renderer.fillPipeShaft(ctx, "pipeUp", pipe.x, bottomY, lowerLip - pipeCapH);
    renderer.drawSprite(ctx, "pipeUp", pipe.x, lowerLip);
    renderer.fillPipeShaft(ctx, "pipeDown", pipe.x, upperLip + pipeCapH, topY);
    renderer.drawSprite(ctx, "pipeDown", pipe.x, upperLip, { flipY: true });
  }
}

function renderGround(ctx, renderer, scrollX, frameW) {
  const tileW = SPRITES.ground.worldW;
  const offset = scrollX % tileW;
  const topY = SIM_CONFIG.lowestHeight + GROUND_TOP_OFFSET;
  const startX = -frameW / 2 - offset;
  const count = Math.ceil(frameW / tileW) + 2;
  ctx.fillStyle = GROUND_FILL_COLOR;
  ctx.fillRect(-10, SIM_CONFIG.lowestHeight, 20, -10);
  for (let i = 0; i < count; i++) {
    renderer.drawSprite(ctx, "ground", startX + i * tileW, topY);
  }
}

// --------------------------------------------------- pixel font & digits ---

const UI_FONT_FAMILY = "Jersey10, sans-serif";
const FONT_REF_PX = 100;

function measureTextWidth(ctx, text, worldSize) {
  ctx.save();
  ctx.font = `${FONT_REF_PX}px ${UI_FONT_FAMILY}`;
  const pxWidth = ctx.measureText(text).width;
  ctx.restore();
  return pxWidth * (worldSize / FONT_REF_PX);
}

function measureTextCenterBias(ctx, text, worldSize) {
  ctx.save();
  ctx.font = `${FONT_REF_PX}px ${UI_FONT_FAMILY}`;
  ctx.textAlign = "center";
  const metrics = ctx.measureText(text);
  ctx.restore();
  return (
    ((metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2) *
    (worldSize / FONT_REF_PX)
  );
}

function drawText(ctx, text, x, y, worldSize, align, fillOverride) {
  const scale = worldSize / FONT_REF_PX;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, -scale);
  ctx.font = `${FONT_REF_PX}px ${UI_FONT_FAMILY}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  if (fillOverride) {
    ctx.fillStyle = fillOverride;
    ctx.fillText(text, 0, 0);
  } else {
    ctx.strokeStyle = "black";
    ctx.lineWidth = FONT_REF_PX * 0.15;
    ctx.lineJoin = "round";
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

const DIGIT_SPRITES = [
  "number0",
  "number1",
  "number2",
  "number3",
  "number4",
  "number5",
  "number6",
  "number7",
  "number8",
  "number9",
];
// Source artwork dimensions: every digit is 36 px tall; "1" is 16 px wide.
const DIGIT_WIDTHS_PX = [24, 16, 24, 24, 24, 24, 24, 24, 24, 24];
const DIGIT_HEIGHT_PX = 36;

function drawDigits(ctx, renderer, value, x, y, digitHeight, align) {
  const chars = String(value).split("");
  const scale = digitHeight / (DIGIT_HEIGHT_PX * PIXEL_TO_WORLD);
  let totalWidth = 0;
  for (const ch of chars) totalWidth += DIGIT_WIDTHS_PX[+ch] * PIXEL_TO_WORLD * scale;

  let cursorX = align === "center" ? x - totalWidth / 2 : x;
  for (const ch of chars) {
    const glyphW = DIGIT_WIDTHS_PX[+ch] * PIXEL_TO_WORLD * scale;
    renderer.drawSprite(ctx, DIGIT_SPRITES[+ch], cursorX + glyphW / 2, y, { scale });
    cursorX += glyphW;
  }
}

// ------------------------------------------------ buttons & panel layout ---

const BUTTON_WIDTH = 0.52;
const BUTTON_HEIGHT = 0.2;
const BUTTON_SPRITE_BY_COLOR = {
  green: "buttonGreen",
  yellow: "buttonYellow",
  gray: "buttonGray",
};
const BUTTON_TEXT_SIZE = 0.12;
const BUTTON_TEXT_PADDING = 0.08;

function drawButtonBody(ctx, renderer, color, x, y, width = BUTTON_WIDTH) {
  const sprite = BUTTON_SPRITE_BY_COLOR[color];
  renderer.drawStretchedSprite(ctx, sprite, x, y, {
    width,
    scale: BUTTON_HEIGHT / SPRITES[sprite].worldH,
  });
}

function fitButtonLabelSize(ctx, label, width = BUTTON_WIDTH) {
  const maxLabelW = width - BUTTON_TEXT_PADDING;
  const rawW = measureTextWidth(ctx, label, BUTTON_TEXT_SIZE);
  return rawW <= maxLabelW ? BUTTON_TEXT_SIZE : (BUTTON_TEXT_SIZE * maxLabelW) / rawW;
}

function drawButton(ctx, renderer, color, label, x, y, width = BUTTON_WIDTH) {
  drawButtonBody(ctx, renderer, color, x, y, width);
  const textSize = fitButtonLabelSize(ctx, label, width);
  drawText(ctx, label, x - measureTextCenterBias(ctx, label, textSize), y, textSize, "center");
}

const WIDE_LAYOUT_MIN_W = 1.7;
const REVIVE_ROW_STEP = 0.32;
const PANEL_W = SPRITES.panelOutside.worldW;
const PANEL_H = SPRITES.panelOutside.worldH;
const GAMEOVER_TITLE_H = SPRITES.gameOver.worldH;
const NARROW_PANEL_Y = 0.1;
const NARROW_TITLE_GAP = 0.075;
const NARROW_BUTTON_Y = -0.76;
const WIDE_PANEL_Y = 0.15;
const WIDE_TITLE_GAP = 0.04;
const WIDE_BUTTON_GAP = 0.07;
const WIDE_COLUMN_GAP = 0.08;
const WIDE_SIDE_MARGIN = 0.05;
const WIDE_MAX_SCALE = 0.8;
const SAFE_BOTTOM_MARGIN = 0.03;

function reviveButtonY(playButtonY) {
  return playButtonY - REVIVE_ROW_STEP;
}

function narrowGameOverLayout() {
  return {
    panelScale: 1,
    panelY: NARROW_PANEL_Y,
    titleY: NARROW_PANEL_Y + PANEL_H / 2 + NARROW_TITLE_GAP + GAMEOVER_TITLE_H / 2,
    buttonY: NARROW_BUTTON_Y,
  };
}

function wideGameOverLayout(frameW) {
  const scale = Math.min(WIDE_MAX_SCALE, (frameW - 2 * WIDE_SIDE_MARGIN - WIDE_COLUMN_GAP) / (2 * PANEL_W));
  const halfPanelH = (PANEL_H * scale) / 2;
  return {
    panelScale: scale,
    panelY: WIDE_PANEL_Y,
    titleY: WIDE_PANEL_Y + halfPanelH + WIDE_TITLE_GAP + GAMEOVER_TITLE_H / 2,
    buttonY: WIDE_PANEL_Y - halfPanelH - WIDE_BUTTON_GAP - BUTTON_HEIGHT / 2,
  };
}

function clampLayoutAboveBottom(layout, safeBottomY) {
  const lowestEdge = reviveButtonY(layout.buttonY) - BUTTON_HEIGHT / 2;
  const lift = Math.max(0, safeBottomY + SAFE_BOTTOM_MARGIN - lowestEdge);
  if (lift === 0) return layout;
  return {
    ...layout,
    panelY: layout.panelY + lift,
    titleY: layout.titleY + lift,
    buttonY: layout.buttonY + lift,
  };
}

function computeGameOverLayout(frameW, safeBottomY) {
  const base = frameW < WIDE_LAYOUT_MIN_W ? narrowGameOverLayout() : wideGameOverLayout(frameW);
  return clampLayoutAboveBottom(base, safeBottomY);
}

const FADE_DURATION = 0.35;
const PANEL_APPEAR_DELAY = 0.3;
const BUTTONS_APPEAR_DELAY = 1.2;

function clampFade(t) {
  return Math.min(1, Math.max(0, t / FADE_DURATION));
}

function panelFadeAlpha(stateElapsed) {
  return clampFade(stateElapsed - PANEL_APPEAR_DELAY);
}

function buttonsFadeAlpha(stateElapsed) {
  return clampFade(stateElapsed - BUTTONS_APPEAR_DELAY);
}

function pointInRect(px, py, cx, cy, w, h) {
  return px >= cx - w / 2 && px <= cx + w / 2 && py >= cy - h / 2 && py <= cy + h / 2;
}

const REVIVE_BUTTON_WIDTH = 0.72;

function hitTestGameOverButtons(worldX, worldY, layout) {
  if (pointInRect(worldX, worldY, 0, layout.buttonY, BUTTON_WIDTH, BUTTON_HEIGHT)) {
    return { kind: "play" };
  }
  if (pointInRect(worldX, worldY, 0, reviveButtonY(layout.buttonY), REVIVE_BUTTON_WIDTH, BUTTON_HEIGHT)) {
    return { kind: "revive" };
  }
  return null;
}

const HUD_SIDE_INSET = 0.08;
const HUD_LABEL_TOP_INSET = 0.12;
const SOUND_ICON_TOP_INSET = 0.2;
const SOUND_HIT_WIDTH = 0.28;
const SOUND_HIT_HEIGHT = 0.22;

function hitTestSoundToggle(worldX, worldY, frameW, frameH) {
  const rightEdge = frameW / 2;
  const centerY = frameH / 2 - SOUND_ICON_TOP_INSET;
  return (
    worldX <= rightEdge &&
    worldX >= rightEdge - SOUND_HIT_WIDTH &&
    worldY <= centerY + SOUND_HIT_HEIGHT / 2 &&
    worldY >= centerY - SOUND_HIT_HEIGHT / 2
  );
}

const PLAY_LABEL = "PLAY";
const REVIVE_LABEL = "REVIVE ONCE";
const REVIVED_USED_LABEL = "ALREADY REVIVED";
const MODAL_VEIL_COLOR = "rgba(0, 0, 0, 0.6)";
const PANEL_SCORE_LABEL_SIZE = 0.075;
const PANEL_INSIDE_Y = 0.27;
const PANEL_COLUMN_X = 0.25;
const PANEL_DIGITS_Y = 0.36;
const PANEL_LABEL_Y = 0.17;
const NEW_BADGE_Y = 0.06;
const NEW_BADGE_SCALE = 0.7;
const MEDAL_LABEL_X = -0.17;
const MEDAL_LABEL_SIZE = 0.09;
const MEDAL_ICON_X = 0.18;
const MEDAL_ROW_Y = -0.33;

const MEDAL_SPRITES = {
  bronze: "medalBronze",
  silver: "medalSilver",
  gold: "medalGold",
  platinum: "medalPlatinum",
};

function renderGameOver(ctx, renderer, snap, frameW, frameH, safeBottomY, canRevive) {
  const layout = computeGameOverLayout(frameW, safeBottomY);
  ctx.save();
  const alpha = panelFadeAlpha(snap.stateElapsed);
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.fillStyle = MODAL_VEIL_COLOR;
  ctx.fillRect(-frameW / 2, -frameH / 2, frameW, frameH);
  renderer.drawSprite(ctx, "gameOver", 0, layout.titleY);
  ctx.save();
  ctx.translate(0, layout.panelY);
  ctx.scale(layout.panelScale, layout.panelScale);
  renderScorePanel(ctx, renderer, snap);
  ctx.restore();

  const btnAlpha = buttonsFadeAlpha(snap.stateElapsed);
  if (btnAlpha > 0) {
    ctx.save();
    if (btnAlpha < 1) ctx.globalAlpha = btnAlpha;
    drawButton(ctx, renderer, "green", PLAY_LABEL, 0, layout.buttonY);
    drawButton(
      ctx,
      renderer,
      canRevive ? "yellow" : "gray",
      canRevive ? REVIVE_LABEL : REVIVED_USED_LABEL,
      0,
      reviveButtonY(layout.buttonY),
      REVIVE_BUTTON_WIDTH,
    );
    ctx.restore();
  }
  ctx.restore();
}

function renderScorePanel(ctx, renderer, snap) {
  renderer.drawSprite(ctx, "panelOutside", 0, 0);
  renderer.drawSprite(ctx, "panelInside", 0, PANEL_INSIDE_Y);
  drawDigits(ctx, renderer, snap.score, -PANEL_COLUMN_X, PANEL_DIGITS_Y, 0.129, "center");
  drawText(ctx, "SCORE", -PANEL_COLUMN_X, PANEL_LABEL_Y, PANEL_SCORE_LABEL_SIZE, "center");
  drawDigits(ctx, renderer, snap.bestScore, PANEL_COLUMN_X, PANEL_DIGITS_Y, 0.129, "center");
  drawText(ctx, "HIGHEST", PANEL_COLUMN_X, PANEL_LABEL_Y, PANEL_SCORE_LABEL_SIZE, "center");
  if (snap.isNewBest) {
    renderer.drawSprite(ctx, "newBadge", PANEL_COLUMN_X, NEW_BADGE_Y, {
      scale: NEW_BADGE_SCALE,
    });
  }
  drawText(ctx, "MEDAL", MEDAL_LABEL_X, MEDAL_ROW_Y, MEDAL_LABEL_SIZE, "center");
  const medalSprite = snap.medal ? MEDAL_SPRITES[snap.medal] : "medalEmpty";
  renderer.drawSprite(ctx, medalSprite, MEDAL_ICON_X, MEDAL_ROW_Y);
}

// ------------------------------------------------------------- easter egg ---

const EGG_TAPS = 10;
const EGG_TAP_GAP = 600;
const EGG_POP_SECONDS = 0.18;
const EGG_CARD_SCALE = 0.84;
const EGG_CARD_WIDTH = 1.06;
const EGG_BUTTON_WIDTH = 0.52;
const EGG_BUTTON_HEIGHT = 0.16;
const EGG_TITLE_SIZE = 0.15;
const EGG_LINE1_SIZE = 0.107;
const EGG_LINE2_SIZE = 0.121;
const EGG_GOLD = "#ffcf3f";

function eggLayout() {
  return {
    width: EGG_CARD_WIDTH,
    scale: EGG_CARD_SCALE,
    centreY: 0.02,
    titleY: 0.355,
    line1Y: 0.175,
    line2Y: 0.085,
    yesY: -0.12,
    noY: -0.335,
  };
}

function eggFitText(ctx, text, desiredSize, maxWidth) {
  const measured = measureTextWidth(ctx, text, desiredSize);
  return measured > maxWidth ? (desiredSize * maxWidth) / measured : desiredSize;
}

function drawEggButton(ctx, renderer, color, label, x, y) {
  const sprite = BUTTON_SPRITE_BY_COLOR[color];
  const scale = EGG_BUTTON_HEIGHT / SPRITES[sprite].worldH;
  const rawLabelW = measureTextWidth(ctx, label, EGG_BUTTON_HEIGHT * 0.55);
  const shrink = Math.min(1, (EGG_BUTTON_WIDTH - BUTTON_TEXT_PADDING) / rawLabelW);
  const labelSize = EGG_BUTTON_HEIGHT * 0.55 * shrink;
  renderer.drawStretchedSprite(ctx, sprite, x, y, { width: EGG_BUTTON_WIDTH, scale });
  drawText(ctx, label, x - measureTextCenterBias(ctx, label, labelSize), y, labelSize, "center");
}

function renderEasterEgg(ctx, renderer, frameW, frameH, elapsed, inRoyale) {
  const linear = Math.min(1, Math.max(0, elapsed / EGG_POP_SECONDS));
  const eased = 1 - (1 - linear) ** 3;
  const layout = eggLayout();
  const maxTextW = layout.width - 0.16;

  ctx.save();
  ctx.globalAlpha = linear;
  ctx.fillStyle = MODAL_VEIL_COLOR;
  ctx.fillRect(-frameW / 2, -frameH / 2, frameW, frameH);
  ctx.translate(0, layout.centreY);
  ctx.scale(0.9 + 0.1 * eased, 0.9 + 0.1 * eased);
  renderer.drawStretchedSprite(ctx, "panelOutside", 0, 0, {
    width: layout.width,
    scale: layout.scale,
  });
  drawText(ctx, "EASTER EGG!", 0, layout.titleY, EGG_TITLE_SIZE, "center");
  drawText(ctx, "EASTER EGG!", 0, layout.titleY, EGG_TITLE_SIZE, "center", EGG_GOLD);
  if (!inRoyale) {
    drawText(
      ctx,
      "You found an Easter egg!",
      0,
      layout.line1Y,
      eggFitText(ctx, "You found an Easter egg!", EGG_LINE1_SIZE, maxTextW),
      "center",
    );
  }
  drawText(
    ctx,
    inRoyale ? "Switch to Classic Mode?" : "Switch to Royale Mode?",
    0,
    layout.line2Y,
    eggFitText(ctx, "Switch to Royale Mode?", EGG_LINE2_SIZE, maxTextW),
    "center",
  );
  drawEggButton(ctx, renderer, "green", "SWITCH", 0, layout.yesY);
  drawEggButton(ctx, renderer, "gray", "NOT NOW", 0, layout.noY);
  ctx.restore();
}

// --------------------------------------------------------------- HUD bar ---

const HUD_BEST_LABEL_SIZE = 0.06;
const HUD_BEST_VALUE_OFFSET = 0.14;
const SCORE_MAX_WORLD_Y = 1.1;
const SCORE_DIGIT_HEIGHT = 0.17;
const SCORE_TOP_QUARTER_RATIO = 0.25;
const HOME_MESSAGE_Y = 0.31;
const HOME_CREDIT_Y = -1.16;
const HOME_CREDIT_SIZE = 0.05;

function computeScoreY(frameH) {
  return Math.min(SCORE_MAX_WORLD_Y, SCORE_TOP_QUARTER_RATIO * frameH - SCORE_DIGIT_HEIGHT / 2);
}

function renderHud(ctx, renderer, snap, frameW, frameH, safeBottomY, isMuted, canRevive) {
  if (snap.state === "getready") {
    renderer.drawSprite(ctx, "message", 0, HOME_MESSAGE_Y);
    renderHomeTopBar(ctx, renderer, snap.bestScore, frameW, frameH, isMuted);
    drawText(ctx, "Made with love by lingyicute", 0, HOME_CREDIT_Y, HOME_CREDIT_SIZE, "center");
  } else if (snap.state === "play") {
    drawDigits(ctx, renderer, snap.score, 0, computeScoreY(frameH), SCORE_DIGIT_HEIGHT, "center");
  } else if (snap.state === "gameover") {
    renderGameOver(ctx, renderer, snap, frameW, frameH, safeBottomY, canRevive);
  }
}

function renderHomeTopBar(ctx, renderer, bestScore, frameW, frameH, isMuted) {
  const labelY = frameH / 2 - HUD_LABEL_TOP_INSET;
  const rightEdge = frameW / 2 - HUD_SIDE_INSET;
  const leftEdge = -frameW / 2 + HUD_SIDE_INSET;
  drawText(ctx, "HIGHEST SCORE", leftEdge, labelY, HUD_BEST_LABEL_SIZE, "left");
  drawDigits(ctx, renderer, bestScore, leftEdge, labelY - HUD_BEST_VALUE_OFFSET, 0.09, "left");
  renderer.drawSprite(
    ctx,
    isMuted ? "soundOff" : "soundOn",
    rightEdge - SPRITES.soundOn.worldW / 2,
    frameH / 2 - SOUND_ICON_TOP_INSET,
  );
}

// --------------------------------------------------- collision & physics ---

function checkGroundHit(birdY) {
  return birdY - BIRD_RADIUS < GROUND_Y;
}

// Lower and upper pipes extend all the way to -Infinity and +Infinity rather
// than stopping at an arbitrary world-unit height, so climbing far above the
// frame never skips a pipe and extreme coordinates cannot overflow `dy * dy`.
function checkPipeHit(birdY, pipe) {
  const left = pipe.x - PIPE_HALF_WIDTH;
  const right = pipe.x + PIPE_HALF_WIDTH;
  const dx = -Math.max(left, Math.min(0, right));
  if (Math.abs(dx) >= BIRD_RADIUS) return null;

  const lowerLip = pipe.gapY - pipe.halfGap;
  const dyLow = Math.max(0, birdY - lowerLip);
  if (dyLow < BIRD_RADIUS && dx * dx + dyLow * dyLow < BIRD_RADIUS_SQ) {
    return "bottom";
  }

  const upperLip = pipe.gapY + pipe.halfGap;
  const dyHigh = Math.max(0, upperLip - birdY);
  return dyHigh < BIRD_RADIUS && dx * dx + dyHigh * dyHigh < BIRD_RADIUS_SQ
    ? "top"
    : null;
}

// ---------------------------------------------------------- SplitMix64 ---

const U64_MASK = (1n << 64n) - 1n;
const SM64_GAMMA = 0x9e3779b97f4a7c15n;
const SM64_MIX1 = 0xbf58476d1ce4e5b9n;
const SM64_MIX2 = 0x94d049bb133111ebn;
const FP_SCALE_BIG = BigInt(FP_SCALE);

class SplitMix64 {
  state;
  constructor(seed) {
    this.state = seed & U64_MASK;
  }
  nextU64() {
    this.state = (this.state + SM64_GAMMA) & U64_MASK;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * SM64_MIX1) & U64_MASK;
    z = ((z ^ (z >> 27n)) * SM64_MIX2) & U64_MASK;
    z = z ^ (z >> 31n);
    return z & U64_MASK;
  }
  nextFraction() {
    return Number(this.nextU64() % FP_SCALE_BIG);
  }
  nextGapY() {
    return PIPE_MIN_Y + Math.trunc((this.nextFraction() * PIPE_Y_SPAN) / FP_SCALE);
  }
}

const SEED_53_MASK = (1n << 53n) - 1n;

function randomSeed53() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new BigUint64Array(1);
    crypto.getRandomValues(buf);
    return buf[0] & SEED_53_MASK;
  }
  return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) & SEED_53_MASK;
}

// ----------------------------------------------------------- game engine ---

const IDLE_BOB_AMPLITUDE = 0.05;
const IDLE_BOB_FREQ = 5;
const FLAP_FRAME_PERIOD = 0.15;
const UPWARD_TILT_RAD = Math.PI / 8;
const TILT_VELOCITY_FACTOR = 0.5;
const NOSE_DOWN_RAD = -Math.PI / 2;
const CRASH_SPIN_STEP = 0.0349;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

class FlappyGame {
  currentState = "getready";
  birdY = 0;
  birdVy = 0;
  birdRot = 0;
  birdGrounded = false;
  pipes = [];
  scrollX = 0;
  score = 0;
  bestScore;
  elapsed = 0;
  stateEnteredElapsed = 0;
  animationTimer = 0;
  isNewBest = false;
  pipeScroll = 0;
  prevBirdY = 0;
  prevBirdRot = 0;
  prevScrollX = 0;
  prevPipeScroll = 0;
  nextSeed = null;
  runSeed = 0n;
  simVersion = DEFAULT_SIM_VERSION;
  spawnCount = 0;
  prng = new SplitMix64(0n);
  playStep = 0;
  flaps = [];
  revivedAtStep = null;
  deathCause = null;
  diePending = false;
  dieSince = 0;
  soundListeners = new Set();
  bestScoreListeners = new Set();

  constructor(initialBestScore = 0) {
    this.bestScore = initialBestScore;
  }

  onSound(listener) {
    this.soundListeners.add(listener);
    return () => this.soundListeners.delete(listener);
  }

  onBestScoreChanged(listener) {
    this.bestScoreListeners.add(listener);
    return () => this.bestScoreListeners.delete(listener);
  }

  seedPipes(seed, simVersion = DEFAULT_SIM_VERSION) {
    this.nextSeed = seed;
    this.simVersion = simVersion;
  }

  get flapTrace() {
    return this.flaps;
  }

  get wasRevived() {
    return this.revivedAtStep !== null;
  }

  get runDeathCause() {
    return this.deathCause;
  }

  get currentSeed() {
    return this.runSeed;
  }

  get runSimVersion() {
    return this.simVersion;
  }

  restart() {
    if (this.currentState === "gameover") {
      this.emitSound("swoosh");
      this.reset();
      this.transition("getready");
    }
  }

  revive() {
    if (this.currentState !== "gameover" || this.revivedAtStep !== null) return;
    this.revivedAtStep = this.playStep;
    this.applyReviveTransform();
    this.birdRot = UPWARD_TILT_RAD;
    this.birdGrounded = false;
    this.prevBirdY = this.birdY;
    this.prevBirdRot = this.birdRot;
    this.deathCause = null;
    this.diePending = false;
    this.emitSound("swoosh");
    this.transition("play");
  }

  applyReviveTransform() {
    this.pipes = [];
    this.birdY = 0;
    this.birdVy = flapImpulseFor(this.simVersion);
  }

  flap() {
    if (this.currentState === "getready") {
      this.emitSound("flap");
      this.beginRun();
      this.transition("play");
      this.birdVy = flapImpulseFor(this.simVersion);
      return;
    }
    if (this.currentState === "play") {
      this.emitSound("flap");
      this.birdVy = flapImpulseFor(this.simVersion);
      if (this.flaps[this.flaps.length - 1] !== this.playStep) {
        this.flaps.push(this.playStep);
      }
    }
  }

  step(dt) {
    this.prevBirdY = this.birdY;
    this.prevBirdRot = this.birdRot;
    this.prevScrollX = this.scrollX;
    this.prevPipeScroll = this.pipeScroll;
    this.elapsed += dt;

    const startedInPlay = this.currentState === "play";
    if (this.currentState === "play" || this.currentState === "gameover") {
      const fallCap = fallSpeedCapFor(this.simVersion);
      if (fallCap !== null && this.birdVy < -fallCap) this.birdVy = -fallCap;
      this.birdVy -= GRAVITY_STEP;
      this.birdY += Math.trunc(this.birdVy / SIM_HZ);

      if (checkGroundHit(this.birdY)) {
        this.birdY = GROUND_Y + BIRD_RADIUS;
        this.birdVy = 0;
        this.birdGrounded = true;
        this.diePending = false;
        if (this.currentState === "play") {
          this.deathCause = "ground";
          this.emitSound("hit");
          this.transition("gameover");
        }
      }

      if (
        this.diePending &&
        !this.birdGrounded &&
        this.birdVy <= 0 &&
        this.elapsed - this.dieSince >= 0.35
      ) {
        this.diePending = false;
        this.emitSound("die");
      }
    } else {
      this.birdY = toFixed(Math.sin(this.elapsed * IDLE_BOB_FREQ) * IDLE_BOB_AMPLITUDE);
      this.birdVy = 0;
      this.birdRot = 0;
    }

    if (this.currentState === "play") this.checkPipeCollision();

    if (this.currentState !== "gameover") {
      this.scrollX += SCROLL_STEP;
      if (this.currentState === "play") this.advancePipes();
    }

    if (this.currentState === "play") {
      this.birdRot =
        this.birdVy > 0
          ? UPWARD_TILT_RAD
          : Math.max(NOSE_DOWN_RAD, UPWARD_TILT_RAD + toWorld(this.birdVy) * TILT_VELOCITY_FACTOR);
    } else if (this.currentState === "gameover") {
      if (this.birdGrounded) {
        this.birdRot = NOSE_DOWN_RAD;
        this.prevBirdRot = NOSE_DOWN_RAD;
      } else {
        this.birdRot = Math.max(
          NOSE_DOWN_RAD,
          Math.min(
            UPWARD_TILT_RAD + toWorld(this.birdVy) * TILT_VELOCITY_FACTOR,
            this.prevBirdRot - CRASH_SPIN_STEP,
          ),
        );
      }
    } else {
      this.birdRot = 0;
    }

    if (this.currentState !== "gameover") this.animationTimer += dt;

    if (startedInPlay) {
      this.playStep += 1;
    }
  }

  get snapshot() {
    return this.composeSnapshot(this.birdY, this.birdRot, this.scrollX, 0);
  }

  renderSnapshot(alpha) {
    return this.composeSnapshot(
      lerp(this.prevBirdY, this.birdY, alpha),
      lerp(this.prevBirdRot, this.birdRot, alpha),
      lerp(this.prevScrollX, this.scrollX, alpha),
      (this.pipeScroll - this.prevPipeScroll) * (1 - alpha),
    );
  }

  composeSnapshot(birdY, birdRot, scrollX, pipeInterp) {
    const pipes = this.pipes.map((pipe) => ({
      x: toWorld(pipe.x) + toWorld(pipeInterp),
      gapY: toWorld(pipe.gapY),
      halfGap: toWorld(pipe.halfGap),
      passed: pipe.passed,
    }));
    return {
      state: this.currentState,
      birdY: toWorld(birdY),
      birdRot,
      birdFrame: this.birdFrame(),
      pipes,
      scrollX: toWorld(scrollX),
      score: this.score,
      bestScore: this.bestScore,
      medal: this.medal(),
      elapsed: this.elapsed,
      stateElapsed: this.elapsed - this.stateEnteredElapsed,
      isNewBest: this.isNewBest,
    };
  }

  get state() {
    return this.currentState;
  }

  get stateElapsed() {
    return this.elapsed - this.stateEnteredElapsed;
  }

  get publishedState() {
    return {
      state: this.currentState,
      score: this.score,
      bestScore: this.bestScore,
    };
  }

  beginRun() {
    this.runSeed = this.nextSeed ?? randomSeed53();
    this.prng = new SplitMix64(this.runSeed);
    this.playStep = 0;
    this.spawnCount = 0;
    this.flaps = [0];
    this.deathCause = null;
    this.diePending = false;
    this.birdY = 0;
    this.birdRot = 0;
    this.prevBirdY = 0;
    this.prevBirdRot = 0;
    this.birdGrounded = false;
    this.pipes = [];
    this.revivedAtStep = null;
    this.score = 0;
  }

  advancePipes() {
    const lastPipe = this.pipes[this.pipes.length - 1];
    const shouldSpawn = lastPipe
      ? PIPE_START_X - lastPipe.x >= PIPE_SPACING
      : this.playStep >= FIRST_PIPE_STEP;
    if (shouldSpawn) {
      this.pipes.push({
        x: PIPE_START_X,
        gapY: this.nextGapY(),
        halfGap: pipeHalfGapFor(this.simVersion, this.spawnCount),
        passed: false,
      });
      this.spawnCount += 1;
    }
    this.pipeScroll += SCROLL_STEP;

    for (const pipe of this.pipes) {
      pipe.x -= SCROLL_STEP;
      if (!pipe.passed && pipe.x <= 0) {
        pipe.passed = true;
        this.score += 1;
        this.emitSound("score");
      }
    }
    if (this.pipes.length > 0 && this.pipes[0].x < PIPE_END_X) this.pipes.shift();
  }

  nextGapY() {
    return this.prng.nextGapY();
  }

  checkPipeCollision() {
    for (const pipe of this.pipes) {
      const hitSide = checkPipeHit(this.birdY, pipe);
      if (hitSide !== null) {
        this.deathCause = hitSide === "top" ? "pipeTop" : "pipeBottom";
        this.emitSound("hit");
        this.diePending = true;
        this.dieSince = this.elapsed;
        this.transition("gameover");
        return;
      }
    }
  }

  medal() {
    if (this.currentState !== "gameover") return null;
    if (this.score >= 40) return "platinum";
    if (this.score >= 30) return "gold";
    if (this.score >= 20) return "silver";
    if (this.score >= 10) return "bronze";
    return null;
  }

  birdFrame() {
    if (this.currentState === "gameover") return 2;
    const phase = Math.floor(this.animationTimer / FLAP_FRAME_PERIOD) % 4;
    return phase === 0 ? 0 : phase === 2 ? 2 : 1;
  }

  reset() {
    this.birdY = 0;
    this.birdVy = 0;
    this.birdRot = 0;
    this.birdGrounded = false;
    this.prevBirdY = 0;
    this.prevBirdRot = 0;
    this.prevPipeScroll = this.pipeScroll;
    this.pipes = [];
    this.score = 0;
    this.isNewBest = false;
    this.diePending = false;
  }

  transition(nextState) {
    if (nextState === "gameover" && this.score > this.bestScore) {
      this.bestScore = this.score;
      this.isNewBest = true;
      for (const listener of this.bestScoreListeners) listener(this.bestScore);
    }
    this.currentState = nextState;
    this.stateEnteredElapsed = this.elapsed;
  }

  emitSound(effect) {
    for (const listener of this.soundListeners) listener(effect);
  }
}

// -------------------------------------------------- Royale mode & bots ---

const BOT_ADJECTIVES = [
  "Zippy", "Peppy", "Perky", "Jumpy", "Lofty", "Windy", "Sunny", "Misty",
  "Foggy", "Gusty", "Brisk", "Swift", "Quick", "Rapid", "Zoomy", "Turbo",
  "Hyper", "Mega", "Super", "Ultra", "Epic", "Retro", "Pixel", "Neon",
  "Gold", "Shiny", "Sleek", "Slick", "Sassy", "Zesty", "Spicy", "Gutsy",
  "Brave", "Bold", "Wild", "Fiery", "Solar", "Lunar", "Astro", "Nova",
  "Star", "Storm", "Downy", "Fuzzy", "Tiny", "Micro", "Mini", "Itty",
  "Jolly", "Merry", "Happy", "Lucky", "Dizzy", "Loopy", "Goofy", "Wacky",
  "Zany", "Nutty", "Agile", "Deft", "Spry", "Fleet", "High", "Soar",
  "Glide", "Flick", "Whirl", "Twirl", "Swoop", "Dive", "Loop", "Zig",
  "Zag", "Boop", "Bonk", "Early", "Night", "Dusk", "Royal", "Regal",
  "Noble", "Fancy", "Dandy", "Jazzy", "Funky", "Rocky", "Vivid", "Aero",
  "Sky", "Cloud", "Air", "Puffy", "Wavy", "Curly", "Amber", "Azure",
  "Coral", "Mango", "Berry", "Lemon", "Minty", "Candy", "Honey", "Pearl",
  "Ruby", "Opal", "Jade", "Onyx", "Topaz", "Cozy", "Zen", "Calm",
];

const BOT_NOUNS = [
  "Bird", "Birdie", "Finch", "Wren", "Robin", "Hawk", "Eagle", "Falcon",
  "Owl", "Owlet", "Chick", "Peep", "Pip", "Pippin", "Egg", "Beak",
  "Wing", "Plume", "Quill", "Talon", "Crest", "Perch", "Roost", "Flock",
  "Flyer", "Glider", "Dodo", "Kiwi", "Emu", "Toucan", "Parrot", "Macaw",
  "Budgie", "Canary", "Dove", "Pigeon", "Crow", "Raven", "Magpie", "Jay",
  "Cuckoo", "Lark", "Pipit", "Plover", "Puffin", "Petrel", "Tern", "Gull",
  "Heron", "Crane", "Stork", "Ibis", "Egret", "Osprey", "Merlin", "Condor",
  "Roc", "Piper", "Hopper", "Jumper", "Dasher", "Zoomer", "Racer", "Pilot",
  "Ace", "Rocket", "Jet", "Comet", "Breeze", "Gust", "Zephyr", "Wisp",
  "Chirp", "Tweet", "Cheep", "Squawk", "Trill", "Melody", "Nugget", "Waddle",
  "Wobble", "Bobble", "Noodle", "Doodle", "Peck", "Duck", "Goose", "Swan",
  "Hen", "Loon", "Grouse", "Quail", "Pipe", "Floof", "Birb", "Winger",
  "Flappy", "Diver", "Swoosh", "Bounce", "Hover", "Halo", "Vortex", "Streak",
  "Bolt", "Dart", "Arrow", "Zoomie", "Boost", "Nimbus", "Cirrus", "Spiral",
];

const NAME_NUMBER_MODULO = 10000;
const FEISTEL_ROUNDS = 4;
const FEISTEL_DEFAULT_KEY = 1179402576;

function totalBotNameCount() {
  return BOT_ADJECTIVES.length * BOT_NOUNS.length * NAME_NUMBER_MODULO;
}

function mixU32(value) {
  value = (value ^ (value >>> 16)) >>> 0;
  value = Math.imul(value, 2246822507) >>> 0;
  value = (value ^ (value >>> 13)) >>> 0;
  value = Math.imul(value, 3266489909) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

function deriveFeistelKeys(seed) {
  const keys = [];
  for (let round = 0; round < FEISTEL_ROUNDS; round++) {
    keys.push(mixU32((seed ^ Math.imul(2654435769, round + 1)) >>> 0));
  }
  return keys;
}

function evenBitCeiling(domainSize) {
  let bits = 1;
  while (Math.pow(2, bits) < domainSize) bits++;
  if (bits % 2 === 1) bits++;
  if (bits > 52) throw new Error("domain too large for JS numbers");
  return bits;
}

function feistelPermuteOnce(value, halfRadix, roundKeys) {
  let left = Math.floor(value / halfRadix);
  let right = value % halfRadix;
  for (const key of roundKeys) {
    const next = (left + mixU32((right ^ key) >>> 0)) % halfRadix;
    left = right;
    right = next;
  }
  return left * halfRadix + right;
}

function permuteNameIndex(index, key = FEISTEL_DEFAULT_KEY) {
  const domain = totalBotNameCount();
  if (!Number.isInteger(index) || index < 0 || index >= domain) {
    throw new RangeError(`index must be an integer in [0, ${domain})`);
  }
  const bits = evenBitCeiling(domain);
  const halfRadix = Math.pow(2, bits / 2);
  const roundKeys = deriveFeistelKeys(key >>> 0);
  let candidate = index;
  do {
    candidate = feistelPermuteOnce(candidate, halfRadix, roundKeys);
  } while (candidate >= domain);
  return candidate;
}

function formatBotName(encoded) {
  const digits = encoded % NAME_NUMBER_MODULO;
  const rest = Math.floor(encoded / NAME_NUMBER_MODULO);
  const nounIdx = rest % BOT_NOUNS.length;
  const adjIdx = Math.floor(rest / BOT_NOUNS.length);
  return BOT_ADJECTIVES[adjIdx] + BOT_NOUNS[nounIdx] + String(digits).padStart(4, "0");
}

function randomBotName(randomFn = Math.random, key = FEISTEL_DEFAULT_KEY) {
  return formatBotName(permuteNameIndex(Math.floor(randomFn() * totalBotNameCount()), key));
}

const WORLD_SCROLL_STEP = toWorld(SCROLL_STEP);
const OFFSCREEN_LEFT_X = -1.6;
const BUS_DROP_BLEND_STEPS = 14;

class RoyaleBot {
  constructor(name, tint, pilot, seed, simVersion, hopStep) {
    this.name = name;
    this.tint = tint;
    this.pilot = pilot;
    this.hopStep = hopStep;
    this.game = new FlappyGame(0);
    this.game.seedPipes(seed, simVersion);
    this.x = -hopStep * WORLD_SCROLL_STEP;
    this.prevX = this.x;
  }

  name;
  tint;
  pilot;
  hopStep;
  game;
  stepIndex = 0;
  x;
  prevX;
  prevY = 0;
  prevRot = 0;
  // post-step snapshot, refreshed once per simulated step: rendering reads it
  // instead of building a fresh one per bot per frame
  snap = null;
  hopped = false;
  dead = false;
  finished = false;
  needsSync = false;

  get alive() {
    return !this.dead;
  }

  advance(matchStep) {
    if (this.finished) return null;
    if (!this.hopped) {
      if (matchStep < this.hopStep) return null;
      this.hopped = true;
      this.game.flap();
    }

    const snap = this.game.snapshot;
    this.prevY = snap.birdY;
    this.prevRot = snap.birdRot;
    this.prevX = this.x;

    if (this.dead) {
      this.game.step(SIM_DT);
      this.x -= WORLD_SCROLL_STEP;
      if (this.x < OFFSCREEN_LEFT_X) this.finished = true;
      this.snap = this.game.snapshot;
      return null;
    }

    if (this.pilot.wantsFlap(snap, this.stepIndex)) this.game.flap();
    this.game.step(SIM_DT);
    this.stepIndex += 1;
    this.snap = this.game.snapshot;

    const pub = this.game.publishedState;
    if (pub.state === "gameover") {
      this.dead = true;
      return { name: this.name, score: pub.score };
    }
    return null;
  }

  view(interpStep, alpha, busY) {
    if (!this.hopped || this.finished || !this.snap) return null;
    const snap = this.snap;
    let y = lerp(this.prevY, snap.birdY, alpha);
    const stepsSinceHop = interpStep - this.hopStep;
    if (stepsSinceHop < BUS_DROP_BLEND_STEPS) {
      const t = Math.max(stepsSinceHop / BUS_DROP_BLEND_STEPS, 0);
      y = busY * (1 - t) + y * t;
    }
    return {
      x: lerp(this.prevX, this.x, alpha),
      y,
      rot: lerp(this.prevRot, snap.birdRot, alpha),
      frame: snap.birdFrame,
      alive: !this.dead,
      tint: this.tint,
    };
  }
}

const AIM_DROP_CLEARANCE = 0.1;
const BLUNDER_EXTRA_MIN = 0.05;
const BLUNDER_EXTRA_SPAN = 0.06;
const PIPE_PASSED_X = -0.15;
const LOOKAHEAD_X = 0.2;
const URGENT_CLIMB_DELTA = 0.18;
const EXIT_TOP_CLEARANCE = 0.2;
const EXIT_BOTTOM_CLEARANCE = 0.06;
const BIRD_MARGIN = 0.07;
const ACE_BOT_SKILL_CAP = 0.15;
const BLUNDER_BASE = 0.02;
const BLUNDER_SCALE = 0.06;
const LATENCY_MIN_STEPS = 4;
const LATENCY_SPAN_STEPS = 8;
const LATENCY_JITTER_STEPS = 3;
const URGENT_MIN_LATENCY = 2;
const AIM_BIAS_MAX = 0.04;
const AIM_BIAS_FLOOR = 0.3;
const WOBBLE_BASE = 0.015;
const WOBBLE_SPAN = 0.035;
const HOVER_MIN_Y = -0.25;
const HOVER_SPAN_Y = 0.5;

function createBotProfile(rng, botIndex) {
  const unit = () => rng.nextFraction() / FP_SCALE;
  const skill = botIndex === 0 ? unit() * ACE_BOT_SKILL_CAP : unit();
  return {
    blunderChance: BLUNDER_BASE + BLUNDER_SCALE * skill * skill,
    latencyBase: LATENCY_MIN_STEPS + Math.round(skill * LATENCY_SPAN_STEPS),
    latencyJitter: LATENCY_JITTER_STEPS,
    aimBias: (unit() * 2 - 1) * AIM_BIAS_MAX * (AIM_BIAS_FLOOR + (1 - AIM_BIAS_FLOOR) * skill),
    wobbleRange: WOBBLE_BASE + WOBBLE_SPAN * skill,
    hoverTarget: HOVER_MIN_Y + unit() * HOVER_SPAN_Y,
  };
}

class BotPilot {
  constructor(rng, profile) {
    this.rng = rng;
    this.profile = profile;
  }

  rng;
  profile;
  pendingFlapStep = null;
  aimOrdinal = -1;
  pipeOffset = 0;
  prevY = 0;

  resetAim() {
    this.aimOrdinal = -1;
    this.pendingFlapStep = null;
  }

  wantsFlap(snap, stepIndex) {
    const aim = this.resolveAim(snap);
    if (aim.aimedPipe && aim.ordinal !== this.aimOrdinal) {
      this.aimOrdinal = aim.ordinal;
      this.pipeOffset = this.rollPipeOffset(aim.aimedPipe, snap.score);
    }

    const targetY = aim.target ?? this.profile.hoverTarget;
    const estVy = (snap.birdY - this.prevY) * SIM_HZ;
    const descending = snap.birdY <= this.prevY;
    this.prevY = snap.birdY;

    if (this.pendingFlapStep !== null) {
      if (stepIndex >= this.pendingFlapStep) {
        this.pendingFlapStep = null;
        return true;
      }
      return false;
    }

    const latency =
      targetY - snap.birdY > URGENT_CLIMB_DELTA
        ? Math.max(URGENT_MIN_LATENCY, this.profile.latencyBase >> 1)
        : this.profile.latencyBase;

    if (descending && this.predictedY(snap.birdY, estVy, latency) < targetY) {
      this.pendingFlapStep =
        stepIndex + latency + Math.floor(this.fraction() * this.profile.latencyJitter);
    }
    return false;
  }

  resolveAim(snap) {
    const pipes = snap.pipes;
    let idx = 0;
    while (idx < pipes.length && pipes[idx].x <= PIPE_PASSED_X) idx += 1;
    const current = idx < pipes.length ? pipes[idx] : null;
    if (!current) return { target: null, ordinal: -1, aimedPipe: null };

    const next = idx + 1 < pipes.length ? pipes[idx + 1] : null;
    const currentOrdinal = snap.score + (current.x > 0 ? 1 : 0);
    const lookAhead = next !== null && current.x < LOOKAHEAD_X;
    const chosen = lookAhead ? next : current;
    const ordinal = lookAhead ? currentOrdinal + 1 : currentOrdinal;

    let target = chosen.gapY + this.profile.aimBias + this.pipeOffset - AIM_DROP_CLEARANCE;
    if (lookAhead) {
      const ceiling = current.gapY + current.halfGap - EXIT_TOP_CLEARANCE - BIRD_MARGIN;
      const floor = current.gapY - current.halfGap + EXIT_BOTTOM_CLEARANCE + BIRD_MARGIN;
      target = Math.min(Math.max(target, floor), ceiling);
    }
    return { target, ordinal, aimedPipe: chosen };
  }

  predictedY(birdY, vy, latencySteps) {
    const dt = (latencySteps + this.profile.latencyJitter / 2) / SIM_HZ;
    return birdY + vy * dt - (SIM_CONFIG.gravity / 2) * dt * dt;
  }

  rollPipeOffset(pipe, score = 0) {
    const blunderProb = Math.min(0.35, this.profile.blunderChance + score * 0.002);
    if (this.fraction() < blunderProb) {
      const sign = this.fraction() < 0.5 ? 1 : -1;
      return sign * (pipe.halfGap + BLUNDER_EXTRA_MIN + this.fraction() * BLUNDER_EXTRA_SPAN);
    }
    return (this.fraction() * 2 - 1) * this.profile.wobbleRange;
  }

  fraction() {
    return this.rng.nextFraction() / FP_SCALE;
  }
}

const ROYALE_BOT_COUNT = 29;
const FIRST_HOP_STEP = 10;
const LAST_HOP_STEP = 150;
const HOP_JITTER_STEPS = 4;
const NAME_DEDUP_TRIES = 8;
const FEED_MAX_AGE_SECONDS = 2.8;
const FEED_MAX_ITEMS = 3;
const BUS_ALTITUDE_Y = 0.9;
const BOT_TINTS = [
  "#ffc9c9",
  "#c9e0ff",
  "#d6ffc9",
  "#ffedc2",
  "#e6ccff",
  "#c9fff1",
  "#ffd9f2",
  "#e0e0e0",
];

function createBotRng(matchSeed, botIndex) {
  return new SplitMix64(matchSeed ^ ((BigInt(botIndex + 1) * SM64_MIX2) & U64_MASK));
}

function uniqueBotName(rng, usedNames) {
  const roll = () => randomBotName(() => rng.nextFraction() / FP_SCALE);
  let name = roll();
  for (let attempt = 0; attempt < NAME_DEDUP_TRIES && usedNames.has(name); attempt += 1) {
    name = roll();
  }
  usedNames.add(name);
  return name;
}

class RoyaleMatch {
  totalBirds = ROYALE_BOT_COUNT + 1;
  bots = [];
  feed = [];
  stepCount = 0;
  fieldSource = null;

  constructor(seed, simVersion) {
    const usedNames = new Set();
    const hopStride = (LAST_HOP_STEP - FIRST_HOP_STEP) / (ROYALE_BOT_COUNT - 1);
    for (let i = 0; i < ROYALE_BOT_COUNT; i += 1) {
      const rng = createBotRng(seed, i);
      const name = uniqueBotName(rng, usedNames);
      const profile = createBotProfile(rng, i);
      const hopStep =
        FIRST_HOP_STEP +
        Math.round(i * hopStride) +
        Math.floor((rng.nextFraction() / FP_SCALE) * HOP_JITTER_STEPS);
      this.bots.push(
        new RoyaleBot(
          name,
          BOT_TINTS[i % BOT_TINTS.length],
          new BotPilot(rng, profile),
          seed,
          simVersion,
          hopStep,
        ),
      );
    }
  }

  get steps() {
    return this.stepCount;
  }

  advance() {
    this.stepCount += 1;
    for (const bot of this.bots) {
      const elimination = bot.advance(this.stepCount);
      if (elimination) this.feed.push({ ...elimination, step: this.stepCount });
    }
    this.applyResync();
  }

  resync(game) {
    this.fieldSource = game;
    for (const bot of this.bots) {
      if (!bot.dead) bot.needsSync = true;
    }
    this.applyResync();
  }

  applyResync() {
    const source = this.fieldSource;
    if (!source) return;
    let waitingOnBus = false;
    for (const bot of this.bots) {
      if (!bot.needsSync) continue;
      if (bot.dead) {
        bot.needsSync = false;
        continue;
      }
      if (!bot.hopped) {
        waitingOnBus = true;
        continue;
      }
      const shiftX = bot.hopStep * SCROLL_STEP;
      bot.game.pipes = source.pipes.map((pipe) => {
        const x = pipe.x + shiftX;
        return {
          x,
          gapY: pipe.gapY,
          halfGap: pipe.halfGap,
          // what advancePipes() scores by: a pipe at or behind the bird is
          // behind it and must not be scored a second time
          passed: x <= 0,
        };
      });
      // The bot flies the player's field from here on, so its step counter runs
      // on the player's clock too: that counter gates the first pipe while the
      // field is still empty, and a bot that had only just hopped would
      // otherwise idle through a second and a half of empty sky. (This used to
      // write a `pipeTimer`, a member the engine no longer has.)
      bot.game.playStep = source.playStep;
      bot.game.spawnCount = source.spawnCount;
      bot.game.prng.state = source.prng.state;
      bot.pilot.resetAim();
      bot.needsSync = false;
    }
    if (!waitingOnBus) this.fieldSource = null;
  }

  aliveBotCount() {
    let alive = 0;
    for (const bot of this.bots) if (bot.alive) alive += 1;
    return alive;
  }

  views(alpha) {
    const interpStep = Math.max(this.stepCount - 1 + alpha, 0);
    const out = [];
    for (const bot of this.bots) {
      const view = bot.view(interpStep, alpha, BUS_ALTITUDE_Y);
      if (view) out.push(view);
    }
    return out;
  }

  busX(alpha) {
    const x = -Math.max(this.stepCount - 1 + alpha, 0) * WORLD_SCROLL_STEP;
    return x < OFFSCREEN_LEFT_X ? null : x;
  }

  recentFeed() {
    const out = [];
    for (let i = this.feed.length - 1; i >= 0 && out.length < FEED_MAX_ITEMS; i -= 1) {
      const entry = this.feed[i];
      const ageSeconds = (this.stepCount - entry.step) / SIM_HZ;
      if (ageSeconds > FEED_MAX_AGE_SECONDS) break;
      out.push({ name: entry.name, score: entry.score, ageSeconds });
    }
    return out;
  }
}

function isRoyaleUrl() {
  return typeof window > "u"
    ? false
    : new URLSearchParams(window.location.search).has("royale");
}

const WIN_BANNER_SECONDS = 3;

class RoyaleController {
  constructor(game) {
    this.game = game;
    this.active = isRoyaleUrl();
    if (this.active) window.__royale = this;
  }

  game;
  active;
  match = null;
  prevState = "getready";
  placement = null;
  winAtStep = null;

  aliveBots() {
    return this.match?.aliveBotCount() ?? 0;
  }

  matchSteps() {
    return this.match?.steps ?? 0;
  }

  afterStep() {
    if (!this.active) return;
    const state = this.game.publishedState.state;
    if (state === "play") {
      const revivedFromGameOver = this.prevState === "gameover";
      if (this.prevState === "getready" || !this.match) this.beginMatch();
      else this.placement = null;

      const match = this.match;
      if (match) {
        if (revivedFromGameOver) match.resync(this.game);
        match.advance();
        if (this.winAtStep === null && match.aliveBotCount() === 0) {
          this.winAtStep = match.steps;
        }
      }
    } else if (state === "gameover" && this.prevState === "play" && this.match) {
      this.placement = this.winAtStep !== null ? 1 : this.match.aliveBotCount() + 1;
    }
    this.prevState = state;
  }

  frameView(alpha, snap) {
    if (!this.active) return null;
    if (snap.state === "getready" || !this.match) {
      return {
        bots: [],
        bus: { x: 0, y: BUS_ALTITUDE_Y },
        birdsLeft: this.match?.totalBirds ?? 30,
        totalBirds: this.match?.totalBirds ?? 30,
        feed: [],
        placement: null,
        winBanner: false,
        inPlay: false,
      };
    }
    const match = this.match;
    const inPlay = snap.state === "play";
    const currentBusX = match.busX(alpha);
    return {
      bots: match.views(alpha),
      bus: currentBusX === null ? null : { x: currentBusX, y: BUS_ALTITUDE_Y },
      birdsLeft: match.aliveBotCount() + (inPlay ? 1 : 0),
      totalBirds: match.totalBirds,
      feed: match.recentFeed(),
      placement: snap.state === "gameover" ? this.placement : null,
      winBanner:
        inPlay &&
        this.winAtStep !== null &&
        (match.steps - this.winAtStep) / SIM_HZ < WIN_BANNER_SECONDS,
      inPlay,
    };
  }

  beginMatch() {
    this.match = new RoyaleMatch(this.game.currentSeed, this.game.runSimVersion);
    this.placement = null;
    this.winAtStep = null;
  }
}

const BOT_ALIVE_ALPHA = 0.5;
const BOT_DEAD_ALPHA = 0.35;
const BUS_BOB_AMPLITUDE = 0.015;
const BUS_BOB_FREQ = 3;
const BUS_OUTLINE_COLOR = "#33323a";
const BUS_BODY_COLOR = "#f5f5ef";
const BUS_STRIPE_COLOR = "#e0453a";
const BUS_WINDOW_COLOR = "#a8e6f0";

function renderRoyaleWorld(ctx, renderer, view, frameW, elapsed) {
  ctx.save();
  ctx.translate(-computeWorldLeadX(frameW), 0);
  if (view.bus) {
    drawRoyaleBus(ctx, view.bus.x, view.bus.y + Math.sin(elapsed * BUS_BOB_FREQ) * BUS_BOB_AMPLITUDE);
  }
  for (const bot of view.bots) {
    ctx.globalAlpha = bot.alive ? BOT_ALIVE_ALPHA : BOT_DEAD_ALPHA;
    renderer.drawSprite(ctx, BIRD_SPRITE_KEYS[bot.frame], bot.x, bot.y, {
      rot: bot.rot,
      tint: bot.tint,
    });
  }
  ctx.restore();
}

function drawRoyaleBus(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = BUS_OUTLINE_COLOR;
  ctx.fillRect(x - 0.18, y - 0.1, 0.36, 0.2);
  ctx.fillStyle = BUS_BODY_COLOR;
  ctx.fillRect(x - 0.17, y - 0.09, 0.34, 0.18);
  ctx.fillStyle = BUS_STRIPE_COLOR;
  ctx.fillRect(x - 0.17, y - 0.035, 0.34, 0.035);
  ctx.fillStyle = BUS_WINDOW_COLOR;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(x - 0.13 + i * 0.1, y + 0.015, 0.06, 0.05);
  }
  ctx.restore();
}

function renderRoyaleHud(ctx, view, frameW, frameH) {
  ctx.save();
  const leftX = -frameW / 2 + 0.06;
  const topY = frameH / 2 - 0.3;
  if (view.inPlay) {
    drawText(ctx, `${view.birdsLeft}/${view.totalBirds} LEFT`, leftX, topY, 0.07, "left");
    view.feed.forEach((entry, idx) => {
      ctx.globalAlpha = Math.max(0, 1 - entry.ageSeconds / FEED_MAX_AGE_SECONDS);
      drawText(
        ctx,
        `${entry.name} OUT (${entry.score})`,
        leftX,
        topY - 0.1 - idx * 0.08,
        0.05,
        "left",
      );
    });
    ctx.globalAlpha = 1;
  }
  if (view.winBanner) {
    drawText(ctx, "LAST BIRD FLYING!", 0, 0.6, 0.11, "center");
  }
  if (view.placement !== null) {
    drawText(
      ctx,
      `PLACED #${view.placement} OF ${view.totalBirds}`,
      0,
      frameH / 2 - 0.32,
      0.1,
      "center",
    );
  }
  ctx.restore();
}

// -------------------------------------------------- camera & frame timing ---

const MAX_ASPECT_RATIO = 3 / 4;
const SKY_COLOR = "#4EC0CA";
const LETTERBOX_COLOR = "#111111";

class Camera {
  constructor(worldW, worldH) {
    this.worldW = worldW;
    this.worldH = worldH;
    this.maxFrameW = worldH * MAX_ASPECT_RATIO;
  }

  worldW;
  worldH;
  pixelsPerUnit = 1;
  offsetX = 0;
  offsetY = 0;
  frameW = 0;
  frameH = 0;
  framePxW = 0;
  framePxH = 0;
  canvasW = 0;
  canvasH = 0;
  safeBottomY = 0;
  dpr = 1;
  maxFrameW;

  handleResize(viewW, viewH, dpr, safeBottomPx = 0) {
    this.dpr = dpr;
    this.canvasW = Math.max(1, Math.round(viewW * dpr));
    this.canvasH = Math.max(1, Math.round(viewH * dpr));
    this.pixelsPerUnit = Math.min(this.canvasW / this.worldW, this.canvasH / this.worldH);
    this.frameW = Math.min(this.canvasW / this.pixelsPerUnit, this.maxFrameW);
    this.frameH = this.canvasH / this.pixelsPerUnit;
    this.framePxW = this.frameW * this.pixelsPerUnit;
    this.framePxH = this.frameH * this.pixelsPerUnit;
    this.offsetX = (this.canvasW - this.framePxW) / 2;
    this.offsetY = (this.canvasH - this.framePxH) / 2;
    this.safeBottomY = -this.frameH / 2 + (safeBottomPx * dpr) / this.pixelsPerUnit;
  }

  setupContext(ctx) {
    ctx.resetTransform();
    if (this.offsetX >= 1) {
      ctx.fillStyle = LETTERBOX_COLOR;
      ctx.fillRect(0, 0, this.canvasW, this.canvasH);
    }

    ctx.save();
    ctx.translate(Math.round(this.offsetX), Math.round(this.offsetY));

    const frameWidth = Math.round(this.framePxW);
    const frameHeight = Math.round(this.framePxH);
    ctx.beginPath();
    if (this.offsetX >= 1) {
      const radius = Math.min(frameWidth, frameHeight) * 0.035;
      ctx.moveTo(radius, 0);
      ctx.lineTo(frameWidth - radius, 0);
      ctx.quadraticCurveTo(frameWidth, 0, frameWidth, radius);
      ctx.lineTo(frameWidth, frameHeight - radius);
      ctx.quadraticCurveTo(frameWidth, frameHeight, frameWidth - radius, frameHeight);
      ctx.lineTo(radius, frameHeight);
      ctx.quadraticCurveTo(0, frameHeight, 0, frameHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, frameWidth, frameHeight);
    }
    ctx.clip();

    ctx.fillStyle = SKY_COLOR;
    ctx.fillRect(0, 0, this.framePxW, this.framePxH);
    ctx.translate(this.framePxW / 2, this.framePxH / 2);
    ctx.scale(this.pixelsPerUnit, -this.pixelsPerUnit);
  }

  restoreContext(ctx) {
    ctx.restore();
  }

  screenToWorld(clientX, clientY) {
    const pxX = clientX * this.dpr - this.offsetX - this.framePxW / 2;
    const pxY = clientY * this.dpr - this.offsetY - this.framePxH / 2;
    return { x: pxX / this.pixelsPerUnit, y: -pxY / this.pixelsPerUnit };
  }
}

class ScreenShake {
  remaining = 0;

  trigger() {
    this.remaining = SHAKE_DURATION;
  }

  advance(dt) {
    this.remaining = Math.max(0, this.remaining - dt);
    if (this.remaining === 0) return { x: 0, y: 0 };
    const decay = this.remaining / SHAKE_DURATION;
    const phase = (1 - decay) * SHAKE_CYCLES * 2 * Math.PI;
    return {
      x: Math.sin(phase) * SHAKE_AMPLITUDE * decay,
      y: Math.cos(phase * SHAKE_Y_RATIO) * SHAKE_AMPLITUDE * SHAKE_Y_RATIO * decay,
    };
  }
}

class FixedTimestep {
  constructor(step, maxFrameSeconds) {
    this.step = step;
    this.maxFrameSeconds = maxFrameSeconds;
  }

  step;
  maxFrameSeconds;
  accumulator = 0;

  advance(dt) {
    if (dt > this.maxFrameSeconds) {
      this.accumulator = 0;
      return 0;
    }
    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= this.step) {
      this.accumulator -= this.step;
      steps++;
    }
    return steps;
  }

  reset() {
    this.accumulator = 0;
  }

  get alpha() {
    return this.accumulator / this.step;
  }
}

const RENDER_SCALE_STEPS = [1, 0.85, 0.7, 0.55];
const MIN_FRAME_SECONDS = 1 / 165;
const MISS_MULTIPLIER = 1.6;
const WINDOW_MIN_SECONDS = 2.5;
const WINDOW_MIN_FRAMES = 60;
const MISS_THRESHOLD = 0.08;

class DynamicRenderScale {
  stepIndex = 0;
  windowFastest = Infinity;
  windowSeconds = 0;
  windowFrames = 0;
  windowMisses = 0;
  lastWindowBad = false;

  get scale() {
    return RENDER_SCALE_STEPS[this.stepIndex];
  }

  record(dt) {
    if (dt <= 0) return false;
    if (dt < this.windowFastest) this.windowFastest = Math.max(dt, MIN_FRAME_SECONDS);
    this.windowSeconds += dt;
    this.windowFrames += 1;
    if (dt > this.windowFastest * MISS_MULTIPLIER) this.windowMisses += 1;
    if (this.windowSeconds < WINDOW_MIN_SECONDS || this.windowFrames < WINDOW_MIN_FRAMES) {
      return false;
    }

    const missRatio = this.windowMisses / this.windowFrames;
    this.windowFastest = Infinity;
    this.windowSeconds = 0;
    this.windowFrames = 0;
    this.windowMisses = 0;

    const bad = missRatio > MISS_THRESHOLD;
    if (!bad || !this.lastWindowBad || this.stepIndex >= RENDER_SCALE_STEPS.length - 1) {
      this.lastWindowBad = bad;
      return false;
    }
    this.lastWindowBad = false;
    this.stepIndex += 1;
    return true;
  }
}

// -------------------------------------------------- input & audio engine ---

class InputRouter {
  constructor(game, camera, actions) {
    this.game = game;
    this.camera = camera;
    this.actions = actions;
  }

  game;
  camera;
  actions;
  pressedGameOverButton = null;

  currentGameOverLayout() {
    return computeGameOverLayout(this.camera.frameW, this.camera.safeBottomY);
  }

  handlePointerDown(clientX, clientY) {
    const world = this.camera.screenToWorld(clientX, clientY);
    const state = this.game.state;
    if (state === "getready") {
      this.pressedGameOverButton = null;
      if (hitTestSoundToggle(world.x, world.y, this.camera.frameW, this.camera.frameH)) {
        this.actions.onToggleMute();
      } else {
        this.game.flap();
      }
    } else if (state === "play") {
      this.pressedGameOverButton = null;
      this.game.flap();
    } else if (state === "gameover") {
      const hit = hitTestGameOverButtons(world.x, world.y, this.currentGameOverLayout());
      this.pressedGameOverButton = hit ? hit.kind : null;
    }
  }

  handlePointerUp(clientX, clientY) {
    const pressed = this.pressedGameOverButton;
    this.pressedGameOverButton = null;
    if (this.game.state !== "gameover" || !pressed) return;
    const world = this.camera.screenToWorld(clientX, clientY);
    const hit = hitTestGameOverButtons(world.x, world.y, this.currentGameOverLayout());
    if (!hit || hit.kind !== pressed || !this.gameOverButtonsActive()) return;
    if (hit.kind === "play") this.actions.onPlay();
    else this.actions.onRevive();
  }

  handlePointerCancel() {
    this.pressedGameOverButton = null;
  }

  handleKeyDown(code) {
    const state = this.game.state;
    if (state === "getready" || state === "play") {
      if (code === "Space" || code === "ArrowUp") this.game.flap();
    } else if (state === "gameover" && this.gameOverButtonsActive()) {
      if (code === "Space" || code === "Enter") this.actions.onPlay();
      else if (code === "KeyR") this.actions.onRevive();
    }
  }

  gameOverButtonsActive() {
    return this.game.stateElapsed >= BUTTONS_APPEAR_DELAY;
  }
}

class FrameLoop {
  constructor(onFrame) {
    this.onFrame = onFrame;
  }

  onFrame;
  frameId = 0;
  running = false;

  start() {
    if (!this.running) {
      this.running = true;
      this.scheduleNext();
    }
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  restart() {
    this.stop();
    this.start();
  }

  scheduleNext() {
    this.frameId = requestAnimationFrame(this.tick);
  }

  tick = (timestamp) => {
    if (this.running) {
      this.scheduleNext();
      this.onFrame(timestamp);
    }
  };
}

const MASTER_GAIN = 0.25;
const SOUND_URLS = {
  flap: "./audio/sfx_wing.mp3",
  score: "./audio/sfx_point.mp3",
  hit: "./audio/sfx_hit.mp3",
  die: "./audio/sfx_die.mp3",
  swoosh: "./audio/sfx_swooshing.mp3",
};

const decodedBuffers = {};
let audioCtx = null;
let masterGainNode = null;

const audioEngine = {
  ensureContext() {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      audioCtx = new Ctor();
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.value = MASTER_GAIN;
      masterGainNode.connect(audioCtx.destination);
    }
    return true;
  },

  resumeIfNeeded() {
    if (audioCtx && audioCtx.state !== "running") {
      audioCtx.resume().catch(() => {});
    }
  },

  async init() {
    if (!this.ensureContext()) return;
    const loads = Object.keys(SOUND_URLS).map(async (name) => {
      try {
        const raw = await (await fetch(SOUND_URLS[name])).arrayBuffer();
        decodedBuffers[name] = await audioCtx.decodeAudioData(raw);
      } catch (err) {
        console.error(`Failed to load audio: ${name}`, err);
      }
    });
    await Promise.all(loads);
  },

  play(name) {
    if (soundPrefs.getSnapshot() || !audioCtx || !masterGainNode || !decodedBuffers[name]) {
      return;
    }
    this.resumeIfNeeded();
    const source = audioCtx.createBufferSource();
    source.buffer = decodedBuffers[name];
    source.connect(masterGainNode);
    source.start(0);
  },

  chime() {
    // a muted player is exactly who used to get a loud chime out of the egg
    if (soundPrefs.getSnapshot() || !this.ensureContext() || !masterGainNode) return;
    this.resumeIfNeeded();
    const t0 = audioCtx.currentTime + 0.005;
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0, t0);
    envelope.gain.linearRampToValueAtTime(0.55, t0 + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
    envelope.connect(masterGainNode);

    [
      [1, 0.5, 2.2],
      [2.76, 0.26, 1.5],
      [5.4, 0.14, 1],
      [8.93, 0.07, 0.6],
    ].forEach(([harmonic, gain, decay], idx) => {
      const osc = audioCtx.createOscillator();
      const partialGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1480 * harmonic;
      partialGain.gain.setValueAtTime(gain, t0);
      partialGain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      osc.connect(partialGain);
      partialGain.connect(envelope);
      if (idx === 0) {
        osc.onended = () => envelope.disconnect();
      }
      osc.start(t0);
      osc.stop(t0 + decay + 0.05);
    });

    const noiseBuf = audioCtx.createBuffer(
      1,
      Math.ceil(audioCtx.sampleRate * 0.012),
      audioCtx.sampleRate,
    );
    const channel = noiseBuf.getChannelData(0);
    for (let i = 0; i < channel.length; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length) ** 3;
    }
    const noiseSource = audioCtx.createBufferSource();
    const highpass = audioCtx.createBiquadFilter();
    const noiseGain = audioCtx.createGain();
    noiseSource.buffer = noiseBuf;
    highpass.type = "highpass";
    highpass.frequency.value = 5000;
    noiseGain.gain.value = 0.4;
    noiseSource.connect(highpass);
    highpass.connect(noiseGain);
    noiseGain.connect(envelope);
    noiseSource.start(t0);
  },
};

// ------------------------------------------------------- app controller ---

const SCROLL_KEYS = new Set(["ArrowDown", "PageUp", "PageDown", "Home", "End"]);
const WORLD_WIDTH = 1.44;
const WORLD_HEIGHT = 2.56;
const MAX_FRAME_DT = 0.25;

class GameApp {
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Failed to acquire 2D rendering context");
    this.ctx = ctx;
    this.game = new FlappyGame(readStoredBestScore());
    this.royale = new RoyaleController(this.game);
    this.inputRouter = new InputRouter(this.game, this.camera, {
      onPlay: () => this.playOn(),
      onRevive: () => this.revive(),
      onToggleMute: () => this.handleMuteTap(),
    });
    this.frameLoop = new FrameLoop((timestamp) => this.frame(timestamp));
  }

  canvas;
  ctx;
  renderer = new SpriteRenderer();
  camera = new Camera(WORLD_WIDTH, WORLD_HEIGHT);
  game;
  royale;
  inputRouter;
  lastState = "getready";
  screenShake = new ScreenShake();
  timestep = new FixedTimestep(SIM_DT, MAX_FRAME_DT);
  renderScale = new DynamicRenderScale();
  frameLoop;
  lastTime = 0;
  paused = false;
  unsubscribeSound = () => {};
  unsubscribeBestScore = () => {};
  muteTapTimes = [];
  muteBeforeEgg = null;
  easterEgg = null;

  handleMuteTap() {
    if (this.easterEgg) return;
    const wasMuted = soundPrefs.getSnapshot();
    const now = performance.now();
    const taps = this.muteTapTimes;
    if (!taps.length || now - taps[taps.length - 1] > EGG_TAP_GAP) {
      this.muteTapTimes = [];
      this.muteBeforeEgg = wasMuted;
    }
    this.muteTapTimes.push(now);
    soundPrefs.setMuted(!wasMuted);
    if (this.muteTapTimes.length >= EGG_TAPS) {
      this.muteTapTimes = [];
      this.openEasterEgg();
    }
  }

  openEasterEgg() {
    if (!this.easterEgg) {
      this.easterEgg = { t: 0 };
      this.inputRouter.handlePointerCancel();
      audioEngine.chime();
    }
  }

  closeEasterEgg() {
    this.easterEgg = null;
    if (this.muteBeforeEgg !== null) {
      soundPrefs.setMuted(this.muteBeforeEgg);
      this.muteBeforeEgg = null;
    }
  }

  chooseEasterEgg(shouldSwitch) {
    this.closeEasterEgg();
    if (!shouldSwitch) return;
    audioEngine.play("swoosh");
    window.setTimeout(() => {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      if (this.royale.active) params.delete("royale");
      else params.set("royale", "");
      const query = params.toString().replace(/(^|&)royale=(?=&|$)/, "$1royale");
      url.search = query ? `?${query}` : "";
      window.location.assign(url.href);
    }, 180);
  }

  eggButtons() {
    const layout = eggLayout();
    return {
      x: 0,
      switchY: layout.centreY + layout.yesY,
      notNowY: layout.centreY + layout.noY,
      w: EGG_BUTTON_WIDTH,
      h: EGG_BUTTON_HEIGHT,
    };
  }

  easterEggPointer(clientX, clientY) {
    const world = this.camera.screenToWorld(clientX, clientY);
    const buttons = this.eggButtons();
    if (pointInRect(world.x, world.y, buttons.x, buttons.switchY, buttons.w, buttons.h)) {
      this.chooseEasterEgg(true);
    } else if (pointInRect(world.x, world.y, buttons.x, buttons.notNowY, buttons.w, buttons.h)) {
      this.chooseEasterEgg(false);
    }
  }

  playOn() {
    this.paused = false;
    this.game.restart();
  }

  reviveAvailable() {
    return this.game.state === "gameover" && !this.game.wasRevived;
  }

  revive() {
    if (this.reviveAvailable()) this.game.revive();
  }

  start() {
    this.renderer.loadAll().then(() => assetsLoadedStore.publish(true));
    schedulePostLoad(() => {
      audioEngine.init();
    });
    this.unsubscribeSound = this.game.onSound((effect) => audioEngine.play(effect));
    this.unsubscribeBestScore = this.game.onBestScoreChanged(writeStoredBestScore);
    window.__game = this.game;
    window.__ui = this;
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
    this.handleResize();
    this.lastTime = performance.now();
    this.frameLoop.start();
  }

  dispose() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.frameLoop.stop();
    this.unsubscribeSound();
    this.unsubscribeBestScore();
  }

  handleResize = () => {
    const pixelScale = (window.devicePixelRatio || 1) * this.renderScale.scale;
    this.camera.handleResize(window.innerWidth, window.innerHeight, pixelScale, 0);
    if (this.canvas.width !== this.camera.canvasW) this.canvas.width = this.camera.canvasW;
    if (this.canvas.height !== this.camera.canvasH) this.canvas.height = this.camera.canvasH;
    const cssW = `${window.innerWidth}px`;
    const cssH = `${window.innerHeight}px`;
    if (this.canvas.style.width !== cssW) this.canvas.style.width = cssW;
    if (this.canvas.style.height !== cssH) this.canvas.style.height = cssH;
  };

  handleKeyDown = (event) => {
    const isFlapKey = event.code === "Space" || event.code === "ArrowUp";
    if (isFlapKey || (this.game.state === "play" && SCROLL_KEYS.has(event.code))) {
      event.preventDefault();
    }
    if (event.repeat) return;
    if (this.easterEgg) {
      if (event.code === "Enter" || event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        this.chooseEasterEgg(true);
      } else if (event.code === "Escape" || event.code === "KeyN") {
        this.chooseEasterEgg(false);
      }
      return;
    }
    if (event.code === "KeyP") {
      event.preventDefault();
      this.inputRouter.handlePointerCancel();
      this.paused = !this.paused;
      return;
    }
    if (!this.paused) this.inputRouter.handleKeyDown(event.code);
  };

  handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.inputRouter.handlePointerCancel();
      return;
    }
    this.lastTime = performance.now();
    this.timestep.reset();
    this.frameLoop.restart();
  };

  handlePointerDown = (event) => {
    if (this.paused) return;
    if (this.easterEgg) {
      this.easterEggPointer(event.clientX, event.clientY);
      return;
    }
    this.inputRouter.handlePointerDown(event.clientX, event.clientY);
    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
  };

  handlePointerUp = (event) => {
    if (!this.paused && !this.easterEgg) {
      this.inputRouter.handlePointerUp(event.clientX, event.clientY);
    }
  };

  handlePointerCancel = () => {
    this.inputRouter.handlePointerCancel();
  };

  frame = (timestamp) => {
    const dt = (timestamp - this.lastTime) / 1000;
    if (this.easterEgg && !this.paused) {
      this.easterEgg.t += Math.min(Math.max(dt, 0), 0.1);
    }
    this.lastTime = timestamp;

    if (!this.paused) {
      const steps = this.timestep.advance(dt);
      for (let i = 0; i < steps; i++) {
        this.game.step(SIM_DT);
        this.royale.afterStep();
      }
    }

    const snap = this.game.renderSnapshot(this.timestep.alpha);
    if (snap.state === "play" && !this.paused && this.renderScale.record(dt)) {
      this.handleResize();
    }
    if (snap.state === "gameover" && this.lastState !== "gameover") {
      this.handleResize();
      this.screenShake.trigger();
    }
    this.lastState = snap.state;
    gameStateStore.publish(this.game.publishedState);

    if (!this.renderer.isLoaded()) return;

    this.camera.setupContext(this.ctx);
    const shake = this.screenShake.advance(this.paused ? 0 : dt);
    const royaleView = this.royale.frameView(this.timestep.alpha, snap);

    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);
    renderWorld(this.ctx, this.renderer, snap, this.camera.frameW, this.camera.frameH, shake);
    if (royaleView) {
      renderRoyaleWorld(this.ctx, this.renderer, royaleView, this.camera.frameW, snap.elapsed);
    }
    this.ctx.restore();

    renderHud(
      this.ctx,
      this.renderer,
      snap,
      this.camera.frameW,
      this.camera.frameH,
      this.camera.safeBottomY,
      soundPrefs.getSnapshot(),
      this.reviveAvailable(),
    );
    if (royaleView) {
      renderRoyaleHud(this.ctx, royaleView, this.camera.frameW, this.camera.frameH);
    }
    if (this.easterEgg) {
      renderEasterEgg(
        this.ctx,
        this.renderer,
        this.camera.frameW,
        this.camera.frameH,
        this.easterEgg.t,
        this.royale.active,
      );
    }
    if (this.paused) {
      drawText(this.ctx, "PAUSED", -this.camera.frameW / 2 + 0.08, -0.62, 0.075, "left");
      drawText(this.ctx, "P TO RESUME", -this.camera.frameW / 2 + 0.08, -0.69, 0.045, "left");
    }
    this.camera.restoreContext(this.ctx);
  };
}

// ------------------------------------------------------------ bootstrap ---

function mountApp(root) {
  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.touchAction = "none";

  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.dataset.loaded = String(assetsLoadedStore.getSnapshot());

  const logo = document.createElement("img");
  logo.className = "loading-overlay__logo";
  logo.src = bootLogoUrl();
  logo.alt = "Flappy Bird";

  const spinner = document.createElement("div");
  spinner.className = "loading-overlay__spinner";

  const label = document.createElement("div");
  label.className = "loading-overlay__label";
  label.textContent = "Loading…";

  overlay.append(logo, spinner, label);
  root.replaceChildren(canvas, overlay);

  const unsubscribeOverlay = assetsLoadedStore.subscribe(() => {
    overlay.dataset.loaded = String(assetsLoadedStore.getSnapshot());
  });

  const app = new GameApp(canvas);
  app.start();
  window.addEventListener(
    "pagehide",
    () => {
      unsubscribeOverlay();
      app.dispose();
    },
    { once: true },
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");
mountApp(rootElement);
