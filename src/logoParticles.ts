// Shared 3D particle geometry for the mark: a four-point star (soft contour
// wires, a reduced inner echo and a volumetric lens-shaped body fill) held by
// a tilted orbit ring. Coordinates live in the same unit space as the
// CosmicUniverse cloud states: y grows downward, positive z faces the viewer,
// and the overall extent stays near ±0.55 so the logo state sits comfortably
// inside the footprint of the other states. The 2D counterpart is
// src/LogoMark.tsx — change both together.

const TAU = Math.PI * 2;

const CENTER_X = 50;
const CENTER_Y = 44;
const UNIT = 1 / 78;

type Point = readonly [number, number];

const TIP_TOP: Point = [50.5, 3];
const TIP_RIGHT: Point = [94, 42.5];
const TIP_BOTTOM: Point = [49.5, 97];
const TIP_LEFT: Point = [6, 45.5];

// The same quadratic bezier edges the SVG mark draws, controls near the waist
// so the star reads concave.
const STAR_EDGES: ReadonlyArray<readonly [Point, Point, Point]> = [
  [TIP_TOP, [52, 41], TIP_RIGHT],
  [TIP_RIGHT, [52.5, 47], TIP_BOTTOM],
  [TIP_BOTTOM, [47.5, 47.5], TIP_LEFT],
  [TIP_LEFT, [47.5, 41], TIP_TOP],
];

const RING_RADIUS = 36 * UNIT;
const RING_PITCH = (25 / 180) * Math.PI; // out-of-plane tilt of the ring plane
const RING_TILT = (-30 / 180) * Math.PI; // in-plane rotation, low-left to up-right

function fract(value: number) {
  return value - Math.floor(value);
}

function seeded(index: number, salt: number) {
  return fract(Math.sin(index * 91.173 + salt * 47.719) * 43758.5453);
}

/**
 * Fills the given arrays with the logo particle distribution: 45% outer star
 * contour (samples biased toward the edge ends so the four tips glow), 10%
 * inner contour echo, 20% volumetric body fill, 25% orbit ring. Deterministic
 * per index so repeated calls produce identical clouds.
 */
export function fillLogoCloud(
  x: Float32Array,
  y: Float32Array,
  z: Float32Array,
  count: number,
) {
  const sinPitch = Math.sin(RING_PITCH);
  const cosPitch = Math.cos(RING_PITCH);
  const sinTilt = Math.sin(RING_TILT);
  const cosTilt = Math.cos(RING_TILT);

  for (let index = 0; index < count; index += 1) {
    const seedA = seeded(index, 51);
    const seedB = seeded(index, 52);
    const seedC = seeded(index, 53);
    const seedD = seeded(index, 54);
    const seedE = seeded(index, 55);
    const lane = index % 20;

    if (lane < 11) {
      // Star wire: outer contour, or the smaller inner echo of the openwork.
      // Outer samples cluster toward the edge ends so the four tips glow.
      const inner = lane >= 9;
      const [start, control, end] = STAR_EDGES[Math.min(3, Math.floor(seedA * 4))];
      const t = inner
        ? 0.14 + seedB * 0.72
        : seedB - 0.12 * Math.sin(seedB * TAU);
      const u = 1 - t;
      const px = u * u * start[0] + 2 * u * t * control[0] + t * t * end[0];
      const py = u * u * start[1] + 2 * u * t * control[1] + t * t * end[1];
      const shrink = inner ? 0.55 : 1;
      const spread = inner ? 0.024 : 0.03;
      // Chisel cross-section like the pendant strands: deep near the edge
      // waist, sharp at the tips, so the side profile reads as a spindle
      // instead of a flat stick.
      const depth = inner
        ? 0.05 + 0.14 * Math.sin(Math.PI * t)
        : 0.07 + 0.25 * Math.sin(Math.PI * t);
      x[index] = (px - CENTER_X) * UNIT * shrink + (seedC - 0.5) * spread;
      y[index] = (py - CENTER_Y) * UNIT * shrink + (seedD - 0.5) * spread;
      z[index] = (seedE - 0.5) * depth;
    } else if (lane < 15) {
      // Volumetric body: a contour point pulled toward the center fills the
      // star as a soft lens, thicker near the middle and thin at the tips.
      const [start, control, end] = STAR_EDGES[Math.min(3, Math.floor(seedA * 4))];
      const t = seedB;
      const u = 1 - t;
      const px = (u * u * start[0] + 2 * u * t * control[0] + t * t * end[0] - CENTER_X) * UNIT;
      const py = (u * u * start[1] + 2 * u * t * control[1] + t * t * end[1] - CENTER_Y) * UNIT;
      const reach = Math.pow(seedC, 0.5);
      x[index] = px * reach + (seedE - 0.5) * 0.02;
      y[index] = py * reach + (seedE - 0.5) * 0.014;
      z[index] = (seedD - 0.5) * 0.32 * (1 - reach * 0.75);
    } else {
      // Orbit ring: a true circle tilted out of the star plane, so its lower
      // half sits in front of the star and its upper half behind it.
      const theta = seedA * TAU;
      const radius = RING_RADIUS * (1 + (seedB - 0.5) * 0.06);
      const ringX = Math.cos(theta) * radius + (seedC - 0.5) * 0.024;
      const across = Math.sin(theta) * radius;
      const ringY = across * sinPitch + (seedD - 0.5) * 0.024;
      z[index] = across * cosPitch + (seedE - 0.5) * 0.024;
      x[index] = ringX * cosTilt - ringY * sinTilt;
      y[index] = ringX * sinTilt + ringY * cosTilt;
    }
  }
}

export type LogoCloud = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
};

export function createLogoCloud(count: number): LogoCloud {
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const z = new Float32Array(count);
  fillLogoCloud(x, y, z, count);
  return { count, x, y, z };
}
