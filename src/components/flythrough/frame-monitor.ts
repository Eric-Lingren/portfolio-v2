/** Tunables for the frame-rate downgrade. */
export const MONITOR_CONFIG = {
  /** Frames ignored at the start (stage mount, first paint, jit). */
  warmupFrames: 12,
  /** Rolling window size, in frames. */
  windowFrames: 45,
  /** Median frame time above this (ms) means sustained poor frame rate (under 25fps). */
  badMedianMs: 40,
  /** The downgrade decision is only made during this many ms after start. */
  decisionMs: 6000,
  /** Gaps longer than this (ms) are tab-switch pauses, not slow frames. */
  maxGapMs: 500,
} as const;

export type MonitorReading = { fps: number; frameMs: number };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Pure frame-time monitor. Feed it frame deltas; it reports whether the frame
 * rate has been poor for a whole window. The median makes a single spike (or a
 * few) irrelevant.
 */
export class FrameMonitor {
  private frames: number[] = [];
  private seen = 0;
  private elapsed = 0;
  private decided = false;
  downgraded = false;

  push(dtMs: number): MonitorReading | null {
    if (dtMs <= 0 || dtMs > MONITOR_CONFIG.maxGapMs) return null;
    this.seen++;
    this.elapsed += dtMs;
    if (this.seen <= MONITOR_CONFIG.warmupFrames) return null;
    this.frames.push(dtMs);
    if (this.frames.length > MONITOR_CONFIG.windowFrames) this.frames.shift();
    const frameMs = median(this.frames);
    if (!this.decided && this.frames.length >= MONITOR_CONFIG.windowFrames && frameMs > MONITOR_CONFIG.badMedianMs) {
      this.downgraded = true;
      this.decided = true;
    }
    if (this.elapsed > MONITOR_CONFIG.decisionMs) this.decided = true;
    return { frameMs, fps: 1000 / frameMs };
  }

  /** True once the decision window has closed or a downgrade fired. */
  get done() {
    return this.decided;
  }
}

/** Runs a FrameMonitor on requestAnimationFrame. Returns a stop function. */
export function startFrameMonitor(opts: {
  onReading?: (r: MonitorReading) => void;
  onDowngrade: () => void;
  /** Keep sampling after the decision window (for the perf overlay). */
  keepAlive?: boolean;
}): () => void {
  const monitor = new FrameMonitor();
  let raf = 0;
  let last = 0;
  let stopped = false;
  const tick = (now: number) => {
    if (stopped) return;
    if (last) {
      const r = monitor.push(now - last);
      if (r) opts.onReading?.(r);
      if (monitor.downgraded) {
        stopped = true;
        opts.onDowngrade();
        return;
      }
      if (monitor.done && !opts.keepAlive) return;
    }
    last = now;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}
