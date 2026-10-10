"use client";

import { RenderModeContext } from "./render-mode";
import { PANELS } from "./registry";
import "./flat.css";

/**
 * The single flat tree for reduced motion, ?view=classic and frame-rate
 * downgrade: every panel once, stacked, polished layer only, in "complete"
 * render mode. No stage, no sketch layer, no 3D.
 */
export function FlatStack() {
  return (
    <RenderModeContext.Provider value="complete">
      <div className="stack stack--flat" data-testid="flat-stack">
        {PANELS.map((p) => (
          <div key={p.id}>{p.render(0)}</div>
        ))}
      </div>
    </RenderModeContext.Provider>
  );
}
