import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { attachLookAround } from "./look";
import { PANELS } from "./registry";

const dir = __dirname;
const read = (f: string) => readFileSync(join(dir, f), "utf8");

function fakeWindow(fine: boolean) {
  return {
    innerWidth: 1000,
    innerHeight: 800,
    matchMedia: vi.fn(() => ({ matches: fine }) as MediaQueryList),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

describe("registry", () => {
  it("has exactly 7 panels in seed order with the expected anchors", () => {
    expect(PANELS.map((p) => p.id)).toEqual([
      "hero",
      "what-i-do",
      "work",
      "ai-toolkit",
      "experience",
      "testimonials",
      "contact",
    ]);
  });
});

describe("input handling", () => {
  it("touch devices register no mousemove and no orientation/motion listeners", () => {
    const win = fakeWindow(false);
    attachLookAround(win as unknown as Window, () => {});
    expect(win.addEventListener).not.toHaveBeenCalled();
  });

  it("desktop registers only mousemove, and cleans it up", () => {
    const win = fakeWindow(true);
    const detach = attachLookAround(win as unknown as Window, () => {});
    expect(win.addEventListener.mock.calls.map((c) => c[0])).toEqual(["mousemove"]);
    detach();
    expect(win.removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });

  it("no fly-through source references deviceorientation or devicemotion", () => {
    for (const f of readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes(".test."))) {
      expect(read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")).not.toMatch(/deviceorientation|devicemotion/i);
    }
  });

  it("no layout reads inside scroll or resize handlers", () => {
    const src = read("FlyStage.tsx");
    expect(src).not.toMatch(/offsetHeight|offsetWidth|getBoundingClientRect|clientHeight|scrollHeight/);
  });
});

describe("initial payload", () => {
  it("initial HTML contains all 7 panel titles", () => {
    const html = renderToString(<Home />);
    for (const p of PANELS) expect(html).toContain(p.title === "Hero" ? "Lingren" : p.title);
  });

  it("the stage is only reachable through a dynamic import", () => {
    const stageImport = /from\s+["'][^"']*FlyStage["']/;
    expect(read("FlyThroughLoader.tsx")).toMatch(/import\(\s*["']\.\/FlyStage["']\s*\)/);
    expect(read("FlyThroughLoader.tsx")).not.toMatch(stageImport);
    expect(readFileSync(join(dir, "../../app/page.tsx"), "utf8")).not.toMatch(/FlyStage/);
    expect(read("registry.tsx")).not.toMatch(stageImport);
  });

  it("does not render the stage in the server HTML", () => {
    expect(renderToString(<Home />)).not.toContain("fly-stage");
  });
});
