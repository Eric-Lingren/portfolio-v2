import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlatStack } from "./FlatStack";
import { FlyThroughLoader } from "./FlyThroughLoader";
import { FrameMonitor, MONITOR_CONFIG } from "./frame-monitor";
import { isFlat, perfDebugEnabled, resolveMode } from "./mode";

const stageLoaded = vi.fn();
vi.mock("./FlyStage", () => {
  stageLoaded();
  return { FlyStage: () => <div data-testid="fly-stage" /> };
});

describe("resolveMode", () => {
  const base = { search: "", reducedMotion: false, downgraded: false };
  it("defaults to interactive", () => {
    expect(resolveMode(base)).toBe("interactive");
    expect(isFlat("interactive")).toBe(false);
  });
  it("?view=classic is classic", () => {
    expect(resolveMode({ ...base, search: "?view=classic" })).toBe("classic");
  });
  it("reduced motion beats the default and ?view=classic", () => {
    expect(resolveMode({ ...base, reducedMotion: true })).toBe("reduced");
    expect(resolveMode({ ...base, reducedMotion: true, search: "?view=classic" })).toBe("reduced");
  });
  it("downgrade is flat", () => {
    expect(resolveMode({ ...base, downgraded: true })).toBe("downgraded");
    expect(isFlat("downgraded")).toBe(true);
  });
  it("detects ?debug=perf only when present", () => {
    expect(perfDebugEnabled("?debug=perf")).toBe(true);
    expect(perfDebugEnabled("")).toBe(false);
    expect(perfDebugEnabled("?debug=other")).toBe(false);
  });
});

describe("flat tree", () => {
  it("renders every panel polished-only with no sketch layer or 3D transforms", () => {
    const html = renderToString(<FlatStack />);
    expect(html).not.toContain('data-layer="sketch"');
    expect(html).toContain('data-layer="polished"');
    expect(html).not.toMatch(/translateZ|preserve-3d|perspective/);
    expect(html).not.toContain("fly-stage");
  });
});

function mockEnv(search: string, reduced: boolean) {
  window.history.pushState({}, "", `/${search}`);
  window.matchMedia = vi.fn((q: string) => ({
    matches: reduced && q.includes("reduced-motion"),
  })) as unknown as typeof window.matchMedia;
}

async function flushFrames() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
}

describe("FlyThroughLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "performance"] });
    stageLoaded.mockClear();
    vi.resetModules();
  });
  afterEach(() => {
    vi.useRealTimers();
    window.history.pushState({}, "", "/");
  });

  it("does not request the fly-through chunk in Classic mode", async () => {
    mockEnv("?view=classic", false);
    render(
      <FlyThroughLoader>
        <p>flat</p>
      </FlyThroughLoader>,
    );
    await flushFrames();
    expect(stageLoaded).not.toHaveBeenCalled();
    expect(screen.getByText("flat")).toBeInTheDocument();
  });

  it("does not request the fly-through chunk with reduced motion", async () => {
    mockEnv("", true);
    render(
      <FlyThroughLoader>
        <p>flat</p>
      </FlyThroughLoader>,
    );
    await flushFrames();
    expect(stageLoaded).not.toHaveBeenCalled();
  });

  it("requests the chunk by default and swaps the stage in", async () => {
    mockEnv("", false);
    render(
      <FlyThroughLoader>
        <p>flat</p>
      </FlyThroughLoader>,
    );
    await flushFrames();
    expect(stageLoaded).toHaveBeenCalled();
    expect(screen.getByTestId("fly-stage")).toBeInTheDocument();
  });

  it("shows the perf overlay only with ?debug=perf", async () => {
    mockEnv("", false);
    const a = render(<FlyThroughLoader>x</FlyThroughLoader>);
    await flushFrames();
    expect(screen.queryByTestId("perf-overlay")).toBeNull();
    a.unmount();
    mockEnv("?debug=perf&view=classic", false);
    render(<FlyThroughLoader>x</FlyThroughLoader>);
    await flushFrames();
    expect(screen.getByTestId("perf-overlay")).toHaveTextContent(/fps/);
  });
});

describe("FrameMonitor", () => {
  const feed = (m: FrameMonitor, ms: number, n: number) => {
    for (let i = 0; i < n; i++) m.push(ms);
  };
  const warm = MONITOR_CONFIG.warmupFrames;
  const win = MONITOR_CONFIG.windowFrames;

  it("good frame rate stays interactive", () => {
    const m = new FrameMonitor();
    feed(m, 16.7, warm + win * 3);
    expect(m.downgraded).toBe(false);
  });

  it("sustained bad frames downgrade", () => {
    const m = new FrameMonitor();
    feed(m, 60, warm + win);
    expect(m.downgraded).toBe(true);
  });

  it("a single spike does not downgrade", () => {
    const m = new FrameMonitor();
    feed(m, 16.7, warm + 10);
    m.push(900);
    m.push(300);
    feed(m, 16.7, win * 2);
    expect(m.downgraded).toBe(false);
  });

  it("ignores slow frames during warmup", () => {
    const m = new FrameMonitor();
    feed(m, 200, warm);
    feed(m, 16.7, win * 2);
    expect(m.downgraded).toBe(false);
  });

  it("reports fps and frame time", () => {
    const m = new FrameMonitor();
    feed(m, 20, warm);
    expect(m.push(20)).toEqual({ frameMs: 20, fps: 50 });
  });
});
