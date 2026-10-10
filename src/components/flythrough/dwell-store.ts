"use client";

import { useSyncExternalStore } from "react";
import { dwellProgressAt } from "./camera";

/**
 * Tiny external store: FlyStage publishes raw scroll progress; a panel that
 * dwells reads its own step from it. Subscribers only re-render when the
 * integer step changes, not on every scroll event.
 */
let progress = 0;
let count = 1;
const listeners = new Set<() => void>();

export function setStageScroll(p: number, panelCount: number): void {
  if (p === progress && panelCount === count) return;
  progress = p;
  count = panelCount;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Pure: which of `steps` steps is active at dwell progress `p` in [0,1]. */
export function stepFromProgress(p: number, steps: number): number {
  if (steps <= 1) return 0;
  const x = Math.min(1, Math.max(0, p));
  return Math.min(steps - 1, Math.floor(x * steps));
}

export function useDwellStep(panelIndex: number, steps: number): number {
  return useSyncExternalStore(
    subscribe,
    () => stepFromProgress(dwellProgressAt(progress, count, panelIndex), steps),
    () => 0,
  );
}
