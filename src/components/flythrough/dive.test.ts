import { describe, expect, it } from "vitest";
import { FLY_CONFIG } from "./config";
import { diveScroll, divePull } from "./dive";

const CFG = FLY_CONFIG.dive;
/** Curve sampled at 1000 even steps across the flight. */
const samples = (f: (u: number) => number) => Array.from({ length: 1001 }, (_, k) => f(k / 1000));

describe("diveScroll", () => {
  it("starts at 0, ends at 1 and never moves backward", () => {
    const s = samples(diveScroll);
    expect(s[0]).toBe(0);
    expect(s.at(-1)).toBe(1);
    s.slice(1).forEach((x, i) => expect(x).toBeGreaterThanOrEqual(s[i]));
  });

  it("holds still while the camera pulls back and dives, gliding only in between", () => {
    const lead = (1 - CFG.glide) / 2;
    expect(diveScroll(lead * 0.99)).toBe(0);
    expect(diveScroll(1 - lead * 0.99)).toBe(1);
    expect(diveScroll(0.5)).toBeCloseTo(0.5, 9);
  });

  it("eases off the mark and into the stop", () => {
    const lead = (1 - CFG.glide) / 2;
    expect(diveScroll(lead + 0.01)).toBeLessThan(0.002);
    expect(diveScroll(1 - lead - 0.01)).toBeGreaterThan(0.998);
  });
});

describe("divePull", () => {
  it("is 0 at both ends and 1 at the middle", () => {
    expect(divePull(0)).toBe(0);
    expect(divePull(1)).toBe(0);
    expect(divePull(0.5)).toBe(1);
  });

  it("rises, then falls, staying within [0,1]", () => {
    const p = samples(divePull);
    p.forEach((x) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
    });
    p.slice(1, 501).forEach((x, i) => expect(x).toBeGreaterThanOrEqual(p[i]));
    p.slice(501).forEach((x, i) => expect(x).toBeLessThanOrEqual(p[500 + i]));
  });

  it("is fully pulled back for the fastest part of the glide", () => {
    expect(divePull(1 - CFG.rise)).toBe(1);
    expect(divePull(CFG.rise)).toBe(1);
  });

  it("eases off and back in without a jolt", () => {
    expect(divePull(0.01)).toBeLessThan(0.005);
    expect(divePull(0.99)).toBeLessThan(0.005);
  });
});
