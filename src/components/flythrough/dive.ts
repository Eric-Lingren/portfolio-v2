import { FLY_CONFIG, type FlyConfig } from "./config";
import { clamp01, smoothstep } from "./camera";

/**
 * Anchor navigation "pull back and dive", as pure curves of normalized flight
 * time u in [0,1]. The camera pulls back and up until the panel stack shows in
 * perspective, glides over it to the target, and dives in. Every jump takes
 * the same time whatever its distance, so long jumps glide faster at altitude
 * instead of taking longer. Motion is continuous: no cuts, no fades.
 */

type DiveConfig = FlyConfig["dive"];

/** Fraction (0..1) of the scroll distance covered at u: a sine ease inside the glide window. */
export function diveScroll(u: number, cfg: DiveConfig = FLY_CONFIG.dive): number {
  const lead = (1 - cfg.glide) / 2;
  const x = clamp01((u - lead) / cfg.glide);
  return (1 - Math.cos(Math.PI * x)) / 2;
}

/** Pull-back amount (0..1) at u: eases out over the first `rise` of the flight, back in over the last. */
export function divePull(u: number, cfg: DiveConfig = FLY_CONFIG.dive): number {
  if (u <= 0 || u >= 1) return 0;
  return smoothstep(u / cfg.rise) * smoothstep((1 - u) / cfg.rise);
}
