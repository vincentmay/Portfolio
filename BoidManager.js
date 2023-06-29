import { Vector2D } from './Vector2D.js';
import { Boid } from './Boid.js';

const width = window.innerWidth;
const height = window.innerHeight;

const canvas = document.getElementById('boids-canvas');
const context = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

const numOfBoids = 50;

const boids = [];

function createBoid() {
  const position = new Vector2D(Math.random() * width, Math.random() * height);
  const velocity = new Vector2D(Math.random(), Math.random());
  const boid = new Boid(position, velocity, 3);
  
  boids.push(boid);
}


for (let i = 0; i < numOfBoids; i++) {
  createBoid();
}

function updateBoids() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each boid
  for (const boid of boids) {
    boid.update();
    context.rotate(boid.velocity.angle());
    boid.draw(context);
  }

  requestAnimationFrame(updateBoids);
}

updateBoids();