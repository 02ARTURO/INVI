# Ulbrinox-Inspired Style Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Borrow five structural/visual patterns from ulbrinox.com.mx (navy-weight sections, gradient card hierarchy, split-panel product cards, warm CTA accent, cyan-focus form inputs) and apply them to INVI's existing sections, filled with INVI's own real content — in six independently-shippable batches.

**Architecture:** Pure CSS/HTML changes layered onto the existing design-token system in `style.css`'s `:root`. No new JS, no build step, no changes to `data.js`/`app.js` (confirmed in the design doc's resolved decisions). Each batch adds new CSS rules/classes and applies them to specific existing markup; nothing is removed except where a batch explicitly says so.

**Tech Stack:** Vanilla CSS/HTML, consistent with the rest of the site. No test framework exists in this repo (precedent: the hero 3D redesign plan). This work is pure CSS/markup with no runtime logic, so verification is: HTML validity checks, grep-based structural checks (new classes present, old behavior preserved), and a deferred manual visual check — same no-localhost-browser-tool limitation noted in the hero plan applies here too; flag it once, don't rediscover it mid-task.

**Spec:** `docs/superpowers/specs/2026-11-25-ulbrinox-style-adaptation-design.md`

## Global Constraints

- No build step; plain HTML/CSS. No bundler, no preprocessor.
- Must not change `data.js` or `app.js` (confirmed: split-panel card is hardcoded HTML, not data-driven).
- Must not change the global `input,textarea,select` focus rule (`style.css:173`) — batch 5's restyle is scoped to a new class on `contacto.html` only.
- Must not apply the warm accent to the hero's "Solicitar cotización" link (`index.html:29`, currently a plain `.btn`, not `.btn.p`) — hierarchy there stays unchanged.
- Existing responsive breakpoints (320/768/1024/1440, see `style.css`'s `@media` blocks) must keep working for every section touched.
- `prefers-reduced-motion` handling (`style.css:230`) must be respected — no new always-on animation that ignores it.
- Never fabricate people, photos, or quotes (design doc anti-goal) — batch 2's gradient card strip uses INVI's real existing "Por qué elegirnos" copy, not invented testimonials.

## Review Focus

- A new CSS custom property typo'd or referencing an undefined `var()` silently falls back to inherited/initial values — each batch's verification must grep the actual rendered value, not just confirm the rule exists.
- The warm-accent class accidentally also matching the hero's secondary button (e.g. via an overly broad selector like `.btn.p` instead of a new distinct class) — explicitly checked in Task 1.
- The new `.weight` navy sections losing readable text contrast against the new background (anti-goal: never lower contrast) — checked visually where possible, flagged for human check otherwise.
- Split-panel card hardcoded content drifting out of sync with `data.js` if that product line's real photo/copy changes later — accepted risk per the design doc's resolved decision, not a defect, but worth one comment in the code noting it's intentionally static.
- Responsive breakpoints breaking for the two- or three-column `.feats`/`.stats` grids once gradient backgrounds are added per-card — checked in each batch's own verification step.

---

## Task 1: Foundation — new CSS tokens + first warm-accent application

**Files:**
- Modify: `style.css` (`:root` block, line 1; add `.btn.warm` rules near `.btn.p`, line 44-45)
- Modify: `index.html` (line 85, the `.ctab` CTA band's button)
- Modify: `contacto.html` (line 25, the form submit button)

**Interfaces:**
- Produces: CSS custom properties `--warm`, `--warm2`, `--navy`, `--navy2` in `:root`.
- Produces: `.btn.warm` class, usable on any existing `.btn` element as an additional class.
- Consumes: nothing from other tasks — this is the foundation all later tasks build on.

- [ ] **Step 1: Add the four new CSS custom properties**

In `style.css` line 1, extend the existing `:root{...}` declaration (do not create a second `:root` block) by appending before the closing `}`:

```css
--warm:#f59e0b;--warm2:#ef4444;--navy:#0d2149;--navy2:#13306e
```

- [ ] **Step 2: Add `.btn.warm` rules**

Immediately after the existing `.btn.p:hover{...}` rule (`style.css` line 45), add:

```css
.btn.warm{background:linear-gradient(135deg,var(--warm),var(--warm2));border-color:transparent;box-shadow:0 10px 40px -10px rgba(239,68,68,.5)}
.btn.warm:hover{box-shadow:0 14px 50px -8px rgba(239,68,68,.75);filter:brightness(1.1)}
```

- [ ] **Step 3: Apply `.btn.warm` to the CTA band button**

In `index.html` line 85, find `<a class="btn p" href="contacto.html">Solicitar cotización ...`. Change its class attribute from `"btn p"` to `"btn p warm"`.

- [ ] **Step 4: Apply `.btn.warm` to the contact form submit button**

In `contacto.html` line 25, find `<button class="btn p" type="submit" ...>`. Change its class attribute from `"btn p"` to `"btn p warm"`.

- [ ] **Step 5: Verify the hero's quote link was NOT touched**

Run: `grep -n "Solicitar cotización" index.html`
Expected: two matches — line 29 (hero, class `"btn"` only, no `p` or `warm`) and line 85 (CTA band, now class `"btn p warm"`). Confirm line 29 still reads exactly `<a class="btn" data-sin-tienda href="contacto.html">Solicitar cotización</a>` with no `warm` class added.

- [ ] **Step 6: Verify the new tokens and class exist and are wired correctly**

Run: `grep -n -- "--warm\|--navy" style.css` — expect the four custom properties present in the `:root` line and nowhere accidentally redefined elsewhere.
Run: `grep -n "btn.warm\|btn p warm" style.css index.html contacto.html` — expect `.btn.warm` and `.btn.warm:hover` rules in `style.css`, and `class="btn p warm"` in both `index.html` and `contacto.html`.

- [ ] **Step 7: Commit**

```bash
git add style.css index.html contacto.html
git commit -m "feat: add warm CTA accent tokens, apply to CTA-band and contact-form buttons"
```

---

## Task 2: `.feats` gradient card strip

**Files:**
- Modify: `style.css` (`.feat`/`.feats` rules, lines 112-118)
- Modify: `index.html` (the `.feats` block, lines 65-68)

**Interfaces:**
- Consumes: `--navy`/`--navy2` from Task 1 for the gradient stops.
- Produces: a new `.feat` modifier pattern (`.feat.g1`, `.feat.g2`, `.feat.g3`) — three increasing-intensity backgrounds across the row, replacing the current identical `var(--panel)` background on all three. No new markup elements, only added classes and a background rule change.

- [ ] **Step 1: Add three gradient-intensity modifier classes**

After the existing `.feat:hover:before{opacity:1}` rule (`style.css` line 116), add:

```css
.feat.g1{background:linear-gradient(160deg,#0a1830,var(--panel))}
.feat.g2{background:linear-gradient(160deg,var(--navy),var(--panel))}
.feat.g3{background:linear-gradient(160deg,var(--navy2),var(--panel))}
```

- [ ] **Step 2: Apply the three classes to the existing feat cards, left to right**

In `index.html`, change each `<div class="feat rv">` (lines 66, 67, 68) to `<div class="feat rv g1">`, `<div class="feat rv g2">`, `<div class="feat rv g3">` respectively, in that order — do not change any other attribute, text, or SVG content.

- [ ] **Step 3: Verify the gradient classes are present and distinct**

Run: `grep -n "feat rv g" index.html` — expect exactly 3 matches, one each of `g1`, `g2`, `g3`, in that order.
Run: `grep -n "\.feat\.g[123]" style.css` — expect exactly 3 rules, each referencing a different background value.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "feat: add gradient-intensity hierarchy to the Por qué elegirnos card strip"
```

---

## Task 3: Split-panel product card variant

**Files:**
- Modify: `style.css` (new `.splitcard` rules)
- Modify: `index.html` (new markup, placed directly after the existing `.bento` grid's closing tag, inside the `#productos` section)

**Interfaces:**
- Consumes: `.btn`, `.btn.p` (unchanged, existing) for the card's CTA button — this card's button does **not** get `.warm` (it's a product-browse action, not a quote-request action, consistent with Task 1's narrow scope).
- Produces: `.splitcard` and `.splitcard .ph`/`.splitcard .bd` classes. New, self-contained — no other task consumes these.

- [ ] **Step 1: Choose the two featured product lines and their images**

Use `válvulas` (`images/valvulas-1.jpg`, the same gate valve already standardized and used as the hero's fallback/GLB source — reinforces visual consistency across the site) and `bridas` (`images/bridas-1.jpg`). Both already exist in the catalog's studio-background style from the earlier image standardization work.

- [ ] **Step 2: Add `.splitcard` CSS**

Add a new block after the `.card .go:hover` rule area (near `style.css` line 104-106, after the existing `.bento`/`.card` rules, before `.stats`):

```css
.splitgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
.splitcard{display:grid;grid-template-columns:1fr 1fr;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:var(--panel)}
.splitcard .ph{aspect-ratio:1/1;overflow:hidden}
.splitcard .ph img{width:100%;height:100%;object-fit:cover}
.splitcard .bd{padding:clamp(20px,3vw,34px);display:flex;flex-direction:column;justify-content:center;gap:12px}
.splitcard .bd h3{font-size:1.4rem}
.splitcard .bd p{color:var(--mu)}
@media(max-width:768px){.splitgrid{grid-template-columns:1fr}.splitcard{grid-template-columns:1fr}}
```

- [ ] **Step 3: Add the two hardcoded split cards to `index.html`**

Immediately after `<div class="bento" id="bento"></div>` (`index.html` line 44), inside the same `#productos` section's `.wrap`, add:

```html
<div class="splitgrid">
  <div class="splitcard rv"><div class="ph"><img src="images/valvulas-1.jpg" alt="Válvula de bola industrial" loading="lazy"></div><div class="bd"><h3>Válvulas</h3><p>Bola, compuerta, globo, check y aguja. Soldables, roscadas, bridadas y tipo clamp.</p><a class="btn" href="producto.html?c=valvulas">Ver producto <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div>
  <div class="splitcard rv"><div class="ph"><img src="images/bridas-1.jpg" alt="Bridas de acero inoxidable" loading="lazy"></div><div class="bd"><h3>Bridas</h3><p>Welding neck, slip-on, blind, threaded y socket weld. Desde 1/2" hasta 24".</p><a class="btn" href="producto.html?c=bridas">Ver producto <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div>
</div>
```

Note: `producto.html?c=valvulas` and `producto.html?c=bridas` match the existing `producto.html?c=<línea>` URL pattern already used by the data-driven bento cards (confirmed against `data.js`'s `slug` values) — verify this in Step 4 rather than assuming.

- [ ] **Step 4: Verify the slugs match `data.js` and the images exist**

Run: `grep -n "slug:'valvulas'\|slug:'bridas'" data.js` — expect both slugs present exactly as written in the new markup's `href` query strings.
Run: `ls -la images/valvulas-1.jpg images/bridas-1.jpg` — expect both files to exist.

- [ ] **Step 5: Verify the new markup is well-formed**

Run: `grep -c "<div class=\"splitcard rv\">" index.html` → expect `2`.
Run: `python -c "import re; s=open('index.html',encoding='utf-8').read(); o=len(re.findall(r'<div\b', s)); c=len(re.findall(r'</div>', s)); print(o, c); assert o==c"` → expect two equal numbers printed and no `AssertionError` (confirms every opened `<div>` in the file has a matching close tag, i.e. the new markup didn't break tag balance).

- [ ] **Step 6: Commit**

```bash
git add style.css index.html
git commit -m "feat: add split-panel product cards for válvulas and bridas"
```

---

## Task 4: "Quiénes somos" navy depth pass

**Files:**
- Modify: `style.css` (new `.sec.weight` rule)
- Modify: `index.html` (the "Quiénes somos" section's opening tag, line 56)

**Interfaces:**
- Consumes: `--navy`/`--navy2` from Task 1.
- Produces: `.sec.weight` class, reusable by Task 4a on a different section.

- [ ] **Step 1: Add the `.sec.weight` rule**

After the existing `.sec-h{margin-bottom:56px}` rule (`style.css` line 87), add:

```css
.sec.weight{background:linear-gradient(160deg,var(--navy2),var(--navy))}
```

(Confirmed during planning: `<main>` has no width-constraining CSS rule anywhere in `style.css` — only `.wrap` inside each `.sec` is capped at 1200px. `.sec` itself already renders full viewport width, so no full-bleed margin/width compensation is needed; the background rule alone is sufficient.)

- [ ] **Step 2: Apply `.weight` to the "Quiénes somos" section**

In `index.html` line 56, change `<section class="sec">` (the one containing `.split`/`.stack`/"Quiénes somos") to `<section class="sec weight">`.

- [ ] **Step 3: Verify the class is applied to the correct section only**

Run: `grep -n "sec weight" index.html` — expect exactly one match at this task's line, inside the section whose content includes "Quiénes somos" (confirm by checking the surrounding lines contain that heading text).

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "feat: apply navy-weight background to the Quiénes somos section"
```

---

## Task 4a: Stats band navy depth pass

**Files:**
- Modify: `index.html` (the stats section's opening tag, line 47)

**Interfaces:**
- Consumes: `.sec.weight` from Task 4 (no new CSS needed — same class, different section).

- [ ] **Step 1: Apply `.weight` to the stats section**

In `index.html` line 47, change `<section class="sec" style="padding-top:20px">` (the section containing `.stats`) to `<section class="sec weight" style="padding-top:20px">`.

- [ ] **Step 2: Verify both weighted sections are now present and distinct**

Run: `grep -n "sec weight" index.html` — expect exactly two matches now (stats section and "Quiénes somos" section from Task 4), on different lines.

- [ ] **Step 3: Check stat-number gradient text still reads against the new background**

The `.stat b` rule (`style.css` line 109) renders stat numbers as a white→cyan gradient-clipped text. Visually confirm (deferred to human check per this plan's Tech Stack note) that this gradient text remains legible against the new `.sec.weight` navy background — it should, since both are light-on-dark, but this is exactly the kind of contrast risk the Review Focus section calls out.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: apply navy-weight background to the stats band"
```

---

## Task 5: Contact form input restyle

**Files:**
- Modify: `style.css` (new scoped class, near the existing `input,textarea,select` rule, line 172-173)
- Modify: `contacto.html` (the `<form>` tag, line 19)

**Interfaces:**
- Consumes: `.btn.warm` from Task 1 (already applied to this form's submit button in Task 1 Step 4 — no change needed here).
- Produces: `.form.industrial` scoped class — new, consumed by nothing else.

- [ ] **Step 1: Add the scoped focus-style override**

After the existing `input:focus,textarea:focus,select:focus{...}` rule (`style.css` line 173), add:

```css
.form.industrial input,.form.industrial textarea,.form.industrial select{border:1px solid rgba(34,211,238,.35)}
.form.industrial input:focus,.form.industrial textarea:focus,.form.industrial select:focus{outline:0;border-color:var(--ac2);box-shadow:0 0 0 3px rgba(34,211,238,.18);background:rgba(34,211,238,.06)}
```

- [ ] **Step 2: Scope the class to the contact form only**

In `contacto.html` line 19, change `<form class="form" id="cform">` to `<form class="form industrial" id="cform">`.

- [ ] **Step 3: Verify no other form on the site was affected**

Run: `grep -rn "class=\"form" *.html` — expect `contacto.html` to show `"form industrial"` and every other match (e.g. tienda's cart/checkout forms, if any) to still read plain `"form"` with no `industrial` class.

- [ ] **Step 4: Verify the global focus rule is untouched**

Run: `grep -n "^input:focus,textarea:focus,select:focus" style.css` — expect this exact selector and its original rule body unchanged from before this task (compare against `git diff` to confirm this line has zero changes, only new lines were added after it).

- [ ] **Step 5: Commit**

```bash
git add style.css contacto.html
git commit -m "feat: add cyan-outline form input restyle, scoped to the contact page"
```

---

## Task 6: Full verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full-repo structural sweep**

Run: `grep -c "sec weight" index.html` → expect `2`.
Run: `grep -c "btn.warm\|class=\"btn p warm\"" style.css index.html contacto.html` → expect at least 4 matches total (2 CSS rules + 2 applied classes).
Run: `grep -c "splitcard" index.html style.css` → expect non-zero in both files.
Run: `grep -c "form industrial" contacto.html` → expect `1`.

- [ ] **Step 2: Confirm the hero and global form rule were never touched**

Run: `git diff <task-1-base-commit>..HEAD -- index.html | grep -A2 -B2 "id=\"top\""` — confirm no changes inside the `<section class="hero" id="top">` block (the hero was explicitly out of scope per the design doc's non-goals).
Run: `git diff <task-1-base-commit>..HEAD -- style.css | grep "input:focus"` — expect no output (confirms Task 5 Step 4's check held for the whole branch, not just that one task).

- [ ] **Step 3: Visual check (deferred to human)**

This plan's Tech Stack section already notes: no tool in this environment can render the page in a real browser. Every visual claim in this plan (gradient hierarchy looking right, navy sections reading as "heavier," split-card layout not breaking at mobile width, warm accent button contrast) needs one real look from the human partner before being treated as finished. List this plainly in the final report — do not claim visual verification that didn't happen.

- [ ] **Step 4: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "fix: address issues found in style-adaptation verification pass"
```
