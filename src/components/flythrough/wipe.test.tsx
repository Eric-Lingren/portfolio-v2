import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Panel } from "../Panel";
import { FLY_CONFIG } from "./config";
import { StageContext } from "./stage-context";
import { applyWipe, builtAmount, findWipe, panelDistance, wipeTransforms } from "./wipe";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const wipeSource = readFileSync(join(__dirname, "wipe.ts"), "utf8");
const DEPTH = FLY_CONFIG.depth;

describe("builtAmount", () => {
  it("is 0 far away", () => {
    expect(builtAmount(DEPTH * 3)).toBe(0);
    expect(builtAmount(DEPTH * FLY_CONFIG.wipeRange)).toBe(0);
  });

  it("has not started in the first half of the approach", () => {
    // The sweep must play out close up, where it is readable.
    expect(builtAmount(DEPTH)).toBe(0);
    expect(builtAmount(DEPTH * 0.5)).toBe(0);
    expect(builtAmount(DEPTH * 0.3)).toBeGreaterThan(0);
  });

  it("is half built at the geometric midpoint, so it runs evenly through the camera's ease-in", () => {
    const mid = DEPTH * Math.sqrt(FLY_CONFIG.wipeRange * FLY_CONFIG.wipeDone);
    expect(builtAmount(mid)).toBeCloseTo(0.5, 6);
  });

  it("is 1 at arrival and after the camera passes", () => {
    expect(builtAmount(0)).toBe(1);
    expect(builtAmount(-DEPTH)).toBe(1);
  });

  it("is monotonic non-increasing in distance and clamped to 0..1", () => {
    let prev = 1;
    for (let d = -DEPTH; d <= DEPTH * 3; d += 25) {
      const v = builtAmount(d);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(prev + 1e-12);
      prev = v;
    }
  });

  it("is symmetric on reverse: the same distance gives the same amount", () => {
    // Scrolling in and scrolling back out pass through identical progress values.
    const count = 7;
    const forward = [0.1, 0.2, 0.3].map((p) => builtAmount(panelDistance(2, p, count)));
    const backward = [0.3, 0.2, 0.1].map((p) => builtAmount(panelDistance(2, p, count))).reverse();
    expect(forward).toEqual(backward);
  });

  it("is fully built when the camera arrives at the panel", () => {
    // panel 3 of 7 at progress 3/6
    expect(builtAmount(panelDistance(3, 3 / 6, 7))).toBe(1);
  });
});

function stagePanel() {
  return render(
    <StageContext.Provider value={true}>
      <Panel name="Sample">
        <p>content</p>
      </Panel>
    </StageContext.Provider>,
  );
}

describe("wipe DOM", () => {
  it("hides the sketch copy from assistive tech and keyboard focus", () => {
    const { container } = stagePanel();
    const wipe = container.querySelector("[data-wipe]")!;
    expect(wipe).toHaveAttribute("aria-hidden", "true");
    expect(wipe).toHaveAttribute("inert");
  });

  it("renders both layers, the wipe box, and the edge only inside the stage", () => {
    const { container } = stagePanel();
    expect(container.querySelector("[data-wipe] [data-wipe-inner] [data-layer='sketch']")).not.toBeNull();
    expect(container.querySelector(":scope > section > [data-layer='polished']")).not.toBeNull();
    expect(container.querySelector("[data-wipe-edge] .build-line")).not.toBeNull();
    const flat = render(
      <Panel name="Flat">
        <p>x</p>
      </Panel>,
    );
    expect(flat.container.querySelector("[data-wipe]")).toBeNull();
    expect(flat.container.querySelector("[data-layer='sketch']")).toBeNull();
  });

  it("outer and inner translateY are equal and opposite", () => {
    const { container } = stagePanel();
    const targets = findWipe(container)!;
    for (const built of [0, 0.1, 0.25, 0.5, 0.73, 1]) {
      applyWipe(targets, built);
      const outer = /translate3d\(0, (-?[\d.]+)%, 0\)/.exec(targets.outer.style.transform)!;
      const inner = /translate3d\(0, (-?[\d.]+)%, 0\)/.exec(targets.inner.style.transform)!;
      expect(Number(outer[1]) + Number(inner[1])).toBe(0);
      expect(Number(outer[1])).toBeCloseTo(built * 100, 3);
      expect(targets.edge!.style.transform).toBe(targets.outer.style.transform);
    }
  });

  it("wipeTransforms clamps out-of-range input", () => {
    expect(wipeTransforms(2).outer).toBe(wipeTransforms(1).outer);
    expect(wipeTransforms(-1).outer).toBe(wipeTransforms(0).outer);
  });

  it("hides the edge when nothing is built or everything is", () => {
    const { container } = stagePanel();
    const t = findWipe(container)!;
    applyWipe(t, 0.5);
    expect(t.edge!.style.visibility).toBe("visible");
    applyWipe(t, 0);
    expect(t.edge!.style.visibility).toBe("hidden");
    applyWipe(t, 1);
    expect(t.edge!.style.visibility).toBe("hidden");
  });

  it("hides the sketch box once fully built, so its dashed border cannot peek past the clip edge", () => {
    const { container } = stagePanel();
    const t = findWipe(container)!;
    applyWipe(t, 0.5);
    expect(t.outer.style.visibility).toBe("visible");
    applyWipe(t, 1);
    expect(t.outer.style.visibility).toBe("hidden");
    applyWipe(t, 0);
    expect(t.outer.style.visibility).toBe("visible");
  });
});

function ruleBody(selector: string): string {
  const m = new RegExp(
    `(?:^|[\\s,}])${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?:,[^{]*)?\\{([^}]*)\\}`,
    "m",
  ).exec(css);
  return m?.[1] ?? "";
}

describe("wipe code guards", () => {
  it("never assigns clip-path or opacity per frame", () => {
    expect(wipeSource).not.toMatch(/clip-?path/i);
    expect(wipeSource).not.toMatch(/opacity/i);
    for (const sel of [".panel-wipe", ".panel-wipe-inner", ".panel-wipe-edge"]) {
      expect(ruleBody(sel)).not.toMatch(/clip-path|opacity/);
    }
  });

  it("writes only transform (plus edge and sketch visibility) to element styles", () => {
    const writes = [...wipeSource.matchAll(/\.style\.(\w+)\s*=/g)].map((m) => m[1]);
    expect(new Set(writes)).toEqual(new Set(["transform", "visibility"]));
  });

  it("dither band is plain CSS (no canvas/WebGL) and has no motion properties of its own", () => {
    const { container } = stagePanel();
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector(".dither-band")).not.toBeNull();
    for (const sel of [".dither-band", ".dither-band--dense", ".dither-band--sparse"]) {
      expect(ruleBody(sel)).not.toMatch(/animation|transition|mask|filter/);
    }
    expect(css).not.toMatch(/\.dither-band[^{]*\{[^}]*(animation|transition)/);
  });

  it("the dither band moves only through the edge's transform", () => {
    const { container } = stagePanel();
    const t = findWipe(container)!;
    applyWipe(t, 0.4);
    const band = container.querySelector<HTMLElement>(".dither-band")!;
    expect(band.style.length).toBe(0);
    expect(t.edge!.contains(band)).toBe(true);
    expect(t.edge!.style.transform).toContain("translate3d");
  });

  it("build line uses the coral-to-cyan gradient and coral glow", () => {
    const body = ruleBody(".build-line").replace(/\s+/g, " ");
    expect(body).toContain("linear-gradient(90deg, #ff5a36, #06b6d4)");
    expect(body).toContain("box-shadow: 0 0 18px 2px #ff5a36");
  });

  it("card hover glow applies to the polished layer under desktop hover only", () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)\s*\{[^@]*\.panel-layer--polished:hover/);
    expect(css).toMatch(/--cyan-glow:\s*0 0 0 1px #06b6d4,\s*0 0 28px rgba\(6, 182, 212, 0\.4\)/);
    expect(css).not.toMatch(/\.panel-layer--sketch:hover/);
  });
});
