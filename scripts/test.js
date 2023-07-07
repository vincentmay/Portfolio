import * as THREE from 'three';

const canvas = document.getElementById('test');
const context = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const logFps = true;
const drawFlowField = false;

const inc = 0.1;
const scl = 40;
let cols = Math.floor(width / scl);
let rows = Math.floor(height / scl);

let zOff = 0;

const particles = [];
const particleCount = 3000;

const flowField = new Array(cols * rows);

const maxw = width - 100;
const minw = 100;
const maxh = height - 100;
const minh = 100;

const TWO_PI = Math.PI * 2;

noiseDetail(6, 0.25);

for (let i = 0; i < particleCount; i++) {

  const position = new THREE.Vector2(Math.random() * (maxw - minw) + minw, Math.random() * (maxh - minh) + minh);
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
  context.globalAlpha = 0.01;
  context.fillRect(0, 0, width, height);

  /* context.clearRect(0, 0, width, height); */

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
  zOff += 0.005;


  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.follow(flowField, scl, cols);
    particle.update(deltaTime);
    particle.wrap(width, height);
    particle.show(context);
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


  lastFrameTime = currentFrame;
  requestAnimationFrame(animate);
}

function createVectorFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(x, y);
}

animate();
