"use client";

import { useEffect, useRef } from "react";
import { setActiveSection } from "../active-section";
import {
  clamp01,
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
import { initialScrollTop, syncHashToActiveSection, writeSectionHash } from "./hash-target";
import { PANELS } from "./registry";
import { pendingScrollTop } from "./scroll-memory";
import { divePull } from "./dive";
import { attachPanelSnap } from "./snap";
import { StageContext } from "./stage-context";
import { applyWipe, builtAmount, findWipe, nextBuilt, panelDistance, type WipeTargets } from "./wipe";

const COUNT = PANELS.length;

/**
 * Fixed 3D stage. Motion is a pure function of scroll position, plus the
 * pull-back of an anchor flight: the rAF loop only eases the camera toward
 * its targets and writes transforms.
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
    // A returning reader starts where they left (see scroll-memory.ts). Otherwise a hash naming a panel
    // starts the camera on that panel's stop. Instant: first paint stays static.
    const startTop = pendingScrollTop() ?? initialScrollTop(window.location.hash, COUNT, lvh);
    if (startTop > 0) window.scrollTo({ top: startTop, left: 0, behavior: "instant" });
    let target = scrollProgress(window.scrollY, lvh);
    let current = target;
    let pullTarget = 0;
    let pull = 0;
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
    // Panel an anchor flight is heading for, null outside a flight. Otherwise the panel nearest the scroll target.
    let flightDest: number | null = null;
    const built = PANELS.map((_, i) => builtAmount(panelDistance(i, current, COUNT)));
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
      world.style.transform = worldTransform(current, COUNT, layout, look, pull);
      const near = Math.round(clamp01(target) * (COUNT - 1));
      if (flightDest === near) flightDest = null;
      const dest = flightDest ?? near;
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = panelStyle(i, current, COUNT, layout, pull);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.visibility = s.opacity < 0.01 ? "hidden" : "visible";
        // Only the panel the camera is nearest takes the pointer, so hover never lands on one further down the tunnel.
        const nearest = Math.abs(stepsAhead(i, current, COUNT)) < 0.5;
        if (nearest) setActiveSection(PANELS[i].id);
        el.style.pointerEvents = nearest && s.opacity > 0.9 ? "auto" : "none";
        const w = wipes[i];
        built[i] = nextBuilt(built[i], panelDistance(i, current, COUNT), i === dest);
        if (w) applyWipe(w, built[i]);
      });
    };

    const tick = (now: number) => {
      raf = 0;
      const k = reduced ? 1 : lerpFactor(Math.min(64, now - last || 16));
      last = now;
      current += (target - current) * k;
      pull += (pullTarget - pull) * k;
      look = {
        x: look.x + (lookTarget.x - look.x) * k,
        y: look.y + (lookTarget.y - look.y) * k,
      };
      const settled =
        Math.abs(target - current) < 1e-4 &&
        Math.abs(pullTarget - pull) < 1e-3 &&
        Math.abs(lookTarget.x - look.x) < 1e-3 &&
        Math.abs(lookTarget.y - look.y) < 1e-3;
      if (settled) {
        current = target;
        pull = pullTarget;
      }
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
    // Pull-back rides the anchor flight's clock; a cancelled flight eases back in through the lerp.
    const onFlight = (u: number | null) => {
      pullTarget = u === null ? 0 : divePull(u);
      if (u === null || u >= 1) flightDest = null;
      wake();
    };
    const snap = attachPanelSnap(
      window,
      () => PANELS.map((_, i) => panelScrollTop(i, COUNT, lvh)),
      FLY_CONFIG.snap,
      { smooth: !reduced, onFlight },
    );
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const i = PANELS.findIndex((p) => p.id === id);
      if (i < 0) return;
      e.preventDefault();
      // preventDefault skips the browser's hash update. Write the destination now, before the flight lands.
      writeSectionHash(PANELS[i].id);
      snap.navigateTo(panelScrollTop(i, COUNT, lvh));
      // After navigateTo: it cancels any running flight, which clears the old destination.
      flightDest = i;
    };

    const detachLook = attachLookAround(window, (p) => {
      lookTarget = p;
      wake();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("click", onClick);
    const unsyncHash = syncHashToActiveSection();
    render();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      fitObserver?.disconnect();
      snap.detach();
      detachLook();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
      unsyncHash();
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
