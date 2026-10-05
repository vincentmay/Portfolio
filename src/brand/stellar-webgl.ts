import * as THREE from "three";
import { createPendant } from "./pendant-model";

/** The pendant as real beveled geometry with a ring crossing its front and back. */
export function createStellar(host: HTMLElement, reduced: boolean) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.z = 8;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x16151b);
  const boxes = [
    { position: [0, 2, 6], width: 5, height: 6, intensity: 1.9 },
    { position: [-4, 3, 4], width: 2, height: 7, intensity: 5 },
    { position: [4, 1, 2], width: 1.5, height: 6, intensity: 3 },
    { position: [0, 5, -2], width: 6, height: 2, intensity: 4 },
    { position: [-1, -4, 4], width: 5, height: 1, intensity: 1.5 },
  ];
  for (const box of boxes) {
    const light = new THREE.Mesh(
      new THREE.PlaneGeometry(box.width, box.height),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(box.intensity, box.intensity, box.intensity),
        side: THREE.DoubleSide,
      }),
    );
    light.position.set(box.position[0], box.position[1], box.position[2]);
    light.lookAt(0, 0, 0);
    room.add(light);
  }
  let environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  pmrem.dispose();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xe9e6e4,
    metalness: 1,
    roughness: 0.26,
    clearcoat: 0.12,
    clearcoatRoughness: 0.13,
    envMapIntensity: 1.1,
  });
  const model = createPendant(material);
  scene.add(model);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const accent = getComputedStyle(host).getPropertyValue("--accent").trim();
  const rim = new THREE.DirectionalLight(accent || "#b9c9ff", 1.5);
  rim.position.set(4, -1, -3);
  scene.add(rim);
  let frame = 0,
    visible = true,
    lost = false,
    disposed = false,
    pointerX = 0,
    pointerY = 0,
    yaw = 0,
    pitch = 0;
  const resize = () => {
    // CSS docking scales the canvas; its drawing buffer keeps its layout size.
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height || lost) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(
      8,
      2.55 / (Math.tan((35 * Math.PI) / 360) * camera.aspect),
    );
    camera.updateProjectionMatrix();
    if (reduced) renderer.render(scene, camera);
  };
  const move = (event: PointerEvent) => {
    const box = host.getBoundingClientRect();
    pointerX = (event.clientX - box.left) / box.width - 0.5;
    pointerY = (event.clientY - box.top) / box.height - 0.5;
  };
  const leave = () => {
    pointerX = pointerY = 0;
  };
  const draw = () => {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    const scroll = Number(host.dataset.scrollPose ?? 0);
    // A small scroll-driven turn changes the reflections without flattening the
    // pendant or moving it out of the hero. Pointer response remains independent.
    yaw += (pointerX * 0.55 - yaw) * 0.08;
    pitch += (pointerY * 0.3 - pitch) * 0.08;
    model.rotation.set(
      0.12 + scroll * 0.08 + pitch,
      -0.18 + scroll * 0.18 + yaw,
      -0.16 + scroll * 0.04,
    );
    model.position.y = 0;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  };
  const resume = () => {
    if (!reduced && !lost && visible && !document.hidden && !frame)
      frame = requestAnimationFrame(draw);
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    delete host.dataset.ready;
    // Release old render-target handles before Three.js resets the context.
    environment.dispose();
  };
  const contextRestored = () => {
    if (disposed) return;
    lost = false;
    // Render-target pixels are lost with the context; rebuild the reflections.
    const restoredPmrem = new THREE.PMREMGenerator(renderer);
    environment = restoredPmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    restoredPmrem.dispose();
    resize();
    renderer.render(scene, camera);
    host.dataset.ready = "true";
    resume();
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) resume();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(host);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("scroll", resume, { passive: true });
  if (!reduced) {
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
  }
  model.rotation.set(0.12, -0.18, -0.16);
  resize();
  renderer.render(scene, camera);
  resume();
  host.dataset.ready = "true";
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    sizeObserver.disconnect();
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("scroll", resume);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    renderer.domElement.removeEventListener(
      "webglcontextrestored",
      contextRestored,
    );
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) object.geometry.dispose();
    });
    material.dispose();
    room.children.forEach((child) => {
      const mesh = child as THREE.Mesh<
        THREE.PlaneGeometry,
        THREE.MeshBasicMaterial
      >;
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    delete host.dataset.ready;
  };
}
