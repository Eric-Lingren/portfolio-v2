/*
 * The home page restores the reader's scroll position itself when they come back (Back from a case study,
 * or a reload). The browser cannot be trusted with it here: the page first paints the flat stack and then
 * swaps in the fly-through, and some browsers (Arc) restore before the swap and land on the hero.
 *
 * FlyThroughLoader saves the position on pagehide. FlatStack and FlyStage read it on mount, in place of the
 * hash jump, and the loader settles it once the final tree is up so a later remount (frame-rate downgrade)
 * does not jump back.
 *
 * Restoring in effects means the first frame would paint at the top (the hero) and then jump. So
 * RESTORE_GATE_SCRIPT runs before first paint and hides the page for a returning reader, and settling
 * shows it again one frame later, once the scroll and the stage are in place.
 */
const PREFIX = "home-scroll:";
const GATE_ATTR = "data-restoring-scroll";
// Fail-safe: show the page even if the stage never settles (script error, very slow chunk load).
const GATE_TIMEOUT_MS = 2000;

/**
 * Inline script for the document head. Mirrors isReturn() and key() below, since it runs before any bundle.
 * Pairs with the `html[data-restoring-scroll]` rule in globals.css.
 */
export const RESTORE_GATE_SCRIPT = `(() => {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav || (nav.type !== "back_forward" && nav.type !== "reload")) return;
    if (!(Number(sessionStorage.getItem(${JSON.stringify(PREFIX)} + location.pathname + location.search)) > 0)) return;
    const root = document.documentElement;
    root.setAttribute("${GATE_ATTR}", "");
    setTimeout(() => root.removeAttribute("${GATE_ATTR}"), ${GATE_TIMEOUT_MS});
  } catch {}
})();`;

let settled = false;

const key = () => `${PREFIX}${window.location.pathname}${window.location.search}`;

// Storage can throw (private mode, blocked site data). Restoring scroll is a convenience, so failures are ignored.
function read(k: string): string | null {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function write(k: string, value: string) {
  try {
    sessionStorage.setItem(k, value);
  } catch {}
}

/** True when this load is the reader returning (back/forward or reload) rather than arriving fresh. */
function isReturn(): boolean {
  const [nav] = (performance.getEntriesByType?.("navigation") ?? []) as PerformanceNavigationTiming[];
  return nav?.type === "back_forward" || nav?.type === "reload";
}

/**
 * Takes scroll restoration from the browser and saves the position when the reader leaves. A page restored
 * from the back/forward cache skips every mount effect, and with restoration manual Safari does not put the
 * scroll back itself, so pageshow does. Returns cleanup.
 */
export function rememberScroll(): () => void {
  window.history.scrollRestoration = "manual";
  const save = () => write(key(), String(window.scrollY));
  const restoreFromCache = (e: PageTransitionEvent) => {
    if (!e.persisted) return;
    const y = Number(read(key()));
    if (y > 0) window.scrollTo({ top: y, left: 0, behavior: "instant" });
  };
  window.addEventListener("pagehide", save);
  window.addEventListener("pageshow", restoreFromCache);
  return () => {
    window.removeEventListener("pagehide", save);
    window.removeEventListener("pageshow", restoreFromCache);
  };
}

/** The position to put a returning reader back at, until the page settles. Otherwise null. */
export function pendingScrollTop(): number | null {
  if (settled || !isReturn()) return null;
  const y = Number(read(key()));
  return y > 0 ? y : null;
}

/**
 * Called once the final tree has mounted, so later remounts start from the hash rules again. Shows the page
 * one frame later: FlyStage's first camera frame is already queued, so the reveal paints the restored view.
 */
export function settleScroll() {
  settled = true;
  requestAnimationFrame(() => document.documentElement.removeAttribute(GATE_ATTR));
}

/** Test hook: forget that the page settled. */
export function resetScrollMemory() {
  settled = false;
}
