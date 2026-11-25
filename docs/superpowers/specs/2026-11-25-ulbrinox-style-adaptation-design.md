# Adapt Ulbrinox's visual language to INVI, in batches

## Intent & why

INVI (Proinvi) is visually uniform: one near-black background (`#05070d`)
throughout, one accent gradient (blue→cyan) on every button, equal-weight
glass panels for every card. The reference site (ulbrinox.com.mx), a
comparable B2B stainless-steel/aluminum distributor, uses **section-to-
section contrast** (white ↔ deep navy) and **card-to-card gradient
hierarchy** to signal which content carries more weight — principles,
trust stats, the quote form. INVI has none of that rhythm today; every
section reads with equal visual weight.

The goal is not to copy Ulbrinox's content, photography, or exact colors —
it's to borrow the *structural patterns* that create hierarchy and trust,
and re-skin them with INVI's own real content, existing blue/cyan identity,
and (per this session's decision) one added warm accent color for primary
CTAs.

## Goals

- Introduce a deep-navy "weight" treatment usable on 1-2 sections per page,
  distinct from the base near-black background, so some sections visually
  read as more important.
- Give the existing `.feats` ("Por qué elegirnos") section a gradient-
  intensity card strip instead of three identical panels.
- Add a split-panel card variant (photo half / text-and-CTA half) usable
  for featured product lines, as an alternative to the full-bleed bento
  cards.
- Deepen the "Quiénes somos" section's background contrast to match the
  "load-bearing" feel of Ulbrinox's equivalent section.
- Restyle form inputs (starting with `contacto.html`) with a cyan-outline-
  on-focus treatment.
- Add a second accent color (orange→red gradient) reserved for primary
  conversion CTAs only (`Solicitar cotización`, `Enviar cotización`-type
  buttons) — confirmed with the human partner.

## Non-goals

- Not redesigning the whole site's color system — blue/cyan remains the
  primary identity; orange/red is a narrow, deliberate exception.
- Not changing page structure/navigation/content hierarchy — this is a
  visual-layer pass over existing sections, not an information-architecture
  change.
- Not touching the hero (just redesigned in this same session).

## Anti-goals

- **Never fabricate people, quotes, or leadership bios.** Ulbrinox's
  "Principios" section uses real founders' photos and quotes. INVI has no
  equivalent real content. The gradient-card-strip *pattern* is being
  borrowed for `.feats`, filled with INVI's real, already-existing "Por qué
  elegirnos" copy — not invented founder portraits or quotes. This is a
  hard line, not a style choice.
- Not introducing a third accent color or any other unreviewed color
  decision beyond the one confirmed addition.
- Not making any section harder to read or lower-contrast in the name of
  matching a reference site.

## Constraints

- No build step; plain HTML/CSS/JS, same as the rest of the site.
- Must not change `data.js` or product image paths.
- Existing responsive breakpoints (320/768/1024/1440) must keep working
  for every section touched.
- `prefers-reduced-motion` handling already established elsewhere in
  `style.css` must be respected for any new transitions.

## Approach

One approach considered and rejected: a single large CSS/markup pass
touching all five areas at once. Rejected per the human partner's explicit
request to **build in batches** — each batch is independently shippable,
reviewable, and revertible without the others.

## Batches (build order)

1. **Foundation** — add new CSS custom properties (navy "weight" token,
   warm CTA accent gradient) and apply the warm accent to the two buttons
   that are already `.btn.p` today: the bottom `.ctab` CTA band's button
   and (once batch 5 adds the form) the contact submit button. The hero's
   quote link is untouched. First visible change, low risk, must go first.
2. **`.feats` gradient card strip** — reskin the existing 3-card "Por qué
   elegirnos" section using real existing copy, gradient-intensity
   backgrounds instead of equal panels.
3. **Split-panel product card variant** — a new card style (photo half +
   text/CTA half, outlined button) for 1-2 featured product lines,
   hardcoded HTML, as an addition alongside (not replacing) the existing
   bento grid.
4. **"Quiénes somos" navy depth pass** — apply the new navy weight token
   to deepen that section's background contrast.
4a. **Stats band navy depth pass** — apply the same navy weight token to
   the 29+/800+/100k stats section, so the two credibility sections share
   visual weight.
5. **Form input restyle** — a new scoped class for cyan-outline-on-focus
   treatment on `contacto.html`'s fields only (global form styling
   untouched), plus the warm accent applied to its submit button.

## Decisions made with the human partner

- Adopt the warm orange→red accent, reserved for primary CTAs only.
- Build and ship in the five batches above, in that order — each is a
  self-contained, reviewable unit of work.

## Resolved after builder check

A fresh builder read this document cold and flagged four decisions with no
safe default. Resolved with the human partner:

- **Warm accent scope:** a new modifier class (e.g. `.btn.warm`), applied
  only to buttons that are already `.btn.p` today — the bottom `.ctab` CTA
  band's "Solicitar cotización" and `contacto.html`'s submit button. The
  hero's "Solicitar cotización" (currently a plain outline `.btn`, *not*
  `.btn.p`) is explicitly **not** touched — its visual hierarchy stays as-is.
  This becomes part of Batch 1 (Foundation), since it's the first visible
  application of the new token and is small in scope.
- **Navy section scope:** two sections get the navy weight token — "Quiénes
  somos" (batch 4, as originally planned) **and** the stats band (29+/800+/
  100k). The stats band gets its own small batch (inserted as batch 4a,
  after "Quiénes somos").
- **Split-panel card data source:** hardcoded HTML for the 1-2 featured
  product lines, not pulled from `data.js`/`app.js`. Scoped entirely to
  `index.html`/`style.css` for batch 3 — no JS rendering-logic changes.
- **Form restyle scope:** a new class scoped to `contacto.html`'s form only
  (not a change to the global `input,textarea,select` focus rule). The
  tienda cart/checkout forms are untouched by batch 5.

## What's left to the builder

- Exact CSS values for the navy weight token and the warm gradient
  (consistent with existing token-naming conventions in `:root`).
- Exact markup for the split-panel card variant and which 1-2 product
  lines feature it first.
- Exact gradient stops/ordering for the `.feats` card strip.
- Exact class name for the scoped form-input restyle and the warm-accent
  button modifier (suggested above, not binding).
