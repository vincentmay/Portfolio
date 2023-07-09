import * as THREE from 'three';

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('flowfield')
});
renderer.setSize( window.innerWidth, window.innerHeight );

const material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 100 } );

// Config
const inc = 0.1;
const scl = 24;
const particleCount = 100;
noiseDetail(4, 0.5);

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

  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

for (let i = 0; i < particleCount; i++) {
  const position = new THREE.Vector2(Math.random() * width - width / 2, Math.random() * height - height / 2);
  const velocity = new THREE.Vector2(0, 0);
  const acceleration = new THREE.Vector2(0, 0);
  particles[i] = new Particle(position, velocity, acceleration);
}

let lastFrameTime = performance.now();

function animate() {
  const currentFrame = performance.now();
  const deltaTime = (currentFrame - lastFrameTime) / 1000;

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

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.follow(flowField, scl, cols);
    particle.update(width, height, deltaTime);

    const geometry = new THREE.BufferGeometry().setFromPoints(particle.positions);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
  lastFrameTime = currentFrame;
}

function createVectorFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(x, y);
}

animate();



/* const canvas = document.getElementById('flowfield');
const context = canvas.getContext('2d', { willReadFrequently: true });
context.willReadFrequently = true;

canvas.width = width;
canvas.height = height;

const logFps = true;
const drawFlowField = false;

const inc = 0.1;
const scl = 24;
let cols = Math.floor(width / scl);
let rows = Math.floor(height / scl);

let zOff = 0;

const particles = [];
const particleCount = 1000;

const flowField = new Array(cols * rows);

const TWO_PI = Math.PI * 2;

noiseDetail(4, 0.75);

for (let i = 0; i < particleCount; i++) {

  const position = new THREE.Vector2(Math.random() * width, Math.random() * height);
  const velocity = new THREE.Vector2(0, 0);
  const accaleration = new THREE.Vector2(0, 0);
  particles[i] = new Particle(position, velocity, accaleration);
}

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  cols = Math.floor(width / scl);
  rows = Math.floor(height / scl);

  canvas.width = width;
  canvas.height = height;
});


let lastFrameTime = performance.now();
let frameCount = 0;
let totalElapsedTime = 0;

function animate() {
  const currentFrame = performance.now();
  const deltaTime = (currentFrame - lastFrameTime) / 1000;

  context.beginPath();
  context.fillStyle = 'black';
  context.globalAlpha = 0.005;
  context.fillRect(0, 0, width, height);

  context.clearRect(0, 0, width, height);

  let yOff = 0;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = noise(xOff, yOff, zOff) * TWO_PI;
      const vector = createVectorFromAngle(angle);
      flowField[index] = vector;

      if (drawFlowField) {
        context.strokeStyle = 'rgba(255, 255, 255, 1)';
        context.save();

        context.translate(x * scl, y * scl);
        context.rotate(vector.angle());

        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(scl, 0);
        context.stroke();

        context.restore();
      }
      xOff += inc;
    }
    yOff += inc;
  }
  zOff += 0.002;


  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.follow(flowField, scl, cols);
    particle.update(width, height, deltaTime);
    particle.show(context);
    particle.prevPos = particle.position.clone();
  }

  if (logFps) {
    frameCount++;
    totalElapsedTime += deltaTime;

    if (totalElapsedTime >= 1) {
      const fps = frameCount / totalElapsedTime;
      console.log(`FPS: ${fps.toFixed(2)}`);

      frameCount = 0;
      totalElapsedTime = 0;
    }
  }

  filterDarkColors(context);

  lastFrameTime = currentFrame;
  requestAnimationFrame(animate);
}

function filterDarkColors(context) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Loop through each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;

    // Check if pixel is dark (adjust threshold as needed)
    if (brightness < 15) {
      data[i] = 0; // Set red channel to 0
      data[i + 1] = 0; // Set green channel to 0
      data[i + 2] = 0; // Set blue channel to 0
    }
  }

  context.putImageData(imageData, 0, 0);
}

function createVectorFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(x, y);
}

animate();
 */