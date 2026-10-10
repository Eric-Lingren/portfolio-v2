import { describe, expect, it } from "vitest";
import { panelScrollTop, scrollProgress, scrollToCamera } from "./camera";
import { FLY_CONFIG } from "./config";

const COUNT = 7;
const LVH = 900;

describe("anchor scroll offset", () => {
  it.each(Array.from({ length: COUNT }, (_, i) => i))("puts the camera exactly at panel %i", (i) => {
    const top = panelScrollTop(i, COUNT, LVH);
    const m = scrollToCamera(scrollProgress(top, LVH), COUNT);
    expect(m.cameraProgress * (COUNT - 1)).toBeCloseTo(i, 6);
  });

  it("is monotonic and accounts for the AI toolkit dwell", () => {
    const tops = Array.from({ length: COUNT }, (_, i) => panelScrollTop(i, COUNT, LVH));
    for (let i = 1; i < COUNT; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
    const gapBefore = tops[2] - tops[1];
    const gapAfter = tops[3] - tops[2];
    expect(gapAfter).toBeGreaterThan(gapBefore * (1 + FLY_CONFIG.dwell[2]) * 0.99);
  });
});
