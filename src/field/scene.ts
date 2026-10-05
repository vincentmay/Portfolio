/**
 * The choreography: which state the field holds at each section of the page,
 * and how the object is framed there so it never fights the text.
 *
 * The page and the field read the same list, so a section can't drift out of
 * sync with the shape that belongs to it.
 */

import { SHAPE_COUNT, SHAPE_NAMES, type ShapeName } from "./shapes.ts";
import type { FieldFrame } from "./renderer.ts";

export type StageId = "index" | "focus" | "work" | "about" | "method" | "contact";

export type Stage = {
  id: StageId;
  shape: ShapeName;
  /** Screen-space nudge in clip units: positive x pushes the object right. */
  offset: readonly [number, number];
  /** How present the field is here. Sections dense with text sit lower. */
  fade: number;
  exposure: number;
  bloom: number;
};

export const STAGES: readonly Stage[] = [
  { id: "index", shape: "mark", offset: [0, 0.34], fade: 1.0, exposure: 1.32, bloom: 0.95 },
  { id: "focus", shape: "disc", offset: [0.36, -0.04], fade: 0.72, exposure: 1.06, bloom: 0.8 },
  { id: "work", shape: "spiral", offset: [0.42, 0.0], fade: 0.5, exposure: 0.94, bloom: 0.68 },
  // Pulled low, left and well back: behind the portrait it should read as a
  // glow around the silhouette, not as an object driving through his chest.
  { id: "about", shape: "orrery", offset: [-0.44, -0.24], fade: 0.36, exposure: 0.96, bloom: 0.62 },
  { id: "method", shape: "burst", offset: [0.3, 0.0], fade: 0.6, exposure: 1.16, bloom: 1.0 },
  { id: "contact", shape: "mark", offset: [0, 0.34], fade: 0.88, exposure: 1.24, bloom: 0.9 },
];

const INDEX_OF = new Map<ShapeName, number>(SHAPE_NAMES.map((n, i) => [n, i]));

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Flat at both ends, so a state settles instead of drifting through. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export type SceneInput = {
  /** Continuous position through STAGES, 0 .. STAGES-1. */
  position: number;
  /** Recent scroll speed, 0..1. Stretches the streaks. */
  energy: number;
  pointerX: number;
  pointerY: number;
  /** Scales the horizontal offsets away on narrow screens. */
  spread: number;
  /** Fades the whole field, e.g. while the page is still arriving. */
  presence: number;
};

const weights = new Float32Array(SHAPE_COUNT);

export function frameFor(input: SceneInput): FieldFrame {
  const last = STAGES.length - 1;
  const p = clamp(input.position, 0, last);
  const i = Math.min(last - 1, Math.floor(p));
  const raw = p - i;
  const t = ease(raw);

  const from = STAGES[i];
  const to = STAGES[i + 1];

  weights.fill(0);
  weights[INDEX_OF.get(from.shape)!] += 1 - t;
  weights[INDEX_OF.get(to.shape)!] += t;

  const morph = 4 * t * (1 - t);

  return {
    weights,
    morph,
    streak: 0.3 + input.energy * 3.2 + morph * 1.8,
    yaw: input.pointerX * 0.24,
    pitch: input.pointerY * 0.1,
    offsetX: mix(from.offset[0], to.offset[0], t) * input.spread,
    offsetY: mix(from.offset[1], to.offset[1], t),
    fade: mix(from.fade, to.fade, t) * input.presence,
    exposure: mix(from.exposure, to.exposure, t),
    bloom: mix(from.bloom, to.bloom, t),
  };
}

/**
 * Turns scroll position into a stage position by anchoring each stage to the
 * middle of its own section, so the shape a section belongs to is fully settled
 * while that section is being read.
 */
export function positionFromAnchors(scrollY: number, anchors: number[]) {
  if (anchors.length < 2) return 0;
  if (scrollY <= anchors[0]) return 0;
  const last = anchors.length - 1;
  if (scrollY >= anchors[last]) return last;
  let i = 0;
  while (i < last && scrollY > anchors[i + 1]) i++;
  const span = Math.max(1, anchors[i + 1] - anchors[i]);
  return i + (scrollY - anchors[i]) / span;
}

/** Particle budget: enough to look dense, not enough to melt a laptop. */
export function budgetFor(width: number, height: number, dpr: number) {
  const area = width * height;
  const raw = area / (dpr > 1.5 ? 15 : 11);
  return Math.round(clamp(raw, 22_000, 110_000));
}
