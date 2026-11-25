# Hero visual redesign: real-product 3D reconstruction

## Intent & why

Proinvi's homepage hero currently rotates a valve through a three-tier
fallback: real video footage of a valve (dark/blue abstract background), a
hand-coded procedural Three.js valve if the video fails, and a static image
if WebGL is unavailable. It's well-built but disconnected from two things:
the real catalog, and the new uniform studio-photography look the catalog
was just given (white-to-light-gray gradient background, consistent
lighting).

The chosen creative direction is **material honesty, with a certification/
spec-trust layer**: for a B2B stainless steel distributor, the most
persuasive hero isn't an abstract or generic rendering — it's real,
verifiable product quality (weld seams, machined tolerances, stamped specs)
presented with the same visual discipline as the catalog, plus a quiet
layer that reinforces engineering trust (spec/standard callouts).

## Goals

- The hero's rotating object is a reconstruction of an **actual catalog
  product** (the gate valve already standardized in `images/valvulas-1.jpg`),
  not an abstract or generic render.
- Visual continuity with the catalog's new studio-photography style.
- Preserve today's interaction quality: drag-to-orbit with inertia, idle
  auto-rotate, scroll-tied motion, and `prefers-reduced-motion` support.
- Add a lightweight spec/certification callout that reinforces engineering
  trust during idle rotation (e.g., a standard/grade string).
- Simplify from three hero tiers (video → procedural 3D → static image) to
  two (live 3D model → static image).

## Non-goals

- Pixel-perfect photographic parity on every rotation angle. Single-photo 3D
  reconstruction approximates fine detail (exact bolt count, engraved text)
  rather than replicating it perfectly.
- A multi-SKU rotating carousel. One hero object for this iteration.
- Reinstating the old procedural valve's "scroll closes the lever" easter
  egg. The reconstructed valve isn't rigged with an articulated lever; a
  different scroll-tied motion (scale/position — already proven in the
  current CSS/JS) stands in for it.

## Anti-goals

Would make this a failure even if technically shipped:

- A hero that visibly wobbles or flickers between angles — the exact failure
  mode this project's pilot ruled out for the AI-image-sequence path.
- A hero heavier than today's video on the homepage's load budget. It must
  not regress LCP; ideally it's lighter.
- A broken-feeling fallback for non-WebGL users. The static-image fallback
  must look intentional, not like a placeholder.

## Constraints

- No build step. The site is plain HTML/CSS/JS with Three.js loaded from a
  local vendor script (`vendor/three.min.js`); the solution must fit that,
  no bundler.
- Must not change filenames/paths that other pages or `data.js` depend on.
  New assets live under new paths (e.g. `media/hero-valve.glb`), isolated
  from the product catalog images.
- Reduced-motion and no-WebGL users must still get a complete, intentional
  hero (not a broken one).
- GLB should target the "web/AR viewer" budget from Higgsfield's
  photo-to-3D guidance — 30,000–50,000 triangles, PBR textured — not the
  heavier print/render tier.

## Approaches considered

1. **AI-generated image-sequence turntable.** Independently generate 24–36
   still images at different angles from one reference photo, scrub between
   them like a sprite sheet (same drag mechanic as today's video).
   **Rejected** — piloted and failed. `gpt_image_2_6`'s reference-editing
   preserves an object's identity from a 2D photo but can't reason about
   genuine 3D viewpoint change; all 5 requested angles collapsed to
   near-duplicate poses of the same viewpoint.

2. **Image-to-3D reconstruction + live Three.js viewer.** Reconstruct a real
   GLB mesh from the single reference photo (`meshy_v7_image_to_3d`), then
   render and interact with it live in-browser via Three.js's `GLTFLoader`,
   reusing the orbit/drag/auto-rotate/scroll logic already proven in
   `hero3d.js`. **Chosen.** Piloted successfully: the reconstructed mesh
   rotates with genuine, consistent geometry across all 6 tested angles (0°,
   60°, 120°, 180°, 240°, 300°) — unlike approach 1, the handwheel, stem, and
   flanges track correctly frame to frame because it's one real mesh, not
   independently-synthesized stills.
   
   Texture fidelity was not fully validated in the pilot — the local Python
   debug renderer (`pyrender`) hit a texture-binding driver bug and had to
   fall back to flat-shaded / vertex-color previews, which are not
   representative of final quality. The actual implementation renders the
   GLB through Three.js in-browser (full UV-mapped PBR textures), the same
   engine already used for `hero3d.js` — a different, well-trodden code path
   that doesn't share the debug script's bug. Texture quality should be
   verified visually once implemented, not assumed from the pilot images.

3. **Reskin the real video's background.** Keep `valvula-giro.mp4` and its
   drag-scrub mechanic, regenerate only its background to match the new
   studio look. **Not pursued** — this was the fallback plan if approach 2
   failed; no longer needed since approach 2 validated.

## Resolved after builder check

A fresh reviewer read this document cold and flagged four open questions.
Two were implementation details with no real tradeoff, settled as the
agent's own call; two carried real business/performance weight and were put
to the human partner directly.

- **GLTFLoader sourcing** (agent's call): `vendor/three.min.js` does not
  include `GLTFLoader` — it ships separately and is version-locked to the
  exact Three.js revision in use. The builder must vendor a matching
  non-module `GLTFLoader.js` build alongside `three.min.js`, identified
  against the currently-vendored Three.js revision.
- **Static fallback image** (agent's call): reuse `images/valvulas-1.jpg`
  as-is rather than generating a new asset. It's the real source photo of
  the same valve, already in the catalog's studio style — directly serves
  the material-honesty goal without an extra generation/QA pass.
- **Commercial use of the AI-reconstructed GLB** (human partner's call,
  confirmed): approved. The reconstruction is derived from Proinvi's own
  product photo, treated like any other AI-assisted asset already in use on
  the site (the studio-background catalog photos).
- **Mobile behavior** (human partner's call, confirmed): the live 3D viewer
  is primary on every device with WebGL support, including mobile — no
  device-detection branch to a static fallback. The GLB must stay within
  the lightweight web/AR budget (30,000–50,000 triangles) specifically
  because this decision means its weight is carried on mobile too, not just
  desktop.

## Decisions made with the human partner

- Creative direction: material honesty + a quiet certification/spec-trust
  layer.
- Technical approach: live-rendered 3D reconstruction (approach 2), not an
  image sequence.
- Drop the video tier entirely: `herovideo.js`,
  `media/valvula-giro.mp4`/`.webm` are removed.
- Drop the hand-coded procedural geometry in `hero3d.js`, but keep Three.js
  itself — repurposed for `GLTFLoader` + rendering instead of hand-authored
  lathe/extrude geometry construction.
- Keep the existing interaction family: drag-to-orbit with inertia, idle
  auto-rotate, scroll-tied motion, reduced-motion handling — re-pointed at
  the loaded GLB instead of procedural meshes.
- Pilot subject: the gate valve in `images/valvulas-1.jpg` (chosen by the
  agent as a representative, already-standardized catalog photo for testing
  — see "what's left to the builder" below for confirming this as the final
  production subject).

## What's left to the builder

- **Confirm or change the final hero subject.** The pilot used
  `images/valvulas-1.jpg` (a single gate valve) because it was a clean,
  already-standardized single-object photo. This was the agent's pilot
  choice, not an explicit creative decision by the human partner — confirm
  it's the right valve/product for the final hero before committing to
  production generation.
- **Run (or re-run) the production-quality 3D generation.** The pilot used
  `meshy_v7_image_to_3d` with default web/AR settings to test geometric
  consistency, not final visual quality. Re-generate and visually QA in a
  real Three.js viewer before treating it as final.
- **Design the spec/certification callout:** exact content (e.g. pull a
  spec string from the válvulas line in `data.js`, such as class/material),
  timing (when it appears during idle rotation), and visual treatment
  (typography, position, consistent with `.pill`/`.drag-h` treatments
  already in `style.css`).
- **Markup/CSS changes** to `index.html` and `style.css`: replace the
  `#hv`/`<video>` markup with a `<canvas>`-based GLB viewer; preserve the
  existing `.hv` ellipse-mask/vignette treatment and responsive breakpoints
  (`@media max-width` rules currently targeting `.hv`/`#c3d`).
- **Rewrite the viewer script:** a new script (replacing `hero3d.js`'s
  procedural-geometry sections) that loads the GLB via `GLTFLoader` and
  reuses the existing camera/light-rig, drag/inertia, auto-rotate, and
  scroll-tie logic from `hero3d.js` — porting the proven interaction code,
  not rewriting it from scratch.
- **Performance verification:** confirm final GLB triangle count/file size
  stay within the web/AR budget and don't regress the homepage's hero LCP
  versus the current video baseline.
- **Cleanup:** remove `herovideo.js`, `media/valvula-giro.mp4`,
  `media/valvula-giro.webm`, `media/valvula-poster.jpg` (if unused
  elsewhere), and the procedural-geometry code in `hero3d.js` once the new
  viewer is verified working.
