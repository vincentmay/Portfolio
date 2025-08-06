import * as THREE from 'three';

const speedMultiplier = 100; // Adjust this value to change particle speed

export function createParticles(count: number) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * window.innerWidth; // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight; // y
    positions[i * 3 + 2] = 0; // z

    velocities[i * 3] = (Math.random() - 0.5) * 1; // vx
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 1; // vy
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, count);

  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });
  const points = new THREE.Points(geometry, material);

  return { geometry: points, positions, velocities };
}

export function updateParticles(pos: Float32Array, vel: Float32Array, deltaTime: number) {
  for (let i = 0; i < vel.length / 2; i++) {
    pos[i * 3] += vel[i * 2] * speedMultiplier * deltaTime; // Update x
    pos[i * 3 + 1] += vel[i * 2 + 1] * speedMultiplier * deltaTime; // Update y
  }
}
