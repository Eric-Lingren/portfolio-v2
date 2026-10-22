"use client";

import { useEffect, useRef } from "react";
import { setActiveSection } from "../active-section";
import {
  contentFit,
  fitScale,
  footerLift,
  layoutFor,
  lerpFactor,
  panelHeight,
  panelScrollTop,
  panelStyle,
  scrollProgress,
  stepsAhead,
  worldTransform,
  type Layout,
} from "./camera";
import { FLY_CONFIG } from "./config";
import { attachLookAround, type LookPoint } from "./look";
import { PANELS } from "./registry";
import { attachPanelSnap } from "./snap";
import { StageContext } from "./stage-context";
import { applyWipe, builtAmount, findWipe, panelDistance, type WipeTargets } from "./wipe";

const COUNT = PANELS.length;

/**
 * Fixed 3D stage. Motion is a pure function of scroll position: the rAF loop
 * only eases the camera toward the scroll target and writes transforms.
 * No layout is read on scroll or resize (innerWidth/innerHeight/scrollY only);
 * panel content heights for the content fit arrive through a ResizeObserver.
 */
export function FlyStage() {
  const stageRef = useRef<HTMLDivElement>(null);
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
    // Natural content height and available body height (layer content box) per panel.
    const bodyHeights: number[] = PANELS.map(() => 0);
    const roomHeights: number[] = PANELS.map(() => 0);
    let fitHeight = window.innerHeight;
    let navHeight: number = FLY_CONFIG.navClearance;
    const nav = document.querySelector(".site-nav");
    // The page footer follows the scroll spacer. The last panel fits above it and the stage lifts as it scrolls in.
    let footerHeight = 0;
    const footer = document.querySelector(".site-footer");
    let lift = 0;
    let look: LookPoint = { x: 0, y: 0 };
    let lookTarget: LookPoint = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let boxHeight = 0;
    const bodies = panelRefs.current.map((el) => el?.querySelector<HTMLElement>("[data-panel-body]") ?? null);

    // The last panel alone shrinks, and only as the footer scrolls in, so it clears the footer.
    const fitLast = () => {
      const el = panelRefs.current[COUNT - 1];
      el?.style.setProperty("--fit", String(fitScale(boxHeight, fitHeight - 2 * lift, navHeight, layout)));
    };
    // Every panel fills the same box below the nav; content taller than its box scales down inside it.
    const applyFit = () => {
      boxHeight = panelHeight(fitHeight, navHeight, layout);
      stageRef.current?.style.setProperty("--nav-clearance", `${navHeight}px`);
      stageRef.current?.style.setProperty("--panel-h", `${boxHeight}px`);
      panelRefs.current.forEach((el, i) => {
        el?.style.setProperty("--content-fit", String(contentFit(bodyHeights[i], roomHeights[i])));
      });
      fitLast();
    };
    const fitObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => {
            for (const e of entries) {
              const size = e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height;
              const body = bodies.indexOf(e.target as HTMLElement);
              const layer = bodies.findIndex((el) => el?.parentElement === e.target);
              if (body >= 0) bodyHeights[body] = size;
              else if (layer >= 0) roomHeights[layer] = e.contentRect.height;
              else if (e.target === nav) navHeight = size;
              else if (e.target === footer) footerHeight = size;
            }
            applyFit();
          });
    bodies.forEach((el) => {
      if (!el) return;
      fitObserver?.observe(el);
      if (el.parentElement) fitObserver?.observe(el.parentElement);
    });
    if (nav) fitObserver?.observe(nav);
    if (footer) fitObserver?.observe(footer);

    const render = () => {
      const nextLift = footerLift(window.scrollY, window.innerHeight, (FLY_CONFIG.scrollLvh / 100) * lvh, footerHeight);
      if (nextLift !== lift && stageRef.current) {
        lift = nextLift;
        stageRef.current.style.transform = lift ? `translate3d(0, ${-lift}px, 0)` : "";
        fitLast();
      }
      world.style.transform = worldTransform(current, COUNT, layout, look);
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = panelStyle(i, current, COUNT, layout);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.visibility = s.opacity < 0.01 ? "hidden" : "visible";
        // Only the panel the camera is nearest takes the pointer, so hover never lands on one further down the tunnel.
        const nearest = Math.abs(stepsAhead(i, current, COUNT)) < 0.5;
        if (nearest) setActiveSection(PANELS[i].id);
        el.style.pointerEvents = nearest && s.opacity > 0.9 ? "auto" : "none";
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
      // Safari address-bar resizes change height by under ~100px and must not re-layout or refit.
      const tall = Math.abs(window.innerHeight - fitHeight) > 150;
      if (window.innerWidth === width && !tall) return;
      fitHeight = window.innerHeight;
      width = window.innerWidth;
      layout = layoutFor(width);
      applyFit();
      wake();
    };
    const snap = attachPanelSnap(
      window,
      () => PANELS.map((_, i) => panelScrollTop(i, COUNT, lvh)),
      FLY_CONFIG.snap,
      { smooth: !reduced },
    );
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const i = PANELS.findIndex((p) => p.id === id);
      if (i < 0) return;
      e.preventDefault();
      snap.navigateTo(panelScrollTop(i, COUNT, lvh));
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
      fitObserver?.disconnect();
      snap.detach();
      detachLook();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div
        ref={stageRef}
        className="fly-stage"
        data-testid="fly-stage"
        style={{
          perspective: `${FLY_CONFIG.perspective}px`,
          ["--nav-clearance" as string]: `${FLY_CONFIG.navClearance}px`,
        }}
      >
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
