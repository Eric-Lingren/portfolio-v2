export type LookPoint = { x: number; y: number };

type LookWindow = Pick<Window, "addEventListener" | "removeEventListener" | "innerWidth" | "innerHeight"> & {
  matchMedia?: Window["matchMedia"];
};

/**
 * Desktop-only mouse look-around. Registers a single mousemove listener when
 * the primary pointer is fine and hovers; on touch devices registers nothing.
 * Deliberately never touches DeviceOrientation / DeviceMotion (no gyroscope).
 * Reports the cursor as -1..1 on both axes.
 */
export function attachLookAround(win: LookWindow, onLook: (p: LookPoint) => void): () => void {
  const fine = win.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  if (!fine) return () => {};
  const handler = (e: Event) => {
    const { clientX, clientY } = e as MouseEvent;
    onLook({
      x: (clientX / win.innerWidth) * 2 - 1,
      y: (clientY / win.innerHeight) * 2 - 1,
    });
  };
  win.addEventListener("mousemove", handler, { passive: true });
  return () => win.removeEventListener("mousemove", handler);
}
