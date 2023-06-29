import { Vector2D } from './Vector2D.js';
import { Boid } from './Boid.js';

let section = document.getElementById('start-container').getBoundingClientRect();

let width = section.width;
let height = section.height;

const canvas = document.getElementById('boids-canvas');
const context = canvas.getContext('2d');

canvas.height = height;
canvas.width = width;

const numOfBoids = 1000;
const detectionRange = 10;

const boids = [];

function createBoid() {
  const position = new Vector2D(Math.random() * section.width, Math.random() * section.height);
  const velocity = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);

  const boid = new Boid(position, velocity, 3);
  boid.draw(context);
  boids.push(boid);
}

for (let i = 0; i < numOfBoids; i++) {
  createBoid();
}

function updateBoids() {
  section = document.getElementById('start-container').getBoundingClientRect();
  width = section.width;
  height = section.height;
  canvas.width = width;
  canvas.height = height;

  context.clearRect(0, 0, width, height);

  // Update and draw each boid
  for (const boid of boids) {
    // const nearbyBoids = [];

    // for (const nearbyBoid of boids) {
      // if (nearbyBoid !== boid) {
        // const distance = boid.position.distance(nearbyBoid.position);
        // if (distance < detectionRange) {
          // nearbyBoids.push(nearbyBoid);
        // }
      // }
      
      // boid.velocity = calculateAlignment(boid, nearbyBoids);
    // }

    boid.update(width, height);
    boid.draw(context);
  }

  requestAnimationFrame(updateBoids);
}

updateBoids();

function calculateAlignment(boid, nearbyBoids) {

}

function calculateCohesion(boid, ) {

}

function calculateSeperation() {

}