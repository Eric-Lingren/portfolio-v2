import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlatStack } from "./FlatStack";
import { FlyStage } from "./FlyStage";
import { RESTORE_GATE_SCRIPT, pendingScrollTop, rememberScroll, resetScrollMemory, settleScroll } from "./scroll-memory";

const arriveBy = (type: NavigationTimingType) =>
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ type } as PerformanceNavigationTiming]);

// Leave the home page at `y`, the way a click on a work card does.
function leaveAt(y: number) {
  const stop = rememberScroll();
  const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(y);
  window.dispatchEvent(new Event("pagehide"));
  stop();
  scrollY.mockRestore();
}

beforeEach(() => {
  window.history.replaceState({}, "", "/#work");
  window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList) as unknown as typeof window.matchMedia;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  resetScrollMemory();
  window.history.scrollRestoration = "auto";
  window.history.replaceState({}, "", "/");
});

describe("restore gate", () => {
  const runGate = () => new Function(RESTORE_GATE_SCRIPT)();
  const gated = () => document.documentElement.hasAttribute("data-restoring-scroll");
  afterEach(() => document.documentElement.removeAttribute("data-restoring-scroll"));

  it("hides the page before first paint for a returning reader with a saved position", () => {
    leaveAt(1910);
    arriveBy("back_forward");
    runGate();
    expect(gated()).toBe(true);
  });

  it("leaves a fresh visit, or a return with nothing saved, alone", () => {
    leaveAt(1910);
    arriveBy("navigate");
    runGate();
    expect(gated()).toBe(false);
    sessionStorage.clear();
    arriveBy("back_forward");
    runGate();
    expect(gated()).toBe(false);
  });

  it("hides with opacity on body, which no descendant can override (visibility can be)", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/html\[data-restoring-scroll\] body\s*{\s*opacity: 0;\s*}/);
  });

  it("shows the page a frame after the scroll settles", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => frames.push(cb));
    document.documentElement.setAttribute("data-restoring-scroll", "");
    settleScroll();
    expect(gated()).toBe(true);
    frames.forEach((cb) => cb(0));
    expect(gated()).toBe(false);
  });
});

describe("scroll memory", () => {
  it("takes restoration from the browser and saves the position per URL on pagehide", () => {
    leaveAt(1910);
    expect(window.history.scrollRestoration).toBe("manual");
    arriveBy("back_forward");
    expect(pendingScrollTop()).toBe(1910);
    window.history.replaceState({}, "", "/?view=classic#work");
    expect(pendingScrollTop()).toBeNull();
  });

  it("puts the scroll back when the page returns from the back/forward cache", () => {
    const stop = rememberScroll();
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(1910);
    window.dispatchEvent(new Event("pagehide"));
    scrollY.mockReturnValue(0);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: false }));
    expect(scrollTo).not.toHaveBeenCalled();
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 1910, left: 0, behavior: "instant" });
    stop();
  });

  it("restores on back/forward and reload, not on a fresh visit", () => {
    leaveAt(1910);
    arriveBy("navigate");
    expect(pendingScrollTop()).toBeNull();
    arriveBy("reload");
    expect(pendingScrollTop()).toBe(1910);
  });

  it("stops restoring once the page settles, so a later remount uses the hash rules", () => {
    leaveAt(1910);
    arriveBy("back_forward");
    settleScroll();
    expect(pendingScrollTop()).toBeNull();
  });

  it("FlatStack restores the saved position instead of jumping to the hash", () => {
    leaveAt(1910);
    arriveBy("back_forward");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<FlatStack />);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1910, left: 0, behavior: "instant" });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("FlyStage starts the camera at the saved position instead of the hash panel's stop", () => {
    leaveAt(2000);
    arriveBy("back_forward");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<FlyStage />);
    expect(scrollTo).toHaveBeenCalledWith({ top: 2000, left: 0, behavior: "instant" });
  });
});
