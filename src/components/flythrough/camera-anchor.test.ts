import { describe, expect, it } from "vitest";
import { panelScrollTop, scrollProgress } from "./camera";

const COUNT = 7;
const LVH = 900;

describe("anchor scroll offset", () => {
  it.each(Array.from({ length: COUNT }, (_, i) => i))("puts the camera exactly at panel %i", (i) => {
    const top = panelScrollTop(i, COUNT, LVH);
    expect(scrollProgress(top, LVH) * (COUNT - 1)).toBeCloseTo(i, 6);
  });

  it("is monotonic with even gaps", () => {
    const tops = Array.from({ length: COUNT }, (_, i) => panelScrollTop(i, COUNT, LVH));
    for (let i = 1; i < COUNT; i++) expect(tops[i] - tops[i - 1]).toBeCloseTo(tops[1] - tops[0], 6);
    expect(tops[1]).toBeGreaterThan(0);
  });
});
