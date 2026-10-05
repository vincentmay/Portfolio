/**
 * Renders every candidate mark as a particle cloud, so the shapes can be judged
 * the way the hero actually shows them. Development aid only.
 *
 *   node scripts/marks.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { DESIGNS } from "../src/brand/designs.ts";
import { VIEW, ringDepth, ringOf, sampleBody, toWorld } from "../src/brand/geometry.ts";
import { png, render, sheet } from "./lib/raster.mjs";

const OUT = new URL("../.preview/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const SIZE = 460;
const COUNT = 70_000;
const SCALE = 0.94;
const TAU = Math.PI * 2;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (u, v) =>
  Math.max(-3, Math.min(3, Math.sqrt(-2 * Math.log(1 - u * 0.9999)) * Math.cos(Math.PI * 2 * v)));

/** The same placement the field uses for the mark state. Keep the two in step. */
function cloud(design) {
  const random = rng(0x5eed);
  const out = new Float32Array(COUNT * 3);
  const ring = ringOf(design);
  const ringR = ring ? (ring.rx / (VIEW / 2)) * SCALE : 0;
  const share = ring ? 0.16 : 0;
  const scatter = 0.32;

  for (let p = 0; p < COUNT; p++) {
    const u = Array.from({ length: 12 }, random);
    const i = p * 3;

    if (ring && u[7] < share) {
      const { pitch, roll } = ringDepth(ring);
      const t = u[0] * TAU;
      const ta = u[5] * TAU;
      const tr = 0.016 * Math.sqrt(u[6]);
      const r = ringR + Math.cos(ta) * tr;
      const x0 = Math.cos(t) * r;
      const y0 = Math.sin(t) * r;
      const lift = Math.sin(ta) * tr;
      const y1 = y0 * Math.cos(pitch) - lift * Math.sin(pitch);
      out[i] = x0 * Math.cos(roll) + y1 * Math.sin(roll);
      out[i + 1] = -x0 * Math.sin(roll) + y1 * Math.cos(roll);
      out[i + 2] = y0 * Math.sin(pitch) + lift * Math.cos(pitch);
      continue;
    }

    const q = sampleBody(design, u[1], u[2], u[3]);
    const w = toWorld(
      q[0] + gauss(u[8], u[9]) * scatter,
      q[1] + gauss(u[10], u[11]) * scatter,
      SCALE,
    );
    out[i] = w[0];
    out[i + 1] = w[1];
    out[i + 2] = (u[4] - 0.5) * 0.03;
  }
  return out;
}

/** Cut a square out of a square buffer, clamped to its bounds. */
function crop(pixels, size, cx, cy, box) {
  const x0 = Math.max(0, Math.min(size - box, Math.round(cx - box / 2)));
  const y0 = Math.max(0, Math.min(size - box, Math.round(cy - box / 2)));
  const out = new Uint8Array(box * box);
  for (let y = 0; y < box; y++) {
    out.set(pixels.subarray((y0 + y) * size + x0, (y0 + y) * size + x0 + box), y * box);
  }
  return out;
}

const frames = DESIGNS.map((design) => {
  const points = cloud(design);
  const pixels = render(points, COUNT, { yaw: 0.24, width: SIZE, exposure: 2.2 });
  writeFileSync(new URL(`mark-${design.id}.png`, OUT), png(SIZE, SIZE, pixels));
  console.log(`  mark-${design.id}.png`);

  // The north spike at magnification, which is where tip artefacts show up.
  const BIG = 1600;
  const big = render(points, COUNT, { yaw: 0.24, width: BIG, exposure: 2.2 });
  const f = BIG / 2 / Math.tan((42 / 2) * (Math.PI / 180));
  let top = -1;
  let topY = Infinity;
  for (let p = 0; p < COUNT; p++) {
    const y = points[p * 3 + 1];
    const sy = BIG / 2 - (y / (3.05 - points[p * 3 + 2])) * f;
    if (sy < topY) {
      topY = sy;
      top = p;
    }
  }
  const tx =
    BIG / 2 +
    ((points[top * 3] * Math.cos(0.24) + points[top * 3 + 2] * Math.sin(0.24)) /
      (3.05 - points[top * 3 + 2])) *
      f;
  const tip = crop(big, BIG, tx, topY + 150, 420);
  writeFileSync(new URL(`mark-${design.id}-tip.png`, OUT), png(420, 420, tip));
  console.log(`  mark-${design.id}-tip.png`);

  return pixels;
});

const row = sheet(frames, SIZE);
writeFileSync(new URL("marks.png", OUT), png(row.width, row.height, row.pixels));
console.log(`  marks.png (${DESIGNS.map((d) => d.id).join(" · ")})`);
