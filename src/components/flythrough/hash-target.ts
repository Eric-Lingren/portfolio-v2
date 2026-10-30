import { getActiveSection, subscribeActiveSection } from "../active-section";
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

/**
 * Points the URL at panel `id` so a refresh reopens it. The hero is the page top, so it clears the hash.
 * Replaces the history entry: nothing listens for popstate, so Back would change the URL without moving
 * the page. Safari throws if replaceState is called too often, and a stale hash is harmless, so that is swallowed.
 */
export function writeSectionHash(id: string): void {
  const hash = id === PANELS[0].id ? "" : `#${id}`;
  if (window.location.hash === hash) return;
  const { pathname, search } = window.location;
  try {
    window.history.replaceState(window.history.state, "", pathname + search + hash);
  } catch {}
}

/** Keeps the URL hash on the active section as the visitor scrolls. Returns the unsubscribe. */
export function syncHashToActiveSection(): () => void {
  return subscribeActiveSection(() => {
    const id = getActiveSection();
    if (id) writeSectionHash(id);
  });
}
