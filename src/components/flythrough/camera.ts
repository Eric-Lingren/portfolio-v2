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

/** Sum of dwell weights for panels that exist (index < count). */
function dwellWeights(count: number, cfg: FlyConfig): number[] {
  return Array.from({ length: count }, (_, i) => Math.max(0, cfg.dwell[i] ?? 0));
}

export type ScrollMapping = {
  /** Camera progress in [0,1] (what cameraZ and friends take). */
  cameraProgress: number;
  /** Progress through the active dwell in [0,1]; 0 when not dwelling. */
  dwellProgress: number;
  /** Panel index being dwelt on, or -1. */
  dwellIndex: number;
};

/**
 * Pure scroll map with dwell. Scroll progress p in [0,1] covers travel (1 unit
 * per panel gap) plus each panel's dwell weight. During a dwell the camera sits
 * exactly on the panel and `dwellProgress` runs 0..1.
 */
export function scrollToCamera(progress: number, count: number, cfg: FlyConfig = FLY_CONFIG): ScrollMapping {
  if (count <= 1) return { cameraProgress: 0, dwellProgress: 0, dwellIndex: -1 };
  const weights = dwellWeights(count, cfg);
  const total = count - 1 + weights.reduce((a, b) => a + b, 0);
  const u = clamp01(progress) * total;
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const w = weights[i];
    if (w > 0) {
      if (u <= acc + w && u > acc) {
        return { cameraProgress: i / (count - 1), dwellProgress: (u - acc) / w, dwellIndex: i };
      }
      acc += w;
    }
    if (i < count - 1) {
      if (u <= acc + 1) return { cameraProgress: (i + (u - acc)) / (count - 1), dwellProgress: 0, dwellIndex: -1 };
      acc += 1;
    }
  }
  return { cameraProgress: 1, dwellProgress: 0, dwellIndex: -1 };
}

/**
 * Inverse of the map: scroll progress that places the camera exactly on panel
 * `index`, at the start of that panel's dwell (the step-one view).
 */
export function panelScrollProgress(index: number, count: number, cfg: FlyConfig = FLY_CONFIG): number {
  if (count <= 1) return 0;
  const weights = dwellWeights(count, cfg);
  const total = count - 1 + weights.reduce((a, b) => a + b, 0);
  const i = Math.min(count - 1, Math.max(0, Math.round(index)));
  const before = weights.slice(0, i).reduce((a, b) => a + b, 0);
  return clamp01((i + before) / total);
}

/**
 * Progress through panel `index`'s own dwell for scroll progress p:
 * 0 before it, 0..1 within it, 1 after it. 0 when the panel has no dwell.
 */
export function dwellProgressAt(progress: number, count: number, index: number, cfg: FlyConfig = FLY_CONFIG): number {
  const weights = dwellWeights(count, cfg);
  const w = weights[index] ?? 0;
  if (w <= 0) return 0;
  const total = count - 1 + weights.reduce((a, b) => a + b, 0);
  const start = index + weights.slice(0, index).reduce((a, b) => a + b, 0);
  return clamp01((clamp01(progress) * total - start) / w);
}

/**
 * Page scrollY (px) that puts the camera exactly on panel `index`. The single
 * source for anchor-click scrolling; inverse of scrollProgress + scrollToCamera.
 */
export function panelScrollTop(index: number, count: number, lvhPx: number, cfg: FlyConfig = FLY_CONFIG): number {
  return panelScrollProgress(index, count, cfg) * ((cfg.scrollLvh - 100) / 100) * lvhPx;
}
