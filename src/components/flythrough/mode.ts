/**
 * Mode resolution for the home page. Decided before the fly-through bundle
 * is requested. One flat tree serves "reduced", "classic" and "downgraded".
 */

/** Phones, portrait or landscape. They get Classic: the fly-through is a desktop experience. */
export const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-height: 500px)";
export type ViewMode = "interactive" | "reduced" | "classic" | "downgraded";

export type ModeInput = {
  /** location.search, e.g. "?view=classic". */
  search: string;
  /** prefers-reduced-motion: reduce matched. */
  reducedMotion: boolean;
  /** Frame monitor reported sustained poor frame rate. */
  downgraded: boolean;
  /** MOBILE_QUERY matched. */
  mobile: boolean;
};

export function resolveMode({ search, reducedMotion, downgraded, mobile }: ModeInput): ViewMode {
  // Reduced motion wins: those users must never get motion, even via a link.
  if (reducedMotion) return "reduced";
  if (mobile || new URLSearchParams(search).get("view") === "classic") return "classic";
  if (downgraded) return "downgraded";
  return "interactive";
}

export const isFlat = (mode: ViewMode) => mode !== "interactive";

export const perfDebugEnabled = (search: string) => new URLSearchParams(search).get("debug") === "perf";
