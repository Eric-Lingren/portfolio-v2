import snapshotJson from "@/content/ai-stats.json";
import type { AIStatsSnapshot } from "../../../scripts/ai-stats-lib.mjs";
import "./ai-stats.css";

export type Stat = { id: string; value: string; label: string };

const MODEL_LABELS = { haiku: "Haiku", sonnet: "Sonnet", opus: "Opus" } as const;

/** Pure: the headline stats and volume line for a snapshot. Percentages and ratios only. */
export function statsFromSnapshot(s: AIStatsSnapshot): { stats: Stat[]; volume: string } {
  const { modelMix, tierAdherencePct } = s.efficiency;
  const mix = (Object.keys(MODEL_LABELS) as (keyof typeof MODEL_LABELS)[])
    .map((m) => `${MODEL_LABELS[m]} ${modelMix[m]}%`)
    .join(" / ");
  return {
    stats: [
      { id: "model-mix", value: mix, label: "Model mix across assistant turns" },
      { id: "tier-adherence", value: `${tierAdherencePct}%`, label: "Runs on the model tier the skill is assigned" },
      { id: "learnings", value: `${s.improvement.learningsAppliedPct}%`, label: "Captured learnings applied back to the toolkit" },
      {
        id: "benchmark",
        value: `${s.improvement.benchmarkBeforePct}% to ${s.improvement.benchmarkAfterPct}%`,
        label: "Skill benchmark score, first run to latest",
      },
    ],
    volume: `${s.volume.skills} skills and ${s.volume.agents} agents in the toolkit`,
  };
}

export function AIStatsStrip({ snapshot = snapshotJson as AIStatsSnapshot }: { snapshot?: AIStatsSnapshot }) {
  const { stats, volume } = statsFromSnapshot(snapshot);
  return (
    <section className="ai-stats" data-testid="ai-stats" data-sample={snapshot.sample ? "true" : undefined} aria-label="Toolkit numbers">
      <dl className="ai-stats-list">
        {stats.map((s) => (
          <div className="ai-stat" key={s.id} data-stat={s.id}>
            <dt className="ai-stat-label">{s.label}</dt>
            <dd className="ai-stat-value">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="ai-stats-volume" data-testid="ai-stats-volume">
        {volume}
      </p>
    </section>
  );
}
