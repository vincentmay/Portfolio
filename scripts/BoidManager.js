const canvas = document.getElementById('boids-canvas');
const context = canvas.getContext('2d');

const numOfBoids = 1000;
const detectionRange = 75;

const boids = [];

let section;
let width;
let height;

let boundary;
let qTree;


function updateCanvas() {
  section = document.getElementById('start-container').getBoundingClientRect();
  width = section.width;
  height = section.height;
  canvas.height = height;
  canvas.width = width;
}

function createBoid() {
  const position = new Vector2D(Math.random() * section.width, Math.random() * section.height);
  const velocity = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);

  const boid = new Boid(position, velocity, 3);
  boids.push(boid);

  qTree.insert(boid);
}

function createQuadTree() {
  boundary = new Rectangle(0, 0, width, height);
  qTree = new QuadTree(boundary, 4);
}

function updateBoids() {
  updateCanvas();
  createQuadTree();

  context.clearRect(0, 0, width, height);

  // Update and draw each boid
  for (const boid of boids) {
    boid.update();
    qTree.insert(boid);
    boid.draw(context);
    let boidsInRange = [];
    qTree.query(new Rectangle(boid.position.x - 50, boid.position.y - 50, 25, 25), boidsInRange);
    
    // drawBoidRange(boid);
    // drawNearbyBoids(boidsInRange);
  }

  qTree.show(context);
  requestAnimationFrame(updateBoids);
}

function drawBoidRange(boid) {
  context.beginPath();
  context.lineWidth = 2;
  context.strokeStyle = "rgba(0, 255, 0, .2)";
  context.rect(boid.position.x - detectionRange / 2, boid.position.y - detectionRange / 2, detectionRange, detectionRange);
  context.stroke();
}

function drawNearbyBoids(nearbyBoids) {
  for (let boid of nearbyBoids) {
    const x = boid.position.x - (boid.size / 2);
    const y = boid.position.y - (boid.size / 2);
  
    context.beginPath();
    context.fillStyle = "green";
    context.rect(x, y, boid.size, boid.size);
    context.fill();
  }
}

function calculateAlignment(boid, nearbyBoids) {

}

function calculateCohesion(boid) {

}

function calculateSeperation() {

}

updateCanvas();
createQuadTree();

for (let i = 0; i < numOfBoids; i++) {
  createBoid();
}

updateBoids();
