/**
 * Mark geometry.
 *
 * A design is a list of primitives, never a hand-written path string. From that
 * one description we derive the SVG the page draws, the favicon file, and the
 * point cloud the particle field starts from — so a design can be swapped or
 * adjusted in one place and everything downstream follows.
 */

export const VIEW = 100;
export const C = VIEW / 2;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** A tapering spike, wide where it leaves its origin and drawn out to a point. */
export type Needle = {
  kind: "needle";
  /** Origin, offset from the centre. Defaults to the centre. */
  x?: number;
  y?: number;
  /** Degrees, 0 = right, 90 = up. */
  angle: number;
  length: number;
  /** Half-width at the base. */
  width: number;
  /** How hard the flanks pinch in behind the base. Lower = sharper. */
  pinch?: number;
  /** Stay filled even when the design as a whole is drawn as an outline. */
  solid?: boolean;
};

/** A straight rounded bar, centred on its origin. */
export type Bar = {
  kind: "bar";
  x?: number;
  y?: number;
  angle: number;
  length: number;
  width: number;
  /** Declared for uniformity; a bar is a stroke already, so it is always solid. */
  solid?: boolean;
};

/** A band around the waist, read as a circle turned away from the viewer. */
export type Ring = {
  kind: "ring";
  rx: number;
  ry: number;
  /** Degrees of roll in the picture plane. */
  roll: number;
  width: number;
};

/**
 * A closed star outline: tip, inner corner, tip, inner corner, all the way
 * round. Built as one path rather than as overlapping spikes, so the spikes
 * stop where they meet each other and the middle stays open.
 */
export type Star = {
  kind: "star";
  points: number;
  outer: number;
  /** Radius of the inner corners, where two neighbouring flanks meet. */
  inner: number;
  /** Degrees off upright. */
  tilt: number;
  /**
   * How far each flank bows toward the centre, 0..1. At 0 the edges are dead
   * straight and the star is a plain polygon — tip, corner, tip, corner — which
   * is what the pendant actually is. Above 0 they scoop inward.
   */
  curve: number;
  /** Radius of the arc that replaces each sharp inner corner. */
  round: number;
  /**
   * Draw the star as a band of metal this wide rather than as a filled shape.
   *
   * Not a stroke. A stroke keeps its width all the way to the tip, where flanks
   * meeting at seven degrees would need a miter reaching twenty units past the
   * point — past any sane miter limit, so it bevels and the spike ends in a flat
   * cut. A band is the region between two star outlines that share their tips,
   * so it is widest at the inner corners and pinches shut to a real point. Which
   * is what the pendant is: a frame, not a traced line.
   */
  band?: number;
  /** Roughen the band the way poured metal sets. */
  melt?: Melt;
  /** Stay filled even when the design as a whole is drawn as an outline. */
  solid?: boolean;
};

/**
 * The uneven, poured quality of the real pendant.
 *
 * Both edges of the strand are displaced by their own smooth wave, so the metal
 * swells and pinches asymmetrically instead of staying an even ribbon, and the
 * centreline itself wanders a little. The waves are built from whole-numbered
 * harmonics of the loop, which makes them exactly periodic — no seam where the
 * band closes — and they are driven off a fixed seed, so the drawn logo and the
 * particle cloud melt identically.
 */
export type Melt = {
  /** Thickness variation, as a fraction of the band width. */
  swell: number;
  /** How far the centreline wanders, in view units. */
  drift: number;
  /** Harmonics in the wave. More gives finer, busier detail. */
  detail: number;
  seed: number;
};

export type Part = Needle | Bar | Ring | Star;

export type Design = {
  id: string;
  name: string;
  note: string;
  parts: readonly Part[];
  /** When set, solid parts are drawn as outlines of this stroke width. */
  hollow?: number;
  /** Darkness cut either side of the ring where it crosses in front. */
  gap?: number;
};

export type Layer = { d: string; fill: boolean; width?: number; evenOdd?: boolean };

/**
 * How much of each flank is given over to sharpening the tip.
 *
 * Kept short on purpose. The flanks of a spike close at about seven degrees, so
 * they converge roughly in step with distance from the point, while a smoothstep
 * taper thins the strand with the square of it. Taper over too long a run and
 * the strand becomes narrower than the gap it is meant to fill, which leaves a
 * hair trailing out past the solid part of the spike.
 */
const TAPER = 0.08;

const polyPath = (pts: Point[]) =>
  pts.reduce(
    (d, p, i) => `${d}${i ? "L" : "M"}${round(p[0])} ${round(p[1])}`,
    "",
  ) + "Z";

export type Rendered = {
  /** The far half of the ring, hidden behind the body. */
  back: Layer[];
  /** The star itself, with a gap cut where the near half of the ring crosses. */
  body: Layer[];
  /** The near half of the ring, over everything. */
  front: Layer[];
  /** Width of the mask stroke that cuts the gap. Zero when there is no ring. */
  gapWidth: number;
  frontPath: string | null;
};

const round = (n: number) => Number(n.toFixed(2));
type Point = readonly [number, number];

/** Steps used when flattening a quadratic into a polyline. */
const SEGMENTS = 22;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A smooth wave over a closed loop, in -1..1.
 *
 * Whole-numbered harmonics only, so it comes back to itself exactly at t = 1 and
 * the band has no seam. Amplitude falls as 1/k^0.7 rather than 1/k: a steeper
 * roll-off leaves one long swell around the whole loop, where what the pendant
 * actually shows is runs and drips a few units apart.
 */
const FALLOFF = 0.7;

function loopWave(seed: number, harmonics: number) {
  const random = seeded(seed);
  const phase: number[] = [];
  const amp: number[] = [];
  let norm = 0;
  for (let k = 1; k <= harmonics; k++) {
    phase.push(random() * TAU);
    const a = Math.pow(k, -FALLOFF);
    amp.push(a);
    norm += a;
  }
  return (t: number) => {
    let v = 0;
    for (let k = 1; k <= harmonics; k++) v += amp[k - 1] * Math.sin(TAU * k * t + phase[k - 1]);
    return v / norm;
  };
}

function quadPoints(a: Point, c: Point, b: Point, out: Point[]) {
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const it = 1 - t;
    out.push([
      it * it * a[0] + 2 * it * t * c[0] + t * t * b[0],
      it * it * a[1] + 2 * it * t * c[1] + t * t * b[1],
    ]);
  }
}

/* ------------------------------------------------------------------ needles */

type Frame = { origin: Point; dir: Point; side: Point; length: number; width: number; pinch: number };

function frameOf(n: Needle, weight: number): Frame {
  const a = n.angle * DEG;
  // y is down in view space, so the sine is negated.
  const dir: Point = [Math.cos(a), -Math.sin(a)];
  return {
    origin: [C + (n.x ?? 0), C + (n.y ?? 0)],
    dir,
    side: [-dir[1], dir[0]],
    length: n.length,
    width: n.width * weight,
    pinch: n.pinch ?? 0.38,
  };
}

const along = (f: Frame, t: number): Point => [
  f.origin[0] + f.dir[0] * f.length * t,
  f.origin[1] + f.dir[1] * f.length * t,
];

const shift = (p: Point, f: Frame, w: number): Point => [p[0] + f.side[0] * w, p[1] + f.side[1] * w];

const PINCH_ALONG = 0.28;

function needleOutline(f: Frame) {
  return {
    tip: along(f, 1),
    left: shift(f.origin, f, f.width),
    right: shift(f.origin, f, -f.width),
    cl: shift(along(f, PINCH_ALONG), f, f.width * f.pinch),
    cr: shift(along(f, PINCH_ALONG), f, -f.width * f.pinch),
  };
}

function needlePath(f: Frame): string {
  const o = needleOutline(f);
  return (
    `M${round(o.left[0])} ${round(o.left[1])}` +
    `Q${round(o.cl[0])} ${round(o.cl[1])} ${round(o.tip[0])} ${round(o.tip[1])}` +
    `Q${round(o.cr[0])} ${round(o.cr[1])} ${round(o.right[0])} ${round(o.right[1])}Z`
  );
}

/* -------------------------------------------------------------------- star */

const polar = (angle: number, radius: number): Point => [
  C + Math.cos(angle * DEG) * radius,
  C - Math.sin(angle * DEG) * radius,
];

type Seg = {
  from: Point;
  ctrl: Point;
  to: Point;
  /** Taper reading at each end: 0 at a tip, 1 where the strand is full width. */
  a0: number;
  a1: number;
};

/**
 * The centreline, as a run of quadratic segments.
 *
 * Each spike is two straight edges from the tip down to where the inner corner
 * begins to turn, and the corner itself is an arc between them rather than a
 * point — which is what keeps the valleys from reading as creases. `curve` bows
 * the straight edges inward if it is above zero; at zero they stay straight,
 * because the control point sits on the midpoint and the quadratic degenerates
 * to a line.
 */
function starSegments(s: Star): Seg[] {
  const step = 360 / s.points;
  const centre: Point = [C, C];

  const bow = (a: Point, b: Point): Point => {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    return [mx + (centre[0] - mx) * s.curve, my + (centre[1] - my) * s.curve];
  };
  const gap = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const towards = (from: Point, to: Point, d: number): Point => {
    const l = gap(from, to) || 1;
    return [from[0] + ((to[0] - from[0]) / l) * d, from[1] + ((to[1] - from[1]) / l) * d];
  };

  const tips: Point[] = [];
  const corners: Point[] = [];
  for (let i = 0; i < s.points; i++) {
    tips.push(polar(s.tilt + i * step, s.outer));
    corners.push(polar(s.tilt + i * step + step / 2, s.inner));
  }

  const segs: Seg[] = [];
  for (let i = 0; i < s.points; i++) {
    const tip = tips[i];
    const corner = corners[i];
    const nextTip = tips[(i + 1) % s.points];
    // Never eat more than half an edge, or neighbouring rounds would collide.
    const r = Math.min(s.round, 0.45 * Math.min(gap(tip, corner), gap(corner, nextTip)));
    const p = towards(corner, tip, r);
    const q = towards(corner, nextTip, r);

    segs.push({ from: tip, ctrl: bow(tip, p), to: p, a0: 0, a1: 1 });
    segs.push({ from: p, ctrl: corner, to: q, a0: 1, a1: 1 });
    segs.push({ from: q, ctrl: bow(q, nextTip), to: nextTip, a0: 1, a1: 0 });
  }
  return segs;
}

function starPath(s: Star): string {
  const segs = starSegments(s);
  let d = `M${round(segs[0].from[0])} ${round(segs[0].from[1])}`;
  for (const seg of segs) {
    d += `Q${round(seg.ctrl[0])} ${round(seg.ctrl[1])} ${round(seg.to[0])} ${round(seg.to[1])}`;
  }
  return `${d}Z`;
}

/** The centreline flattened, carrying the taper reading with it. */
function flattenStar(s: Star) {
  const pts: Point[] = [];
  const along: number[] = [];
  for (const seg of starSegments(s)) {
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      const it = 1 - u;
      const p: Point = [
        it * it * seg.from[0] + 2 * it * u * seg.ctrl[0] + u * u * seg.to[0],
        it * it * seg.from[1] + 2 * it * u * seg.ctrl[1] + u * u * seg.to[1],
      ];
      const last = pts[pts.length - 1];
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 1e-6) continue;
      pts.push(p);
      along.push(seg.a0 + (seg.a1 - seg.a0) * u);
    }
  }
  const n = pts.length;
  if (n > 1 && Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) < 1e-6) {
    pts.pop();
    along.pop();
  }
  return { pts, along };
}

/**
 * The two edges of the metal.
 *
 * The strand keeps one thickness for almost its whole length and only narrows
 * over the last stretch before each tip, which is where the point comes from —
 * a rod of constant section, sharpened at the ends. Offsetting the centreline by
 * a width that falls to zero at the tips gives exactly that, and because both
 * edges arrive at the same place there, the tip is a real point rather than
 * anything a stroke would have to miter.
 */
export function starBand(s: Star, width: number, taper: number) {
  const { pts: centre, along } = flattenStar(s);
  const count = centre.length;

  // Walk the loop by distance rather than by index, or the waves would bunch up
  // over the short corner arcs and stretch out along the long edges.
  const travelled: number[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    travelled.push(total);
    const next = centre[(i + 1) % count];
    total += Math.hypot(next[0] - centre[i][0], next[1] - centre[i][1]);
  }

  const melt = s.melt;
  const waveOuter = melt ? loopWave(melt.seed, melt.detail) : null;
  const waveInner = melt ? loopWave(melt.seed + 977, melt.detail) : null;
  const waveDrift = melt ? loopWave(melt.seed + 5501, melt.detail) : null;

  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let i = 0; i < count; i++) {
    const prev = centre[(i - 1 + count) % count];
    const next = centre[(i + 1) % count];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    // Sharpening the tip is applied last and multiplicatively, so however the
    // metal swells elsewhere, both edges still arrive at the point together.
    const t = Math.min(1, Math.max(0, along[i] / taper));
    const sharpen = t * t * (3 - 2 * t);
    const u = total > 0 ? travelled[i] / total : 0;

    const drift = waveDrift ? waveDrift(u) * melt!.drift * sharpen : 0;
    const cx = centre[i][0] + nx * drift;
    const cy = centre[i][1] + ny * drift;

    // Floored: past a swell of 1 the wave would drive an edge through the
    // centreline and the band would turn itself inside out.
    const half = (width * sharpen) / 2;
    const swellAt = (wave: ((t: number) => number) | null) =>
      half * Math.max(0.12, 1 + (wave ? wave(u) * melt!.swell : 0));
    const out = swellAt(waveOuter);
    const inn = swellAt(waveInner);

    outer.push([cx + nx * out, cy + ny * out]);
    inner.push([cx - nx * inn, cy - ny * inn]);
  }

  return { outer, inner };
}

/** The outline flattened, for sampling a filled star. */
const starPolygon = (s: Star): Point[] => flattenStar(s).pts;

/* --------------------------------------------------------------- bars, rings */

function barEnds(b: Bar, weight: number) {
  const a = b.angle * DEG;
  const dx = Math.cos(a) * (b.length / 2);
  const dy = -Math.sin(a) * (b.length / 2);
  const ox = C + (b.x ?? 0);
  const oy = C + (b.y ?? 0);
  return {
    from: [ox - dx, oy - dy] as Point,
    to: [ox + dx, oy + dy] as Point,
    width: b.width * weight,
  };
}

const barPath = (b: Bar, weight: number) => {
  const e = barEnds(b, weight);
  return `M${round(e.from[0])} ${round(e.from[1])}L${round(e.to[0])} ${round(e.to[1])}`;
};

const ringPoint = (r: Ring, t: number): Point => {
  const roll = r.roll * DEG;
  const x = r.rx * Math.cos(t);
  const y = r.ry * Math.sin(t);
  return [C + x * Math.cos(roll) - y * Math.sin(roll), C + x * Math.sin(roll) + y * Math.cos(roll)];
};

/** `front` is the half nearer the viewer. */
function ringArc(r: Ring, front: boolean): string {
  const from = ringPoint(r, front ? 0 : Math.PI);
  const to = ringPoint(r, front ? Math.PI : TAU);
  return (
    `M${round(from[0])} ${round(from[1])}` +
    `A${r.rx} ${r.ry} ${r.roll} 0 1 ${round(to[0])} ${round(to[1])}`
  );
}

/** The ring read as a real circle in space, for placing it in the 3D field. */
export function ringDepth(r: Ring) {
  return { radius: r.rx, pitch: Math.acos(r.ry / r.rx), roll: r.roll * DEG };
}

export const ringOf = (d: Design): Ring | null =>
  (d.parts.find((p) => p.kind === "ring") as Ring | undefined) ?? null;

/* ------------------------------------------------------------------- render */

/**
 * `weight` is an optical-size adjustment, not a redesign: below about 24px the
 * thinner marks dissolve into a grey smudge, so small renderings draw the same
 * geometry with fatter flanks.
 */
export function renderDesign(design: Design, weight = 1): Rendered {
  const body: Layer[] = [];
  const back: Layer[] = [];
  const front: Layer[] = [];
  let gapWidth = 0;
  let frontPath: string | null = null;

  for (const part of design.parts) {
    // A part may opt out of the design's outline and stay solid.
    const hollow = design.hollow && !(part.kind !== "ring" && part.solid) ? design.hollow : 0;

    if (part.kind === "star") {
      if (part.band) {
        // Both edges of the strand in one path, the inner one reversed so the
        // non-zero rule cancels it out and leaves the middle open.
        //
        // Even-odd cannot be used here: near a tip the strand doubles back on
        // itself, and even-odd unfills anything covered twice — which punched a
        // slit into every point, splitting each spike in two.
        const { outer, inner } = starBand(part, part.band * weight, TAPER);
        body.push({ d: `${polyPath(outer)}${polyPath([...inner].reverse())}`, fill: true });
      } else {
        // A filled star cannot take a fatter stroke, so weight moves its inner
        // corners out instead, which thickens the arms by the same intent.
        const d = starPath(hollow ? part : { ...part, inner: part.inner * weight });
        body.push(hollow ? { d, fill: false, width: hollow * weight } : { d, fill: true });
      }
    } else if (part.kind === "needle") {
      const d = needlePath(frameOf(part, weight));
      body.push(hollow ? { d, fill: false, width: hollow * weight } : { d, fill: true });
    } else if (part.kind === "bar") {
      body.push({ d: barPath(part, weight), fill: false, width: part.width * weight });
    } else {
      const width = part.width * weight;
      back.push({ d: ringArc(part, false), fill: false, width });
      frontPath = ringArc(part, true);
      front.push({ d: frontPath, fill: false, width });
      gapWidth = width + (design.gap ?? 2.6) * 2;
    }
  }

  return { back, body, front, gapWidth, frontPath };
}

/* ----------------------------------------------------------------- sampling */

/**
 * Particle placement.
 *
 * The mark is a union of overlapping shapes: the corner spikes grow out of the
 * band, and the strand doubles back over itself at every tip. Sampling each
 * shape on its own puts twice the grains wherever two of them cross, so every
 * junction burns brighter than the metal around it — which is the one thing a
 * cast object never does.
 *
 * So the silhouette is rasterised once into a coverage grid and grains are
 * scattered over the covered cells. That is uniform by construction: an overlap
 * is just a cell that was already covered, and counts once.
 */

const GRID = 1024;

/** The needle's outline, flattened. */
function needlePolygon(f: Frame): Point[] {
  const o = needleOutline(f);
  const pts: Point[] = [];
  quadPoints(o.left, o.cl, o.tip, pts);
  quadPoints(o.tip, o.cr, o.right, pts);
  return pts;
}

/** The bar as a closed shape, round caps included. */
function barPolygon(b: Bar): Point[] {
  const e = barEnds(b, 1);
  const dx = e.to[0] - e.from[0];
  const dy = e.to[1] - e.from[1];
  const len = Math.hypot(dx, dy) || 1;
  const half = e.width / 2;
  const nx = (-dy / len) * half;
  const ny = (dx / len) * half;
  const angle = Math.atan2(ny, nx);

  const arc = (centre: Point, from: number) => {
    const out: Point[] = [];
    for (let k = 1; k < 12; k++) {
      const a = from - (Math.PI * k) / 12;
      out.push([centre[0] + Math.cos(a) * half, centre[1] + Math.sin(a) * half]);
    }
    return out;
  };

  return [
    [e.from[0] + nx, e.from[1] + ny],
    [e.to[0] + nx, e.to[1] + ny],
    ...arc(e.to, angle),
    [e.to[0] - nx, e.to[1] - ny],
    [e.from[0] - nx, e.from[1] - ny],
    ...arc(e.from, angle + Math.PI),
  ];
}

/** A closed outline turned into the ring of metal a stroke would lay down. */
function strokeRing(pts: Point[], width: number): Point[][] {
  const n = pts.length;
  const half = width / 2;
  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const l = Math.hypot(dx, dy) || 1;
    outer.push([pts[i][0] - (dy / l) * half, pts[i][1] + (dx / l) * half]);
    inner.push([pts[i][0] + (dy / l) * half, pts[i][1] - (dx / l) * half]);
  }
  return [outer, inner.reverse()];
}

/** Closed polygons whose combined non-zero winding is the mark's filled area. */
function bodyPolygons(design: Design): Point[][] {
  const polys: Point[][] = [];

  for (const part of design.parts) {
    const hollow = design.hollow && !(part.kind !== "ring" && part.solid) ? design.hollow : 0;

    if (part.kind === "star") {
      if (part.band) {
        const { outer, inner } = starBand(part, part.band, TAPER);
        polys.push(outer, [...inner].reverse());
      } else if (hollow) {
        polys.push(...strokeRing(starPolygon(part), hollow));
      } else {
        polys.push(starPolygon(part));
      }
    } else if (part.kind === "needle") {
      const shape = needlePolygon(frameOf(part, 1));
      if (hollow) polys.push(...strokeRing(shape, hollow));
      else polys.push(shape);
    } else if (part.kind === "bar") {
      polys.push(barPolygon(part));
    }
    // Rings live in the field's third dimension and are placed there, not here.
  }

  return polys;
}

type Cover = { cells: Uint32Array; cdf: Float64Array; size: number };

/**
 * Density field.
 *
 * An even scatter over the silhouette is uniform, which is exactly the problem:
 * it reads as printed rather than cast. Weighting each cell by smooth noise lets
 * the grains gather and thin across the metal, so the surface has the same
 * unevenness the object does.
 */
const CLUMP_SCALE = 0.45;
/** 0 leaves the scatter even; 1 lets it run from near-bare to twice as dense. */
const CLUMP_DEPTH = 0.85;
const CLUMP_SEED = 0x9e37;

function valueNoise(seed: number) {
  const at = (x: number, y: number) => {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * u;
    const bottom = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * u;
    return top + (bottom - top) * v;
  };
}

/** Three octaves: broad patches, broken up twice. */
function clumping() {
  const octaves = [valueNoise(CLUMP_SEED), valueNoise(CLUMP_SEED + 71), valueNoise(CLUMP_SEED + 149)];
  return (x: number, y: number) => {
    let v = 0;
    let amp = 1;
    let freq = CLUMP_SCALE;
    let norm = 0;
    for (const octave of octaves) {
      v += octave(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.3;
    }
    return v / norm;
  };
}

/** Scanline fill, non-zero winding, collecting the cells that end up inside. */
function rasterize(polys: Point[][], size: number): Cover {
  const scale = size / VIEW;
  const x0: number[] = [];
  const y0: number[] = [];
  const x1: number[] = [];
  const y1: number[] = [];
  const dir: number[] = [];

  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const ay = a[1] * scale;
      const by = b[1] * scale;
      if (ay === by) continue;
      x0.push(a[0] * scale);
      y0.push(ay);
      x1.push(b[0] * scale);
      y1.push(by);
      dir.push(by > ay ? 1 : -1);
    }
  }

  const edges = dir.length;
  const cells: number[] = [];
  const hitX: number[] = [];
  const hitW: number[] = [];
  const order: number[] = [];

  for (let py = 0; py < size; py++) {
    const y = py + 0.5;
    hitX.length = 0;
    hitW.length = 0;
    for (let e = 0; e < edges; e++) {
      const lo = y0[e] < y1[e] ? y0[e] : y1[e];
      const hi = y0[e] < y1[e] ? y1[e] : y0[e];
      if (y < lo || y >= hi) continue;
      hitX.push(x0[e] + ((x1[e] - x0[e]) * (y - y0[e])) / (y1[e] - y0[e]));
      hitW.push(dir[e]);
    }
    if (hitX.length < 2) continue;

    order.length = hitX.length;
    for (let i = 0; i < hitX.length; i++) order[i] = i;
    order.sort((a, b) => hitX[a] - hitX[b]);

    let wind = 0;
    for (let k = 0; k < order.length - 1; k++) {
      wind += hitW[order[k]];
      if (wind === 0) continue;
      const from = Math.max(0, Math.ceil(hitX[order[k]] - 0.5));
      const to = Math.min(size - 1, Math.floor(hitX[order[k + 1]] - 0.5));
      for (let px = from; px <= to; px++) cells.push(py * size + px);
    }
  }

  const noise = clumping();
  const cdf = new Float64Array(cells.length);
  let running = 0;
  for (let i = 0; i < cells.length; i++) {
    const px = cells[i] % size;
    const py = (cells[i] - px) / size;
    const n = noise(((px + 0.5) * VIEW) / size, ((py + 0.5) * VIEW) / size);
    running += 1 - CLUMP_DEPTH + CLUMP_DEPTH * 2 * Math.pow(n, 1.4);
    cdf[i] = running;
  }
  for (let i = 0; i < cdf.length; i++) cdf[i] /= running || 1;

  return { cells: Uint32Array.from(cells), cdf, size };
}

const covers = new WeakMap<Design, Cover>();

/** A point somewhere on the mark, uniformly across its filled area. */
export function sampleBody(design: Design, u0: number, u1: number, u2: number): Point {
  let cover = covers.get(design);
  if (!cover) {
    cover = rasterize(bodyPolygons(design), GRID);
    covers.set(design, cover);
  }

  const { cells, cdf, size } = cover;
  if (!cells.length) return [C, C];

  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < u0) lo = mid + 1;
    else hi = mid;
  }

  const idx = cells[lo];
  const px = idx % size;
  const py = (idx - px) / size;
  return [((px + u1) * VIEW) / size, ((py + u2) * VIEW) / size];
}

/** View coordinates to the field's world space: centred, y up, unit radius. */
export function toWorld(x: number, y: number, scale: number) {
  return [((x - C) / C) * scale, ((C - y) / C) * scale] as const;
}
