import { smoothstep, stepsAhead } from "./camera";
import { FLY_CONFIG, type FlyConfig } from "./config";

/**
 * Per-panel build wipe. The sketch layer sits in an overflow-hidden box that is
 * translated down by the built amount while its inner content is translated back
 * up by the same amount, so the content stays put and the box edge sweeps down.
 * Transforms only: no paint-affecting properties are written per frame here.
 */

/** Distance (z units) from the camera to panel i. Positive = ahead, 0 on arrival. */
export function panelDistance(i: number, progress: number, count: number, cfg: FlyConfig = FLY_CONFIG): number {
  return stepsAhead(i, progress, count) * cfg.depth;
}

/**
 * Built amount in [0,1] from camera distance to the panel. 0 when far away,
 * 1 once within `wipeDone` of arrival (and after the camera passes). A pure
 * function of distance, so it is symmetric when scrolling in reverse.
 */
export function builtAmount(distance: number, cfg: FlyConfig = FLY_CONFIG): number {
  const done = cfg.wipeDone * cfg.depth;
  const range = cfg.wipeRange * cfg.depth;
  if (!(range > done)) return distance <= done ? 1 : 0;
  return 1 - smoothstep((distance - done) / (range - done));
}

const pct = (v: number) => `${Math.round(v * 1000) / 1000}%`;

export type WipeTransforms = { outer: string; inner: string; edge: string };

/** Equal-and-opposite translateY values (percent of the panel height). */
export function wipeTransforms(built: number): WipeTransforms {
  const p = Math.min(1, Math.max(0, built)) * 100;
  return {
    outer: `translate3d(0, ${pct(p)}, 0)`,
    inner: `translate3d(0, ${pct(-p)}, 0)`,
    edge: `translate3d(0, ${pct(p)}, 0)`,
  };
}

export type WipeTargets = {
  outer: HTMLElement;
  inner: HTMLElement;
  edge: HTMLElement | null;
};

/** Finds the wipe elements of a rendered panel once, so per-frame writes avoid queries. */
export function findWipe(root: ParentNode): WipeTargets | null {
  const outer = root.querySelector<HTMLElement>("[data-wipe]");
  const inner = root.querySelector<HTMLElement>("[data-wipe-inner]");
  if (!outer || !inner) return null;
  return {
    outer,
    inner,
    edge: root.querySelector<HTMLElement>("[data-wipe-edge]"),
  };
}

/** Writes the wipe transforms. The edge is shown only while the wipe is mid-sweep. */
export function applyWipe(t: WipeTargets, built: number): void {
  const s = wipeTransforms(built);
  t.outer.style.transform = s.outer;
  t.inner.style.transform = s.inner;
  if (t.edge) {
    t.edge.style.transform = s.edge;
    const visible = built > 0.002 && built < 0.998 ? "visible" : "hidden";
    if (t.edge.style.visibility !== visible) t.edge.style.visibility = visible;
  }
}
