import * as THREE from 'three';

const boidSize = 0.02;
const boidsCount = 4000;

const logFps = false;

const drawBoidsRange = false;
const highlightBoidsInRange = false;

const qTreeCapacity = 10;

const minSpeed = 1;
const maxSpeed = 2;
const turnFactor = 0.075;

const detectionRange = 20;
const seperationRange = 6;
const mouseAvoidanceRange = 30;

const seperationWeight = 0.8;
const alignmentWeight = 0.3;
const cohesionWeight = 0;

const edgeMargin = 50;

let boundary;
let qTree;

let mouseX, mouseY, mousedown;

const boids = [];
const boidsParticlePositions = new Float32Array(boidsCount * 3);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#boids-canvas')
});

renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 5;

/* const gridHelper = new THREE.GridHelper(100, 100);

scene.add(gridHelper); */

for (let i = 0; i < boidsCount; i++) {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const position = new THREE.Vector2(x, y);
  const velocity = new THREE.Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1);
  const acceleration = new THREE.Vector2(0, 0);
  const boid = new Boid(position, velocity, acceleration);
  boids.push(boid);

  const ndcX = (x / window.innerWidth) * 2 - 1;
  const ndcY = -(y / window.innerHeight) * 2 + 1;
  let ndcVector = new THREE.Vector3(ndcX, ndcY, 0.5);
  ndcVector.unproject(camera);

  boidsParticlePositions[i * 3] = ndcVector.x;
  boidsParticlePositions[i * 3 + 1] = ndcVector.y;
  boidsParticlePositions[i * 3 + 2] = ndcVector.z;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(boidsParticlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: boidSize,
  transparent: true,
  opacity: 0.25
});

const particles = new THREE.Points(particleGeometry, particleMaterial);

scene.add(particles);


document.addEventListener('mousemove', function (event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  /*     cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    
      cursoroutline.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`; */
});

document.addEventListener('mousedown', function () {
  mousedown = true;
});

document.addEventListener('mouseup', function () {
  mousedown = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  renderer.setSize(window.innerWidth, window.innerHeight);
});


function createQuadTree() {
  boundary = new Rectangle(0, 0, window.innerWidth, window.innerHeight);
  qTree = new QuadTree(boundary, qTreeCapacity);
}

let prevTime = Date.now();
let frames = 0;
let calculatedFps = [];

function logFPS() {
  const time = Date.now();
  frames++;
  if (time > prevTime + 1000) {
    let fps = Math.round((frames * 1000) / (time - prevTime));
    prevTime = time;
    frames = 0;

    calculatedFps.push(fps);
    // console.info('FPS: ', fps);

    let countedFrames = 0;
    calculatedFps.forEach(frame => countedFrames += frame);
    console.info('avg. FPS: ', Math.round(countedFrames / calculatedFps.length));
  }
}



function animate() {
  requestAnimationFrame(animate);

  createQuadTree();

  // Update and draw each boid
  for (let i = 0; i < boidsCount; i++) {
    const boid = boids[i];
    qTree.insert(boid);

    let range = new Rectangle(boid.position.x - detectionRange / 2, boid.position.y - detectionRange / 2, detectionRange, detectionRange);
    let boidsInRange = [];
    qTree.query(range, boidsInRange);

    let desiredVelocity = nextMove(boid, boidsInRange);

    if (mousedown) {
      desiredVelocity.x += mouseX - boid.position.x;
      desiredVelocity.y += mouseY - boid.position.y;
    }

    if (Math.sqrt(Math.pow(mouseY - boid.position.y, 2) + Math.pow(mouseX - boid.position.x, 2)) <= mouseAvoidanceRange) {
      const oppositevx = -(mouseX - boid.position.x);
      const oppositevy = -(mouseY - boid.position.y);

      desiredVelocity.x += oppositevx;
      desiredVelocity.y += oppositevy;
    }

    limitVelocity(desiredVelocity);

    if (desiredVelocity.x != 0 && desiredVelocity.y != 0) {
      let difference = desiredVelocity.clone().sub(boid.velocity);
      if (difference.length() > turnFactor) {
        difference.normalize().multiplyScalar(turnFactor);
      }

      boid.acceleration = difference;
    }

    boid.update(window.innerWidth, window.innerHeight, turnFactor, edgeMargin);


    const ndcX = (boid.position.x / window.innerWidth) * 2 - 1;
    const ndcY = -(boid.position.y / window.innerHeight) * 2 + 1;
    let ndcVector = new THREE.Vector3(ndcX, ndcY, 0.5);
    ndcVector.unproject(camera);

    boidsParticlePositions[i * 3] = ndcVector.x;
    boidsParticlePositions[i * 3 + 1] = ndcVector.y;
    boidsParticlePositions[i * 3 + 2] = ndcVector.z;
    /*     if (drawBoidsRange) {
          drawBoidRange(boid);
        }
        if (highlightBoidsInRange) {
          drawNearbyBoids(boid, boidsInRange);
        } */
  }

  if (logFps) {
    logFPS();
  }

  /*     qTree.show(context); */

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(boidsParticlePositions, 3))

  renderer.render(scene, camera);
}

function nextMove(currentBoid, nearbyBoids) {
  let desiredVelocity = new THREE.Vector2(0, 0);

  let separation = new THREE.Vector2(0, 0);
  let alignment = new THREE.Vector2(0, 0);
  let cohesion = new THREE.Vector2(0, 0);
  let nearbyBoidCount = 0;

  for (let boid of nearbyBoids) {
    if (currentBoid !== boid && currentBoid.position.distanceTo(boid.position) <= detectionRange) {
      nearbyBoidCount++;

      if (currentBoid.position.distanceTo(boid.position) <= seperationRange) {
        separation.x += currentBoid.position.x - boid.position.x;
        separation.y += currentBoid.position.y - boid.position.y;
      } else {

        alignment.x += boid.velocity.x;
        alignment.y += boid.velocity.y;

        cohesion.x += boid.position.x;
        cohesion.y += boid.position.y;
      }

    }
  }

  if (nearbyBoidCount > 0) {
    alignment.x /= nearbyBoidCount;
    alignment.y /= nearbyBoidCount;
    cohesion.x /= nearbyBoidCount;
    cohesion.y /= nearbyBoidCount;

    cohesion.x -= currentBoid.position.x;
    cohesion.y -= currentBoid.position.y;

    desiredVelocity.x += alignment.x * alignmentWeight;
    desiredVelocity.y += alignment.y * alignmentWeight;

    desiredVelocity.x += cohesion.x * cohesionWeight;
    desiredVelocity.y += cohesion.y * cohesionWeight;
  }

  desiredVelocity.x += separation.x * seperationWeight;
  desiredVelocity.y += separation.y * seperationWeight;

  return desiredVelocity;
}

function limitVelocity(desiredVelocity) {
  let speed = Math.sqrt(desiredVelocity.x * desiredVelocity.x + desiredVelocity.y * desiredVelocity.y);

  if (speed > maxSpeed) {
    desiredVelocity.x = (desiredVelocity.x / speed) * maxSpeed;
    desiredVelocity.y = (desiredVelocity.y / speed) * maxSpeed;
  } else if (speed > 0 && speed < minSpeed) {
    desiredVelocity.x = (desiredVelocity.x / speed) * minSpeed;
    desiredVelocity.y = (desiredVelocity.y / speed) * minSpeed;
  }
}

animate();

/* const canvas = document.getElementById('boids-canvas');
const context = canvas.getContext('2d');

let cursor = document.querySelector('.cursor');
let cursoroutline = document.querySelector('.cursor-outline');

const logFps = false;

const drawBoidsRange = false;
const highlightBoidsInRange = false;

const qTreeCapacity = 10;

const boidSize = 12;

const numOfBoids = 5000;

const minSpeed = 0.1;
const maxSpeed = 0.8;
const turnFactor = 0.1;

const detectionRange = 40;
const seperationRange = 8;
const mouseAvoidanceRange = 30;

const seperationWeight = 0.8;
const alignmentWeight = 0.3;
const cohesionWeight = 0.0005;

const edgeMargin = 50;

const boids = [];

let section;
let width;
let height;

let boundary;
let qTree;

let mouseX;
let mouseY;

let mousedown;

document.addEventListener('mousemove', function (event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';

  cursoroutline.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
});

document.addEventListener('mousedown', function () {
  mousedown = true;
});

document.addEventListener('mouseup', function () {
  mousedown = false;
});

function updateCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.height = height;
  canvas.width = width;
}

function createBoid() {
  const position = new Vector2D(Math.random() * width, Math.random() * height);
  const velocity = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);
  let boid = new Boid(position, velocity, boidSize);
  boids.push(boid);

  qTree.insert(boid);
}

function createQuadTree() {
  boundary = new Rectangle(0, 0, width, height);
  qTree = new QuadTree(boundary, qTreeCapacity);
}

function updateBoids() {
  createQuadTree();
  context.clearRect(0, 0, width, height);

  // Update and draw each boid
  for (const boid of boids) {
    qTree.insert(boid);

    let range = new Rectangle(boid.position.x - detectionRange / 2, boid.position.y - detectionRange / 2, detectionRange, detectionRange);
    let boidsInRange = [];
    qTree.query(range, boidsInRange);


    if (mousedown) {
      boid.velocity.x = mouseX - boid.position.x;
      boid.velocity.y = mouseY - boid.position.y;
    }

    if (Math.sqrt(Math.pow(mouseY - boid.position.y, 2) + Math.pow(mouseX - boid.position.x, 2)) <= mouseAvoidanceRange) {
      const oppositevx = -(mouseX - boid.position.x);
      const oppositevy = -(mouseY - boid.position.y);

      boid.velocity.x = oppositevx;
      boid.velocity.y = oppositevy;

      limitVelocity(boid);

      const x = boid.position.x - (boid.size / 2);
      const y = boid.position.y - (boid.size / 2);

      context.beginPath();
      context.fillStyle = "rgba(58, 162, 210, .5)";
      context.rect(x, y, boid.size, boid.size);
      context.fill();
    }

    nextMove(boid, boidsInRange);


    boid.update(width, height, turnFactor, edgeMargin);
    boid.draw(context);

    if (drawBoidsRange) {
      drawBoidRange(boid);
    }
    if (highlightBoidsInRange) {
      drawNearbyBoids(boid, boidsInRange);
    }
  }

  if (logFps) {
    logFPS();
  }

  qTree.show(context);
  requestAnimationFrame(updateBoids);
}


function nextMove(currentBoid, nearbyBoids) {
  let seperation = new Vector2D(0, 0);
  let alignment = new Vector2D(0, 0);
  let cohesion = new Vector2D(0, 0);
  let nearbyBoidCount = 0;

  for (let boid of nearbyBoids) {
    if (currentBoid !== boid) {
      nearbyBoidCount++;

      if (currentBoid.position.distance(boid.position) <= seperationRange) {
        seperation.x += currentBoid.position.x - boid.position.x;
        seperation.y += currentBoid.position.y - boid.position.y;
      } else if (currentBoid.position.distance(boid.position) <= detectionRange) {

        alignment.x += boid.velocity.x;
        alignment.y += boid.velocity.y;

        cohesion.x += boid.position.x;
        cohesion.y += boid.position.y;
      }

    }
  }

  if (nearbyBoidCount > 0) {
    alignment.x /= nearbyBoidCount;
    alignment.y /= nearbyBoidCount;
    cohesion.x /= nearbyBoidCount;
    cohesion.y /= nearbyBoidCount;

    cohesion.x -= currentBoid.position.x;
    cohesion.y -= currentBoid.position.y;

    currentBoid.velocity.x += alignment.x * alignmentWeight;
    currentBoid.velocity.y += alignment.y * alignmentWeight;

    currentBoid.velocity.x += cohesion.x * cohesionWeight;
    currentBoid.velocity.y += cohesion.y * cohesionWeight;
  }

  currentBoid.velocity.x += seperation.x * seperationWeight;
  currentBoid.velocity.y += seperation.y * seperationWeight;

  limitVelocity(currentBoid);
}

function limitVelocity(boid) {
  let speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y);

  if (speed > maxSpeed) {
    boid.velocity.x = (boid.velocity.x / speed) * maxSpeed;
    boid.velocity.y = (boid.velocity.y / speed) * maxSpeed;
  } else if (speed < minSpeed) {
    boid.velocity.x = (boid.velocity.x / speed) * minSpeed;
    boid.velocity.y = (boid.velocity.y / speed) * minSpeed;
  }
}


function drawBoidRange(boid) {
  context.beginPath();
  context.lineWidth = 2;
  context.strokeStyle = "rgba(0, 255, 0, .2)";
  context.rect(boid.position.x - detectionRange / 2, boid.position.y - detectionRange / 2, detectionRange, detectionRange);
  context.stroke();
}

function drawNearbyBoids(currentBoid, nearbyBoids) {
  for (let boid of nearbyBoids) {
    if (boid !== currentBoid) {
      const x = boid.position.x - (boid.size / 2);
      const y = boid.position.y - (boid.size / 2);

      context.beginPath();
      context.fillStyle = "green";
      context.rect(x, y, boid.size, boid.size);
      context.fill();
    }
  }
}

let prevTime = Date.now();
let frames = 0;
let calculatedFps = [];

function logFPS() {
  const time = Date.now();
  frames++;
  if (time > prevTime + 1000) {
    let fps = Math.round((frames * 1000) / (time - prevTime));
    prevTime = time;
    frames = 0;

    calculatedFps.push(fps);
    // console.info('FPS: ', fps);

    let countedFrames = 0;
    calculatedFps.forEach(frame => countedFrames += frame);
    console.info('avg. FPS: ', Math.round(countedFrames / calculatedFps.length));
  }
}

updateCanvas();

window.addEventListener('resize', updateCanvas);

createQuadTree();

for (let i = 0; i < numOfBoids; i++) {
  createBoid();
}

updateBoids();
 */