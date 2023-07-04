import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 1;
const controls = new OrbitControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

const particleCount = 1000;
const particleSize = 0.001;

const boids = [];
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    const ndcX = (x / window.innerWidth) * 2 - 1;
    const ndcY = -(y / window.innerHeight) * 2 + 1;
    let position = new THREE.Vector3(ndcX, ndcY, 0.5);
    boids.push(position.unproject(camera));

    particlePositions[i * 3] = boids[i].x;
    particlePositions[i * 3 + 1] = boids[i].y;
    particlePositions[i * 3 + 2] = boids[i].z;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: particleSize
});

const particles = new THREE.Points(particleGeometry, particleMaterial);

scene.add(particles);

/* function updateParticlePositions() {
    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
        // Increment the X position by 1 (you can adjust this value)
        boids[i].x += .01;

        // Update the particle buffer positions
        particlePositions[i * 3] = boids[i].x;
        particlePositions[i * 3 + 1] = boids[i].y;
        particlePositions[i * 3 + 2] = boids[i].z;

        
    }

    // Update the particle buffer with the new positions
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
} */

function animate() {
    requestAnimationFrame(animate);

    controls.update();

/*     updateParticlePositions(); */

    renderer.render(scene, camera)
}

animate();