import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const controls = new OrbitControls( camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(window.innerWidth, window.innerHeight);
const axesHelper = new THREE.AxesHelper(window.innerWidth);
scene.add(gridHelper, axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const boids = [];

function addTestBoids() {
    const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    const testBoid = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))

    testBoid.position.set(x, y, z);
    scene.add(testBoid);
    boids.push(testBoid);
}

function animate() {
    requestAnimationFrame(animate);

    for (let boid of boids) {
        
    }

    renderer.render(scene, camera);
}

for (let i = 0; i < 100; i++) {
    addTestBoids()
}

animate();