import * as THREE from 'three';

export function createParticles(count: number) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800; // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 600; // y
    positions[i * 3 + 2] = 0; // z

    velocities[i * 3] = (Math.random() - 0.5) * 1; // vx
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 1; // vy
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const points = new THREE.Points(geometry, material);

  return { geometry: points, positions, velocities };
}

export function updateParticles(pos: Float32Array, vel: Float32Array) {
  for (let i = 0; i < vel.length / 2; i++) {
    pos[i * 3] += vel[i * 2]; // Update x
    pos[i * 3 + 1] += vel[i * 2 + 1]; // Update y
  }
}
