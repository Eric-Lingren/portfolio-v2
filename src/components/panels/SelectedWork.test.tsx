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

  it("renders lazy 568x284 thumbs and a role=list grid when every thumb is present", () => {
    const all = (cards as WorkCard[]).map((c) => ({ ...c, hasThumbnail: true }));
    const { container } = render(<SelectedWork items={all} />);
    expect(container.querySelector("ul.work-grid")).toHaveAttribute("role", "list");
    const links = Array.from(container.querySelectorAll("a.work-card"));
    expect(links.map((a) => a.getAttribute("data-card"))).toEqual(SLUGS);
    const imgs = Array.from(container.querySelectorAll("img.work-thumb-real"));
    expect(imgs).toHaveLength(5);
    for (const img of imgs) {
      expect(img).toHaveAttribute("width", "568");
      expect(img).toHaveAttribute("height", "284");
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
      expect(img).toHaveAttribute("alt", "");
    }
    expect(container.querySelectorAll(".work-thumb-missing")).toHaveLength(0);
  });

  it("points every card at /work/<slug>/thumb.webp", () => {
    for (const c of cards as WorkCard[]) expect(c.thumbnail).toBe(`/work/${c.slug}/thumb.webp`);
  });

  it("css has 3-across, a phone container rule for compact rows, and a 2-line outcome clamp", () => {
    expect(panelCss).toMatch(/\.work-item\s*{\s*flex:\s*0 0 calc\(\(100% - 2 \* var\(--block-gap\)\) \/ 3\)/);
    expect(panelCss).toMatch(/@container \(max-width: 559px\)[\s\S]*grid-template-columns: 7rem/);
    expect(panelCss).toMatch(/\.work-card-outcome\s*{[^}]*line-clamp: 2/);
    expect(panelCss).toMatch(/aspect-ratio: 2 \/ 1/);
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

  it("uses the shared card, which defines a visible touch active state and desktop-only hover", () => {
    const { container } = render(<SelectedWork />);
    expect(container.querySelector("a.work-card")?.classList.contains("card")).toBe(true);
    expect(css).toMatch(/@media \(hover: none\)[\s\S]*\.card:active[\s\S]*box-shadow/);
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.card:hover[\s\S]*var\(--accent-2\)/);
  });
});
