/** Tunable constants for the fly-through stage. Everything else derives from these. */
export const FLY_CONFIG = {
  perspective: 1100,
  /** Distance between neighboring panels along z. */
  depth: 1700,
  /**
   * Total page scroll length, in lvh units (includes the 100lvh viewport itself
   * and every dwell segment below: 700 for travel + 3 dwell units at ~117 each).
   */
  scrollLvh: 1150,
  /**
   * Dwell segments: panel index -> weight, in the same units as one panel-to-panel
   * travel step (1). While dwelling the camera holds exactly on that panel and
   * the scroll drives the panel's own stepping. Index 2 is the AI toolkit panel.
   */
  dwell: { 2: 3 } as Readonly<Record<number, number>>,
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
  /** Panels this many steps ahead are fully faded in the distance. */
  farFade: 3.5,
  /** Panels this many steps behind the camera are fully faded out. */
  passedFade: 0.45,
  /** Build wipe starts when a panel is this many steps ahead of the camera. */
  wipeRange: 1.2,
  /** Panel is fully built once the camera is within this many steps of it. */
  wipeDone: 0.1,
} as const;

export type FlyConfig = typeof FLY_CONFIG;
