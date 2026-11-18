
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("custom-3d-viewport");

// ---------- 1. Scene, camera, renderer ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0.3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ---------- 2. Lights (neon vibe) ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(0, 5, 5);
scene.add(keyLight);

const pinkLight = new THREE.PointLight(0xff4fd8, 30);
pinkLight.position.set(-3, 2, 3);
scene.add(pinkLight);

const cyanLight = new THREE.PointLight(0x00eefc, 30);
cyanLight.position.set(3, 1, 3);
scene.add(cyanLight);

// ---------- 3. Models (your control panel: tweak these numbers) ----------
const MODELS = [
  { url: container.dataset.ps5,        x: 0,    y: 0,    size: 2.2, spin: 0.4 },
  { url: container.dataset.controller, x: -2.1, y: -0.6, size: 1.1, spin: 0.8 },
  { url: container.dataset.gta,        x: 2.1,  y: -0.4, size: 1.0, spin: 0.6 },
];

const floaters = [];
const loader = new GLTFLoader();

// Center a model and scale it so its biggest side equals `size`
function prepare(model, size) {
  const box = new THREE.Box3().setFromObject(model);
  const dims = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const group = new THREE.Group();
  group.add(model);
  group.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z));
  return group;
}

for (const m of MODELS) {
  loader.load(
    m.url,
    (gltf) => {
      const group = prepare(gltf.scene, m.size);
      group.position.set(m.x, m.y, 0);
      scene.add(group);
      floaters.push({ group, baseY: m.y, spin: m.spin, offset: Math.random() * Math.PI * 2 });
    },
    undefined,
    (error) => console.error("Could not load model:", m.url, error)
  );
}

// ---------- 4. Fit the canvas to the box (also when the tab opens) ----------
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);

// ---------- 5. Animation loop (~60 times per second) ----------
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();

  for (const f of floaters) {
    f.group.rotation.y = t * f.spin;                                    // spin
    f.group.position.y = f.baseY + Math.sin(t * 1.5 + f.offset) * 0.15; // float
  }

  renderer.render(scene, camera);
});