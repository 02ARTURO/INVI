/* Visor 3D del héroe: carga la válvula real reconstruida (GLB) y la ilumina
   en un estudio virtual. Si WebGL falla o el modelo no carga, se muestra la
   foto real de catálogo (ver .nogl/.fallback en style.css). */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const GLB_URL = 'media/hero-valve.glb';
const H = document.documentElement;
const box = document.getElementById('c3d');

function createRenderer(box) {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw 0;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    box.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0, 10);
    return { renderer, scene, camera };
  } catch (e) {
    return null;
  }
}

function buildStudioEnvironment(renderer, scene) {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x14181f, side: THREE.BackSide })));
  function panel(w, h, x, y, z, c, rx, ry) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.material.color.setRGB(c[0], c[1], c[2]);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, 0);
    env.add(m);
  }
  panel(18, 5, 0, 14, 0, [9, 9, 9], Math.PI / 2, 0);
  panel(4, 18, -14, 2, 3, [5, 5.4, 6.4], 0, Math.PI / 2);
  panel(4, 18, 14, 2, -3, [6.2, 5.6, 5], 0, Math.PI / 2);
  panel(16, 3, 0, -6, 13, [2.6, 2.8, 3.2], 0, 0);
  panel(12, 6, 0, 3, -15, [2, 2.2, 2.6], 0, 0);
  panel(2, 12, 6, 0, 14, [7, 7, 7], 0, 0);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.03).texture;
  pm.dispose();
}

function loadHeroModel(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

let renderer, scene, camera, model;
let sc = 1;

function render() {
  renderer.render(scene, camera);
}

function size() {
  const w = box.clientWidth || 600;
  const h = box.clientHeight || 600;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  sc = w < 700 ? 0.52 : (w < 1000 ? 0.62 : 0.68);
  camera.position.z = w / h < 0.9 ? 11.5 : 10;
  camera.updateProjectionMatrix();
  if (model) model.scale.setScalar(sc);
  render();
}

function init() {
  const created = createRenderer(box);
  if (!created) {
    H.classList.add('nogl');
    return;
  }
  ({ renderer, scene, camera } = created);

  loadHeroModel(GLB_URL).then((loadedModel) => {
    model = loadedModel;
    scene.add(model);
    buildStudioEnvironment(renderer, scene);
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(box);
    else addEventListener('resize', size);
    H.classList.add('glready');
  }).catch(() => {
    H.classList.add('nogl');
  });
}

init();
