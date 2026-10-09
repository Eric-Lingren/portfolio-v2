---
name: fidelity-progression-3d
description: Prototype findings for the portfolio v2 3D direction. Fly-through of real DOM section panels in z-space won over the round-1 fidelity-shader boxes and three other immersive variants.
source_seed: docs/seeds/20261009-0124-portfolio-v2-rebuild.json
---

# Prototype: Fidelity progression and immersive 3D direction

## Question

Seed `portfolio-v2-3d-rebuild` asked the prototype to answer four things:

1. Does the sketch hero hook in 3 seconds?
2. Do fidelity transitions (sketch, then dither, then polished) feel intentional?
3. Does the section order (Hero, Positioning, AI toolkit, Selected work, Experience, Contact) read as a story?
4. Does it hold 60fps on Eric's phone?

Round 1 raised a bigger question: **which 3D concept feels immersive and shows senior frontend flair, not just a marketing site?**

## Verdict

**Fly-through wins.** The site's sections are real DOM panels placed in z-space. Scrolling flies the camera through them. Panels ahead of the camera are wireframes (sketch mode). A "build line" wipes each one into its polished version as the camera arrives. When the camera reaches a panel, it sits flat at z = 0 and reads like a normal page.

This replaces the round-1 approach (WebGL boxes in a canvas beside DOM text). The "Exploded Interface" concept survives, but the exploded layers are now the site's own sections, not decorative geometry.

### Mechanics (from the prototype, `proto-3d/src/Fly.jsx`)

- **Stage:** a fixed full-viewport element with `perspective: 1100px`. Inside it, a `preserve-3d` world. A tall scroll spacer (`N * 140vh`) drives progress.
- **Panel layout:** panel `i` sits at `z = -i * D` with `D = 1700px`. Panels alternate horizontally (`XS = [0, -420, 420, -360, 360, 0]`) and are yawed (`RY = [0, 16, -16, 13, -13, 0]` degrees). Yaw eases to 0 as the camera arrives.
- **Camera:** `cam` lerps toward `p * (N - 1) * D` at 0.09 per frame. Camera X follows a smoothstep between neighboring panel X values. The mouse adds a small look-around (about ±7° Y, ±5° X).
- **Passed panels** fade out over 350px once they are 250px behind the camera, then get `visibility: hidden`.
- **Build wipe:** each panel stacks a polished copy and a sketch copy of the same section. The sketch copy is clipped from the top as the camera approaches. An orange line with glow marks the wipe edge.

```js
const dist = i * D - cam
const k = clamp(dist / D, 0, 1)
panel.style.transform =
  `translate(-50%, -50%) translate3d(${XS[i]}px, 0, ${-i * D}px) rotateY(${RY[i] * k}deg)`
const built = 1 - clamp((dist - 120) / 900, 0, 1)
sketch.style.clipPath = `inset(${built * 100}% 0 0 0)`
```

```css
.fly-stage  { position: fixed; inset: 0; perspective: 1100px; overflow: hidden; }
.fly-world  { transform-style: preserve-3d; }
.fly-sketch { position: absolute; inset: 0; transform: translateZ(1px); /* avoids coplanar z-fighting */
              border-top: 2px solid #ff4b1f; box-shadow: 0 -6px 24px #ff4b1f88; }
```

- **Sketch and polished share one layout.** Each section renders twice (`sk` prop). Theme CSS changes only color, background, and border style, so the two versions align pixel for pixel. Redline notes in the sketch version are absolutely positioned and do not affect layout. The pattern is in `proto-3d/src/Page.jsx` and `page.css`.
- **Annotations as personality:** each panel has a `<ComponentName /> · z -1700px` tag. Handwritten redline callouts (e.g. "↕ Δz 1700px · ease smoothstep") float between panels.

### Constraints to carry forward

- The panels are **real DOM**. Content stays selectable, accessible, and crawlable. This supports the seed's accessibility defaults.
- Do **not** put large planes (such as a floor grid) inside the same `preserve-3d` context as the panels. In Chrome, a floor plane at y = +460 sorted in front of the panels and hid half the sketch layer. The prototype removed the floor.
- Any coplanar layers inside a panel need a small `translateZ` offset to avoid z-fighting.
- The motion is fully driven by scroll position, so scrolling back up reverses it. This is untested by eye.

## Explorations

- **Round 1 (`?v=orig`):** 7 WebGL boxes beside DOM text, with one shader blending sketch hatch, 1-bit Bayer dither, and polished shading by scroll. Transitions felt smooth and intentional. Eric was unsure the sketch hero hooks in 3 seconds. Verdict: "cool" but not immersive. It reads like a marketing site, without senior FE flair.
- **Fidelity lens (`?v=lens`):** sketch page with a cursor lens revealing the polished site through a CSS mask. The lens drifts on its own when idle, scroll widens it, and `S` ships the whole page. Cheap, mostly DOM.
- **Fly-through (`?v=fly`):** chosen. See Verdict. The first version crossfaded sketch to polished with opacity, and the midpoint looked muddy gray. Switching to a clip-path wipe fixed it and made the build read as intentional.
- **Inspect mode (`?v=inspect`):** devtools-style hover overlay (component name, size, padding, font). `X` explodes the real DOM into its component tree using CSS 3D, with each `[data-c]` node lifted by depth through the `translate` property. Drag to orbit.
- **Desk scene (`?v=desk`):** R3F desk with monitor, globe, sailboat, console, and mug, all using the round-1 fidelity shader. The camera moves between objects per section, and personality objects are clickable.
- Desktop frame rate: round 1 ran 85 to 120fps. The fly-through was not measured.

## Rejected Paths

- **Round 1 boxes beside text:** decorative sidecar. Not immersive, and lacks senior FE flair (Eric's feedback).
- **Fidelity lens, Inspect mode, Desk scene:** not chosen. Eric picked fly-through as the winner.
- **Opacity crossfade for sketch-to-polished:** the midpoint looked muddy. Replaced by the clip-path build wipe.
- **3D floor grid in the fly-through world:** broke depth sorting in Chrome.

## PRD Handoff Notes

- **Stack change to decide.** The seed specifies a persistent R3F canvas in the root layout. The winning variant uses **CSS 3D transforms on DOM, with no WebGL**. The PRD must decide whether R3F is still needed, for example as an atmospheric background layer behind the CSS 3D world, or dropped. Dropping it would also simplify the 1.5MB asset budget and the GPU tier detection.
- **Fidelity progression changes shape.** The page-wide sketch, dither, polished shader is replaced by a per-panel wireframe-to-polished build as you arrive. The dither stage does not appear in the fly-through. The PRD should confirm whether dither survives anywhere.
- **Phone untested.** The 60fps target on Eric's phone was not checked. CSS 3D with six large DOM panels needs a mobile check. Panel scale already shrinks below 1240px viewport width. A narrow-screen layout may need fewer panels in view, or flatter yaw.
- **Hook in 3 seconds is unconfirmed.** Eric was unsure about the round-1 hero. Nobody evaluated the fly-through hero on first load specifically.
- **Section order** was not challenged and stays as in the seed.
- **"View work" CTA in the hero:** keep it. Skimmers need one click to proof.
- **Reduced motion and Tier 3:** the fly-through needs a flat fallback. The shared `Page` component (all sections stacked, polished mode) already works as that fallback.
- **Possible reuse, not decided:** Inspect mode's X-ray and the lens could become easter eggs. Eric did not ask for this, so it is a PRD-level option only.
- **Mouse look-around has no touch equivalent yet.** Decide whether device tilt or nothing replaces it on mobile.
