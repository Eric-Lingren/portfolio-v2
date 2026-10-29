import { panelScrollTop } from "./camera";
import { PANELS } from "./registry";

/** Registry index of the panel a location hash names, or -1 for an empty or unknown hash. */
export function hashPanelIndex(hash: string): number {
  const id = hash.replace(/^#/, "");
  return id ? PANELS.findIndex((p) => p.id === id) : -1;
}

/** Scroll position a page load with `hash` starts at in the fly-through: the panel's stop, or the top. */
export function initialScrollTop(hash: string, count: number, lvhPx: number): number {
  const i = hashPanelIndex(hash);
  return i < 0 ? 0 : panelScrollTop(i, count, lvhPx);
}
