import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { PILLARS } from "@/content/positioning";
import WORK_CARDS from "@/content/work-cards.json";
import { WhatIDo } from "./WhatIDo";

const DENY = [
  "react", "next.js", "nextjs", "typescript", "javascript", "node", "graphql", "postgres", "python",
  "tailwind", "css", "html", "redux", "vue", "angular", "docker", "aws", "claude", "mdx", "vite",
  // AI has its own section (AI toolkit); this one stays on how Eric works with people and problems.
  "ai", "agents",
];

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8") +
  readFileSync(join(process.cwd(), "src/components/panels/what-i-do.css"), "utf8");

const PROPS = ["display", "position", "padding-top", "padding-left", "min-height", "height", "width", "gap",
  "border-top-width", "border-left-width", "grid-template-columns", "flex-direction"];
function geometry(el: Element) {
  const cs = getComputedStyle(el);
  return PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
}

describe("WhatIDo", () => {
  it("has exactly 3 pillars with the given titles", () => {
    expect(PILLARS.map((p) => p.title)).toEqual(["Outcome Oriented", "Extreme Ownership", "Craftsmanship"]);
    const { container } = render(<WhatIDo />);
    expect(container.querySelectorAll(".pillar")).toHaveLength(3);
  });

  it("gives each pillar a short description and a one-sentence outcome", () => {
    const { container } = render(<WhatIDo />);
    for (const el of container.querySelectorAll(".pillar")) {
      expect(el.querySelectorAll(".pillar-sentence")).toHaveLength(1);
      expect(el.querySelectorAll(".pillar-outcome")).toHaveLength(1);
    }
    for (const p of PILLARS) {
      // Two short sentences are allowed when the rhythm reads better (card 2).
      expect(p.sentence.match(/[.!?]/g)!.length).toBeLessThanOrEqual(2);
      expect(p.outcome.match(/[.!?]/g)).toHaveLength(1);
      for (const line of [p.sentence, p.outcome]) expect(line.endsWith(".")).toBe(true);
    }
  });

  it("names no product, project or shipped result: those belong to Selected work and the resume", () => {
    const names = [
      ...WORK_CARDS.map((c) => c.title),
      "Metrics Tab", "KPI granularity", "Information Request", "AI toolkit", "auto-submit",
    ];
    for (const p of PILLARS) {
      for (const line of [p.title, p.sentence, p.outcome]) {
        for (const name of names) expect(line.toLowerCase()).not.toContain(name.toLowerCase());
        expect(line).not.toMatch(/\d/);
      }
    }
  });

  it("pillars are static cards with no links", () => {
    const { container } = render(<WhatIDo />);
    expect(container.querySelectorAll(".pillar")).toHaveLength(3);
    expect(container.querySelectorAll(".what-i-do a")).toHaveLength(0);
  });

  it("heads each pillar with its own decorative picture, hidden from assistive tech", () => {
    const { container } = render(<WhatIDo />);
    const pillars = [...container.querySelectorAll(".pillar")];
    expect(pillars.map((el) => el.getAttribute("data-viz"))).toEqual(["target", "board", "grid"]);
    for (const el of pillars) {
      const viz = el.querySelector(".viz")!;
      expect(viz).toHaveAttribute("aria-hidden", "true");
      expect(el.firstElementChild).toBe(viz);
    }
  });

  it("leaves the pillars unnumbered and labels what a company gets", () => {
    const { container } = render(<WhatIDo />);
    for (const t of container.querySelectorAll(".pillar-title")) expect(t.textContent).not.toMatch(/\d/);
    for (const el of container.querySelectorAll(".pillar-outcome")) {
      expect(el.querySelector(".pillar-outcome-label")?.textContent).toBe("What you get");
    }
  });

  it("names no technologies or frameworks", () => {
    const { container } = render(<WhatIDo />);
    const text = (container.textContent ?? "").toLowerCase();
    for (const word of DENY) expect(text).not.toMatch(new RegExp(`\\b${word.replace(".", "\\.")}\\b`));
  });

  it("flags unconfirmed copy for content:check without rendering the markers", () => {
    const { container } = render(<WhatIDo />);
    expect(container.textContent).not.toContain("[ERIC");
    const flags = PILLARS.flatMap((p) => p.review);
    // Every line has been picked or written by Eric, so nothing is left to sign off.
    expect(flags).toEqual([]);
  });

  it("keeps layout parity between sketch and polished layers", () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const { container } = render(<WhatIDo layers="both" />);
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    for (const sel of [
      ".what-i-do", ".pillar", ".pillar-title", ".pillar-sentence", ".pillar-outcome",
      ".viz", ".viz-chart", ".viz-bar", ".viz-target", ".viz-board", ".viz-col", ".viz-ghost", ".viz-ticket-track", ".viz-ticket", ".viz-grid", ".viz-cursor",
    ]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
    style.remove();
  });

  it("colours the cards from brand tokens only (coral, cyan, coral)", () => {
    const panelCss = readFileSync(join(process.cwd(), "src/components/panels/what-i-do.css"), "utf8");
    expect(panelCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    expect(panelCss).toMatch(/\.pillar \{[^}]*--pillar-accent: var\(--accent\);/);
    expect(panelCss).toMatch(/\.pillar\[data-viz="board"\] \{\s*--pillar-accent: var\(--accent-2\);/);
  });
});
