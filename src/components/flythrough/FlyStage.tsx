"use client";

import { useEffect, useRef } from "react";
import { clamp01, layoutFor, lerpFactor, panelStyle, scrollProgress, worldTransform, type Layout } from "./camera";
import { FLY_CONFIG } from "./config";
import { attachLookAround, type LookPoint } from "./look";
import { PANELS } from "./registry";
import { StageContext } from "./stage-context";
import { applyWipe, builtAmount, findWipe, panelDistance, type WipeTargets } from "./wipe";

const COUNT = PANELS.length;

/**
 * Fixed 3D stage. Motion is a pure function of scroll position: the rAF loop
 * only eases the camera toward the scroll target and writes transforms.
 * No layout is read on scroll or resize (innerWidth/innerHeight/scrollY only).
 */
export function FlyStage() {
  const worldRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    const wipes: (WipeTargets | null)[] = panelRefs.current.map((el) => (el ? findWipe(el) : null));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let layout: Layout = layoutFor(window.innerWidth);
    let width = window.innerWidth;
    let lvh = window.innerHeight;
    let target = scrollProgress(window.scrollY, lvh);
    let current = target;
    let look: LookPoint = { x: 0, y: 0 };
    let lookTarget: LookPoint = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;

    const render = () => {
      world.style.transform = worldTransform(current, COUNT, layout, look);
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = panelStyle(i, current, COUNT, layout);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.visibility = s.opacity < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = s.opacity > 0.9 ? "auto" : "none";
        const w = wipes[i];
        if (w) applyWipe(w, builtAmount(panelDistance(i, current, COUNT)));
      });
    };

    const tick = (now: number) => {
      raf = 0;
      const k = reduced ? 1 : lerpFactor(Math.min(64, now - last || 16));
      last = now;
      current += (target - current) * k;
      look = {
        x: look.x + (lookTarget.x - look.x) * k,
        y: look.y + (lookTarget.y - look.y) * k,
      };
      const settled =
        Math.abs(target - current) < 1e-4 &&
        Math.abs(lookTarget.x - look.x) < 1e-3 &&
        Math.abs(lookTarget.y - look.y) < 1e-3;
      if (settled) current = target;
      render();
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      lvh = Math.max(lvh, window.innerHeight);
      target = scrollProgress(window.scrollY, lvh);
      wake();
    };
    const onResize = () => {
      // Width only: Safari address-bar resizes change height and must not re-layout.
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      layout = layoutFor(width);
      wake();
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const i = PANELS.findIndex((p) => p.id === id);
      if (i < 0) return;
      e.preventDefault();
      window.scrollTo({
        top: clamp01(i / (COUNT - 1)) * ((FLY_CONFIG.scrollLvh - 100) / 100) * lvh,
        behavior: reduced ? "auto" : "smooth",
      });
    };

    const detachLook = attachLookAround(window, (p) => {
      lookTarget = p;
      wake();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("click", onClick);
    render();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      detachLook();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div className="fly-stage" data-testid="fly-stage" style={{ perspective: `${FLY_CONFIG.perspective}px` }}>
        <div className="fly-world" ref={worldRef}>
          <StageContext.Provider value={true}>
            {PANELS.map((p, i) => (
              <div
                key={p.id}
                className="fly-panel"
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                {p.render(-i * FLY_CONFIG.depth)}
              </div>
            ))}
          </StageContext.Provider>
        </div>
      </div>
      <div className="fly-spacer" aria-hidden="true" style={{ height: `${FLY_CONFIG.scrollLvh}lvh` }} />
    </>
  );
}
