/**
 * Mode resolution for the home page. Decided before the fly-through bundle
 * is requested. One flat tree serves "reduced", "classic" and "downgraded".
 */
export type ViewMode = "interactive" | "reduced" | "classic" | "downgraded";

export type ModeInput = {
  /** location.search, e.g. "?view=classic". */
  search: string;
  /** prefers-reduced-motion: reduce matched. */
  reducedMotion: boolean;
  /** Frame monitor reported sustained poor frame rate. */
  downgraded: boolean;
};

export function resolveMode({ search, reducedMotion, downgraded }: ModeInput): ViewMode {
  // Reduced motion wins: those users must never get motion, even via a link.
  if (reducedMotion) return "reduced";
  if (new URLSearchParams(search).get("view") === "classic") return "classic";
  if (downgraded) return "downgraded";
  return "interactive";
}

export const isFlat = (mode: ViewMode) => mode !== "interactive";

export const perfDebugEnabled = (search: string) => new URLSearchParams(search).get("debug") === "perf";
