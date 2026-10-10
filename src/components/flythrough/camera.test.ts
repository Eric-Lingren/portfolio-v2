import { describe, expect, it } from "vitest";
import {
  cameraX,
  cameraZ,
  layoutFor,
  panelOpacity,
  panelStyle,
  panelX,
  panelYaw,
  scrollProgress,
  worldTransform,
} from "./camera";
import { FLY_CONFIG } from "./config";

const N = 7;
const D = FLY_CONFIG.depth;
const wide = layoutFor(1440);

describe("camera math", () => {
  it("camera z is monotonic non-increasing in progress", () => {
    let prev = Infinity;
    for (let k = 0; k <= 100; k++) {
      const z = cameraZ(k / 100, N);
      expect(z).toBeLessThanOrEqual(prev);
      prev = z;
    }
  });

  it("camera z at panel i equals -i*D at progress i/(N-1)", () => {
    for (let i = 0; i < N; i++) {
      expect(cameraZ(i / (N - 1), N)).toBeCloseTo(-i * D, 6);
    }
  });

  it("camera x equals the panel offset on arrival", () => {
    for (let i = 0; i < N; i++) {
      expect(cameraX(i / (N - 1), N, wide)).toBeCloseTo(panelX(i, wide), 6);
    }
  });

  it("yaw is exactly 0 on arrival and nonzero away", () => {
    for (let i = 0; i < N; i++) {
      expect(panelYaw(i, i / (N - 1), N, wide)).toBe(0);
    }
    expect(Math.abs(panelYaw(1, 0, N, wide))).toBeGreaterThan(0);
  });

  it("fade stays within [0,1], is 1 on arrival, and 0 once passed", () => {
    for (let k = 0; k <= 200; k++) {
      for (let i = 0; i < N; i++) {
        const o = panelOpacity(i, k / 200, N);
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(1);
      }
    }
    expect(panelOpacity(2, 2 / (N - 1), N)).toBe(1);
    expect(panelOpacity(0, 1, N)).toBe(0);
    expect(panelOpacity(6, 0, N)).toBe(0);
  });

  it("is reversible: same progress yields identical transforms regardless of path", () => {
    const sample = (p: number) => ({
      world: worldTransform(p, N, wide),
      panels: Array.from({ length: N }, (_, i) => panelStyle(i, p, N, wide)),
    });
    const p = 0.37;
    const before = sample(p);
    for (const q of [0, 0.5, 1, 0.9, 0.1]) sample(q);
    expect(sample(p)).toEqual(before);
  });

  it("scales down and flattens on narrow screens", () => {
    const narrow = layoutFor(390);
    expect(wide.scale).toBe(1);
    expect(narrow.scale).toBeLessThan(1);
    expect(narrow.maxYaw).toBeLessThan(wide.maxYaw);
    expect(narrow.offsetX).toBeLessThan(wide.offsetX);
  });

  it("maps scroll to progress from stable units and clamps", () => {
    const range = ((FLY_CONFIG.scrollLvh - 100) / 100) * 800;
    expect(scrollProgress(0, 800)).toBe(0);
    expect(scrollProgress(range / 2, 800)).toBeCloseTo(0.5);
    expect(scrollProgress(range * 3, 800)).toBe(1);
  });
});

import { dwellProgressAt, panelScrollProgress, scrollToCamera } from "./camera";

describe("scroll map with dwell", () => {
  const cfg = { ...FLY_CONFIG, dwell: { 2: 3 } } as typeof FLY_CONFIG;
  const none = { ...FLY_CONFIG, dwell: {} } as typeof FLY_CONFIG;

  it("is the identity when no panel dwells", () => {
    for (const p of [0, 0.2, 0.5, 1]) {
      const m = scrollToCamera(p, N, none);
      expect(m.cameraProgress).toBeCloseTo(p, 9);
      expect(m.dwellProgress).toBe(0);
      expect(m.dwellIndex).toBe(-1);
    }
  });

  it("holds the camera exactly on the panel during its dwell", () => {
    const start = panelScrollProgress(2, N, cfg);
    const end = start + 3 / (N - 1 + 3);
    for (const f of [0.01, 0.3, 0.7, 0.99]) {
      const m = scrollToCamera(start + (end - start) * f, N, cfg);
      expect(m.cameraProgress).toBeCloseTo(2 / (N - 1), 9);
      expect(m.dwellIndex).toBe(2);
      expect(m.dwellProgress).toBeCloseTo(f, 6);
    }
  });

  it("camera progress is monotonic non-decreasing and reaches 0 and 1", () => {
    let prev = -1;
    for (let k = 0; k <= 500; k++) {
      const m = scrollToCamera(k / 500, N, cfg);
      expect(m.cameraProgress).toBeGreaterThanOrEqual(prev);
      prev = m.cameraProgress;
    }
    expect(scrollToCamera(0, N, cfg).cameraProgress).toBe(0);
    expect(scrollToCamera(1, N, cfg).cameraProgress).toBe(1);
    expect(scrollToCamera(-1, N, cfg).cameraProgress).toBe(0);
    expect(scrollToCamera(2, N, cfg).cameraProgress).toBe(1);
  });

  it("inverse places the camera exactly at each panel", () => {
    for (const c of [cfg, none]) {
      for (let i = 0; i < N; i++) {
        const m = scrollToCamera(panelScrollProgress(i, N, c), N, c);
        expect(m.cameraProgress).toBeCloseTo(i / (N - 1), 9);
      }
    }
    expect(panelScrollProgress(0, N, cfg)).toBe(0);
    expect(panelScrollProgress(2, N, cfg)).toBeCloseTo(2 / (N - 1 + 3), 9);
    expect(panelScrollProgress(3, N, cfg)).toBeCloseTo(6 / (N - 1 + 3), 9);
  });

  it("panel dwell progress is 0 before, 1 after, and 0 for panels without a dwell", () => {
    expect(dwellProgressAt(0, N, 2, cfg)).toBe(0);
    expect(dwellProgressAt(1, N, 2, cfg)).toBe(1);
    expect(dwellProgressAt(0.5, N, 4, cfg)).toBe(0);
    const mid = panelScrollProgress(2, N, cfg) + 1.5 / (N - 1 + 3);
    expect(dwellProgressAt(mid, N, 2, cfg)).toBeCloseTo(0.5, 9);
  });

  it("ships a dwell for the AI toolkit panel (index 2)", () => {
    expect(FLY_CONFIG.dwell[2]).toBeGreaterThan(0);
  });
});
