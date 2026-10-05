/**
 * The mark, read off the pendant.
 *
 * An ordinary four-spike star with all four spikes the same length and deep
 * concave valleys between them; a flattened band lying across the north-west
 * and south-east inner corners; and a small spike pushing out of each of the
 * other two corners.
 *
 * Two things about the real object drive the construction. It is open metal,
 * not a filled shape, so everything is drawn as an outline. And the spikes stop
 * where they meet each other rather than carrying on to the centre, so the star
 * is one closed path that turns at each inner corner and the middle stays open.
 *
 * The melted, uneven surface is texture rather than structure, so the drawn mark
 * keeps the structure clean and lets a few degrees of tilt carry the character.
 *
 * `/logo-lab` renders every entry here at real sizes — useful for checking that
 * a change still holds together at 16px, where the band and the corner spikes
 * are the first things to go.
 */

import type { Design, Needle, Star } from "./geometry.ts";

const OUTER = 47;
/**
 * Where two neighbouring flanks meet. The lower this sits the narrower the
 * spikes become, since each one is drawn from its tip down to here.
 */
const INNER = 7.5;
/** A few degrees off upright, the way it hangs. */
const TILT = 4;
/**
 * Thickness of the metal. The strand runs up one side of a spike and back down
 * the other, so anything much above three closes the gap between the two passes
 * and the spike stops reading as an open frame.
 */
const BAND = 3.2;

const star: Star = {
  kind: "star",
  points: 4,
  outer: OUTER,
  inner: INNER,
  tilt: TILT,
  // Straight edges, softened only where they meet: the spikes are clean lines
  // and the valleys turn rather than crease.
  curve: 0,
  round: 4.5,
  band: BAND,
  melt: { swell: 1.15, drift: 1.6, detail: 18, seed: 20260725 },
};

/**
 * A small spike pushing out of one inner corner, along the diagonal.
 *
 * Solid, unlike the star it grows from: on the pendant these are little cast
 * nubs rather than loops of open metal, and at this size an outline would just
 * close up into a muddy sliver anyway. Its base sits on the corner itself —
 * inside the outline stroke, which is 2.6 wide, so it stays attached — rather
 * than further in, where it would poke into the open middle.
 */
function corner(diagonal: number, length: number, width: number): Needle {
  const a = (diagonal + TILT) * (Math.PI / 180);
  const base = INNER + 0.4;
  return {
    kind: "needle",
    x: Math.cos(a) * base,
    y: -Math.sin(a) * base,
    angle: diagonal + TILT,
    length,
    width,
    pinch: 0.34,
    solid: true,
  };
}

export const DESIGNS: readonly Design[] = [
  {
    id: "pendant",
    name: "Pendant",
    note: "Four equal spikes, open middle, band across the NW/SE corners, a small spike out of the other two.",
    parts: [
      star,
      corner(45, 11, 3),
      corner(225, 11, 3),
      // Wrapped close in around the waist rather than sweeping out over the
      // spikes: on the pendant the band barely clears the inner corners.
      { kind: "ring", rx: 17.5, ry: 5.2, roll: 45 + TILT, width: 3.4 },
    ],
    gap: 2.6,
  },
  {
    id: "plain",
    name: "Plain",
    note: "Star only, filled solid. The fallback for sizes where the frame closes up.",
    parts: [{ ...star, band: undefined }],
  },
];

export const designById = (id: string): Design => DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];

/** The mark the site actually uses. */
export const ACTIVE_MARK: Design = designById("pendant");
