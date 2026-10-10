import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { PILLARS } from "@/content/positioning";
import { Positioning } from "./Positioning";

const DENY = [
  "react", "next.js", "nextjs", "typescript", "javascript", "node", "graphql", "postgres", "python",
  "tailwind", "css", "html", "redux", "vue", "angular", "docker", "aws", "claude", "mdx", "vite",
];

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8") +
  readFileSync(join(process.cwd(), "src/components/panels/positioning.css"), "utf8");

const PROPS = ["display", "position", "padding-top", "padding-left", "min-height", "height", "width", "gap",
  "border-top-width", "border-left-width", "grid-template-columns", "flex-direction"];
function geometry(el: Element) {
  const cs = getComputedStyle(el);
  return PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
}

describe("Positioning", () => {
  it("has exactly 3 pillars with the given titles", () => {
    expect(PILLARS.map((p) => p.title)).toEqual(["Frontend craft", "Full-stack delivery", "AI-native workflow"]);
    const { container } = render(<Positioning />);
    expect(container.querySelectorAll(".pillar")).toHaveLength(3);
  });

  it("gives each pillar one sentence and one proof point", () => {
    const { container } = render(<Positioning />);
    for (const el of container.querySelectorAll(".pillar")) {
      expect(el.querySelectorAll(".pillar-sentence")).toHaveLength(1);
      expect(el.querySelectorAll(".pillar-proof")).toHaveLength(1);
    }
    for (const p of PILLARS) {
      expect(p.sentence.match(/[.!?]/g)).toHaveLength(1);
      expect(p.sentence.endsWith(".")).toBe(true);
      expect(p.proof.text.length).toBeGreaterThan(0);
    }
  });

  it("proof links point to existing case studies", () => {
    const links = PILLARS.flatMap((p) => (p.proof.href ? [p.proof.href] : []));
    expect(links).toEqual(expect.arrayContaining(["/work/ai-toolkit"]));
    for (const href of links) {
      const slug = href.replace("/work/", "");
      expect(href.startsWith("/work/")).toBe(true);
      expect(existsSync(join(process.cwd(), "content/work", `${slug}.mdx`))).toBe(true);
    }
  });

  it("names no technologies or frameworks", () => {
    const { container } = render(<Positioning />);
    const text = (container.textContent ?? "").toLowerCase();
    for (const word of DENY) expect(text).not.toMatch(new RegExp(`\\b${word.replace(".", "\\.")}\\b`));
  });

  it("flags unconfirmed copy for content:check without rendering the markers", () => {
    const { container } = render(<Positioning />);
    expect(container.textContent).not.toContain("[ERIC");
    const flags = PILLARS.flatMap((p) => p.review);
    expect(flags.filter((f) => f === "[ERIC: confirm or replace this pillar sentence]")).toHaveLength(3);
    expect(flags).toContain("[ERIC: confirm Metrics Tab v2 credit]");
  });

  it("keeps layout parity between sketch and polished layers", () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const { container } = render(<Positioning layers="both" />);
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    for (const sel of [".positioning", ".pillar", ".pillar-thumb", ".pillar-title", ".pillar-sentence", ".pillar-proof"]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
    style.remove();
  });
});
