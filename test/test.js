import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('test')
});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

camera.position.z = 1;
camera.position.y = 0.5;

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

const particleSize = 0.01;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const particleOffset = 50;
const particleRowCount = Math.ceil(window.innerWidth / particleOffset);
const particleColumnCount = Math.ceil(window.innerHeight / particleOffset);
const particlePositions = new Float32Array(particleRowCount * particleColumnCount * 3);
let index = 0;
const points = [];

for (let y = 0; y < 1000; y += particleOffset) {
  for (let x = 0; x < 1000; x += particleOffset) {
    let ndcVector = new THREE.Vector3(x * .001, Math.random() * 0.1, y * .001);
    points.push(ndcVector);

    particlePositions[index * 3] = ndcVector.x;
    particlePositions[index * 3 + 1] = ndcVector.y;
    particlePositions[index * 3 + 2] = ndcVector.z;
    index++;
  }
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  transparent: false,
  opacity: 0.1,
  size: particleSize
});

const particles = new THREE.Points(particleGeometry, particleMaterial);


const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

let test = [];
for (let y = 0; y < particleColumnCount - 1; y++) {
  for (let x = 0; x < particleRowCount - 1; x++) {
    const i = y * particleRowCount + x;

    // Triangle 1
    test.push(points[i]);
    test.push(points[i + 1]);
    test.push(points[i + particleRowCount]);

    // Triangle 2
    test.push(points[i + 1]);
    test.push(points[i + particleRowCount + 1]);
    test.push(points[i + particleRowCount]);

    // Vertical Line 1
    test.push(points[i]);
    test.push(points[i + particleRowCount]);

    // Vertical Line 2
    test.push(points[i + 1]);
    test.push(points[i + particleRowCount + 1]);

  }
}
const geometry = new THREE.BufferGeometry().setFromPoints(test);

const line = new THREE.LineSegments(geometry, material);

scene.add(line, particles);



function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();




/* const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.6,
  size: particleSize
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}



animate(); */