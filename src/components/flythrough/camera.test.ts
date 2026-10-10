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
