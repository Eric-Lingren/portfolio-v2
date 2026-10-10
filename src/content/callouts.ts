/**
 * Redline margin notes that float in the 3D world between panels.
 * `gap` n sits between panel n and panel n+1, so valid gaps are 0..PANELS-2.
 */
export type Callout = {
  gap: number;
  text: string;
  /** Which side of the flight path the note floats on. */
  side: -1 | 1;
  /** Vertical offset in px from the center line. */
  y: number;
  /** Slight hand-drawn tilt in degrees. */
  tilt: number;
};

export const CALLOUTS: readonly Callout[] = [
  { gap: 0, text: "8px grid. Not negotiable.", side: 1, y: -150, tilt: -3 },
  { gap: 1, text: "this radius is intentional", side: -1, y: 120, tilt: 2 },
  { gap: 2, text: "check the empty state", side: 1, y: 90, tilt: -2 },
  { gap: 3, text: "tokens, not hex", side: -1, y: -130, tilt: 3 },
  { gap: 4, text: "ship it, then measure it", side: 1, y: -100, tilt: -2 },
  { gap: 5, text: "keep the focus ring", side: -1, y: 110, tilt: 2 },
];
