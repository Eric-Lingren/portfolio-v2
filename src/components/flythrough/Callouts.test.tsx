import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { CALLOUTS } from "@/content/callouts";
import { CALLOUT_MAX, Callouts, calloutPosition, isValidGap } from "./Callouts";
import { FLY_CONFIG } from "./config";
import { layoutFor, panelStyle } from "./camera";
import { PANELS } from "./registry";

describe("callouts", () => {
  it("every callout targets a valid panel gap", () => {
    expect(CALLOUTS.length).toBeGreaterThan(0);
    for (const c of CALLOUTS) expect(isValidGap(c.gap, PANELS.length)).toBe(true);
    expect(isValidGap(PANELS.length - 1, PANELS.length)).toBe(false);
    expect(isValidGap(-1, PANELS.length)).toBe(false);
  });

  it("sits strictly between its two panels in z", () => {
    for (const c of CALLOUTS) {
      const z = calloutPosition(c).z;
      expect(z).toBeLessThan(-c.gap * FLY_CONFIG.depth);
      expect(z).toBeGreaterThan(-(c.gap + 1) * FLY_CONFIG.depth);
    }
  });

  it("is aria-hidden", () => {
    const html = renderToString(<Callouts />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("fly-callouts");
  });

  it("flat page tree contains no callouts", () => {
    const html = renderToString(<Home />);
    expect(html).not.toContain("fly-callout");
  });

  it("does not change panel geometry", () => {
    const layout = layoutFor(1440);
    const before = PANELS.map((_, i) => panelStyle(i, 0.3, PANELS.length, layout));
    renderToString(<Callouts items={[...CALLOUTS, { gap: 0, text: "extra", side: 1, y: 0, tilt: 0 }]} />);
    const after = PANELS.map((_, i) => panelStyle(i, 0.3, PANELS.length, layout));
    expect(after).toEqual(before);
  });

  it("keeps every annotation within a small box with pointer-events none", () => {
    expect(CALLOUT_MAX.width).toBeLessThanOrEqual(260);
    expect(CALLOUT_MAX.height).toBeLessThanOrEqual(60);
    for (const c of CALLOUTS) expect(c.text.length * 8).toBeLessThanOrEqual(CALLOUT_MAX.width);
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/\.fly-callouts\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/\.fly-callout\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/\.fly-callout\s*\{[^}]*max-height:\s*48px/);
  });
});
