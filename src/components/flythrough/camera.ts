import { FLY_CONFIG, type FlyConfig } from "./config";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Camera z for scroll progress p in [0,1]. Panel i sits at z = -i*depth. */
export function cameraZ(progress: number, count: number, cfg: FlyConfig = FLY_CONFIG): number {
  return -clamp01(progress) * (count - 1) * cfg.depth;
}

export type Layout = { scale: number; offsetX: number; maxYaw: number };

/** Responsive layout: scale below ~1240px, flatter yaw and smaller offsets on narrow screens. */
export function layoutFor(width: number, cfg: FlyConfig = FLY_CONFIG): Layout {
  const scale = width >= cfg.scaleBelow ? 1 : Math.max(cfg.minScale, width / cfg.scaleBelow);
  const narrow = width < cfg.narrowBelow;
  return {
    scale,
    offsetX: narrow ? cfg.offsetX * 0.25 : cfg.offsetX * Math.max(0.5, scale),
    maxYaw: narrow ? cfg.maxYaw * 0.35 : cfg.maxYaw,
  };
}

/** Side of panel i: the hero is centered, the rest alternate. */
export const panelSide = (i: number): -1 | 0 | 1 => (i === 0 ? 0 : i % 2 === 1 ? 1 : -1);
export const panelX = (i: number, layout: Layout) => panelSide(i) * layout.offsetX;

/** Camera x: smoothstep between the offsets of the two panels it is between. */
export function cameraX(progress: number, count: number, layout: Layout, cfg: FlyConfig = FLY_CONFIG): number {
  const t = -cameraZ(progress, count, cfg) / cfg.depth; // position in panel units
  const i = Math.min(count - 1, Math.floor(t));
  const next = Math.min(count - 1, i + 1);
  return lerp(panelX(i, layout), panelX(next, layout), smoothstep(t - i));
}

/** Steps ahead of the camera (positive) or behind it (negative). 0 on arrival. */
export function stepsAhead(i: number, progress: number, count: number): number {
  return i - clamp01(progress) * (count - 1);
}

/** Yaw (degrees) toward the panel's side; eases to exactly 0 on arrival. */
export function panelYaw(i: number, progress: number, count: number, layout: Layout): number {
  const delta = stepsAhead(i, progress, count);
  return -panelSide(i) * layout.maxYaw * smoothstep(Math.abs(delta)) || 0;
}

/** Opacity in [0,1]: faded in the far distance and shortly after the camera passes. */
export function panelOpacity(i: number, progress: number, count: number, cfg: FlyConfig = FLY_CONFIG): number {
  const delta = stepsAhead(i, progress, count);
  if (delta >= 0) return 1 - smoothstep(delta - (cfg.farFade - 1));
  return 1 - smoothstep(-delta / cfg.passedFade);
}

export type PanelStyle = { transform: string; opacity: number };

export function panelStyle(
  i: number,
  progress: number,
  count: number,
  layout: Layout,
  cfg: FlyConfig = FLY_CONFIG,
): PanelStyle {
  const x = panelX(i, layout);
  const yaw = panelYaw(i, progress, count, layout);
  return {
    transform: `translate3d(${x}px, 0, ${-i * cfg.depth}px) rotateY(${yaw}deg) scale(${layout.scale})`,
    opacity: panelOpacity(i, progress, count, cfg),
  };
}

/** World transform: moves the world opposite to the camera, plus optional look-around. */
export function worldTransform(
  progress: number,
  count: number,
  layout: Layout,
  look: { x: number; y: number } = { x: 0, y: 0 },
  cfg: FlyConfig = FLY_CONFIG,
): string {
  const cx = cameraX(progress, count, layout, cfg);
  const cz = cameraZ(progress, count, cfg);
  return `rotateX(${-look.y * cfg.lookDegrees}deg) rotateY(${look.x * cfg.lookDegrees}deg) translate3d(${-cx}px, 0, ${-cz}px)`;
}

/** Scroll position to progress, from stable values only (no layout reads). */
export function scrollProgress(scrollY: number, lvhPx: number, cfg: FlyConfig = FLY_CONFIG): number {
  const range = ((cfg.scrollLvh - 100) / 100) * lvhPx;
  return range > 0 ? clamp01(scrollY / range) : 0;
}

/** Frame-rate independent lerp factor. */
export const lerpFactor = (dtMs: number, cfg: FlyConfig = FLY_CONFIG) =>
  1 - Math.pow(1 - cfg.lerp, dtMs / (1000 / 60));
