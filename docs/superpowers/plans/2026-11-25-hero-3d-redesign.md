# Hero 3D Valve Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero's video+procedural-3D fallback chain with a single live 3D viewer rendering a real reconstruction of the gate valve in `images/valvulas-1.jpg`, with a static-image fallback for no-WebGL/load-failure cases.

**Architecture:** A new ES-module script (`heroviewer.js`) loads a pre-generated GLB (`media/hero-valve.glb`) via Three.js's `GLTFLoader`, reusing the camera/lighting-rig and drag/inertia/auto-rotate/scroll interaction logic already proven in the current `hero3d.js`, just pointed at the loaded model instead of hand-built geometry. `herovideo.js`, `hero3d.js`, and the video assets are deleted.

**Tech Stack:** Vanilla JS (ES modules for the new hero script only — every other script on the site stays classic/non-module), Three.js r149 (ES-module build, vendored locally), `GLTFLoader`. No bundler, no test framework exists in this repo — verification steps are manual browser checks with exact pass/fail criteria, run via the project's existing `python -m http.server` local-serving method (per `LEEME.md`/`README.md`).

**Spec:** `docs/superpowers/specs/2026-11-25-hero-3d-redesign-design.md`

## Global Constraints

- No build step; plain HTML/CSS/JS. The one exception: the new hero script loads as `<script type="module">`, a native browser feature, not a bundler.
- Must not touch `data.js`, product image paths, or any file other pages depend on. Confirmed only `index.html` references `herovideo.js`/`hero3d.js`/`valvula-giro.*`/`three.min.js` — safe to change in isolation.
- Reduced-motion and no-WebGL users get a complete, intentional hero (the existing `.nogl`/`.fallback` CSS mechanism, reused).
- GLB triangle budget: 30,000–50,000 triangles, PBR textured (web/AR tier).
- GLB file size target ≤ 1.5 MB, hard ceiling 2 MB — matches today's `valvula-giro.mp4` (1.07 MB) / `.webm` (2.0 MB) baseline; the anti-goal is "not heavier than today's video."
- The AI-reconstructed GLB is approved for commercial/production use (confirmed by human partner).
- The live 3D viewer is primary on every device with WebGL, including mobile — no device-detection branch to a static fallback (confirmed by human partner).
- Pages must keep working when served over HTTP (as documented); ES modules do not load over `file://` — this is consistent with the project's documented local-serving method, not a new constraint, but worth remembering during manual verification.

## Review Focus

- **WebGL context creation fails** (old GPU, disabled WebGL, browser flag): must show `.fallback` image via the existing `.nogl` class, not a blank hero. Covered in Task 2.
- **GLB fetch/parse fails** even though WebGL exists (404, slow/broken connection, malformed file): must also fall back to `.fallback`, not hang on a blank canvas forever. Covered in Task 2.
- **`prefers-reduced-motion: reduce`**: no inertia, no auto-rotate, no animation loop — static single frame, matching the existing `hero3d.js` precedent. Covered in Task 4.
- **Tab hidden / viewer scrolled out of view**: render loop pauses (existing `hero3d.js` precedent via `IntersectionObserver` + `visibilitychange`) — now more important since 3D is primary on mobile. Covered in Task 4.
- **Resize / orientation change**: canvas and camera aspect stay correct without distortion (existing `hero3d.js` `size()`/`ResizeObserver` pattern, reused). Covered in Task 3.

---

## Task 1: Vendor Three.js (ES module) and GLTFLoader, matching the existing r149 build

**Files:**
- Create: `vendor/three.module.js`
- Create: `vendor/GLTFLoader.js`

**Interfaces:**
- Produces: `vendor/three.module.js` exporting the full `THREE` namespace (`import * as THREE from './vendor/three.module.js'`).
- Produces: `vendor/GLTFLoader.js` exporting `{ GLTFLoader }`, importable as `import { GLTFLoader } from './vendor/GLTFLoader.js'`.

- [ ] **Step 1: Confirm the exact vendored Three.js revision**

Run: `grep -oE '="1[0-9]{2}"' vendor/three.min.js`
Expected output includes `="149"` (confirms r149 — already verified during planning; re-check here in case the file changes before this task runs).

- [ ] **Step 2: Download the matching r149 ES-module build and GLTFLoader source**

Fetch `build/three.module.js` and `examples/jsm/loaders/GLTFLoader.js` from the `three.js` repository at tag `r149` (equivalently, npm package `three@0.149.0`). Save as `vendor/three.module.js` and `vendor/GLTFLoader.js` respectively.

- [ ] **Step 3: Fix GLTFLoader.js's import path**

Open `vendor/GLTFLoader.js` and find its first `import` statement (it imports core Three.js classes using a relative path sized for its original location three directories deep inside the three.js repo, e.g. `from '../../../build/three.module.js'`). Rewrite that one import line to `from './three.module.js'` (the sibling file vendored in Step 2, same folder).

- [ ] **Step 4: Check for other relative imports GLTFLoader.js needs**

Run: `grep -n "^import" vendor/GLTFLoader.js`
Expected: one import line reading `from './three.module.js'` (fixed in Step 3). If any additional `import` lines reference other relative files (e.g. a `BufferGeometryUtils.js` helper), vendor each named file at the same relative path it asks for, under `vendor/`. Do not guess which files are needed — this grep is how you find out.

- [ ] **Step 5: Verify both files load without syntax errors**

Run a minimal smoke check: `node --input-type=module -e "import('./vendor/three.module.js').then(()=>console.log('three ok'))"` from the `INVI` directory, then `node --input-type=module -e "import('./vendor/GLTFLoader.js').then(()=>console.log('loader ok'))"`.
Expected: both print their `ok` message with no thrown error.

- [ ] **Step 6: Commit**

```bash
git add vendor/three.module.js vendor/GLTFLoader.js
git commit -m "feat: vendor Three.js r149 ES module build and GLTFLoader"
```

---

## Task 2: Generate and optimize the production hero GLB

**Files:**
- Create: `media/hero-valve.glb`

**Interfaces:**
- Produces: `media/hero-valve.glb`, a web/AR-tier GLB (30,000–50,000 triangles, PBR textures ≤ 1024px, file size ≤ 1.5 MB target / 2 MB hard ceiling) depicting the gate valve from `images/valvulas-1.jpg`.

- [ ] **Step 1: Generate the production mesh**

Using the Higgsfield `generate_3d` tool with `model: "meshy_v7_image_to_3d"`, `medias: [{ value: <uploaded images/valvulas-1.jpg media_id>, role: "image_references" }]`, `target_polycount: 40000`, `should_texture: true`, `enable_pbr: true`, `topology: "triangle"` — the same parameters validated in the design pilot. Download the resulting `.glb`.

- [ ] **Step 2: Check the raw file size and triangle count against budget**

Run: `ls -la media/hero-valve.glb` (before optimization) and inspect the mesh's triangle count (e.g. via `python -c "import trimesh; m=trimesh.load('media/hero-valve.glb', force='scene'); print(sum(len(g.faces) for g in m.geometry.values()))"`, using the `trimesh` package already installed during the design pilot).
Expected: triangle count is within 30,000–50,000. If the raw file exceeds ~2 MB (likely, given the design pilot's unoptimized GLB was 9.6 MB), proceed to Step 3.

- [ ] **Step 3: Optimize textures to hit the file-size budget**

Run (one-time asset-prep step, not a site runtime dependency): `npx --yes @gltf-transform/cli resize media/hero-valve.glb media/hero-valve.glb --width 1024 --height 1024` then `npx --yes @gltf-transform/cli webp media/hero-valve.glb media/hero-valve.glb`. Do not apply Draco mesh compression — it would require vendoring an additional `DRACOLoader` + WASM decoder at runtime, which this plan avoids by keeping polycount within the already-small web/AR budget instead.

- [ ] **Step 4: Verify the optimized file meets budget**

Run: `ls -la media/hero-valve.glb`
Expected: file size ≤ 1.5 MB (target) and in all cases ≤ 2 MB (hard ceiling). If still over, re-run Step 1 with a lower `target_polycount` (e.g. 30000) and repeat Steps 2–4.

- [ ] **Step 5: Commit**

```bash
git add media/hero-valve.glb
git commit -m "feat: add production hero valve GLB"
```

---

## Task 3: Hero viewer bootstrap — load the GLB and render it

**Files:**
- Create: `heroviewer.js`
- Modify: `index.html` (add import map is NOT needed — see Task 1 Step 3; add the new `<script type="module" src="heroviewer.js">` tag and remove `herovideo.js`/`hero3d.js` tags, done fully in Task 6)

**Interfaces:**
- Produces: `loadHeroModel(url: string): Promise<THREE.Object3D>` — resolves with the loaded GLB's scene root, or rejects on fetch/parse failure.
- Produces: `buildStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void` — ported verbatim from `hero3d.js`'s existing virtual-studio-lighting rig (the boxed softbox/panel setup and `PMREMGenerator` call, `hero3d.js` current lines ~21–33). Not redesigned; same lighting mood as today's 3D fallback.
- Produces: `createRenderer(box: HTMLElement): { renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera } | null` — returns `null` if WebGL context creation fails (ported from `hero3d.js`'s existing `fail()`/try-catch WebGL-detection logic, current lines ~6–13).
- Consumes: `#c3d` container element (already exists in `index.html`, already styled in `style.css`) as the mount point — no new container markup needed.

- [ ] **Step 1: Write `heroviewer.js` module skeleton with WebGL-failure detection**

```js
// heroviewer.js
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

function createRenderer(box) {
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw 0;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    return { renderer, scene, camera };
  } catch (e) {
    return null;
  }
}
```

- [ ] **Step 2: Verify no-WebGL path sets the existing fallback class**

Manual check: temporarily force `createRenderer` to return `null` (e.g. `return null;` as the first line), open the page (`python -m http.server` from `INVI`, navigate to it), confirm the code path that calls `createRenderer` adds `document.documentElement.classList.add('nogl')` when it gets `null` back (write this call now, as part of Step 1's caller — see Step 4), and confirm the static `.fallback` image (`images/valvulas-1.jpg`, already wired via existing CSS) becomes visible. Remove the temporary forced `null` afterward.
Expected: with the viewer unable to start, the existing `.nogl .hero .fallback{display:block}` CSS rule shows the real valve photo, not a blank area.

- [ ] **Step 3: Port `buildStudioEnvironment` from `hero3d.js`**

Copy the existing lighting-rig IIFE from current `hero3d.js` (the `env`/`panel()` scene + `PMREMGenerator` block) into a named function `buildStudioEnvironment(renderer, scene)` in `heroviewer.js`, unchanged in behavior — same panel sizes/colors/positions.

- [ ] **Step 4: Write `loadHeroModel` and wire the failure path**

```js
function loadHeroModel(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}
```

In the module's top-level init logic: call `createRenderer`; if it returns `null`, add the `nogl` class to `document.documentElement` and stop. Otherwise call `loadHeroModel('media/hero-valve.glb')`; on rejection, also add the `nogl` class and stop (same fallback path serves both WebGL-unavailable and GLB-load-failure cases — this is the Review Focus item on load failures with WebGL present).

- [ ] **Step 5: Verify the GLB-load-failure path also falls back correctly**

Manual check: temporarily change the `loadHeroModel` URL to a nonexistent file (e.g. `media/does-not-exist.glb`), reload the page, confirm `.nogl` gets added and the fallback image shows (same as Step 2's check). Revert the URL afterward.

- [ ] **Step 6: Wire the happy path — mount the loaded model and render one frame**

On `loadHeroModel` success: add the resolved `THREE.Object3D` to the scene, call `buildStudioEnvironment(renderer, scene)`, size the renderer to `box.clientWidth`/`clientHeight` (port `hero3d.js`'s existing `size()` function, current lines ~117–122, including its `ResizeObserver`/`resize` listener), render one frame, and add `document.documentElement.classList.add('glready')` (existing class already consumed by `style.css`'s `.drag-h` hint).

- [ ] **Step 7: Verify the happy path renders**

Run: `python -m http.server` from `INVI`, open `http://localhost:8000`, open devtools console.
Expected: zero console errors; the valve model is visible in the hero's right-side area within `#c3d`, lit by the studio rig (not flat/unlit); the `.glready` class is present on `<html>` (checkable via devtools Elements panel).

- [ ] **Step 8: Commit**

```bash
git add heroviewer.js
git commit -m "feat: load and render hero valve GLB with WebGL/load-failure fallback"
```

---

## Task 4: Port interaction — drag/inertia, idle auto-rotate, scroll-tie, reduced motion, visibility pausing

**Files:**
- Modify: `heroviewer.js`

**Interfaces:**
- Consumes: the `box` (`#c3d`), `renderer`/`scene`/`camera`, and loaded model root `Object3D` from Task 3.
- Produces: no new exported names — this task adds self-contained event listeners and an animation loop to the same module, following the exact control scheme already in `hero3d.js` (current lines ~98–145: `rot(dx,dy)`, pointer drag with inertia `vx`/`vy`, idle auto-rotate, scroll-driven `scr`/`gap` state, `IntersectionObserver` + `visibilitychange` pausing).

- [ ] **Step 1: Port drag-to-orbit with inertia**

Copy `hero3d.js`'s existing `rot(dx, dy)` function and its `pointerdown`/`pointermove`/`pointerup`/`pointercancel` listeners (current lines ~98–114) into `heroviewer.js`, operating on the loaded model's root `Object3D.quaternion` instead of the hand-built `root` group — same math, same event wiring, different target object.

- [ ] **Step 2: Port idle auto-rotate and inertia decay**

Copy the existing `frame(now)` animation-loop logic (current lines ~130–139): inertia decay (`vx*=.94`), auto-rotate when idle (`rot(dt*.45,0)`), and the `requestAnimationFrame` loop itself (`start()`/`raf`).

- [ ] **Step 3: Respect `prefers-reduced-motion: reduce`**

Port the existing `reduce` check (`matchMedia('(prefers-reduced-motion: reduce)').matches`, current line ~14) and its effect: when true, render exactly one static frame and skip starting the `requestAnimationFrame` loop entirely (current lines ~141 vs ~142–145).

- [ ] **Step 4: Port visibility/intersection pausing**

Copy the existing `IntersectionObserver` (pause when `#c3d` scrolls out of view) and `document.addEventListener('visibilitychange', start)` logic (current lines ~143–144) unchanged.

- [ ] **Step 5: Port scroll-tied motion (without the lever — there isn't one on this model)**

Copy the existing scroll-progress tracking (`scr`, `onScroll()`, current lines ~123–124) and the `root.scale`/`root.position` scroll-driven adjustment (current line ~127: `root.scale.setScalar(...)`, `root.position.y/x`). Drop the `lever.rotation.y` line entirely — the reconstructed model has no separate lever node to animate; the scale/position motion alone satisfies the "something moves on scroll" goal without inventing an articulation the model doesn't have.

- [ ] **Step 6: Verify drag, idle rotation, and reduced motion manually**

Run: open the page in a browser with default motion settings. Expected: dragging left/right rotates the model and tracking the cursor; releasing continues rotating briefly (inertia) then settles into slow auto-rotate after ~1s idle (matching existing `resume` timeout pattern already used by `herovideo.js`, reused here if helpful for the "resume after drag" delay).
Then: enable "reduce motion" in OS accessibility settings, reload. Expected: model renders once, statically — no auto-rotate, no inertia, dragging still works if you choose to port drag-when-reduced (optional; matching `hero3d.js`'s existing behavior, which still allows manual drag under reduced motion, only suppressing the automatic animation).

- [ ] **Step 7: Verify visibility pausing**

Run: open devtools Performance or a simple `console.log` inside the `frame()` loop, scroll the hero fully out of view, confirm the loop stops being called; scroll back, confirm it resumes.

- [ ] **Step 8: Commit**

```bash
git add heroviewer.js
git commit -m "feat: port drag/inertia/auto-rotate/scroll/reduced-motion interaction to hero viewer"
```

---

## Task 5: Spec/certification trust callout

**Files:**
- Modify: `index.html` (add callout markup inside the `.hero` section)
- Modify: `style.css` (add callout styles)
- Modify: `heroviewer.js` (add show/hide timing)

**Interfaces:**
- Produces: a `.hero-spec` element, shown via a `.show` class toggle, with the exact copy fixed below.
- Consumes: the same idle/drag state already tracked in Task 4 (reuses the `drag` boolean and idle timing, no new state machine).

- [ ] **Step 1: Add the callout markup**

In `index.html`, inside `<section class="hero">`, add (near the existing `.drag-h` element):

```html
<div class="hero-spec" aria-hidden="true"><span>Marcado de fábrica</span><b>Clase 600 · WCB</b></div>
```

- [ ] **Step 2: Style the callout**

In `style.css`, add a `.hero-spec` rule following the existing `.drag-h` treatment (same `background:rgba(5,7,13,.55)`, `border`, `backdrop-filter:blur(8px)` pattern, positioned so it doesn't overlap `.drag-h`), plus a `.hero-spec.show` opacity transition (0 → 1), default `opacity:0`.

- [ ] **Step 3: Wire show/hide timing in `heroviewer.js`**

Add: a `setTimeout` that adds the `.show` class to `.hero-spec` after 2.5s of no drag interaction (reuse the existing `drag` boolean from Task 4 — only start the timer once `glready` is set and the pointer isn't down), and removes `.show` immediately when a drag starts (same moment `hv.classList.add('grab')`-equivalent logic runs).

- [ ] **Step 4: Verify the callout appears and hides correctly**

Run: open the page, wait ~3 seconds without touching the hero. Expected: "Marcado de fábrica / Clase 600 · WCB" fades in near the model. Then click-drag the model. Expected: the callout fades out immediately on drag start.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css heroviewer.js
git commit -m "feat: add spec/certification trust callout to hero"
```

---

## Task 6: Swap hero markup — remove the video tier, wire up the new script

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `heroviewer.js` (Tasks 3–5), existing `#c3d`/`.fallback`/`.drag-h` elements (unchanged ids/classes, so existing CSS keeps working without a CSS rewrite beyond Task 5's additions).

- [ ] **Step 1: Remove the video markup and its script tag**

In `index.html`, delete the `<div id="hv" class="hv">...</video></div>` block (current line 19) and the `<script src="herovideo.js"></script>` tag (current line 88).

- [ ] **Step 2: Remove the old 3D fallback script tag, add the new module script**

Delete `<script src="hero3d.js"></script>` (current line 90). Add `<script type="module" src="heroviewer.js"></script>` in its place.

- [ ] **Step 3: Confirm `#c3d` no longer depends on the removed `.v3d` trigger class**

The existing CSS rule `#c3d{display:none}.v3d #c3d{display:block}` (current `style.css` line 50) gated visibility on a `.v3d` class that `herovideo.js` used to add on video failure. Since there's no video tier anymore, this task does not touch CSS directly (that's Task 7) but confirms here that `heroviewer.js` (Task 3) never needs to add `.v3d` — it relies on `.nogl` only. Leave the CSS fix itself to Task 7, where the obsolete `.v3d` rule is removed and replaced.

- [ ] **Step 4: Verify the page loads with no references to deleted files**

Run: `grep -n "herovideo\|hero3d\.js\|valvula-giro" index.html`
Expected: no matches (confirms Steps 1–2 fully removed the old references; `hero3d.js` as a filename will still exist on disk until Task 8 deletes it, but nothing in `index.html` should reference it anymore).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: remove video hero tier, wire up new 3D hero viewer script"
```

---

## Task 7: Update hero CSS for the single-viewer layout

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: `#c3d` (existing selector, current lines 50, 53–54), `.fallback`/`.nogl` (existing, lines 55–56), `.hv`/`.hv.grab`/`.hv video` (existing, lines 51–52 — now unused, to be removed).

- [ ] **Step 1: Remove the obsolete `.hv` rules**

Delete the CSS rules for `.hv`, `.hv.grab`, `.hv video` (current lines 51–52) — no element uses these classes anymore after Task 6.

- [ ] **Step 2: Remove the `.v3d` gate, make `#c3d` the unconditional primary layer**

Change `#c3d{display:none}.v3d #c3d{display:block}` (current line 50) to simply `#c3d{display:block}` — the viewer is primary now, no longer a fallback gated behind a trigger class. The existing `.nogl` mechanism (hiding/showing `.fallback`) still handles the no-WebGL/load-failure case independently.

- [ ] **Step 3: Check the responsive breakpoint rules still make sense**

Review the existing `@media` rule touching `.hv{width:100%;right:0;top:auto;bottom:0;transform:none}` (current line 220) — since `.hv` no longer exists, remove this line from that breakpoint block. Leave the `#c3d{...}` responsive overrides in the same block (current line 221) as they are; they already target the right element.

- [ ] **Step 4: Verify desktop and mobile layout visually**

Run: open the page at desktop width (≥1024px) and mobile width (375px, via devtools device toolbar). Expected: at both sizes, the hero valve viewer occupies the same area the old video/3D-fallback used to (right side on desktop, lower portion on mobile per the existing breakpoint rules), with no leftover empty gap where `.hv` used to be masked/positioned.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: simplify hero CSS to single 3D-viewer layer, remove obsolete video styles"
```

---

## Task 8: Delete obsolete files

**Files:**
- Delete: `herovideo.js`
- Delete: `hero3d.js`
- Delete: `media/valvula-giro.mp4`
- Delete: `media/valvula-giro.webm`
- Delete: `media/valvula-poster.jpg`

**Interfaces:**
- None — this task only removes files already unreferenced after Tasks 3–7 ported their logic into `heroviewer.js` and Task 6 removed their `<script>`/`<video>` tags.

- [ ] **Step 1: Confirm nothing still references these files**

Run: `grep -rn "herovideo\.js\|hero3d\.js\|valvula-giro\|valvula-poster" --include=*.html --include=*.js .`
Expected: no matches anywhere in the project (re-confirms Task 6 Step 4's narrower check, now across all files, not just `index.html`).

- [ ] **Step 2: Delete the files**

```bash
git rm herovideo.js hero3d.js media/valvula-giro.mp4 media/valvula-giro.webm media/valvula-poster.jpg
```

- [ ] **Step 3: Verify the page still works with the files gone**

Run: `python -m http.server` from `INVI`, reload the page, open devtools console.
Expected: zero 404s, zero console errors, hero viewer still renders and is interactive (same checks as Task 3 Step 7 and Task 4 Step 6, re-run once more here as a final confirmation after deletion).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove obsolete hero video and procedural-3D fallback files"
```

---

## Task 9: Full manual verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Cross-browser check**

Open the page in Chrome, Firefox, and Safari (per the project's existing `web/testing.md` cross-browser minimum). Expected: hero viewer loads and is draggable in all three; no console errors.

- [ ] **Step 2: Responsive breakpoints**

Check at 320px, 768px, 1024px, 1440px widths (per the project's existing `web/testing.md` breakpoint list). Expected: no horizontal overflow, viewer sized and positioned sensibly at each width, matching Task 7 Step 4's check extended to all four widths.

- [ ] **Step 3: Simulate no-WebGL**

In Chrome devtools, disable WebGL (`chrome://flags` → disable hardware acceleration, or use a devtools WebGL-disabling extension) and reload. Expected: `.nogl` is present on `<html>`, the static fallback image (`images/valvulas-1.jpg`) is visible and looks intentional (not a broken placeholder) — confirms the design doc's anti-goal is met.

- [ ] **Step 4: Confirm final performance budget**

Run: `ls -la media/hero-valve.glb vendor/three.module.js vendor/GLTFLoader.js media/valvula-giro.mp4 2>/dev/null` (the last one should already be gone — comparison reference only).
Expected: `hero-valve.glb` ≤ 2 MB (per Task 2's ceiling); total new hero payload (GLB + the two vendored JS files) should read as comparable to or lighter than the old video+three.min.js baseline — confirms the design doc's "must not regress LCP" anti-goal informally, ahead of a full Lighthouse pass if the human partner wants one.

- [ ] **Step 5: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "fix: address issues found in hero viewer manual verification pass"
```
