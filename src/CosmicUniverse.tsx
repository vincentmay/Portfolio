import { useEffect, useRef } from "react";
import { fillLogoCloud } from "./logoParticles";

type CloudStateName = "logo" | "orb" | "nebula" | "disk" | "burst";

type CloudState = {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
};

type ParticleCloud = {
  count: number;
  states: Record<CloudStateName, CloudState>;
  phase: Uint16Array;
  size: Float32Array;
  buckets: number[][];
};

type VisualKeyframe = {
  at: number;
  state: CloudStateName;
  x: number;
  y: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  alpha: number;
  noise: number;
  flare: number;
  dust: number;
  dustRing: number;
  glow: number;
};

type Star = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  size: number;
  bright: boolean;
};

const TAU = Math.PI * 2;
const SINE_STEPS = 512;
const SINE_MASK = SINE_STEPS - 1;
const LIGHT = "#f2f1e8";
const BRIGHT = "#fffef4";
const BURST_SPOKES = 36;

// The journey starts with the bare particle logo in the hero, then unfolds
// into the universe on scroll: a billowing nebula (work), a dense two-armed
// spiral galaxy (focus), a ringed orb (about), a radial burst on the way into
// contact, then back to the logo. Rest keyframes keep flare low; the high
// flare values sit only on the short morph spans, so overexposure, streaks
// and star flares happen at transitions and nowhere else. `glow` drives the
// soft nebula bloom per scene — near zero on the logo so the mark stays
// crisp, high on the cloud states. `dustRing` picks between the ringed
// dust texture (spiral-galaxy look, disk) and the shapeless one (nebula).
const VISUAL_KEYFRAMES: VisualKeyframe[] = [
  { at: 0, state: "logo", x: 0.72, y: 0.5, scale: 0.38, rotateX: 0.08, rotateY: -0.04, rotateZ: 0, alpha: 1, noise: 0.006, flare: 0.05, dust: 0.05, dustRing: 0.6, glow: 0.12 },
  { at: 0.55, state: "logo", x: 0.76, y: 0.47, scale: 0.32, rotateX: 0.14, rotateY: 0.06, rotateZ: 0, alpha: 0.8, noise: 0.009, flare: 0.06, dust: 0.12, dustRing: 0.4, glow: 0.12 },
  { at: 1.05, state: "nebula", x: 0.82, y: 0.36, scale: 0.5, rotateX: 0.3, rotateY: -0.2, rotateZ: 0.08, alpha: 0.72, noise: 0.02, flare: 0.46, dust: 0.75, dustRing: 0, glow: 0.85 },
  { at: 1.55, state: "nebula", x: 0.78, y: 0.42, scale: 0.56, rotateX: 0.26, rotateY: 0.14, rotateZ: 0.03, alpha: 0.62, noise: 0.018, flare: 0.08, dust: 0.82, dustRing: 0, glow: 0.8 },
  { at: 2.1, state: "disk", x: 0.74, y: 0.56, scale: 0.66, rotateX: 0.34, rotateY: -0.12, rotateZ: -0.05, alpha: 0.62, noise: 0.016, flare: 0.4, dust: 0.7, dustRing: 1, glow: 0.7 },
  { at: 2.6, state: "disk", x: 0.7, y: 0.52, scale: 0.58, rotateX: 0.3, rotateY: 0.08, rotateZ: 0.02, alpha: 0.55, noise: 0.014, flare: 0.07, dust: 0.72, dustRing: 1, glow: 0.62 },
  { at: 3.1, state: "orb", x: 0.55, y: 0.3, scale: 0.3, rotateX: 0.3, rotateY: 0.18, rotateZ: -0.06, alpha: 0.48, noise: 0.01, flare: 0.4, dust: 0.12, dustRing: 0.5, glow: 0.35 },
  { at: 3.55, state: "orb", x: 0.52, y: 0.32, scale: 0.36, rotateX: 0.26, rotateY: -0.1, rotateZ: 0.03, alpha: 0.42, noise: 0.009, flare: 0.08, dust: 0.12, dustRing: 0.5, glow: 0.32 },
  { at: 4.15, state: "burst", x: 0.62, y: 0.46, scale: 1.05, rotateX: 0.2, rotateY: 0.06, rotateZ: 0.12, alpha: 0.46, noise: 0.02, flare: 0.62, dust: 0, dustRing: 0, glow: 0.5 },
  { at: 4.6, state: "logo", x: 0.7, y: 0.5, scale: 0.36, rotateX: 0.1, rotateY: -0.05, rotateZ: 0, alpha: 0.56, noise: 0.007, flare: 0.1, dust: 0.2, dustRing: 0.5, glow: 0.18 },
  { at: 5, state: "logo", x: 0.72, y: 0.52, scale: 0.33, rotateX: 0.12, rotateY: 0.04, rotateZ: 0, alpha: 0.62, noise: 0.006, flare: 0.06, dust: 0.1, dustRing: 0.5, glow: 0.14 },
];

const SINE = Float32Array.from(
  { length: SINE_STEPS },
  (_, index) => Math.sin((index / SINE_STEPS) * TAU),
);

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function smoothstep(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function fract(value: number) {
  return value - Math.floor(value);
}

function seeded(index: number, salt: number) {
  return fract(Math.sin(index * 91.173 + salt * 47.719) * 43758.5453);
}

// Fixed off-center directions for transition streaks and star flares, so the
// same peaks always fire in the same places instead of a random particle soup.
const FLARE_ANCHORS = Array.from({ length: 7 }, (_, index) => ({
  angle: seeded(index, 40) * TAU,
  dist: 0.25 + seeded(index, 41) * 0.7,
  tilt: (seeded(index, 42) - 0.5) * 1.2,
  scale: 0.6 + seeded(index, 43) * 0.9,
  gate: (index / 7) * 0.8,
}));

// Soft cloud cores for the nebula state, strung along a tilted loop so the
// cloud reads as billowing smoke rather than a geometric shell.
const NEBULA_CLUMPS = Array.from({ length: 7 }, (_, index) => {
  const angle = (index / 7) * TAU;
  return {
    x: Math.cos(angle) * (0.22 + seeded(index, 60) * 0.42),
    y: (seeded(index, 61) - 0.5) * 0.4 + Math.sin(angle * 2) * 0.08,
    z: Math.sin(angle) * (0.18 + seeded(index, 62) * 0.3),
    size: 0.18 + seeded(index, 63) * 0.24,
  };
});

function makeState(count: number): CloudState {
  return {
    x: new Float32Array(count),
    y: new Float32Array(count),
    z: new Float32Array(count),
  };
}

function makeCloud(count: number): ParticleCloud {
  const names: CloudStateName[] = ["logo", "orb", "nebula", "disk", "burst"];
  const states = Object.fromEntries(
    names.map((name) => [name, makeState(count)]),
  ) as Record<CloudStateName, CloudState>;
  const phase = new Uint16Array(count);
  const size = new Float32Array(count);
  const buckets: number[][] = [[], [], [], []];
  const orbRings = [0.3, 0.46, 0.62, 0.78];

  // logo — the mark itself: star wireframe plus orbit ring, shared with the
  // logo lab so hero state and 2D/3D mark never drift apart.
  fillLogoCloud(states.logo.x, states.logo.y, states.logo.z, count);

  for (let index = 0; index < count; index += 1) {
    const seedA = seeded(index, 1);
    const seedB = seeded(index, 2);
    const seedC = seeded(index, 3);
    const seedD = seeded(index, 4);

    // orb — granular sphere shell with an equatorial ring system inside
    if (index % 4 === 0) {
      const orbRing = orbRings[(index >> 2) % orbRings.length];
      const orbAngle = seedB * TAU;
      const orbJitter = 1 + (seedC - 0.5) * 0.04;
      states.orb.x[index] = Math.cos(orbAngle) * orbRing * orbJitter;
      states.orb.z[index] = Math.sin(orbAngle) * orbRing * orbJitter;
      states.orb.y[index] = (seedD - 0.5) * 0.018;
    } else {
      const pole = seedA * 2 - 1;
      const theta = seedB * TAU;
      const shell = 0.9 + seedC * 0.08;
      const cross = Math.sqrt(Math.max(1 - pole * pole, 0));
      states.orb.x[index] = Math.cos(theta) * cross * shell;
      states.orb.z[index] = Math.sin(theta) * cross * shell;
      states.orb.y[index] = pole * shell;
    }

    // nebula — soft gaussian clumps strung along a tilted loop, joined by
    // thin wisps, so the state reads as billowing smoke
    const clumpIndex = Math.floor(seedD * NEBULA_CLUMPS.length) % NEBULA_CLUMPS.length;
    const clump = NEBULA_CLUMPS[clumpIndex];
    if (index % 5 === 0) {
      const next = NEBULA_CLUMPS[(clumpIndex + 1) % NEBULA_CLUMPS.length];
      states.nebula.x[index] = lerp(clump.x, next.x, seedA) + (seedB - 0.5) * 0.12;
      states.nebula.y[index] = lerp(clump.y, next.y, seedA) + (seedC - 0.5) * 0.1;
      states.nebula.z[index] = lerp(clump.z, next.z, seedA) + (seedB + seedC - 1) * 0.08;
    } else if (index % 5 <= 2) {
      // dense bright body in the middle of the cloud
      states.nebula.x[index] = (seedA + seedB - 1) * 0.42;
      states.nebula.y[index] = (seedB + seedC - 1) * 0.26;
      states.nebula.z[index] = (seedA + seedC - 1) * 0.34;
    } else {
      states.nebula.x[index] = clump.x + (seedA + seedB - 1) * clump.size;
      states.nebula.y[index] = clump.y + (seedB + seedC - 1) * clump.size * 0.7;
      states.nebula.z[index] = clump.z + (seedA + seedC - 1) * clump.size * 0.8;
    }

    // disk — flat two-armed vortex with a dense bright core and a ragged rim
    const inCore = index % 4 === 0;
    const diskRadius = inCore ? Math.pow(seedA, 0.7) * 0.34 : 0.1 + Math.pow(seedA, 0.55) * 0.95;
    const diskAngle = inCore
      ? seedB * TAU
      : (index % 2) * Math.PI + diskRadius * 5.6 + (seedB - 0.5) * (0.18 + diskRadius * 0.7);
    const rimScatter = !inCore && index % 13 === 0 ? 1.12 + seedD * 0.2 : 1;
    states.disk.x[index] = Math.cos(diskAngle) * diskRadius * rimScatter;
    states.disk.z[index] = Math.sin(diskAngle) * diskRadius * 0.94 * rimScatter;
    states.disk.y[index] = (seedC + seedD - 1) * 0.06 * (1.1 - diskRadius * 0.6);

    // burst — hollow center, radially stretched spokes plus loose ejecta
    const onSpoke = index % 3 !== 0;
    const burstAngle = onSpoke
      ? (Math.floor(seedA * BURST_SPOKES) / BURST_SPOKES) * TAU + (seedB - 0.5) * 0.03
      : seedA * TAU;
    const burstLength = (onSpoke ? 0.28 : 0.12) + Math.pow(seedD, 0.35) * 1.45;
    const elevation = (seedC - 0.5) * (onSpoke ? 0.4 : 1.1);
    states.burst.x[index] = Math.cos(burstAngle) * burstLength;
    states.burst.z[index] = Math.sin(burstAngle) * burstLength * 0.62;
    states.burst.y[index] = elevation * burstLength * 0.5;

    phase[index] = Math.floor(seeded(index, 8) * SINE_STEPS);
    size[index] = 0.46 + seeded(index, 9) * 0.9;
    const brightness = Math.min(3, Math.floor(seeded(index, 10) * 3.45));
    buckets[brightness].push(index);
  }

  return { count, states, phase, size, buckets };
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, (_, index) => ({
    x: seeded(index, 20),
    y: seeded(index, 21),
    depth: 0.2 + seeded(index, 22) * 0.8,
    phase: seeded(index, 23) * TAU,
    size: 0.35 + seeded(index, 24) * 0.95,
    bright: seeded(index, 25) > 0.92,
  }));
}

// Two dust flavours share the haze base: the ringed one reads as a spiral
// galaxy (disk scene), the shapeless one as billowing nebula smoke. Which one
// shows is blended per keyframe via `dustRing`.
function makeDustTexture(size: number, count: number, ringed: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const center = size / 2;
  const extent = size * 0.46;
  const ringScales = [0.26, 0.4, 0.55, 0.71, 0.89];
  const puffCount = 9;
  context.globalCompositeOperation = "lighter";

  const haze = context.createRadialGradient(center, center, 0, center, center, extent);
  haze.addColorStop(0, "rgba(255,254,244,.18)");
  haze.addColorStop(0.2, "rgba(242,241,232,.07)");
  haze.addColorStop(0.64, "rgba(242,241,232,.018)");
  haze.addColorStop(1, "rgba(242,241,232,0)");
  context.fillStyle = haze;
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < count; index += 1) {
    const seedA = seeded(index, 70);
    const seedB = seeded(index, 71);
    const seedC = seeded(index, 72);
    const seedD = seeded(index, 73);
    let x: number;
    let y: number;
    let edgeFade: number;

    if (ringed) {
      const onRing = index % 5 < 3;
      const ring = index % ringScales.length;
      const radius = onRing
        ? ringScales[ring] + (seedA - 0.5) * (0.035 + ring * 0.008)
        : 0.1 + Math.pow(seedA, 0.66) * 0.9;
      const arm = index % 4;
      const angle = onRing
        ? seedB * TAU
        : arm * (TAU / 4) + radius * 8.1 + (seedB + seedC - 1) * (0.16 + radius * 0.62);
      const radialNoise = 1 + (seedD - 0.5) * (0.04 + radius * 0.08);
      x = center + Math.cos(angle) * extent * radius * radialNoise;
      y = center + Math.sin(angle) * extent * radius * radialNoise;
      edgeFade = clamp((1 - radius) / 0.13);
    } else {
      // Shapeless smoke: grains gather in a handful of soft puffs.
      const puff = index % puffCount;
      const puffX = (seeded(puff, 80) - 0.5) * 0.92;
      const puffY = (seeded(puff, 81) - 0.5) * 0.7;
      const puffSize = 0.16 + seeded(puff, 82) * 0.22;
      const grainX = puffX + (seedA + seedB - 1) * puffSize * 2;
      const grainY = puffY + (seedB + seedC - 1) * puffSize * 1.5;
      const radius = Math.hypot(grainX, grainY);
      x = center + grainX * extent;
      y = center + grainY * extent;
      edgeFade = clamp((1 - radius) / 0.3);
    }

    const alpha = (0.1 + seedC * 0.5) * edgeFade;
    const particleSize = 0.35 + seedD * 1.05;
    if (alpha < 0.012) continue;

    context.fillStyle = `rgba(244,243,234,${alpha})`;
    context.fillRect(x, y, particleSize, particleSize);

    if (seedB > 0.994) {
      context.fillStyle = `rgba(255,254,244,${alpha * 0.14})`;
      context.fillRect(
        x - particleSize * 1.4,
        y - particleSize * 1.4,
        particleSize * 3.8,
        particleSize * 3.8,
      );
    }
  }

  return canvas;
}

function makeGlowSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const glow = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  glow.addColorStop(0, "rgba(255,254,244,.72)");
  glow.addColorStop(0.08, "rgba(255,254,244,.3)");
  glow.addColorStop(0.34, "rgba(242,241,232,.1)");
  glow.addColorStop(1, "rgba(242,241,232,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 96, 96);
  return canvas;
}

// A radial glow stretched to a long streak with a thin hot core line;
// drawn rotated during transitions.
function makeStreakSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 40;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.translate(128, 20);
  context.scale(6.4, 1);
  const glow = context.createRadialGradient(0, 0, 0, 0, 0, 20);
  glow.addColorStop(0, "rgba(255,254,244,.85)");
  glow.addColorStop(0.25, "rgba(250,249,240,.32)");
  glow.addColorStop(0.7, "rgba(242,241,232,.08)");
  glow.addColorStop(1, "rgba(242,241,232,0)");
  context.fillStyle = glow;
  context.fillRect(-20, -20, 40, 40);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalCompositeOperation = "lighter";
  const core = context.createLinearGradient(28, 0, 228, 0);
  core.addColorStop(0, "rgba(255,254,244,0)");
  core.addColorStop(0.5, "rgba(255,254,244,.85)");
  core.addColorStop(1, "rgba(255,254,244,0)");
  context.fillStyle = core;
  context.fillRect(28, 18.6, 200, 2.8);
  return canvas;
}

function getKeyframes(timeline: number) {
  for (let index = 0; index < VISUAL_KEYFRAMES.length - 1; index += 1) {
    const from = VISUAL_KEYFRAMES[index];
    const to = VISUAL_KEYFRAMES[index + 1];
    if (timeline <= to.at) {
      return {
        from,
        to,
        mix: smoothstep((timeline - from.at) / Math.max(to.at - from.at, 0.001)),
      };
    }
  }
  const last = VISUAL_KEYFRAMES[VISUAL_KEYFRAMES.length - 1];
  return { from: last, to: last, mix: 0 };
}

export function CosmicUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const constrained = compact || (navigator.hardwareConcurrency || 8) <= 4 || memory < 4;
    const cloud = makeCloud(constrained ? 2800 : 6000);
    const stars = makeStars(constrained ? 90 : 150);
    const ringDustTexture = makeDustTexture(constrained ? 720 : 1024, constrained ? 9000 : 16000, true);
    const softDustTexture = makeDustTexture(constrained ? 720 : 1024, constrained ? 9000 : 16000, false);
    const glowSprite = makeGlowSprite();
    const streakSprite = makeStreakSprite();
    const bucketAlpha = [0.16, 0.28, 0.48, 0.8];
    const targetFrameTime = 1000 / (constrained ? 45 : 60);

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let previousTime = 0;
    let pointerTargetX = 0.5;
    let pointerTargetY = 0.5;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetScrollY = window.scrollY;
    let visualScrollY = targetScrollY;
    let targetTimeline = 0;
    let visualTimeline = 0;
    let active = !document.hidden;

    // Inspection override: /de?timeline=2.35 pins the scroll timeline so any
    // scene or morph moment can be rendered and reviewed in isolation.
    const debugParam = new URLSearchParams(window.location.search).get("timeline");
    const debugTimeline = debugParam === null ? Number.NaN : Number(debugParam);

    // Scene anchor positions in scroll space, plus the scroll end as final
    // entry: scene i maps to timeline [i, i+1) between starts[i] and
    // starts[i+1]. Anchors are capped from the back so that every scene stays
    // reachable and the page bottom always completes the timeline — on short
    // mobile viewports the raw section tops of the last scenes can lie beyond
    // the maximum scroll position entirely.
    let sceneStarts: number[] = [];

    const timelineAt = (scrollY: number) => {
      if (Number.isFinite(debugTimeline)) return debugTimeline;
      let timeline = 0;
      for (let index = 0; index < sceneStarts.length - 1; index += 1) {
        if (scrollY < sceneStarts[index]) break;
        const span = Math.max(sceneStarts[index + 1] - sceneStarts[index], 1);
        timeline = index + clamp((scrollY - sceneStarts[index]) / span);
      }
      return timeline;
    };

    const updateSceneBounds = () => {
      const tops = Array.from(document.querySelectorAll<HTMLElement>(".scene")).map(
        (scene) => scene.getBoundingClientRect().top + window.scrollY,
      );
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const minSpan = Math.min(
        window.innerHeight * 0.35,
        maxScroll / Math.max(tops.length * 2, 1),
      );
      const starts = new Array<number>(tops.length + 1);
      starts[tops.length] = maxScroll;
      for (let index = tops.length - 1; index >= 0; index -= 1) {
        starts[index] = Math.min(tops[index], starts[index + 1] - minSpan);
      }
      sceneStarts = starts;
      targetTimeline = timelineAt(targetScrollY);
      if (previousTime === 0) visualTimeline = targetTimeline;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, constrained ? 1 : 1.2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      updateSceneBounds();
    };

    const draw = (time: number) => {
      if (!active) return;
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw);
      if (!reducedMotion.matches && time - lastFrameTime < targetFrameTime - 1) return;
      if (reducedMotion.matches && lastFrameTime > 0) return;

      const delta = previousTime === 0 ? 16.67 : Math.min(time - previousTime, 50);
      previousTime = time;
      lastFrameTime = time;
      const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 0.022);
      const pointerFollow = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 0.006);
      visualTimeline += (targetTimeline - visualTimeline) * follow;
      visualScrollY += (targetScrollY - visualScrollY) * follow;
      pointerX += (pointerTargetX - pointerX) * pointerFollow;
      pointerY += (pointerTargetY - pointerY) * pointerFollow;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      const stillTime = reducedMotion.matches ? 0 : time;
      const timeStep = Math.floor(stillTime * 0.018) & SINE_MASK;
      const scrollEnergy = clamp(Math.abs(targetTimeline - visualTimeline) * 2.2);
      const { from, to, mix } = getKeyframes(visualTimeline);
      const mobile = width < 760;
      const energyScale = mobile ? 0.55 : 1;
      // On phones the body sits directly behind the copy, so it renders
      // dimmer, smaller and pushed toward the lower half of the viewport.
      const alphaScale = mobile ? 0.6 : 1;
      const stateChanging = from.state !== to.state;
      // Squared sine keeps the energy peak short and steep: quiet approach,
      // brief hard flash mid-morph, quiet settle — never a sustained glow.
      const morphPeak = stateChanging ? Math.pow(Math.sin(Math.PI * mix), 2.2) : 0;
      const centerX = (mobile ? 0.5 : lerp(from.x, to.x, mix)) * width
        + (pointerX - 0.5) * (mobile ? 4 : 12);
      // On phones the hero has free space above the headline, later scenes
      // only below the copy — so the body starts high and drifts low while
      // the first scene scrolls out.
      const mobileShift = mobile
        ? lerp(-0.27, 0.16, smoothstep(visualTimeline / 0.9))
        : 0;
      const centerY = (lerp(from.y, to.y, mix) + mobileShift) * height
        + (pointerY - 0.5) * (mobile ? 3 : 8);
      const radius = Math.min(width, height) * lerp(from.scale, to.scale, mix)
        * (mobile ? 0.85 : 1)
        * (1 + scrollEnergy * 0.02 + morphPeak * 0.05);
      const rotateX = lerp(from.rotateX, to.rotateX, mix);
      const rotateY = lerp(from.rotateY, to.rotateY, mix)
        + (reducedMotion.matches ? 0 : Math.sin(stillTime * 0.00011) * 0.035);
      const rotateZ = lerp(from.rotateZ, to.rotateZ, mix)
        + (reducedMotion.matches ? 0 : Math.sin(stillTime * 0.000073) * 0.012);
      const alpha = lerp(from.alpha, to.alpha, mix) * alphaScale;
      const noise = lerp(from.noise, to.noise, mix) * (1 + scrollEnergy * 0.18 + morphPeak * 0.5);
      const rawFlare = clamp(
        (lerp(from.flare, to.flare, mix) + scrollEnergy * 0.1 + morphPeak * 0.22) * energyScale,
        0,
        0.78,
      );
      const flare = reducedMotion.matches ? Math.min(rawFlare, 0.22) : rawFlare;
      const dustAmount = lerp(from.dust, to.dust, mix);
      const ringShare = lerp(from.dustRing, to.dustRing, mix);
      const glowAmount = lerp(from.glow, to.glow, mix) * (mobile ? 0.75 : 1);
      // Nebula bloom: high-glow scenes draw glow sprites on more particles.
      const glowStep = constrained
        ? (glowAmount > 0.6 ? 3 : 5)
        : (glowAmount > 0.6 ? 2 : glowAmount > 0.3 ? 3 : 5);
      const trail = reducedMotion.matches
        ? 0
        : clamp(scrollEnergy * 1.3 + morphPeak * 0.55 - 0.22, 0, 1) * energyScale;
      const fromState = cloud.states[from.state];
      const toState = cloud.states[to.state];
      const cosX = Math.cos(rotateX);
      const sinX = Math.sin(rotateX);
      const cosY = Math.cos(rotateY);
      const sinY = Math.sin(rotateY);
      const cosZ = Math.cos(rotateZ);
      const sinZ = Math.sin(rotateZ);

      context.fillStyle = LIGHT;
      for (const star of stars) {
        const parallax = visualScrollY * star.depth * 0.013;
        const x = (star.x * width + (pointerX - 0.5) * star.depth * 9 + width) % width;
        const y = (star.y * height - parallax + height * 10) % height;
        const twinkle = star.bright
          ? 0.62 + Math.sin(stillTime * 0.001 + star.phase) * 0.32
          : 0.44;
        context.globalAlpha = twinkle * (star.bright ? 0.64 : 0.24);
        context.fillRect(x, y, star.size, star.size);
      }

      if (dustAmount > 0.02) {
        const dustRadius = radius * 1.16;
        const dustTilt = 0.34 + Math.abs(Math.sin(rotateX)) * 0.26;
        context.save();
        context.translate(centerX, centerY);
        context.rotate(rotateZ + Math.sin(stillTime * 0.000045) * 0.018);
        context.scale(1, dustTilt);
        const dustAlpha = clamp(
          alpha * dustAmount * (0.9 + flare * 0.25 + glowAmount * 0.55),
          0,
          0.85,
        );
        if (ringShare > 0.03) {
          context.globalAlpha = dustAlpha * ringShare;
          context.drawImage(
            ringDustTexture,
            -dustRadius,
            -dustRadius,
            dustRadius * 2,
            dustRadius * 2,
          );
        }
        if (ringShare < 0.97) {
          context.globalAlpha = dustAlpha * (1 - ringShare);
          context.drawImage(
            softDustTexture,
            -dustRadius,
            -dustRadius,
            dustRadius * 2,
            dustRadius * 2,
          );
        }
        // High-glow scenes stack a tighter second dust pass so the cloud core
        // reads milky-bright like a real nebula, not just grainy. Always the
        // shapeless texture — a bright core must not imprint rings.
        if (glowAmount > 0.4) {
          context.globalAlpha = clamp(
            alpha * dustAmount * (glowAmount - 0.2),
            0,
            0.7,
          );
          context.drawImage(
            softDustTexture,
            -dustRadius * 0.64,
            -dustRadius * 0.64,
            dustRadius * 1.28,
            dustRadius * 1.28,
          );
        }
        context.restore();
      }

      const coreGlowSize = radius * (0.18 + flare * 0.35 + glowAmount * 0.6);
      context.globalAlpha = alpha * (0.12 + flare * 0.32 + glowAmount * 0.22);
      context.drawImage(
        glowSprite,
        centerX - coreGlowSize / 2,
        centerY - coreGlowSize / 2,
        coreGlowSize,
        coreGlowSize,
      );

      const hotCoreSize = radius * (0.05 + flare * 0.12 + glowAmount * 0.3);
      context.globalAlpha = clamp(alpha * (0.16 + flare * 0.5 + glowAmount * 0.34), 0, 0.78);
      context.drawImage(
        glowSprite,
        centerX - hotCoreSize / 2,
        centerY - hotCoreSize / 2,
        hotCoreSize,
        hotCoreSize,
      );

      // Brief additive overexposure: only the very top of a morph peak blows
      // the whole body out to near-white; rest flare never reaches this gate,
      // so no frame outside a transition carries the blowout.
      if (!reducedMotion.matches && flare > 0.56) {
        const blowout = clamp((flare - 0.56) / 0.22);
        const blowoutSize = radius * (2.2 + blowout * 1.6);
        context.globalAlpha = clamp(blowout * 0.5 * alphaScale, 0, 0.55);
        context.drawImage(
          glowSprite,
          centerX - blowoutSize / 2,
          centerY - blowoutSize / 2,
          blowoutSize,
          blowoutSize,
        );
      }

      // Streaks only while a transition peak is running, never at rest.
      if (!reducedMotion.matches && flare > 0.3) {
        const streakStrength = (flare - 0.3) / 0.42;
        for (let index = 0; index < FLARE_ANCHORS.length; index += 1) {
          const anchor = FLARE_ANCHORS[index];
          if (streakStrength < anchor.gate) continue;
          const streakX = centerX + Math.cos(anchor.angle) * radius * anchor.dist;
          const streakY = centerY + Math.sin(anchor.angle) * radius * anchor.dist * 0.6;
          const streakLength = radius * (0.9 + streakStrength * 1.5) * anchor.scale;
          const streakThickness = streakLength * 0.1;
          context.save();
          context.translate(streakX, streakY);
          context.rotate(anchor.angle + anchor.tilt);
          context.globalAlpha = clamp(streakStrength * (0.12 + alpha * 0.3), 0, 0.5);
          context.drawImage(
            streakSprite,
            -streakLength / 2,
            -streakThickness / 2,
            streakLength,
            streakThickness,
          );
          context.restore();
        }
      }

      const trailMix = clamp(mix - 0.06 - trail * 0.06);
      for (let bucket = 0; bucket < cloud.buckets.length; bucket += 1) {
        const indices = cloud.buckets[bucket];
        const drawTrail = trail > 0.05 && stateChanging && bucket >= 2;
        context.fillStyle = bucket === 3 ? BRIGHT : LIGHT;
        context.globalAlpha = clamp(bucketAlpha[bucket] * alpha * (1 + flare * 0.34 + glowAmount * 0.7), 0, 1);

        for (let listIndex = 0; listIndex < indices.length; listIndex += 1) {
          const index = indices[listIndex];
          const noiseA = SINE[(cloud.phase[index] + timeStep) & SINE_MASK];
          const noiseB = SINE[(cloud.phase[index] + timeStep * 2 + 137) & SINE_MASK];
          let x = lerp(fromState.x[index], toState.x[index], mix) + noiseA * noise;
          let y = lerp(fromState.y[index], toState.y[index], mix) + noiseB * noise;
          const z = lerp(fromState.z[index], toState.z[index], mix) + noiseA * noise * 0.42;

          const rotatedX = x * cosY - z * sinY;
          const depthY = x * sinY + z * cosY;
          const rotatedY = y * cosX - depthY * sinX;
          const depth = y * sinX + depthY * cosX;
          const perspective = 1 / (1.2 - depth * 0.19);
          x = rotatedX * perspective;
          y = rotatedY * perspective;
          const projectedX = x * cosZ - y * sinZ;
          const projectedY = x * sinZ + y * cosZ;
          const screenX = centerX + projectedX * radius;
          const screenY = centerY + projectedY * radius;
          const particleSize = cloud.size[index] * (0.78 + perspective * 0.28)
            * (bucket === 3 ? 1.2 : 1);

          if (bucket === 3 && listIndex % glowStep === 0) {
            const glowSize = 9 + particleSize * 4 + flare * 18 + glowAmount * 34;
            context.globalAlpha = alpha * (0.045 + flare * 0.065 + glowAmount * 0.09);
            context.drawImage(
              glowSprite,
              screenX - glowSize / 2,
              screenY - glowSize / 2,
              glowSize,
              glowSize,
            );
            context.globalAlpha = clamp(bucketAlpha[bucket] * alpha * (1 + flare * 0.34 + glowAmount * 0.7), 0, 1);
          }

          context.fillRect(
            screenX - particleSize * 0.5,
            screenY - particleSize * 0.5,
            particleSize,
            particleSize,
          );

          // Short motion trail along the morph path during fast transitions.
          if (drawTrail && (bucket === 3 || listIndex % 2 === 0)) {
            let trailX = lerp(fromState.x[index], toState.x[index], trailMix) + noiseA * noise;
            let trailY = lerp(fromState.y[index], toState.y[index], trailMix) + noiseB * noise;
            const trailZ = lerp(fromState.z[index], toState.z[index], trailMix) + noiseA * noise * 0.42;
            const trailRotX = trailX * cosY - trailZ * sinY;
            const trailDepthY = trailX * sinY + trailZ * cosY;
            const trailRotY = trailY * cosX - trailDepthY * sinX;
            const trailDepth = trailY * sinX + trailDepthY * cosX;
            const trailPerspective = 1 / (1.2 - trailDepth * 0.19);
            trailX = trailRotX * trailPerspective;
            trailY = trailRotY * trailPerspective;
            const trailScreenX = centerX + (trailX * cosZ - trailY * sinZ) * radius;
            const trailScreenY = centerY + (trailX * sinZ + trailY * cosZ) * radius;
            context.fillRect(
              screenX + (trailScreenX - screenX) * 0.45 - particleSize * 0.35,
              screenY + (trailScreenY - screenY) * 0.45 - particleSize * 0.35,
              particleSize * 0.7,
              particleSize * 0.7,
            );
            context.fillRect(
              screenX + (trailScreenX - screenX) * 0.8 - particleSize * 0.25,
              screenY + (trailScreenY - screenY) * 0.8 - particleSize * 0.25,
              particleSize * 0.5,
              particleSize * 0.5,
            );
          }
        }
      }

      // Star-shaped flares only at the strongest, shortest peaks. Each cross
      // sits slightly rotated with unequal arms so the pair reads as two
      // distinct diagonal light paths, not a symmetric HUD ornament.
      if (!reducedMotion.matches && flare > 0.48) {
        const starStrength = clamp((flare - 0.48) / 0.24);
        for (let index = 0; index < 2; index += 1) {
          const anchor = FLARE_ANCHORS[index * 3];
          const flareX = centerX + Math.cos(anchor.angle) * radius * anchor.dist * 0.8;
          const flareY = centerY + Math.sin(anchor.angle) * radius * anchor.dist * 0.5;
          const armLength = radius * (0.5 + starStrength * 0.7) * anchor.scale;
          const armThickness = armLength * 0.07;
          context.save();
          context.translate(flareX, flareY);
          context.rotate(anchor.tilt * 0.5 + (index === 0 ? 0.38 : -0.31));
          context.globalAlpha = clamp(starStrength * (index === 0 ? 0.6 : 0.42), 0, 0.65);
          context.drawImage(
            streakSprite,
            -armLength / 2,
            -armThickness / 2,
            armLength,
            armThickness,
          );
          context.rotate(Math.PI / 2);
          context.drawImage(
            streakSprite,
            -armLength * 0.35,
            -armThickness / 2,
            armLength * 0.7,
            armThickness,
          );
          context.restore();
          const flareCoreSize = armLength * 0.2;
          context.globalAlpha = clamp(starStrength * 0.5, 0, 0.55);
          context.drawImage(
            glowSprite,
            flareX - flareCoreSize / 2,
            flareY - flareCoreSize / 2,
            flareCoreSize,
            flareCoreSize,
          );
        }
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const requestStaticFrame = () => {
      if (!reducedMotion.matches) return;
      lastFrameTime = 0;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };
    const onResize = () => {
      resize();
      requestStaticFrame();
    };
    const onScroll = () => {
      targetScrollY = window.scrollY;
      targetTimeline = timelineAt(targetScrollY);
      requestStaticFrame();
    };
    const onPointer = (event: PointerEvent) => {
      pointerTargetX = event.clientX / Math.max(width, 1);
      pointerTargetY = event.clientY / Math.max(height, 1);
    };
    const onVisibility = () => {
      active = !document.hidden;
      if (active) {
        previousTime = 0;
        lastFrameTime = 0;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(draw);
      }
    };
    // Toggling reduced motion at runtime must swap cleanly between the loop
    // and the single static frame, without a half-finished morph in between.
    const onMotionChange = () => {
      previousTime = 0;
      lastFrameTime = 0;
      visualTimeline = targetTimeline;
      visualScrollY = targetScrollY;
      cancelAnimationFrame(animationFrame);
      if (active) animationFrame = requestAnimationFrame(draw);
    };

    let disposed = false;
    resize();
    document.fonts.ready
      .then(() => {
        if (disposed) return;
        updateSceneBounds();
        requestStaticFrame();
      })
      .catch(() => undefined);
    animationFrame = requestAnimationFrame(draw);
    // Late layout shifts (lazy images, font swaps) silently move the scene
    // anchors, which desynced the timeline especially on phones — track the
    // document height instead of trusting the initial measurement.
    const layoutObserver = new ResizeObserver(() => {
      updateSceneBounds();
      requestStaticFrame();
    });
    layoutObserver.observe(document.body);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      layoutObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas className="particle-universe" ref={canvasRef} aria-hidden="true" />;
}
