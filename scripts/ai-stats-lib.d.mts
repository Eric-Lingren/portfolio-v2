export interface AIStatsSnapshot {
  sample?: boolean;
  sampleNote?: string;
  generatedAt: string;
  efficiency: {
    modelMix: { haiku: number; sonnet: number; opus: number };
    tierAdherencePct: number;
  };
  improvement: {
    learningsAppliedPct: number;
    benchmarkBeforePct: number;
    benchmarkAfterPct: number;
  };
  volume: { skills: number; agents: number };
}
export function validateSnapshot(data: unknown): string[];
export function parseModelMix(text: string): { haiku: number; sonnet: number; opus: number };
export function parseAdherence(text: string): number;
export function learningsAppliedPct(jsonl: string): number;
export function benchmarkBeforeAfter(files: { runs?: { timestamp?: string; behavioral_score?: number }[] }[]): { before: number; after: number };
export function buildSnapshot(input: string, generatedAt: string): AIStatsSnapshot;
