import * as THREE from "three";

/**
 * A cast frame, not a tube tracing a star. The inner opening stops before each
 * tip, leaving a solid tapered end. Two smaller spurs belong to the casting.
 * Proportions are drawn from the front and oblique Stellar reference photos.
 * Units are arbitrary; the reference pendant is approximately 18 × 18 mm.
 */
export function createPendantProfile() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 2.2);
  shape.bezierCurveTo(0.06, 1.38, 0.16, 0.66, 0.31, 0.43);
  shape.bezierCurveTo(0.37, 0.4, 0.43, 0.46, 0.56, 0.69);
  shape.bezierCurveTo(0.54, 0.48, 0.45, 0.36, 0.59, 0.29);
  shape.bezierCurveTo(0.95, 0.15, 1.69, 0.06, 2.2, 0);
  shape.bezierCurveTo(1.47, -0.06, 0.71, -0.18, 0.38, -0.34);
  shape.bezierCurveTo(0.22, -0.51, 0.1, -1.51, 0, -2.2);
  shape.bezierCurveTo(-0.13, -1.6, -0.2, -0.72, -0.3, -0.49);
  shape.bezierCurveTo(-0.35, -0.4, -0.49, -0.58, -0.57, -0.65);
  shape.bezierCurveTo(-0.56, -0.47, -0.4, -0.34, -0.55, -0.27);
  shape.bezierCurveTo(-0.96, -0.16, -1.65, -0.06, -2.2, 0);
  shape.bezierCurveTo(-1.58, 0.08, -0.81, 0.17, -0.43, 0.32);
  shape.bezierCurveTo(-0.23, 0.47, -0.1, 1.45, 0, 2.2);
  const opening = new THREE.Path();
  opening.moveTo(0, 1.52);
  opening.bezierCurveTo(0.05, 0.95, 0.08, 0.52, 0.21, 0.3);
  opening.bezierCurveTo(0.4, 0.18, 1.01, 0.09, 1.55, 0);
  opening.bezierCurveTo(1.06, -0.08, 0.43, -0.17, 0.24, -0.32);
  opening.bezierCurveTo(0.13, -0.61, 0.08, -1.14, 0, -1.53);
  opening.bezierCurveTo(-0.07, -1.1, -0.12, -0.58, -0.25, -0.32);
  opening.bezierCurveTo(-0.43, -0.18, -1.05, -0.1, -1.54, 0);
  opening.bezierCurveTo(-1, 0.07, -0.44, 0.2, -0.25, 0.35);
  opening.bezierCurveTo(-0.14, 0.55, -0.08, 1.09, 0, 1.52);
  return { shape, opening };
}

export function createPendantBody() {
  const { shape, opening } = createPendantProfile();
  // Matched radial contours let the whole face swell into a rounded casting.
  // A planar extrusion reflects one flat sheet of light; this surface has a
  // continuous convex section and solid metal between the opening and tips.
  const outer = shape.getPoints(28), inner = opening.getPoints(28);
  const radius = (points: THREE.Vector2[], dx: number, dy: number) => {
    let farthest = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i], q = points[i + 1];
      const sx = q.x - p.x, sy = q.y - p.y;
      const cross = dx * sy - dy * sx;
      if (Math.abs(cross) < 1e-9) continue;
      const t = (p.x * sy - p.y * sx) / cross;
      const u = (p.x * dy - p.y * dx) / cross;
      if (t > 0 && u >= -1e-7 && u <= 1.0000001) farthest = Math.max(t, farthest);
    }
    return farthest;
  };
  const steps = 512, sides = 20;
  const positions: number[] = [], indices: number[] = [];
  for (let i = 0; i < steps; i++) {
    const angle = i / steps * Math.PI * 2;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const outside = radius(outer, dx, dy), inside = radius(inner, dx, dy);
    const center = (outside + inside) / 2, width = (outside - inside) / 2;
    const depth = Math.min(0.16, Math.max(0.055, width * 0.75));
    for (let j = 0; j < sides; j++) {
      const a = j / sides * Math.PI * 2;
      const r = center + Math.cos(a) * width;
      const cast = 1 + 0.045 * Math.sin(angle * 19 + Math.cos(a) * 5) + 0.025 * Math.sin(angle * 43);
      positions.push(dx * r, dy * r, Math.sin(a) * depth * cast);
      const p = i * sides + j, q = ((i + 1) % steps) * sides + j;
      const pn = i * sides + (j + 1) % sides, qn = ((i + 1) % steps) * sides + (j + 1) % sides;
      indices.push(p, q, pn, q, qn, pn);
    }
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  body.setIndex(indices);
  body.computeVertexNormals();
  body.computeBoundingBox();
  return body;
}

/** Flattened oval band: a broad polished face, rounded edges, front/back wrap. */
export function createPendantOrbit() {
  const steps = 160, sides = 16;
  const positions: number[] = [], indices: number[] = [];
  const normal = new THREE.Vector3(0, -0.72, 0.69).normalize();
  const tangent = new THREE.Vector3(), radial = new THREE.Vector3();
  for (let i = 0; i < steps; i++) {
    const t = i / steps * Math.PI * 2;
    const x = 0.82 * Math.cos(t), y = 0.34 * Math.sin(t);
    tangent.set(-0.82 * Math.sin(t), 0.34 * Math.cos(t) * 0.69, 0.34 * Math.cos(t) * 0.72).normalize();
    radial.crossVectors(tangent, normal).normalize();
    for (let j = 0; j < sides; j++) {
      const a = j / sides * Math.PI * 2;
      const r = Math.cos(a) * 0.075, z = Math.sin(a) * 0.047;
      positions.push(x + radial.x * r + normal.x * z, y * 0.69 + radial.y * r + normal.y * z, y * 0.72 + radial.z * r + normal.z * z);
      const p = i * sides + j, q = ((i + 1) % steps) * sides + j;
      const pn = i * sides + (j + 1) % sides, qn = ((i + 1) % steps) * sides + (j + 1) % sides;
      indices.push(p, q, pn, q, qn, pn);
    }
  }
  const orbit = new THREE.BufferGeometry();
  orbit.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  orbit.setIndex(indices);
  orbit.computeVertexNormals();
  orbit.rotateZ(-Math.PI / 4);
  orbit.computeBoundingBox();
  return orbit;
}

export function createPendant(material: THREE.Material) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(createPendantBody(), material);
  body.name = "Cast star frame";
  const band = new THREE.Mesh(createPendantOrbit(), material);
  band.name = "Flattened orbital band";
  group.add(body, band);
  return group;
}
