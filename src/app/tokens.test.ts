import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

function tokenValue(name: string): string | undefined {
  const re = new RegExp(`${name.replace(/-/g, "\\-")}\\s*:\\s*([^;]+);`);
  return re.exec(css)?.[1].trim();
}

const EXPECTED_TOKENS: Record<string, string> = {
  "--po-bg": "#0c0a0e",
  "--po-surface": "#111827",
  "--po-ink": "#f9fafb",
  "--po-muted": "#9ca3af",
  "--po-border": "#252a36",
  "--po-border-strong": "#3a4150",
  "--accent": "#ff5a36",
  "--accent-2": "#06b6d4",
  "--on-accent": "#0c0a0e",
  "--sk-bg": "#eff1f4",
  "--sk-line": "#1f2937",
  "--sk-ink": "#111827",
  "--sk-grid": "rgba(31, 41, 55, 0.11)",
  "--sk-hatch": "rgba(8, 145, 178, 0.28)",
  "--accent-ink-sk": "#bd4328",
};

const normalize = (v: string | undefined) => v?.replace(/\s+/g, "").toLowerCase();

describe("theme tokens", () => {
  it.each(Object.entries(EXPECTED_TOKENS))("defines %s with its exact value", (name, value) => {
    expect(normalize(tokenValue(name))).toBe(normalize(value));
  });

  it("declares the build-line utility with coral-to-cyan gradient and coral glow", () => {
    const block = /\.build-line\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(normalize(block)).toContain("linear-gradient(90deg,#ff5a36,#06b6d4)");
    expect(normalize(block)).toContain("box-shadow:0018px2px#ff5a36");
  });

  it("is dark only, with no theme toggle styles", () => {
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
    expect(css).not.toMatch(/data-theme/);
  });
});

describe("accent text contrast (WCAG AA, 4.5:1)", () => {
  const t = (name: string) => tokenValue(name) as string;
  const cases: Array<[string, string, string]> = [
    ["coral on obsidian", "--accent", "--po-bg"],
    ["coral on gray-900", "--accent", "--po-surface"],
    ["cyan on obsidian", "--accent-2", "--po-bg"],
    ["cyan on gray-900", "--accent-2", "--po-surface"],
    ["sketch coral ink on paper", "--accent-ink-sk", "--sk-bg"],
  ];

  it.each(cases)("%s", (_label, fg, bg) => {
    expect(contrastRatio(t(fg), t(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("computes known reference ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });
});

describe("fly-through hit-testing", () => {
  it("keeps .fly-world out of 3D hit-tests so the settled panel owns hover and cursor", () => {
    const block = /\.fly-world\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(normalize(block)).toContain("pointer-events:none");
  });
});
