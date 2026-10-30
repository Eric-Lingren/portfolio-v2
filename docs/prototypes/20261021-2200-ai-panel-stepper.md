---
name: ai-panel-stepper
description: Prototype findings for the AI toolkit panel rebuild. A wide three.js track with every stage labeled (variant E) won. The real-bug walkthrough was dropped as too hard to follow.
source_seed: docs/seeds/20261019-0021-ai-panel-stepper-rebuild.json
---

# Prototype: AI toolkit panel stepper

## Question

Seed `ai-panel-stepper-rebuild` asked for a 2x2 of scene tech (CSS 3D vs three.js) and layout (receding track vs ring), plus a lede on/off switch. Each variant walked one real, anonymized bug through five stages (Plan, Build, Catch, Learn, Improve).

## Variants tried

| Key | Tech | Layout | Notes |
|-----|------|--------|-------|
| A | CSS 3D | track | Same tech as the fly-through. Only the active stage was readable. |
| B | CSS 3D | ring | Ring wraps Improve back to Plan. Same readability problem. |
| C | three.js | track | Best of the four. Still showed one labeled stage at a time and wasted most of a large scene. |
| D | three.js | ring | Ring rotation hid most stages. |
| E | three.js | wide track | Added after review of C. Full-width scene, all five stages labeled at once, hover tips on every skill, click a stage to jump. |

## Verdict

**E wins**, with the bug walkthrough removed.

- Eric preferred C over A, B and D, but found it "highly compressed" with little information in a big area. The original 16-node diagram was easier to mouse over and understand.
- E fixes that by labeling every stage at once, so all questions and skill names are readable side by side, like the original.
- The real-bug story (problem headlines, ticket and code snippets, the "bugbot caught it" note) made the panel confusing to follow. It was cut. The stage card now shows a plain summary of what the stage does and each skill with its one-line description and GitHub link.
- Lede: shipped off.

## Mechanics kept

- Labels are HTML projected from 3D each frame, so text stays crisp and hoverable. They stay hidden until their first placement.
- Fixed horizontal field of view (62°) so the five stages span the same share of the scene at any width. At 1440px wide, five 10.5rem labels fit without overlap.
- The track does not pan. A pan toward the active stage pushed Plan off the left edge on step 5. Only the highlight moves.
- Bounded tilt drag (no free orbit, no wheel capture). Pointer-down on a label skips the drag so clicks still land.
- WebGL mounts only in the polished layer. The sketch layer renders the same labels in a plain row.
- Flat strip of stage buttons on narrow screens, touch, reduced motion, missing `matchMedia`, or a failed WebGL context.

## Open edges

- Below about 1200px wide (but above the 700px flat cutoff), labels start to crowd.
- On a phone, the Back and Next labels wrap to two lines.
