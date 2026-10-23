# Prototype: AI panel animation

## Question

The AI toolkit panel ("How I build with AI") needed more motion than the first pass. The prototype tested three different ideas for animating the stage track and the feedback loop, and picked one. Every option had to keep the panel's existing rules: stay inside the fit budget, never shift layout, keep the first paint still, animate the polished layer only, and support reduced motion.

## Verdict

**Build-up (option C), changed so stages appear one at a time instead of brightening from dim.** It is now on `feat/portfolio-v2-3d-rebuild` in `src/components/panels/ai-toolkit.css` (the polished motion block) and `AIToolkit.tsx` (one `aria-hidden` hero span per stage).

The loop runs for 17.8s:

1. The board starts empty.
2. Each stage fades and rises in, showing only a big title centred in its column at 1.4x. The title holds about 0.4s so the visitor can read it. Then it slides up and shrinks onto the real title over 0.45s with ease-in-out.
3. The stage's questions then appear one at a time, 0.35s each. Each one fades in first, then fills with a highlight.
4. The stage gets a check and a glow, and its arrow fires. The next stage starts.
5. When Improve is done, the dashed return path draws in from right to left. The full board holds for 2.5s.
6. A dot runs the return path from Improve back to Plan. The path is erased behind it, and each stage fades out as the dot passes under it.
7. After a 0.8s pause, the loop repeats.

How it works:

- **Registered custom properties drive each column.** Each `.ai-stage:nth-child(n)` runs its own `ai-build-n` keyframes. Those keyframes animate four `@property` numbers that the column's children inherit: `--ai-in` (column shown), `--ai-title` (title slid up), `--ai-rows` (questions shown) and `--ai-done` (stage complete). The children read these values through `calc()`:
  ```css
  .panel-layer--polished .ai-skill {
    --ai-row-in: clamp(0, calc((var(--ai-rows) - var(--j)) * 2), 1);
    --ai-row-fill: clamp(0, calc((var(--ai-rows) - var(--j)) * 2 - 1), 1);
    opacity: var(--ai-row-in);
    background-size: calc(var(--ai-row-fill) * 100%) 100%;
  }
  ```
  Each column has its own keyframes because the gap between a column's build time and its clear time differs per column. A single keyframe set shifted with `animation-delay` cannot express that.
- **The hero title slide needs no JS.** `.ai-stage-hero` is absolutely positioned with `inset: 0`, so a `translate` percentage on it is a share of the column's size. The inner text uses its own size to recentre itself. The real title takes over once `--ai-title` reaches 1. In testing, the two titles' positions matched to 0px in every column.
- **The return path draws and erases with `clip-path: inset()`.** The dot uses the existing trick: it sits at the right end of a full-width strip, and sliding the strip by `translateX(-100%)` carries it back to Plan.
- **The first paint shows the full board.** Every loop animation has a negative delay of -13.8s, which starts it inside the full-board hold.
- **Reduced motion still shows everything.** `--ai-in` and `--ai-title` start at 1. The reduced-motion block also forces the questions to `opacity: 1`.
- **Hover and focus still work on hidden stages.** Hovering or focusing a faded-out stage forces it fully visible (`!important` beats the animation), so its tips and button still work.
- **The bigger titles fit the budget.** Stage titles went from 0.8rem to 0.9rem in both layers. The title's bottom margin dropped from 0.5rem to 0.3rem to pay for it, so the panel stays at scale 1 at 1440×805.

## Explorations

- **A, Circuit.** One packet ran the whole loop on nested X/Y transform wrappers: across a top wire, down Improve, along the return wire and up Plan. Columns lit up as it passed. It worked, but it read as one decoration moving rather than as a process.
- **B, Live system.** Every stage blinked at its own pace, with status lights, rows ticking like a status board, streaming arrows and a marching return wire. It was busy, and the order of the stages was lost.
- **C, Build-up (first cut).** Columns brightened from dim as their questions filled in, over a 10s loop. Eric picked this direction.
- **C, revision 2.** Columns started hidden and appeared one by one. The loop grew to 13s so the full board stays up long enough to read.
- **C, revision 3.** Each column showed its title alone before its questions. The return path stopped sitting there empty: it draws in, then the dot erases it.
- **C, revision 4.** Added the big centred title that slides up. Then the titles were made slightly smaller, which became the final version.

## Rejected Paths

- A, Circuit: one moving dot decorates the board without showing the process.
- B, Live system: too busy, and the stage order gets lost.
- Columns brightening from dim to lit: replaced by columns appearing from nothing.
- A dashed return path that stays on screen: it looked like an empty line with nothing on it.
- A 1.6x hero title with 0.95rem final titles: too big. "5 IMPROVE" nearly overflowed its column.

## PRD Handoff Notes

- **Long loop.** The loop is 17.8s, and the board is complete at 12.8s. To make it faster, trim `CENTER_HOLD` or `ROW` and regenerate the timings. All the keyframe percentages derive from one schedule.
- **Narrow desktops.** The 1.4x hero title fits a column at 1440px wide. On desktop windows around 900 to 1000px wide, "5 IMPROVE" may touch the column edge. If that shows up, cap the scale with container query units.
- **Phone width.** At 700px and below, the track is replaced by the compact strip, so phones don't get the build-up animation.
- **Browser support.** Smooth animation of registered custom properties needs Chrome 85, Safari 16.4 or Firefox 128 or later. Older browsers change these values in jumps (at each keyframe's midpoint) instead of easing. The loop still plays, just stepped.
