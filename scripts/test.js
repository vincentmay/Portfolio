import * as THREE from 'three';

const canvas = document.getElementById('test');
const context = canvas.getContext('2d');
console.log(context);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let inc = 0.05;
let scl = 20;
let cols = Math.floor(canvas.width / scl);
let rows = Math.floor(canvas.height / scl);

let zOff = 0;

let particles = [];
let particleCount = 1000;

let flowField = [];
flowField = new Array(cols * rows);

for (let i = 0; i < particleCount; i++) {
  let position = new THREE.Vector2(Math.random() * canvas.width - 2 * 50, Math.random() * canvas.height - 2 * 50);
  let velocity = new THREE.Vector2(0, 0);
  let accaleration = new THREE.Vector2(0, 0);
  particles[i] = new Particle(position, velocity, accaleration);
}

function animate() {
/*   context.clearRect(0, 0, canvas.width, canvas.height); */

  let yOff = 0;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xOff, yOff, zOff) * Math.PI * 2;
      let vector = createVectorFromAngle(angle);
      flowField[index] = vector;
/*       context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      context.save();

      context.translate(x * scl, y * scl);
      context.rotate(vector.angle());

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(scl, 0);
      context.stroke();

      context.restore(); */
      xOff += inc;
    }
    yOff += inc;
  }
    zOff += 0.003;

  for (let particle of particles) {
    particle.follow(flowField, scl, cols);
    particle.update();
    particle.wrap(canvas.width, canvas.height);
    particle.show(context);
  }

  requestAnimationFrame(animate);

}

function createVectorFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(x, y);
}

animate();