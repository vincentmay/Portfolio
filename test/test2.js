import * as THREE from 'three';

// Config
const inc = 0.1;
const scl = 20;
const particleCount = 500;
const positionsMaxLength = 1500;
noiseDetail(4, 0.5);
const logfps = true;

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, width, 0, height, 1, 1000);
camera.position.set(0, 0, 1);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('test2')
});
renderer.setSize(window.innerWidth, window.innerHeight);

const material = new THREE.PointsMaterial({
  size: 1,
  color: new THREE.Color(.3, .3, 1),
  transparent: true,
  opacity: 0.3
});

let rows = Math.floor(height / scl);
let cols = Math.floor(width / scl);
const flowField = new Array(rows * cols);

let zOff = 0;

const particles = [];

const TWO_PI = Math.PI * 2;

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  cols = Math.floor(width / scl);
  rows = Math.floor(height / scl);

  camera.left = 0;
  camera.right = width;
  camera.top = 0;
  camera.bottom = height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(particleCount * 3 * positionsMaxLength);

lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

const lineMesh = new THREE.Points(lineGeometry, material);
scene.add(lineMesh);

function setup() {
  for (let i = 0; i < particleCount; i++) {
    const position = new THREE.Vector2(Math.random() * width, Math.random() * height);
    const velocity = new THREE.Vector2();
    const acceleration = new THREE.Vector2();
    particles[i] = new Particle(position, velocity, acceleration, linePositions, i, positionsMaxLength);
  }
}


function updateFlowfield() {
  let yOff = 0;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = noise(xOff, yOff, zOff) * TWO_PI;
      const vector = createVectorFromAngle(angle);
      flowField[index] = vector;
      xOff += inc;
    }
    yOff += inc;
  }
  zOff += 0.002;
}

function updateParticles(deltaTime) {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.follow(flowField, scl, cols);
    particle.update(width, height, deltaTime);
    particle.updateLinePositions(width, height);
  }

  lineGeometry.attributes.position.needsUpdate = true;
}

function logFps(currentFrame) {
  frameCount++;
  const elapsedTime = (currentFrame - lastFrameTime) / 1000;
  if (elapsedTime >= 1) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = currentFrame;
    console.log('FPS: ', fps);
  }
}

function animate() {
  const currentFrame = performance.now();
  const deltaTime = (currentFrame - lastFrameTime) / 1000;

  updateFlowfield();

  updateParticles(deltaTime);


  renderer.render(scene, camera);

  if (logfps) logFps(currentFrame);

  requestAnimationFrame(animate);
}

function createVectorFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(x, y);
}


setup();

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

animate();