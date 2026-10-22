import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AIStatsSnapshot } from "../../../scripts/ai-stats-lib.mjs";
import { AIStatsStrip, statsFromSnapshot } from "./AIStatsStrip";

const SNAP: AIStatsSnapshot = {
  generatedAt: "2026-03-01T00:00:00.000Z",
  efficiency: { modelMix: { haiku: 40, sonnet: 35, opus: 25 }, tierAdherencePct: 61 },
  improvement: { learningsAppliedPct: 48, benchmarkBeforePct: 62, benchmarkAfterPct: 91 },
  volume: { skills: 12, agents: 7 },
};

describe("AIStatsStrip", () => {
  it("renders 4 stats and one volume line from the snapshot", () => {
    render(<AIStatsStrip snapshot={SNAP} />);
    const strip = screen.getByTestId("ai-stats");
    expect(strip.querySelectorAll("[data-stat]")).toHaveLength(4);
    expect(within(strip).getByText("Haiku 40% / Sonnet 35% / Opus 25%")).toBeTruthy();
    expect(within(strip).getByText("61%")).toBeTruthy();
    expect(within(strip).getByText("48%")).toBeTruthy();
    expect(within(strip).getByText("62% to 91%")).toBeTruthy();
    expect(screen.getByTestId("ai-stats-volume").textContent).toBe("12 skills and 7 agents in the toolkit");
  });

  it("shows no dollar figures", () => {
    const { stats, volume } = statsFromSnapshot(SNAP);
    expect(JSON.stringify([stats, volume])).not.toMatch(/\$/);
  });
});
