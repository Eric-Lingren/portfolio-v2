import { CALLOUTS, type Callout } from "@/content/callouts";
import { FLY_CONFIG } from "./config";

/** Horizontal distance (px) of a note from the flight path. */
export const CALLOUT_X = 380;
/** Upper bound for any annotation box (px). Guards against large planes. */
export const CALLOUT_MAX = { width: 240, height: 48 } as const;

/** World position of a callout: halfway between the two panels of its gap. */
export function calloutPosition(c: Callout) {
  return { x: c.side * CALLOUT_X, y: c.y, z: -(c.gap + 0.5) * FLY_CONFIG.depth };
}

/** True when the gap sits between two real panels. */
export const isValidGap = (gap: number, panelCount: number) =>
  Number.isInteger(gap) && gap >= 0 && gap <= panelCount - 2;

/**
 * Decorative world annotations. Static transforms (no per-frame work), absolutely
 * positioned inside the world so they never affect layout.
 */
export function Callouts({ items = CALLOUTS }: { items?: readonly Callout[] }) {
  return (
    <div className="fly-callouts" aria-hidden="true" data-testid="callouts">
      {items.map((c) => {
        const p = calloutPosition(c);
        return (
          <span
            key={`${c.gap}-${c.text}`}
            className="fly-callout"
            style={{
              transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotate(${c.tilt}deg)`,
              maxWidth: CALLOUT_MAX.width,
            }}
          >
            {c.text}
          </span>
        );
      })}
    </div>
  );
}
