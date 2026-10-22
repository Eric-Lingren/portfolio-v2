import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FLY_CONFIG } from "./config";
import { attachPanelSnap, crossedStop, flyDuration, flyProgress, idleSnapTarget, isFreshSwipe, lockHolds } from "./snap";

const STOPS = [0, 1000, 2000, 3000];
const CFG = FLY_CONFIG.snap;

describe("crossedStop", () => {
  it("finds the first stop reached or passed in the direction of travel", () => {
    expect(crossedStop(10, 990, STOPS)).toBe(-1);
    expect(crossedStop(900, 1000, STOPS)).toBe(1);
    expect(crossedStop(900, 2500, STOPS)).toBe(1);
    expect(crossedStop(2500, 900, STOPS)).toBe(2);
    expect(crossedStop(1100, 1000, STOPS)).toBe(1);
  });

  it("does not count leaving a stop", () => {
    expect(crossedStop(1000, 1050, STOPS)).toBe(-1);
    expect(crossedStop(1000, 950, STOPS)).toBe(-1);
    expect(crossedStop(1000, 1000, STOPS)).toBe(-1);
  });
});

describe("idleSnapTarget", () => {
  it("eases onto the nearer stop when resting close to it, either direction", () => {
    expect(idleSnapTarget(1150, STOPS, 0.2)).toBe(1);
    expect(idleSnapTarget(1850, STOPS, 0.2)).toBe(2);
    expect(idleSnapTarget(1020, STOPS, 0.2)).toBe(1);
  });

  it("leaves a scroll resting mid-gap where it is", () => {
    expect(idleSnapTarget(1500, STOPS, 0.2)).toBe(-1);
    expect(idleSnapTarget(1300, STOPS, 0.2)).toBe(-1);
    expect(idleSnapTarget(1700, STOPS, 0.2)).toBe(-1);
  });

  it("returns -1 on a stop or outside the stops (footer)", () => {
    expect(idleSnapTarget(2000, STOPS, 0.2)).toBe(-1);
    expect(idleSnapTarget(3400, STOPS, 0.2)).toBe(-1);
  });

  it("ships a pull radius well short of half a gap", () => {
    expect(CFG.pullRadius).toBeGreaterThan(0);
    expect(CFG.pullRadius).toBeLessThanOrEqual(0.25);
  });
});

describe("lockHolds", () => {
  it("holds for the minimum time regardless of input", () => {
    const cfg = { ...CFG, holdMs: 200 };
    expect(lockHolds(0, -Infinity, 199, cfg)).toBe(true);
  });

  it("keeps holding while input continues, then releases once quiet", () => {
    const t = CFG.holdMs + 50;
    expect(lockHolds(0, t - 10, t, CFG)).toBe(true);
    expect(lockHolds(0, t - CFG.quietMs, t, CFG)).toBe(false);
  });

  it("never holds past the cap", () => {
    expect(lockHolds(0, CFG.maxHoldMs, CFG.maxHoldMs, CFG)).toBe(false);
  });

  it("releases on a fresh swipe once the minimum hold is over", () => {
    const cfg = { ...CFG, holdMs: 200 };
    expect(lockHolds(0, 205, 210, cfg, true)).toBe(false);
    expect(lockHolds(0, 180, 190, cfg, true)).toBe(true);
  });

  it("ships a short but perceptible hold, between the felt extremes (300ms slightly loose, 700ms too stiff)", () => {
    expect(CFG.holdMs).toBeGreaterThan(300);
    expect(CFG.holdMs).toBeLessThan(700);
    expect(lockHolds(0, CFG.holdMs, CFG.holdMs + 1, CFG, true)).toBe(false);
  });

  it("swallows even a fresh swipe inside the hold", () => {
    expect(lockHolds(0, 50, 60, CFG, true)).toBe(true);
  });
});

describe("isFreshSwipe", () => {
  it("treats a rising wheel delta as a new swipe", () => {
    expect(isFreshSwipe(6, 20, CFG)).toBe(true);
  });

  it("treats decaying or flat deltas as momentum", () => {
    expect(isFreshSwipe(40, 36, CFG)).toBe(false);
    expect(isFreshSwipe(100, 100, CFG)).toBe(false);
    expect(isFreshSwipe(2, 3, CFG)).toBe(false); // too small to be intent
    expect(isFreshSwipe(0, 50, CFG)).toBe(false);
  });
});

describe("flyProgress", () => {
  /** Progress sampled every ms across the whole flight. */
  const samples = (steps: number) => {
    const total = flyDuration(steps, CFG);
    return Array.from({ length: Math.ceil(total) + 2 }, (_, t) => flyProgress(t, steps, CFG));
  };

  it("starts at 0, ends at 1 and never moves backward", () => {
    for (const steps of [0.4, 1, 3, 6, -2]) {
      const p = samples(steps);
      expect(p[0]).toBe(0);
      expect(p.at(-1)).toBe(1);
      p.slice(1).forEach((x, i) => expect(x).toBeGreaterThanOrEqual(p[i] - 1e-12));
    }
  });

  it("never flies faster than the cruise speed, however far it goes", () => {
    for (const steps of [1, 3, 6]) {
      const p = samples(steps);
      const peak = Math.max(...p.slice(1).map((x, i) => (x - p[i]) * steps));
      expect(peak).toBeLessThanOrEqual((CFG.navCruisePerSec / 1000) * 1.0001);
    }
  });

  it("eases off the mark and into the stop", () => {
    const total = flyDuration(6, CFG);
    expect(flyProgress(CFG.navRampMs * 0.2, 6, CFG)).toBeLessThan(0.005);
    expect(flyProgress(total - CFG.navRampMs * 0.2, 6, CFG)).toBeGreaterThan(0.995);
  });

  it("is continuous where the ramps meet the cruise", () => {
    const steps = 6;
    const cruiseEnd = flyDuration(steps, CFG) - CFG.navRampMs;
    for (const t of [CFG.navRampMs, cruiseEnd]) {
      expect(Math.abs(flyProgress(t + 1e-6, steps, CFG) - flyProgress(t - 1e-6, steps, CFG))).toBeLessThan(1e-6);
    }
  });
});

describe("flyDuration", () => {
  it("grows with the number of panel gaps travelled, either direction", () => {
    expect(flyDuration(3, CFG)).toBeGreaterThan(flyDuration(1, CFG));
    expect(flyDuration(-2, CFG)).toBe(flyDuration(2, CFG));
  });

  it("is just the two ramps for a hop too short to reach cruise speed", () => {
    expect(flyDuration(0.3, CFG)).toBe(2 * CFG.navRampMs);
  });

  it("takes well over a second for even a single panel", () => {
    expect(flyDuration(1, CFG)).toBeGreaterThanOrEqual(1200);
  });
});

/** Minimal window: scrollTo moves scrollY and fires scroll synchronously. */
function fakeWindow() {
  const handlers: Record<string, ((e: Event) => void)[]> = {};
  const win = {
    scrollY: 0,
    addEventListener: (t: string, h: (e: Event) => void) => (handlers[t] ??= []).push(h),
    removeEventListener: (t: string, h: (e: Event) => void) => {
      handlers[t] = (handlers[t] ?? []).filter((x) => x !== h);
    },
    scrollTo: vi.fn((o: ScrollToOptions) => win.moveTo(o.top ?? 0)),
    moveTo(y: number) {
      win.scrollY = y;
      (handlers.scroll ?? []).forEach((h) => h(new Event("scroll")));
    },
    wheel(deltaY = 40) {
      const e = Object.assign(new Event("wheel", { cancelable: true }), { deltaY });
      (handlers.wheel ?? []).forEach((h) => h(e));
      return e;
    },
    touch() {
      (handlers.touchstart ?? []).forEach((h) => h(new Event("touchstart")));
    },
    count: (t: string) => (handlers[t] ?? []).length,
  };
  return win;
}

describe("attachPanelSnap", () => {
  let t = 0;
  const now = () => t;
  beforeEach(() => {
    vi.useFakeTimers();
    t = 0;
  });
  afterEach(() => vi.useRealTimers());

  let frames: (FrameRequestCallback | null)[] = [];
  const raf = (cb: FrameRequestCallback) => frames.push(cb);
  const caf = (id: number) => {
    frames[id - 1] = null;
  };
  /** Advance the clock by `ms` and run the frames queued so far. */
  const frame = (ms = 16) => {
    t += ms;
    const queued = frames;
    frames = [];
    queued.forEach((cb) => cb?.(t));
  };
  /** Run frames until no flight is pending. */
  const flyToEnd = () => {
    for (let i = 0; i < 1000 && frames.some(Boolean); i++) frame();
  };

  const setup = (smooth = true) => {
    frames = [];
    const win = fakeWindow();
    const snap = attachPanelSnap(win as unknown as Window, () => STOPS, CFG, { smooth, now, raf, caf });
    return { win, snap };
  };

  it("clamps a user fling to the first stop it crosses and swallows input while locked", () => {
    const { win } = setup();
    win.wheel(60);
    win.moveTo(1400);
    expect(win.scrollY).toBe(1000);
    t += 16;
    expect(win.wheel(50).defaultPrevented).toBe(true); // decaying momentum
    win.moveTo(1300); // momentum the browser applied anyway
    expect(win.scrollY).toBe(1000);
  });

  it("scrolling back the other way releases once the hold is over", () => {
    const { win } = setup();
    win.wheel(60);
    win.moveTo(1400);
    t += 16;
    expect(win.wheel(-20).defaultPrevented).toBe(true);
    t = CFG.holdMs + 1;
    expect(win.wheel(-20).defaultPrevented).toBe(false);
  });

  it("a new touch releases the lock", () => {
    const { win } = setup();
    win.wheel(60);
    win.moveTo(1400);
    t = CFG.holdMs + 1;
    win.touch();
    t += 16;
    expect(win.wheel(30).defaultPrevented).toBe(false);
  });

  it("releases after the hold once input goes quiet", () => {
    const { win } = setup();
    win.wheel();
    win.moveTo(1400);
    t += CFG.holdMs + CFG.quietMs + 1;
    expect(win.wheel().defaultPrevented).toBe(false);
    win.moveTo(1200);
    expect(win.scrollY).toBe(1200);
  });

  it("a fresh swipe after the minimum hold unlocks immediately", () => {
    const { win } = setup();
    win.wheel(60);
    win.moveTo(1400);
    t += 30;
    expect(win.wheel(30).defaultPrevented).toBe(true); // momentum decaying
    t += 16;
    expect(win.wheel(80).defaultPrevented).toBe(true); // inside the hold: swallowed
    for (let k = 0; t < CFG.holdMs; k++) {
      t += 16;
      win.wheel(30 * Math.pow(0.9, k)); // momentum decaying through the hold
    }
    t += 16;
    expect(win.wheel(80).defaultPrevented).toBe(false); // new swipe, input never went quiet
    win.moveTo(1150);
    expect(win.scrollY).toBe(1150);
  });

  it("absorbs a realistic trackpad fling (16ms events, decaying deltas) on the panel it reaches", () => {
    const { win } = setup();
    let d = 120;
    let y = 0;
    for (let k = 0; k < 90; k++, t += 16, d *= 0.94) {
      const e = win.wheel(Math.max(1, d));
      if (!e.defaultPrevented) win.moveTo((y = win.scrollY + d));
    }
    expect(y).toBeGreaterThan(1000);
    // At most a sliver of the faint tail leaks past the cap, and the idle snap settles it back.
    expect(win.scrollY - 1000).toBeLessThan(1000 * CFG.pullRadius);
    vi.advanceTimersByTime(CFG.idleMs);
    expect(win.scrollY).toBe(1000);
  });

  it("a tiny nudge eases back to its stop without locking again", () => {
    const { win } = setup();
    win.moveTo(1000);
    win.wheel();
    win.moveTo(1020);
    vi.advanceTimersByTime(CFG.idleMs);
    expect(win.scrollY).toBe(1000);
    t += 20;
    expect(win.wheel().defaultPrevented).toBe(false);
  });

  it("eases an idle user scroll that rests near the next stop onto it", () => {
    const { win } = setup();
    win.wheel();
    win.moveTo(900);
    vi.advanceTimersByTime(CFG.idleMs);
    expect(win.scrollTo).toHaveBeenLastCalledWith({ top: 1000, behavior: "smooth" });
  });

  it("leaves an idle user scroll resting mid-gap alone", () => {
    const { win } = setup();
    win.wheel();
    win.moveTo(500);
    vi.advanceTimersByTime(CFG.idleMs * 3);
    expect(win.scrollTo).not.toHaveBeenCalled();
    expect(win.scrollY).toBe(500);
  });

  it("ignores programmatic scrolling with no user input", () => {
    const { win } = setup();
    win.moveTo(2500);
    expect(win.scrollY).toBe(2500);
    vi.advanceTimersByTime(CFG.idleMs * 3);
    expect(win.scrollTo).not.toHaveBeenCalled();
  });

  it("anchor navigation passes intermediate stops and locks on arrival", () => {
    const { win, snap } = setup();
    win.wheel();
    snap.navigateTo(3000);
    flyToEnd();
    expect(win.scrollY).toBe(3000);
    t += 16;
    expect(win.wheel(30).defaultPrevented).toBe(true);
  });

  it("anchor navigation eases over the full flight duration instead of jumping", () => {
    const { win, snap } = setup();
    snap.navigateTo(3000);
    expect(win.scrollY).toBe(0);
    const start = t;
    const ys: number[] = [];
    while (frames.some(Boolean)) {
      frame();
      ys.push(win.scrollY);
    }
    expect(t - start).toBeGreaterThanOrEqual(flyDuration(3, CFG));
    expect(ys.at(-1)).toBe(3000);
    // Monotonic, slow off the mark and slow into the stop.
    ys.slice(1).forEach((y, i) => expect(y).toBeGreaterThanOrEqual(ys[i]));
    expect(ys[0]).toBeLessThan(10);
    expect(3000 - ys.at(-2)!).toBeLessThan(10);
  });

  it("anchor navigation does not snap at the stops it flies through", () => {
    const { win, snap } = setup();
    snap.navigateTo(3000);
    for (let i = 0; i < 80; i++) frame();
    expect(win.scrollY).toBeGreaterThan(1000);
    expect(win.scrollY).toBeLessThan(3000);
    expect(frames.some(Boolean)).toBe(true);
  });

  it("user input mid-flight cancels the fly-through", () => {
    const { win, snap } = setup();
    snap.navigateTo(3000);
    for (let i = 0; i < 30; i++) frame();
    const y = win.scrollY;
    win.wheel(40);
    expect(frames.some(Boolean)).toBe(false);
    flyToEnd();
    expect(win.scrollY).toBe(y);
  });

  it("a new navigation replaces the one in flight", () => {
    const { win, snap } = setup();
    snap.navigateTo(3000);
    for (let i = 0; i < 20; i++) frame();
    snap.navigateTo(1000);
    flyToEnd();
    expect(win.scrollY).toBe(1000);
  });

  it("without smooth motion (reduced motion) anchor navigation jumps straight there", () => {
    const { win, snap } = setup(false);
    snap.navigateTo(3000);
    expect(win.scrollY).toBe(3000);
    expect(win.scrollTo).toHaveBeenLastCalledWith({ top: 3000, behavior: "auto" });
    expect(frames.some(Boolean)).toBe(false);
  });

  it("detach removes every listener and stops a flight", () => {
    const { win, snap } = setup();
    snap.navigateTo(3000);
    snap.detach();
    expect(frames.some(Boolean)).toBe(false);
    for (const type of ["wheel", "touchstart", "touchmove", "keydown", "scroll"]) expect(win.count(type)).toBe(0);
  });
});
