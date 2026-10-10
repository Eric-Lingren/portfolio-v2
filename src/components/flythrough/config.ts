/** Tunable constants for the fly-through stage. Everything else derives from these. */
export const FLY_CONFIG = {
  perspective: 1100,
  /** Distance between neighboring panels along z. */
  depth: 1700,
  /** Total page scroll length, in lvh units (includes the 100lvh viewport itself). */
  scrollLvh: 800,
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
} as const;

export type FlyConfig = typeof FLY_CONFIG;
