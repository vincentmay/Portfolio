import * as THREE from 'three';

export function initScene(container: HTMLElement) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0.1,
    10
  );
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // Set background color to black
  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
}

export function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera, container: HTMLElement): boolean {
  const canvas = renderer.domElement;
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  }
}
