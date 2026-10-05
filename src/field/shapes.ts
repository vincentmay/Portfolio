/**
 * The five states of the field.
 *
 * Each state is a pure function of a particle's eight fixed random numbers, so
 * particle #9412 keeps its identity across all of them: the grain that sits at
 * angle t in the disc is the same grain that sits at angle t in the spiral and
 * on ring 2 of the orrery. That is what makes the morphs read as one object
 * changing rather than one cloud dissolving into another.
 */

import { ACTIVE_MARK } from "../brand/designs.ts";
import { VIEW, ringDepth, ringOf, sampleBody, toWorld } from "../brand/geometry.ts";

export const SHAPE_NAMES = ["mark", "disc", "spiral", "orrery", "burst"] as const;
export type ShapeName = (typeof SHAPE_NAMES)[number];
export const SHAPE_COUNT = SHAPE_NAMES.length;

/** How many random numbers each particle carries. */
export const SEEDS = 12;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Standard normal from two uniforms, clamped so nothing flies off to infinity. */
function gauss(u: number, v: number) {
  const r = Math.sqrt(-2 * Math.log(1 - u * 0.9999));
  return Math.max(-3, Math.min(3, r * Math.cos(TAU * v)));
}

/** Tip a point that was authored flat in the XZ plane up toward the camera. */
function tilt(out: Float32Array, i: number, x: number, y: number, z: number, deg: number) {
  const a = deg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  out[i] = x;
  out[i + 1] = y * c - z * s;
  out[i + 2] = y * s + z * c;
}

/* ------------------------------------------------------------------- mark */

const MARK_SCALE = 0.94;
const MARK_RING = ringOf(ACTIVE_MARK);
const MARK_RING_R = MARK_RING ? (MARK_RING.rx / (VIEW / 2)) * MARK_SCALE : 0;
/** Share of the cloud on the band. It is short and tight, so a little is a lot. */
const RING_SHARE = MARK_RING ? 0.16 : 0;
/**
 * How far grains stray off the silhouette, in the mark's own 100-unit space.
 *
 * Enough to feather an edge, not enough to lose one. The band is barely three
 * units across, so much past a third of a unit and the spikes stop having
 * points and the whole mark goes soft.
 */
const MARK_SCATTER = 0.32;

function mark(u: Float32Array, o: number, out: Float32Array, i: number) {
  if (MARK_RING && u[o + 7] < RING_SHARE) {
    // A real circle in space, pitched until its silhouette matches the ellipse
    // in the drawn logo. With genuine depth it passes behind the needles on the
    // far side and in front of them on the near side, exactly as the metal does.
    const { pitch, roll } = ringDepth(MARK_RING);
    const t = u[o] * TAU;
    const tube = 0.016;
    const ta = u[o + 5] * TAU;
    const tr = tube * Math.sqrt(u[o + 6]);
    const r = MARK_RING_R + Math.cos(ta) * tr;
    const x0 = Math.cos(t) * r;
    const y0 = Math.sin(t) * r;
    const lift = Math.sin(ta) * tr;
    const y1 = y0 * Math.cos(pitch) - lift * Math.sin(pitch);
    const z1 = y0 * Math.sin(pitch) + lift * Math.cos(pitch);
    // The band gets the same scatter as the star, or it reads as a clean wire
    // laid over a dusty object.
    const s = MARK_SCATTER / (VIEW / 2);
    out[i] = x0 * Math.cos(roll) + y1 * Math.sin(roll) + gauss(u[o + 8], u[o + 9]) * s;
    out[i + 1] = -x0 * Math.sin(roll) + y1 * Math.cos(roll) + gauss(u[o + 10], u[o + 11]) * s;
    out[i + 2] = z1;
    return;
  }
  const p = sampleBody(ACTIVE_MARK, u[o + 1], u[o + 2], u[o + 3]);
  // Grains settle on the metal rather than being stamped into it: scattering
  // them off the silhouette feathers the edge instead of leaving a clean cut,
  // and a few land clear of the object as loose dust.
  const x = p[0] + gauss(u[o + 8], u[o + 9]) * MARK_SCATTER;
  const y = p[1] + gauss(u[o + 10], u[o + 11]) * MARK_SCATTER;
  const w = toWorld(x, y, MARK_SCALE);
  out[i] = w[0];
  out[i + 1] = w[1];
  // The star is cast metal, not flat: a little thickness keeps it from
  // vanishing edge-on as the cloud turns.
  out[i + 2] = gauss(u[o + 4], u[o + 5]) * 0.016;
}

/* ------------------------------------------------------------------- disc */

function disc(u: Float32Array, o: number, out: Float32Array, i: number) {
  const a = u[o] * TAU;
  const base = 0.32 + 0.68 * Math.sqrt(u[o + 1]);
  // A thin scatter of grains thrown clear of the rim, which become the light
  // streaks once the whole thing is turning.
  const flung = u[o + 7] > 0.965 ? 1.35 + u[o + 6] * 0.5 : 1;
  const r = base * flung;
  const h = gauss(u[o + 2], u[o + 3]) * 0.05 * (1.2 - base);
  tilt(out, i, Math.cos(a) * r, h, Math.sin(a) * r, 21);
}

/* ----------------------------------------------------------------- spiral */

function spiral(u: Float32Array, o: number, out: Float32Array, i: number) {
  if (u[o + 7] < 0.2) {
    // Core bulge.
    const t = u[o] * TAU;
    const ct = 1 - 2 * u[o + 1];
    const st = Math.sqrt(Math.max(0, 1 - ct * ct));
    const r = 0.24 * Math.cbrt(u[o + 2]);
    tilt(out, i, Math.cos(t) * st * r, ct * r * 0.7, Math.sin(t) * st * r, 33);
    return;
  }
  const t = Math.pow(u[o + 1], 0.55);
  const r = 0.16 + 1.0 * t;
  const arm = Math.floor(u[o] * 2);
  const along = (u[o] * 2) % 1;
  const scatter = gauss(u[o + 3], u[o + 4]) * (0.05 + 0.05 / (0.35 + t));
  const a = arm * Math.PI + along * 0.85 + t * 6.2 + scatter;
  const h = gauss(u[o + 5], u[o + 6]) * 0.045 * Math.exp(-1.8 * t);
  tilt(out, i, Math.cos(a) * r, h, Math.sin(a) * r, 33);
}

/* ---------------------------------------------------------------- orrery */

const RINGS = [0.34, 0.52, 0.7, 0.88];

function orrery(u: Float32Array, o: number, out: Float32Array, i: number) {
  const k = u[o + 7];
  if (k < 0.5) {
    // Dusty shell.
    const t = u[o] * TAU;
    const ct = 1 - 2 * u[o + 1];
    const st = Math.sqrt(Math.max(0, 1 - ct * ct));
    const r = 0.99 + gauss(u[o + 2], u[o + 3]) * 0.014;
    out[i] = Math.cos(t) * st * r;
    out[i + 1] = ct * r;
    out[i + 2] = Math.sin(t) * st * r;
    return;
  }
  if (k < 0.94) {
    // Orbits: crisp, thin, evenly lit.
    const ring = RINGS[Math.min(RINGS.length - 1, Math.floor(u[o + 4] * RINGS.length))];
    const a = u[o] * TAU;
    const r = ring + gauss(u[o + 2], u[o + 3]) * 0.004;
    const h = gauss(u[o + 5], u[o + 6]) * 0.004;
    tilt(out, i, Math.cos(a) * r, h, Math.sin(a) * r, 25);
    return;
  }
  if (k < 0.985) {
    // The body at the centre.
    const t = u[o] * TAU;
    const ct = 1 - 2 * u[o + 1];
    const st = Math.sqrt(Math.max(0, 1 - ct * ct));
    const r = 0.05 * Math.cbrt(u[o + 2]);
    out[i] = Math.cos(t) * st * r;
    out[i + 1] = ct * r;
    out[i + 2] = Math.sin(t) * st * r;
    return;
  }
  // A single small companion, parked on the second orbit.
  const a = 2.3;
  const r = RINGS[1];
  const t = u[o] * TAU;
  const ct = 1 - 2 * u[o + 1];
  const st = Math.sqrt(Math.max(0, 1 - ct * ct));
  const rr = 0.035 * Math.cbrt(u[o + 2]);
  tilt(
    out,
    i,
    Math.cos(a) * r + Math.cos(t) * st * rr,
    ct * rr,
    Math.sin(a) * r + Math.sin(t) * st * rr,
    25,
  );
}

/* ------------------------------------------------------------------ burst */

const RAYS = 26;
const BURST_TILT = 29;

function burst(u: Float32Array, o: number, out: Float32Array, i: number) {
  if (u[o + 7] < 0.34) {
    // The bright rim the spikes tear out of. Nothing inside 0.5, so the middle
    // stays as a dark lens.
    const a = u[o] * TAU;
    const r = 0.5 + 0.42 * Math.sqrt(u[o + 1]);
    const h = gauss(u[o + 2], u[o + 3]) * 0.02;
    tilt(out, i, Math.cos(a) * r, h, Math.sin(a) * r, BURST_TILT);
    return;
  }
  // Spikes, thrown almost entirely along the plane of the rim. Each ray gets a
  // fixed length of its own so the crown stays irregular instead of cog-like.
  const ray = Math.floor(u[o + 4] * RAYS);
  const reach = 0.35 + (((ray * 2654435761) >>> 8) % 1000) / 1000;
  const a = (ray / RAYS) * TAU + (u[o + 5] - 0.5) * 0.05;
  const lift = Math.pow(2 * u[o + 3] - 1, 3) * 0.13;
  const d = 0.5 + Math.pow(u[o + 1], 2.6) * 2.6 * reach;
  const cl = Math.cos(lift);
  tilt(out, i, Math.cos(a) * cl * d, Math.sin(lift) * d, Math.sin(a) * cl * d, BURST_TILT);
}

/* ------------------------------------------------------------------ build */

const BUILDERS = { mark, disc, spiral, orrery, burst } as const;

/** Deterministic, cheap, and good enough for scattering dust. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Field = {
  count: number;
  seeds: Float32Array;
  /** One Float32Array of xyz per shape, in SHAPE_NAMES order. */
  positions: Float32Array[];
};

export function buildField(count: number, seed = 0x5eed): Field {
  const random = rng(seed);
  const seeds = new Float32Array(count * SEEDS);
  for (let i = 0; i < seeds.length; i++) seeds[i] = random();

  const positions = SHAPE_NAMES.map((name) => {
    const out = new Float32Array(count * 3);
    const build = BUILDERS[name];
    for (let p = 0; p < count; p++) build(seeds, p * SEEDS, out, p * 3);
    return out;
  });

  return { count, seeds, positions };
}
