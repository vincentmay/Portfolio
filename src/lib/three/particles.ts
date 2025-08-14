import * as THREE from 'three';
import { GridAngle } from './flowfield/GridAngle';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

const xOff: number = 0;
const yOff: number = 0;
const spacing: number = 10;
const resolution: number = 0.0005;

const TAU: number = Math.PI * 2;
const noise = new SimplexNoise();

export function createGrid(width: number, height: number): GridAngle[][] {
  const grid: GridAngle[][] = [];

  for (let x = xOff; x < width - xOff; x += spacing) {
    const row: GridAngle[] = [];
    for (let y = yOff; y < height - yOff; y += spacing) {
      const n = noise.noise(x * resolution, y * resolution);
      const angle = THREE.MathUtils.mapLinear(n, -1.0, 1.0, 0.0, TAU);

      row.push(new GridAngle(x, y, spacing, angle));
    }
    grid.push(row);
  }
  return grid;
}

export function createGridLines(width: number, height: number): THREE.LineSegments {
  const grid = createGrid(width, height);

  const cols = grid.length;
  const rows = grid[0]?.length ?? 0;
  const count = cols * rows;

  const positions = new Float32Array(count * 2 * 3);
  let index = 0;

  const toWorld = (px: number, py: number) => ({
    x: px - width / 2,
    y: height / 2 - py
  });

  for (let cx = 0; cx < cols; cx++) {
    for (let ry = 0; ry < rows; ry++) {
      const ga = grid[cx][ry];
      const start = toWorld(ga.x, ga.y);
      const end = toWorld(ga.x + ga.r * Math.cos(ga.angle), ga.y + ga.r * Math.sin(ga.angle));

      positions[index++] = start.x;
      positions[index++] = start.y;
      positions[index++] = 0;

      positions[index++] = end.x;
      positions[index++] = end.y;
      positions[index++] = 0;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });

  const lines = new THREE.LineSegments(geometry, material);
  // Persist data needed for updates
  lines.userData = { grid, width, height };
  return lines;
}

export function updateGridLines(lines: THREE.LineSegments, offset: number): void {
  type GridLinesData = { grid: GridAngle[][]; width: number; height: number };
  const { grid, width, height } = ((lines as any).userData ?? {}) as GridLinesData;
  if (!grid || !grid.length) {
    return;
  }

  const positionAttr = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = positionAttr.array as Float32Array;

  const toWorld = (px: number, py: number) => ({
    x: px - width / 2,
    y: height / 2 - py
  });

  let index = 0;
  for (let cx = 0; cx < grid.length; cx++) {
    const row = grid[cx];
    for (let ry = 0; ry < row.length; ry++) {
      const ga = row[ry];

      const n = noise.noise(ga.x * resolution, ga.y * resolution + offset);
      const angle = THREE.MathUtils.mapLinear(n, -1.0, 1.0, 0.0, TAU);

      const start = toWorld(ga.x, ga.y);
      const end = toWorld(ga.x + ga.r * Math.cos(angle), ga.y + ga.r * Math.sin(angle));

      positions[index++] = start.x;
      positions[index++] = start.y;
      positions[index++] = 0;

      positions[index++] = end.x;
      positions[index++] = end.y;
      positions[index++] = 0;
    }
  }

  positionAttr.needsUpdate = true;
}
