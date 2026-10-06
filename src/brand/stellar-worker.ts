import * as THREE from "three";
import { createPendant } from "./pendant-model";

import type { StellarMessage, StellarResponse } from "./stellar-webgl";
const scope = self as unknown as {
  onmessage: (event: MessageEvent<StellarMessage>) => void;
  postMessage: (message: StellarResponse) => void;
};
type InitialState = Extract<StellarMessage, { type: "init" }>;
let receive: ((message: StellarMessage) => void) | undefined;
scope.onmessage = ({ data }) => {
  try {
    if (data.type === "init") receive = createStellar(data);
    else receive?.(data);
  } catch { scope.postMessage({ type: "error" }); }
};

/** The same studio scene, rendered independently of page input and layout. */
function createStellar(initial: InitialState) {
  const renderer = new THREE.WebGLRenderer({
    canvas: initial.canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(initial.pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
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
  const accent = initial.accent;
  const rim = new THREE.DirectionalLight(accent || "#b9c9ff", 1.5);
  rim.position.set(4, -1, -3);
  scene.add(rim);
  let frame = 0,
    visible = true,
    lost = false,
    ready = false,
    scroll = initial.scroll,
    pointerX = 0,
    pointerY = 0,
    yaw = 0,
    pitch = 0,
    lastDraw = 0;
  let currentWidth = initial.width, currentHeight = initial.height;
  const resize = (width: number, height: number) => {
    currentWidth = width; currentHeight = height;
    if (!width || !height || lost) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(
      8,
      2.55 / (Math.tan((35 * Math.PI) / 360) * camera.aspect),
    );
    camera.updateProjectionMatrix();
    resume();
  };
  const draw = (time: number) => {
    frame = 0;
    if (lost || !visible) return;
    // A small scroll-driven turn changes the reflections without flattening the
    // pendant or moving it out of the hero. Pointer response remains independent.
    const targetYaw = pointerX * 0.55;
    const targetPitch = pointerY * 0.3;
    const blend = 1 - Math.exp(-Math.min(100, time - (lastDraw || time - 16.67)) / 180);
    lastDraw = time;
    yaw += (targetYaw - yaw) * blend;
    pitch += (targetPitch - pitch) * blend;
    const moving = Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) > 0.0001;
    if (!moving) { yaw = targetYaw; pitch = targetPitch; }
    model.rotation.set(
      0.12 + scroll * 0.08 + pitch,
      -0.18 + scroll * 0.18 + yaw,
      -0.16 + scroll * 0.04,
    );
    model.position.y = 0;
    renderer.render(scene, camera);
    if (!ready) { ready = true; scope.postMessage({ type: "ready" }); }
    // Reflections are static at rest. Stop spending GPU time once damping settles.
    if (moving) frame = requestAnimationFrame(draw);
  };
  const resume = () => {
    if (!lost && visible && !frame) {
      lastDraw = 0;
      frame = requestAnimationFrame(draw);
    }
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    ready = false;
    scope.postMessage({ type: "lost" });
    // Release old render-target handles before Three.js resets the context.
    environment.dispose();
  };
  const contextRestored = () => {
    lost = false;
    // Render-target pixels are lost with the context; rebuild the reflections.
    const restoredPmrem = new THREE.PMREMGenerator(renderer);
    environment = restoredPmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    restoredPmrem.dispose();
    resize(currentWidth, currentHeight);
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  resize(initial.width, initial.height);
  return (message: StellarMessage) => {
    if (message.type === "resize") resize(message.width, message.height);
    else if (message.type === "pose") { scroll = message.scroll; resume(); }
    else if (message.type === "pointer") {
      pointerX = message.x; pointerY = message.y; resume();
    } else if (message.type === "visible") {
      visible = message.visible;
      if (visible) resume();
      else { cancelAnimationFrame(frame); frame = 0; }
    }
  };
}
