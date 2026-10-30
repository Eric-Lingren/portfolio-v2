"use client";

import { useEffect } from "react";
import { setActiveSection } from "../active-section";
import { RenderModeContext } from "./render-mode";
import { hashPanelIndex, syncHashToActiveSection } from "./hash-target";
import { PANELS } from "./registry";
import { pendingScrollTop } from "./scroll-memory";
import "./flat.css";

/**
 * The single flat tree for reduced motion, ?view=classic and frame-rate
 * downgrade: every panel once, stacked, polished layer only, in "complete"
 * render mode. No stage, no sketch layer, no 3D.
 */
export function FlatStack() {
  // A returning reader goes back to where they were (see scroll-memory.ts). Otherwise a hash naming a
  // panel scrolls that panel into view, instantly.
  useEffect(() => {
    const restored = pendingScrollTop();
    if (restored !== null) {
      window.scrollTo({ top: restored, left: 0, behavior: "instant" });
    } else if (hashPanelIndex(window.location.hash) >= 0) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, []);

  // The section crossing the middle of the viewport is the active one, and the URL hash follows it.
  useEffect(() => syncHashToActiveSection(), []);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveSection(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const p of PANELS) {
      const el = document.getElementById(p.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

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
