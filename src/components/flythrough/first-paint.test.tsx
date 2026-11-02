import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { layoutFor } from "./camera";
import { clearFirstPaint, FIRST_PAINT_SCRIPT, firstPaintNavHeight } from "./first-paint";
import { FlyThroughLoader } from "./FlyThroughLoader";
import { isFlat, MOBILE_QUERY, resolveMode } from "./mode";

vi.mock("./FlyStage", () => ({ FlyStage: () => <div data-testid="fly-stage" /> }));

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const root = document.documentElement;

function mockEnv({ search = "", reduced = false, mobile = false, width = 1440 } = {}) {
  window.history.pushState({}, "", `/${search}`);
  window.matchMedia = vi.fn((q: string) => ({
    matches: (reduced && q.includes("reduced-motion")) || (mobile && q === MOBILE_QUERY),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
}

const runScript = () => new Function(FIRST_PAINT_SCRIPT)();

afterEach(() => {
  clearFirstPaint();
  root.removeAttribute("style");
  document.body.innerHTML = "";
  window.history.pushState({}, "", "/");
});

describe("FIRST_PAINT_SCRIPT", () => {
  const cases = [
    { search: "", reduced: false, mobile: false },
    { search: "?view=classic", reduced: false, mobile: false },
    { search: "", reduced: true, mobile: false },
    { search: "", reduced: false, mobile: true },
  ];

  it.each(cases)("marks the page pending only when resolveMode picks the stage: %o", (env) => {
    mockEnv(env);
    runScript();
    const interactive = !isFlat(resolveMode({ ...env, reducedMotion: env.reduced, downgraded: false }));
    expect(root.hasAttribute("data-fly-pending")).toBe(interactive);
  });

  it.each([1920, 1240, 1100, 1024, 800, 768])("matches the stage's layout scale at %ipx", (width) => {
    mockEnv({ width });
    runScript();
    expect(Number(root.style.getPropertyValue("--fly-scale"))).toBeCloseTo(layoutFor(width).scale, 6);
  });

  it("uses the measured nav height", () => {
    mockEnv();
    document.body.innerHTML = '<header class="site-nav"></header>';
    vi.spyOn(document.querySelector(".site-nav")!, "getBoundingClientRect").mockReturnValue({ height: 53.5 } as DOMRect);
    runScript();
    expect(root.style.getPropertyValue("--fly-nav-h")).toBe("53.5px");
  });

  it("clearFirstPaint drops the attribute and keeps the nav height for a stage remount", () => {
    mockEnv();
    document.body.innerHTML = '<header class="site-nav"></header>';
    vi.spyOn(document.querySelector(".site-nav")!, "getBoundingClientRect").mockReturnValue({ height: 53.5 } as DOMRect);
    runScript();
    clearFirstPaint();
    expect(root.hasAttribute("data-fly-pending")).toBe(false);
    expect(firstPaintNavHeight()).toBe(53.5);
  });

  it("firstPaintNavHeight is null when the script did not run", () => {
    expect(firstPaintNavHeight()).toBeNull();
  });
});

describe("first-paint card CSS", () => {
  it("is scoped to the pending flat hero and shares the stage card's width", () => {
    expect(css).toMatch(/html\[data-fly-pending\] \.stack--flat \[data-panel="Hero"\] \.panel-layer \{[^}]*width: min\(960px, 92vw\)/);
    expect(css).toMatch(/\.fly-panel \{[^}]*width: min\(960px, 92vw\)/);
  });
});

describe("FlyThroughLoader clears the first-paint card", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "performance"] });
  });
  afterEach(() => vi.useRealTimers());

  const flush = () =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

  it("once the stage swaps in", async () => {
    mockEnv();
    runScript();
    render(
      <FlyThroughLoader>
        <p>flat</p>
      </FlyThroughLoader>,
    );
    expect(root.hasAttribute("data-fly-pending")).toBe(true);
    await flush();
    expect(screen.getByTestId("fly-stage")).toBeInTheDocument();
    expect(root.hasAttribute("data-fly-pending")).toBe(false);
  });

  it("when the mode resolves flat", async () => {
    mockEnv({ search: "?view=classic" });
    root.setAttribute("data-fly-pending", "");
    render(
      <FlyThroughLoader>
        <p>flat</p>
      </FlyThroughLoader>,
    );
    await flush();
    expect(root.hasAttribute("data-fly-pending")).toBe(false);
  });
});
