/**
 * Panel snap-lock. Each panel has a scroll stop (the scrollY that puts the
 * camera exactly on it). User scrolling that reaches or crosses a stop is
 * clamped to it and locked there briefly, so a trackpad fling ends on the
 * panel instead of sailing past it. All input is ignored for a short hold.
 * After it, a fresh swipe (wheel delta rising again), a reversal, a key press
 * or a new touch releases the lock at once, while the decaying momentum of the
 * arriving fling keeps being absorbed.
 *
 * Scrolling that comes to rest close to a stop eases onto it; resting further
 * out stays put. Easing back to the stop just left does not lock again.
 *
 * Only user-driven scrolling (wheel, touch, keys and their momentum) snaps.
 * Programmatic scrollTo calls, anchor navigation and scrollbar drags do not,
 * so camera motion stays a pure function of scroll position.
 *
 * Anchor navigation flies there on its own eased, frame-driven scroll rather
 * than native smooth scrolling, whose browser-chosen duration rushes through
 * several panels. Any user input mid-flight hands control back at once.
 */

export type SnapConfig = {
  /** Minimum time (ms) a reached stop stays locked. */
  holdMs: number;
  /** Lock never lasts longer than this (ms), even under continuous input. */
  maxHoldMs: number;
  /** After the hold, the lock releases once input has been quiet this long (ms). */
  quietMs: number;
  /** A wheel delta this many times the previous one reads as a fresh swipe, not momentum. */
  freshRatio: number;
  /** Smallest wheel delta (px) that can count as a fresh swipe. */
  freshMinDelta: number;
  /** Scroll that rests between stops this long (ms) eases to a stop. */
  idleMs: number;
  /** Resting within this fraction of a gap from a stop eases onto it; further out stays put. */
  pullRadius: number;
  /** Anchor fly-through: time (ms) to ease up to cruise speed, and the same to ease back down. */
  navRampMs: number;
  /** Anchor fly-through cruise speed, in panel gaps per second. Long jumps take longer instead of going faster. */
  navCruisePerSec: number;
};

/** Index of the first stop reached or crossed moving from `from` to `to`, else -1. Leaving a stop does not count. */
export function crossedStop(from: number, to: number, stops: readonly number[]): number {
  if (to > from) {
    for (let i = 0; i < stops.length; i++) if (stops[i] > from && stops[i] <= to) return i;
  } else if (to < from) {
    for (let i = stops.length - 1; i >= 0; i--) if (stops[i] < from && stops[i] >= to) return i;
  }
  return -1;
}

/**
 * Stop an idle scroll position should ease to: the nearer stop when it lies
 * within `radius` (a fraction of the gap) of it. -1 when it already sits on a
 * stop, rests further out, or lies outside the stops (the footer).
 */
export function idleSnapTarget(y: number, stops: readonly number[], radius: number): number {
  for (let k = 0; k < stops.length - 1; k++) {
    const a = stops[k];
    const b = stops[k + 1];
    if (y <= a + 1 || y >= b - 1) continue;
    const f = (y - a) / (b - a);
    if (f <= radius) return k;
    if (f >= 1 - radius) return k + 1;
    return -1;
  }
  return -1;
}

/**
 * Whether a lock that began at `start` still holds at `now`, given the last
 * input time and whether the input arriving now is a fresh swipe.
 */
export function lockHolds(start: number, lastInput: number, now: number, cfg: SnapConfig, fresh = false): boolean {
  const held = now - start;
  if (held >= cfg.maxHoldMs) return false;
  if (held < cfg.holdMs) return true;
  return !fresh && now - lastInput < cfg.quietMs;
}

/** Whether wheel delta `d` after `prev` looks like a new swipe rather than decaying momentum. */
export function isFreshSwipe(prev: number, d: number, cfg: SnapConfig): boolean {
  return prev > 0 && d >= cfg.freshMinDelta && d >= prev * cfg.freshRatio;
}

/**
 * Speed profile of an anchor fly-through covering `steps` panel gaps: a
 * sine-shaped ramp up to cruise speed, a steady cruise, and a matching ramp
 * down. A hop too short to reach cruise speed peaks lower instead.
 */
function flyProfile(steps: number, cfg: SnapConfig) {
  const d = Math.abs(steps);
  const r = cfg.navRampMs;
  const v = Math.min(cfg.navCruisePerSec / 1000, d / r);
  const cruise = v > 0 ? (d - v * r) / v : 0;
  return { d, r, v, cruise, total: 2 * r + cruise };
}

/** Duration (ms) of an anchor fly-through that covers `steps` panel gaps. */
export function flyDuration(steps: number, cfg: SnapConfig): number {
  return flyProfile(steps, cfg).total;
}

/** Fraction (0..1) of the distance an anchor fly-through has covered `elapsed` ms in. */
export function flyProgress(elapsed: number, steps: number, cfg: SnapConfig): number {
  const { d, r, v, cruise, total } = flyProfile(steps, cfg);
  if (d === 0 || elapsed >= total) return 1;
  if (elapsed <= 0) return 0;
  const k = r / (2 * Math.PI);
  let s: number;
  if (elapsed < r) s = v * (elapsed / 2 - k * Math.sin((Math.PI * elapsed) / r));
  else if (elapsed < r + cruise) s = (v * r) / 2 + v * (elapsed - r);
  else {
    const u = elapsed - r - cruise;
    s = (v * r) / 2 + v * cruise + v * (u / 2 + k * Math.sin((Math.PI * u) / r));
  }
  return Math.min(1, s / d);
}

type SnapWindow = Pick<Window, "addEventListener" | "removeEventListener" | "scrollTo" | "scrollY">;

const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"]);
/** Scroll events further apart than this end a user scroll chain (momentum has stopped). */
const CHAIN_GAP_MS = 250;
/** Anchor navigation gives up waiting for arrival this long after the flight should have ended. */
const NAV_TIMEOUT_MS = 2500;

export type PanelSnap = {
  /** Smooth-scroll to a stop without snapping at the stops in between. */
  navigateTo: (top: number) => void;
  detach: () => void;
};

export function attachPanelSnap(
  win: SnapWindow,
  getStops: () => readonly number[],
  cfg: SnapConfig,
  opts: {
    smooth: boolean;
    now?: () => number;
    raf?: (cb: FrameRequestCallback) => number;
    caf?: (id: number) => void;
  },
): PanelSnap {
  const now = opts.now ?? (() => performance.now());
  const raf = opts.raf ?? ((cb: FrameRequestCallback) => requestAnimationFrame(cb));
  const caf = opts.caf ?? ((id: number) => cancelAnimationFrame(id));
  const behavior: ScrollBehavior = opts.smooth ? "smooth" : "auto";
  let prevY = win.scrollY;
  let dir = 0;
  let lastInput = -Infinity;
  let lastScroll = -Infinity;
  let userChain = false;
  let lastDelta = 0;
  let lock = -1;
  let lockStart = 0;
  /** Stop an idle nudge is easing back to; arriving there does not lock. */
  let returnTo = -1;
  let nav: { top: number; until: number } | null = null;
  let idle: ReturnType<typeof setTimeout> | undefined;
  /** Pending frame of an anchor fly-through, 0 when none is running. */
  let fly = 0;
  const stopFly = () => {
    if (fly) caf(fly);
    fly = 0;
  };

  const locked = () => {
    if (lock >= 0 && !lockHolds(lockStart, lastInput, now(), cfg)) lock = -1;
    return lock >= 0;
  };
  const engage = (i: number) => {
    lock = i;
    lockStart = now();
  };
  const jump = (top: number) => win.scrollTo({ top, behavior: "instant" as ScrollBehavior });

  const onInput = (e: Event) => {
    if (e.type === "keydown") {
      const t = e.target as HTMLElement | null;
      // Keys typed into a control (Space on a button, arrows in a field) are not page scrolls.
      if (!SCROLL_KEYS.has((e as KeyboardEvent).key) || t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t?.tagName ?? "")) return;
    }
    const t = now();
    // Keys, a new finger and any reversal are deliberate; only same-direction, decaying wheel input is momentum.
    let fresh = e.type === "keydown" || e.type === "touchstart";
    if (e.type === "wheel") {
      const dy = (e as WheelEvent).deltaY;
      const d = Math.abs(dy);
      fresh = isFreshSwipe(lastDelta, d, cfg) || (dy !== 0 && Math.sign(dy) !== dir);
      lastDelta = d;
    }
    if (lock >= 0 && !lockHolds(lockStart, lastInput, t, cfg, fresh)) lock = -1;
    const isLocked = lock >= 0;
    lastInput = t;
    userChain = true;
    stopFly();
    nav = null;
    returnTo = -1;
    if (isLocked && e.cancelable) e.preventDefault();
  };

  const onScroll = () => {
    const y = win.scrollY;
    const t = now();
    if (y !== prevY) dir = Math.sign(y - prevY);
    if (t - Math.max(lastInput, lastScroll) > CHAIN_GAP_MS) userChain = false;
    lastScroll = t;
    if (idle) clearTimeout(idle);
    const stops = getStops();

    if (nav) {
      // Mid-flight frames pass close to the target; only the landed flight locks it.
      if (!fly && Math.abs(y - nav.top) < 2) {
        engage(stops.findIndex((s) => Math.abs(s - nav!.top) < 2));
        nav = null;
      } else if (t > nav.until) nav = null;
      prevY = y;
      return;
    }
    if (locked()) {
      if (Math.abs(y - stops[lock]) > 1) {
        // Momentum still pushing (touch flings send no input events after lift-off) keeps the lock.
        lastInput = t;
        jump(stops[lock]);
      }
      prevY = stops[lock];
      return;
    }
    if (!userChain) {
      prevY = y;
      return;
    }
    const hit = crossedStop(prevY, y, stops);
    if (hit >= 0 && hit === returnTo) {
      returnTo = -1;
      prevY = y;
      return;
    }
    if (hit >= 0) {
      engage(hit);
      if (y !== stops[hit]) jump(stops[hit]);
      prevY = stops[hit];
      return;
    }
    prevY = y;
    idle = setTimeout(() => {
      if (nav || locked()) return;
      const i = idleSnapTarget(win.scrollY, getStops(), cfg.pullRadius);
      if (i < 0) return;
      // Easing back against the direction of travel undoes a nudge; it must not lock again.
      const back = (dir > 0 && getStops()[i] < win.scrollY) || (dir < 0 && getStops()[i] > win.scrollY);
      returnTo = back ? i : -1;
      win.scrollTo({ top: getStops()[i], behavior });
    }, cfg.idleMs);
  };

  const active = { passive: false } as AddEventListenerOptions;
  win.addEventListener("wheel", onInput, active);
  win.addEventListener("touchstart", onInput, { passive: true });
  win.addEventListener("touchmove", onInput, active);
  win.addEventListener("keydown", onInput);
  win.addEventListener("scroll", onScroll, { passive: true });

  return {
    navigateTo(top) {
      stopFly();
      lock = -1;
      returnTo = -1;
      const from = win.scrollY;
      if (!opts.smooth || Math.abs(top - from) < 1) {
        nav = { top, until: now() + NAV_TIMEOUT_MS };
        win.scrollTo({ top, behavior });
        return;
      }
      const stops = getStops();
      const gap = stops.length > 1 ? (stops[stops.length - 1] - stops[0]) / (stops.length - 1) : 0;
      const steps = gap > 0 ? (top - from) / gap : 1;
      const duration = flyDuration(steps, cfg);
      const start = now();
      nav = { top, until: start + duration + NAV_TIMEOUT_MS };
      const frame = () => {
        const elapsed = now() - start;
        fly = elapsed < duration ? raf(frame) : 0;
        jump(from + (top - from) * flyProgress(elapsed, steps, cfg));
      };
      fly = raf(frame);
    },
    detach() {
      stopFly();
      if (idle) clearTimeout(idle);
      win.removeEventListener("wheel", onInput, active);
      win.removeEventListener("touchstart", onInput, { passive: true } as EventListenerOptions);
      win.removeEventListener("touchmove", onInput, active);
      win.removeEventListener("keydown", onInput);
      win.removeEventListener("scroll", onScroll);
    },
  };
}
