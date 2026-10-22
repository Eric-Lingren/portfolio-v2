import type { CSSProperties } from "react";
import type { Pillar } from "@/content/positioning";

/** Bar heights as a share of the chart; the last one reaches the target line. */
const CHART_BARS = [0.3, 0.42, 0.5, 0.62, 0.7, 0.82];
/** One ticket, one owner, carried across every column to done. */
const BOARD_COLUMNS = ["open", "doing", "done"] as const;
const GRID_CELLS = 12;

/**
 * Decorative picture at the top of a pillar card. Markup only: motion lives in
 * what-i-do.css, runs on the polished layer, and animates transform/opacity only.
 */
export function PillarViz({ kind }: { kind: Pillar["viz"] }) {
  return (
    <div className={`viz viz--${kind}`} aria-hidden="true">
      {kind === "target" && (
        <div className="viz-chart">
          <span className="viz-target" />
          {CHART_BARS.map((h, i) => (
            <span className="viz-bar" key={i} style={{ "--h": h, "--i": i } as CSSProperties} />
          ))}
        </div>
      )}
      {kind === "board" && (
        <div className="viz-board">
          {BOARD_COLUMNS.map((label) => (
            <span className="viz-col" key={label}>
              <span className="viz-col-label">{label}</span>
              <span className="viz-ghost" />
            </span>
          ))}
          <span className="viz-ticket-track">
            <span className="viz-ticket">
              <span className="viz-owner" />
              <span className="viz-ticket-lines" />
              <span className="viz-check" />
            </span>
          </span>
        </div>
      )}
      {kind === "grid" && (
        <div className="viz-grid">
          {Array.from({ length: GRID_CELLS }, (_, i) => (
            <span className="viz-cell" key={i} />
          ))}
          <span className="viz-paste" />
          <span className="viz-cursor" />
        </div>
      )}
    </div>
  );
}
