/**
 * The panel id the visitor is currently on. FlyStage writes it from the camera
 * position, FlatStack from an IntersectionObserver, and Nav reads it to mark the
 * active link. Writes are no-ops unless the id changes, so per-frame calls are cheap.
 */
let current: string | null = null;
const listeners = new Set<() => void>();

export function setActiveSection(id: string | null): void {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l());
}

export function getActiveSection(): string | null {
  return current;
}

export function subscribeActiveSection(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
