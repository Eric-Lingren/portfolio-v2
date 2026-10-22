import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { getStudy } from "@/lib/work";
import cards from "@/content/work-cards.json";
// @ts-expect-error untyped script module
import { buildCards } from "../../../scripts/generate-work-cards.mjs";
import { SelectedWork, type WorkCard } from "./SelectedWork";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const panelCss = readFileSync(join(process.cwd(), "src/components/panels/selected-work.css"), "utf8");
const SLUGS = ["kpi-granularity", "investor-reports", "metrics-tab-v2", "frontend-platform", "render-performance"];

describe("SelectedWork", () => {
  it("renders exactly 5 cards in order, each linking to its route", () => {
    const { container } = render(<SelectedWork />);
    const links = Array.from(container.querySelectorAll("a.work-card"));
    expect(links.map((a) => a.getAttribute("data-card"))).toEqual(SLUGS);
    links.forEach((a, i) => expect(a).toHaveAttribute("href", `/work/${SLUGS[i]}`));
  });

  it("card data matches case study frontmatter and is in sync with the generator", () => {
    expect(cards).toEqual(buildCards());
    for (const c of cards as WorkCard[]) {
      const s = getStudy(c.slug)!;
      expect(c.title).toBe(s.title);
      expect(c.outcome).toBe(s.cardOutcome);
      expect(c.number).toBe(s.cardNumber);
    }
  });

  it("shows title, outcome and the number with its label", () => {
    render(<SelectedWork />);
    expect(screen.getByText("KPI Granularity for Information Requests")).toBeInTheDocument();
    const n = screen.getByText("20");
    expect(n.closest("a")).toHaveAttribute("href", "/work/investor-reports");
  });

  it("falls back to the outcome sentence when cardNumber is null", () => {
    const item: WorkCard = {
      slug: "x",
      title: "T",
      outcome: "Outcome sentence.",
      number: null,
      numberLabel: "",
      thumbnail: "/x.png",
      hasThumbnail: false,
    };
    const { container } = render(<SelectedWork items={[item]} />);
    expect(screen.getByText("Outcome sentence.")).toBeInTheDocument();
    expect(container.querySelector(".work-card-number")).toBeNull();
  });

  it("degrades to a neutral frame when the thumbnail file is missing", () => {
    const { container } = render(<SelectedWork />);
    const missing = (cards as WorkCard[]).filter((c) => !c.hasThumbnail).length;
    expect(container.querySelectorAll(".work-thumb-missing")).toHaveLength(missing);
    expect(container.querySelectorAll("img")).toHaveLength(SLUGS.length - missing);
  });

  it("shows no PR, file or line counts", () => {
    const { container } = render(<SelectedWork />);
    expect(container.textContent).not.toMatch(/\b\d+\s+(PRs?|files?|lines?)\b/i);
  });

  it("keeps layout identical across layers", () => {
    const style = document.createElement("style");
    style.textContent = css + panelCss;
    document.head.appendChild(style);
    const { container } = render(<SelectedWork layers="both" />);
    const sk = container.querySelector('[data-layer="sketch"]')!;
    const po = container.querySelector('[data-layer="polished"]')!;
    const props = ["display", "position", "padding-top", "padding-left", "gap", "border-top-width"];
    const geo = (el: Element) => props.map((p) => getComputedStyle(el).getPropertyValue(p)).join(";");
    for (const sel of [".work", ".work-grid", ".work-card", ".work-thumb", ".work-thumb-sketch", ".work-thumb-real"]) {
      expect(geo(sk.querySelector(sel)!)).toBe(geo(po.querySelector(sel)!));
    }
    style.remove();
  });

  it("defines a visible touch active state and desktop-only hover", () => {
    expect(panelCss).toMatch(/@media \(hover: none\)[\s\S]*\.work-card:active[\s\S]*box-shadow/);
    expect(panelCss).toMatch(
      /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.work-card:hover[\s\S]*var\(--accent-2\)/,
    );
  });
});
