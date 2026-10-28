/** Tunable constants for the fly-through stage. Everything else derives from these. */
export const FLY_CONFIG = {
  perspective: 1100,
  /** Distance between neighboring panels along z. */
  depth: 1700,
  /**
   * Total page scroll length, in lvh units (includes the 100lvh viewport itself;
   * the other 700 spread over 6 panel-to-panel steps, ~117 each).
   */
  scrollLvh: 800,
  /**
   * Panel snap-lock (see snap.ts). A reached panel ignores all input for holdMs. After that a
   * fresh swipe, reversal or quiet gap releases it, while a decaying fling is absorbed up to maxHoldMs.
   * Felt: 700ms hold too stiff, 0 too loose (no perceptible lock), 300ms slightly loose.
   */
  snap: {
    holdMs: 400,
    maxHoldMs: 1200,
    quietMs: 80,
    freshRatio: 1.3,
    freshMinDelta: 10,
    idleMs: 140,
    pullRadius: 0.2,
    /**
     * Anchor fly-through duration (ms), the same for every jump (see dive below). Felt: the old
     * one-panel hop at ~1.5s was right; cruising 1.3 panels/s made Home to Contact ~5.4s.
     */
    navMs: 1500,
  },
  /**
   * Anchor navigation "pull back and dive" (see dive.ts). The camera pulls back `depth` px and
   * tilts `tilt` degrees down, glides over the stack during the middle `glide` of the flight,
   * then dives in. `rise` is the fraction of the flight spent pulling out (and diving in).
   * At full pull the weave flattens by `flatten`, panels `reach` more steps ahead stay visible,
   * and passed panels fade over `linger` more steps (they are still in view, below the camera).
   * Felt: a mid-flight fade that cut to the last gap "jumps", "glitchy". Cutting to the panel
   * before the target flashed it. Flying every panel at cruise speed took ~5s and its weaving
   * brought on motion sickness.
   */
  dive: { glide: 0.7, rise: 0.4, depth: 2600, tilt: 22, flatten: 1, reach: 4, linger: 1 },
  /** Nav height (px) assumed until the fixed nav is measured; panels center in the space below it. */
  navClearance: 64,
  /** Minimum gap (px) between a resting panel and the viewport edges. */
  fitMargin: 20,
  /** Fraction of the remaining distance the camera closes per frame at 60fps. */
  lerp: 0.12,
  /** Horizontal panel offset (px) on wide screens; alternates sign per panel. */
  offsetX: 260,
  /** Yaw (degrees) of a panel one full step ahead of the camera. */
  maxYaw: 18,
  /** Max world rotation (degrees) following the cursor on desktop. */
  lookDegrees: 2.5,
  /** Panels scale down below this viewport width. */
  scaleBelow: 1240,
  /** Narrow-screen breakpoint: flatter yaw and smaller offsets. */
  narrowBelow: 768,
  minScale: 0.55,
  /** Panel scale below narrowBelow (panels are 92vw wide already; keeps text readable). */
  narrowScale: 0.9,
  /** Panels this many steps ahead are fully faded in the distance. */
  farFade: 3.5,
  /** Panels this many steps behind the camera are fully faded out. */
  passedFade: 0.45,
  /**
   * Build wipe starts when a panel is this many steps ahead of the camera.
   * Felt: 1.2 started while the panel was still tiny in the distance, so the sweep was unreadable. 0.5 still early.
   */
  wipeRange: 0.35,
  /**
   * Panel is fully built once the camera is within this many steps of it. Kept tiny so the sweep
   * spans most of the camera's ease-in (wipe is log-spaced, see builtAmount). Felt: 0.05 ran too fast.
   */
  wipeDone: 0.008,
} as const;

export type FlyConfig = typeof FLY_CONFIG;
