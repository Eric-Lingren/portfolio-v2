import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "./ai-stats-snapshot.mjs";
import { parseAdherence, parseModelMix, validateSnapshot } from "./ai-stats-lib.mjs";

const FIXTURE = resolve(import.meta.dirname, "fixtures/ai-stats");
const SAMPLE = JSON.parse(readFileSync(resolve(import.meta.dirname, "../src/content/ai-stats.json"), "utf8"));

const valid = () => structuredClone({ ...SAMPLE, sample: undefined, sampleNote: undefined });
const withChange = (fn) => {
  const s = valid();
  fn(s);
  return validateSnapshot(s);
};

describe("validateSnapshot", () => {
  it("accepts the committed sample, flagged as sample with an ERIC marker", () => {
    expect(SAMPLE.sample).toBe(true);
    expect(SAMPLE.sampleNote).toContain("[ERIC: run npm run stats:snapshot before launch]");
    expect(validateSnapshot(SAMPLE)).toEqual([]);
  });

  it("accepts percentages and before/after ratios without sample fields", () => {
    expect(validateSnapshot(valid())).toEqual([]);
  });

  it("rejects a sample flag without an ERIC marker", () => {
    expect(validateSnapshot({ ...valid(), sample: true, sampleNote: "just a sample" })).not.toEqual([]);
  });

  it("rejects cost keys", () => {
    expect(withChange((s) => (s.efficiency.costUsd = 12))).toEqual(expect.arrayContaining([expect.stringMatching(/cost key/)]));
    expect(withChange((s) => (s.spend = 5))).toEqual(expect.arrayContaining([expect.stringMatching(/cost key/)]));
  });

  it("rejects dollar values", () => {
    expect(withChange((s) => (s.sampleNote = "saves $1,200 a month"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/dollar value/)]),
    );
  });

  it("rejects raw work-profile counts", () => {
    expect(withChange((s) => (s.efficiency.sessions = 810))).toEqual(
      expect.arrayContaining([expect.stringMatching(/raw work-profile count/)]),
    );
    expect(withChange((s) => (s.improvement.requestCount = 3670))).toEqual(
      expect.arrayContaining([expect.stringMatching(/raw work-profile count/)]),
    );
  });

  it("rejects project names and paths", () => {
    expect(withChange((s) => (s.sampleNote = "-Users-someone-Documents-dev-worktrees-app"))).toEqual(
      expect.arrayContaining([expect.stringMatching(/project name/)]),
    );
    expect(withChange((s) => (s.projects = ["KEY-1234"]))).not.toEqual([]);
  });

  it("rejects out-of-range percentages and unknown keys", () => {
    expect(withChange((s) => (s.efficiency.tierAdherencePct = 140))).not.toEqual([]);
    expect(withChange((s) => (s.extra = 1))).toEqual(expect.arrayContaining(["unknown key: extra"]));
  });
});

describe("parsers", () => {
  it("weights the model mix by turns and sums to 100", () => {
    const mix = parseModelMix("--- MODEL MIX (assistant turns) ---\n  1%  haiku  1\n  1%  sonnet  1\n  1%  opus  1\n");
    expect(mix.haiku + mix.sonnet + mix.opus).toBe(100);
  });
  it("reads the adherence percentage", () => {
    expect(parseAdherence("  adher.       24%   ^6pt   (24/99)")).toBe(24);
  });
});

describe("ai-stats-snapshot script", () => {
  it("maps fixture input to the expected snapshot", () => {
    const out = join(mkdtempSync(join(tmpdir(), "ai-stats-")), "ai-stats.json");
    run(["--input", FIXTURE, "--out", out, "--generated-at", "2026-03-01T00:00:00.000Z"]);
    expect(JSON.parse(readFileSync(out, "utf8"))).toEqual({
      generatedAt: "2026-03-01T00:00:00.000Z",
      efficiency: { modelMix: { haiku: 40, sonnet: 35, opus: 25 }, tierAdherencePct: 40 },
      improvement: { learningsAppliedPct: 50, benchmarkBeforePct: 65, benchmarkAfterPct: 85 },
      volume: { skills: 4, agents: 2 },
    });
  });
});
