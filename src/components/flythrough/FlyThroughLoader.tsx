"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";

/**
 * Renders the flat, server-rendered stack first. After first paint it
 * dynamically imports the fly-through stage and swaps it in, so the flat
 * content (all panel titles) is in the initial HTML and the stage code is not
 * part of the initial bundle.
 */
export function FlyThroughLoader({ children }: { children: ReactNode }) {
  const [Stage, setStage] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Two frames: the first runs before paint, the second after it.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        import("./FlyStage").then((m) => {
          if (!cancelled) setStage(() => m.FlyStage);
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return Stage ? <Stage /> : <>{children}</>;
}
