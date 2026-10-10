"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { startFrameMonitor } from "./frame-monitor";
import { isFlat, perfDebugEnabled, resolveMode, type ViewMode } from "./mode";
import { PerfOverlay } from "./PerfOverlay";
import { RenderModeContext } from "./render-mode";

/**
 * Renders the flat, server-rendered stack first (children). The mode is
 * resolved before anything is imported: reduced-motion and Classic users
 * never request the fly-through chunk. Otherwise, after first paint, it
 * dynamically imports the stage and swaps it in, and a frame monitor can send
 * the page back to the flat stack if frame rate stays poor.
 */
export function FlyThroughLoader({ children }: { children: ReactNode }) {
  const [Stage, setStage] = useState<ComponentType | null>(null);
  const [mode, setMode] = useState<ViewMode | null>(null);
  const [debug, setDebug] = useState(false);
  const [reading, setReading] = useState<{ fps: number; frameMs: number } | null>(null);

  useEffect(() => {
    const search = window.location.search;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const resolved = resolveMode({ search, reducedMotion, downgraded: false });
    const showPerf = perfDebugEnabled(search);
    let cancelled = false;
    let stopMonitor = () => {};
    // Two frames: the first runs before paint, the second after it.
    const raf = requestAnimationFrame(() => {
      setMode(resolved);
      setDebug(showPerf);
      if (isFlat(resolved)) return; // never download the stage
      requestAnimationFrame(() => {
        import("./FlyStage").then((m) => {
          if (cancelled) return;
          setStage(() => m.FlyStage);
          // Marks where the enhancement replaces the first-paint content; perf:check reads it.
          performance.mark("fly-stage-swap");
          stopMonitor = startFrameMonitor({
            keepAlive: showPerf,
            onReading: showPerf ? setReading : undefined,
            onDowngrade: () => {
              setStage(null);
              setMode(resolveMode({ search, reducedMotion, downgraded: true }));
            },
          });
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopMonitor();
    };
  }, []);

  return (
    <>
      {Stage ? (
        <RenderModeContext.Provider value="staged">
          <Stage />
        </RenderModeContext.Provider>
      ) : (
        children
      )}
      {debug && <PerfOverlay fps={reading?.fps ?? null} frameMs={reading?.frameMs ?? null} mode={mode ?? "pending"} />}
    </>
  );
}
