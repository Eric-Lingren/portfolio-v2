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
     * Anchor fly-through: ease up over navRampMs, cruise at navCruisePerSec panels/s, ease down.
     * Felt: native smooth scroll rushed several panels (motion sickness). An ease-in-out cubic over
     * at most 4s eased well but its middle still flew by too fast. 1 panel ~1.5s, 6 panels ~5.4s.
     */
    navRampMs: 750,
    navCruisePerSec: 1.3,
  },
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
