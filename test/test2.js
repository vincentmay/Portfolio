import * as THREE from 'three';

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('test2')
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
  


const points = [];
points.push( new THREE.Vector3( - 500, 0, 0 ) );
points.push( new THREE.Vector3( 0, 300, 0 ) );
points.push( new THREE.Vector3( 500, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add( line );
renderer.render( scene, camera );

