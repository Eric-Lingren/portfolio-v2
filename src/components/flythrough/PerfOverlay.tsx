export function PerfOverlay({ fps, frameMs, mode }: { fps: number | null; frameMs: number | null; mode: string }) {
  return (
    <div className="perf-overlay" data-testid="perf-overlay" aria-hidden="true">
      {mode} | {fps === null ? "--" : fps.toFixed(0)} fps | {frameMs === null ? "--" : frameMs.toFixed(1)} ms
    </div>
  );
}
