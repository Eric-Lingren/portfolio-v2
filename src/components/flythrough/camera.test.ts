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

describe("pull-back", () => {
  const p = 1.5 / (N - 1); // between panels 1 and 2

  it("leaves every transform untouched at zero pull", () => {
    expect(worldTransform(p, N, wide, undefined, 0)).toBe(worldTransform(p, N, wide));
    for (let i = 0; i < N; i++) expect(panelStyle(i, p, N, wide, 0)).toEqual(panelStyle(i, p, N, wide));
  });

  it("dollies the camera back and tilts it down in proportion to pull", () => {
    const half = worldTransform(0, N, wide, undefined, 0.5);
    expect(half).toContain(`translate3d(0, 0, ${-0.5 * FLY_CONFIG.dive.depth}px)`);
    expect(half).toContain(`rotateX(${-0.5 * FLY_CONFIG.dive.tilt}deg)`);
  });

  it("flattens the weave at full pull", () => {
    expect(panelYaw(1, 0, N, wide, 1)).toBe(0);
    expect(worldTransform(p, N, wide, undefined, 1)).toMatch(/translate3d\(0px, 0, [-\d.]+px\)$/);
  });

  it("shows panels further down the stack while pulled back", () => {
    expect(panelOpacity(6, 0, N)).toBe(0);
    expect(panelOpacity(6, 0, N, 1)).toBeGreaterThan(0.5);
  });

  it("keeps a just-passed panel in view below the pulled-back camera", () => {
    expect(panelOpacity(1, 1.5 / (N - 1), N)).toBe(0);
    expect(panelOpacity(1, 1.5 / (N - 1), N, 1)).toBeGreaterThan(0.5);
  });
});

import { contentFit, fitScale, footerLift, panelHeight, panelScrollProgress } from "./camera";

describe("footerLift", () => {
  const vh = 900;
  const spacer = 8 * vh;
  const footer = 120;

  it("is 0 until the footer starts to show", () => {
    expect(footerLift(0, vh, spacer, footer)).toBe(0);
    expect(footerLift(spacer - vh, vh, spacer, footer)).toBe(0);
  });

  it("tracks half the visible footer, capped at half its height", () => {
    expect(footerLift(spacer - vh + 60, vh, spacer, footer)).toBe(30);
    expect(footerLift(spacer - vh + footer, vh, spacer, footer)).toBe(60);
    expect(footerLift(spacer, vh, spacer, footer)).toBe(60);
  });
});

describe("panel stops", () => {
  it("places panel i at progress i/(n-1), clamped", () => {
    for (let i = 0; i < N; i++) expect(panelScrollProgress(i, N)).toBeCloseTo(i / (N - 1), 9);
    expect(panelScrollProgress(-2, N)).toBe(0);
    expect(panelScrollProgress(N + 3, N)).toBe(1);
    expect(panelScrollProgress(3, 1)).toBe(0);
  });

  it("ships no dwell: the scroll range is one even step per panel gap", () => {
    expect(FLY_CONFIG).not.toHaveProperty("dwell");
    expect(FLY_CONFIG.scrollLvh).toBe(800);
  });
});

describe("fit scale", () => {
  const NAV = 60;
  const room = 900 - NAV - 2 * FLY_CONFIG.fitMargin;

  it("leaves panels that already fit at 1", () => {
    expect(fitScale(500, 900, NAV, wide)).toBe(1);
    expect(fitScale(room, 900, NAV, wide)).toBe(1);
  });

  it("shrinks a tall panel to exactly the room below the nav", () => {
    expect(fitScale(room * 2, 900, NAV, wide)).toBeCloseTo(0.5, 9);
  });

  it("accounts for the layout scale already applied", () => {
    const half = { ...wide, scale: 0.5 };
    expect(fitScale(room * 1.5, 900, NAV, half)).toBe(1);
    expect(fitScale(room * 4, 900, NAV, half)).toBeCloseTo(0.5, 9);
  });

  it("leaves less room under a taller (wrapped) nav", () => {
    expect(fitScale(room, 900, NAV + 100, wide)).toBeLessThan(1);
  });

  it("is 1 before the panel is measured", () => {
    expect(fitScale(0, 900, NAV, wide)).toBe(1);
  });
});

describe("shared panel box", () => {
  const NAV = 60;
  const room = 900 - NAV - 2 * FLY_CONFIG.fitMargin;

  it("fills the room below the nav, before the layout scale", () => {
    expect(panelHeight(900, NAV, wide)).toBe(room);
    expect(panelHeight(900, NAV, { ...wide, scale: 0.5 })).toBe(room * 2);
  });

  it("rests at exactly fit 1, so no panel shrinks or grows at its stop", () => {
    expect(fitScale(panelHeight(900, NAV, wide), 900, NAV, wide)).toBe(1);
  });

  it("is never negative on a tiny viewport", () => {
    expect(panelHeight(50, NAV, wide)).toBe(0);
  });
});

describe("content fit", () => {
  it("leaves content that fits at 1", () => {
    expect(contentFit(400, 600)).toBe(1);
    expect(contentFit(600, 600)).toBe(1);
  });

  it("shrinks taller content to exactly the body room", () => {
    expect(contentFit(800, 600)).toBeCloseTo(0.75, 9);
  });

  it("is 1 before content or room is measured", () => {
    expect(contentFit(0, 600)).toBe(1);
    expect(contentFit(800, 0)).toBe(1);
  });
});
