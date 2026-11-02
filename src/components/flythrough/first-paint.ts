import { FLY_CONFIG } from "./config";
import { MOBILE_QUERY } from "./mode";

/*
 * The home page paints the flat stack first and swaps in the fly-through stage once its chunk loads.
 * Without help the hero would jump at the swap: full-bleed and centered in the viewport on the flat
 * stack, a card centered below the nav in the stage.
 *
 * FIRST_PAINT_SCRIPT runs inline right after the nav, before first paint. When the page is headed for
 * the stage it sets data-fly-pending on <html>, plus the layout scale and nav height the stage will use,
 * and the `html[data-fly-pending]` rules in globals.css draw the flat hero as the stage's resting card.
 * The loader clears it once the final tree is up, so a downgrade back to the flat stack gets the
 * classic layout.
 */
const PENDING_ATTR = "data-fly-pending";

/**
 * Inline script for the body, placed after the nav. Mirrors resolveMode() (interactive only: no reduced
 * motion, not a phone, no ?view=classic) and layoutFor()'s scale, since it runs before any bundle.
 */
export const FIRST_PAINT_SCRIPT = `(() => {
  try {
    const q = (m) => window.matchMedia(m).matches;
    if (q("(prefers-reduced-motion: reduce)") || q(${JSON.stringify(MOBILE_QUERY)})) return;
    if (new URLSearchParams(location.search).get("view") === "classic") return;
    const root = document.documentElement;
    const w = window.innerWidth;
    const scale = w >= ${FLY_CONFIG.scaleBelow} ? 1 : Math.max(${FLY_CONFIG.minScale}, w / ${FLY_CONFIG.scaleBelow});
    const nav = document.querySelector(".site-nav");
    root.style.setProperty("--fly-scale", String(scale));
    root.style.setProperty("--fly-nav-h", (nav ? nav.getBoundingClientRect().height : ${FLY_CONFIG.navClearance}) + "px");
    root.setAttribute("${PENDING_ATTR}", "");
  } catch {}
})();`;

/** Nav height (px) the script measured, or null when it did not run. A style read, not a layout read. */
export function firstPaintNavHeight(): number | null {
  const px = parseFloat(document.documentElement.style.getPropertyValue("--fly-nav-h"));
  return Number.isFinite(px) && px > 0 ? px : null;
}

/**
 * Drops the first-paint stage geometry. Call once the stage or a flat mode is in place. The custom
 * properties stay: they are inert without the attribute, and a stage remount (StrictMode) still reads
 * the nav height.
 */
export function clearFirstPaint() {
  document.documentElement.removeAttribute(PENDING_ATTR);
}
