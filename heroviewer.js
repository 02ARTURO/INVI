/* Visor 3D del héroe: carga la válvula real reconstruida (GLB) y la ilumina
   en un estudio virtual. Si WebGL falla o el modelo no carga, se muestra la
   foto real de catálogo (ver .nogl/.fallback en style.css). */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const GLB_URL = 'media/hero-valve.glb';
const GLB_LOAD_TIMEOUT_MS = 9000;
const H = typeof document !== 'undefined' ? document.documentElement : null;
const box = typeof document !== 'undefined' ? document.getElementById('c3d') : null;
const reduce = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)').matches : false;

export function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

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
let drag = false, lx = 0, ly = 0, vx = 0, vy = 0, pid = null;
let scr = 0, gap = 0, vis = true, raf = 0, last = 0;
let specTimer = null;
const specEl = typeof document !== 'undefined' ? document.querySelector('.hero-spec') : null;
const AX = new THREE.Vector3(1, 0, 0);
const AY = new THREE.Vector3(0, 1, 0);
const qa = new THREE.Quaternion();

function rot(dx, dy) {
  qa.setFromAxisAngle(AY, dx);
  model.quaternion.premultiply(qa);
  if (dy) {
    qa.setFromAxisAngle(AX, dy);
    model.quaternion.premultiply(qa);
  }
}

function render() {
  gap += (scr - gap) * 0.12;
  model.scale.setScalar(sc * (1 - scr * 0.1));
  model.position.y = -scr * 0.5;
  model.position.x = -scr * 0.7;
  renderer.render(scene, camera);
}

function size() {
  const w = box.clientWidth || 600;
  const h = box.clientHeight || 600;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  sc = w < 700 ? 0.78 : (w < 1000 ? 0.9 : 1.0);
  camera.position.z = w / h < 0.9 ? 11.5 : 10;
  camera.updateProjectionMatrix();
  if (reduce) render();
}

function onScroll() {
  const hh = box.parentElement.offsetHeight || innerHeight;
  scr = Math.max(0, Math.min(1, scrollY / (hh * 0.85)));
}

function frame(now) {
  raf = 0;
  if (!vis || document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!drag) {
    if (Math.abs(vx) > 1e-4 || Math.abs(vy) > 1e-4) {
      rot(vx, vy);
      vx *= 0.94;
      vy *= 0.94;
    } else if (!reduce) {
      rot(dt * 0.45, 0);
    }
  }
  render();
  raf = requestAnimationFrame(frame);
}

function start() {
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

function wireInteraction() {
  box.style.touchAction = 'pan-y';
  box.style.cursor = 'grab';
  box.addEventListener('pointerdown', (e) => {
    drag = true;
    pid = e.pointerId;
    lx = e.clientX;
    ly = e.clientY;
    vx = vy = 0;
    box.style.cursor = 'grabbing';
    try { box.setPointerCapture(pid); } catch (_) {}
    clearTimeout(specTimer);
    if (specEl) specEl.classList.remove('show');
  });
  box.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== pid) return;
    const dx = (e.clientX - lx) * 0.009;
    const dy = e.pointerType === 'touch' ? 0 : (e.clientY - ly) * 0.009;
    lx = e.clientX;
    ly = e.clientY;
    vx = dx;
    vy = dy;
    rot(dx, dy);
    if (reduce || !raf) render();
  });
  const up = () => {
    if (!drag) return;
    drag = false;
    box.style.cursor = 'grab';
    try { box.releasePointerCapture(pid); } catch (_) {}
    H.classList.add('dragged');
  };
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', up);
  box.addEventListener('lostpointercapture', () => { drag = false; box.style.cursor = 'grab'; });

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (reduce) {
    render();
    addEventListener('scroll', () => requestAnimationFrame(render), { passive: true });
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) start(); }).observe(box);
    }
    document.addEventListener('visibilitychange', start);
    start();
  }
}

function init() {
  const created = createRenderer(box);
  if (!created) {
    H.classList.add('nogl');
    return;
  }
  ({ renderer, scene, camera } = created);

  withTimeout(loadHeroModel(GLB_URL), GLB_LOAD_TIMEOUT_MS).then((loadedModel) => {
    model = loadedModel;
    scene.add(model);
    buildStudioEnvironment(renderer, scene);
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(box);
    else addEventListener('resize', size);
    wireInteraction();
    H.classList.add('glready');
    if (specEl && !drag) specTimer = setTimeout(() => specEl.classList.add('show'), 2500);
  }).catch(() => {
    H.classList.add('nogl');
  });
}

if (typeof document !== 'undefined') init();
