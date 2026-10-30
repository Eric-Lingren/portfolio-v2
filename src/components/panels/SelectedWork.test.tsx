import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { getStudy } from "@/lib/work";
import cards from "@/content/work-cards.json";
// @ts-expect-error untyped script module
import { buildCards } from "../../../scripts/generate-work-cards.mjs";
import { SelectedWork, type WorkCard } from "./SelectedWork";
import { WorkThumbFilters } from "./WorkThumbFilters";

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

  it("layers a hidden tinted copy over each thumb, with the tone and srcset from the image build", () => {
    const { container } = render(<SelectedWork />);
    for (const c of cards as WorkCard[]) {
      const card = container.querySelector(`a[data-card="${c.slug}"]`)!;
      const real = card.querySelector("img.work-thumb-real")!;
      const tint = card.querySelector("img.work-thumb-tint")!;
      expect(tint).toHaveAttribute("data-tone", c.thumbnailTone);
      expect(tint).toHaveAttribute("aria-hidden", "true");
      expect(tint.getAttribute("src")).toBe(real.getAttribute("src"));
      expect(tint.getAttribute("srcset")).toBe(real.getAttribute("srcset"));
      if (c.thumbnailSrcSet) {
        expect(real).toHaveAttribute("srcset", c.thumbnailSrcSet);
        expect(real).toHaveAttribute("sizes");
      } else {
        expect(real).not.toHaveAttribute("srcset");
      }
    }
    expect((cards as WorkCard[]).find((c) => c.slug === "render-performance")?.thumbnailTone).toBe("dark");
  });

  it("starts stage panels too tall for their box at the top padding, so the title clears the z tag", () => {
    expect(css).toMatch(/\.fly-panel \.panel-layer\s*{[^}]*justify-content: safe center/);
  });

  it("css tints thumbs in the polished layer and reveals color on hover and focus", () => {
    expect(panelCss).toMatch(/\.work-thumb-tint\[data-tone="light"\]\s*{\s*filter: url\(#work-thumb-tint-light\)/);
    expect(panelCss).toMatch(/\.work-thumb-tint\[data-tone="dark"\]\s*{\s*filter: url\(#work-thumb-tint-dark\)/);
    expect(panelCss).toMatch(/\.work-card:focus-visible \.work-thumb-tint\s*{\s*opacity: 0/);
    expect(panelCss).toMatch(/@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.work-card:hover \.work-thumb-tint\s*{\s*opacity: 0/);
    expect(panelCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.work-thumb-tint\s*{\s*transition: none/);
  });

  it("points every card at /work/<slug>/thumb.webp", () => {
    for (const c of cards as WorkCard[]) expect(c.thumbnail).toBe(`/work/${c.slug}/thumb.webp`);
  });

  it("css has 3-across, a phone container rule for compact rows, and a 3-line outcome clamp", () => {
    expect(panelCss).toMatch(/\.work-item\s*{\s*flex:\s*0 0 calc\(\(100% - 2 \* var\(--block-gap\)\) \/ 3\)/);
    expect(panelCss).toMatch(/@container \(max-width: 559px\)[\s\S]*grid-template-columns: 7rem/);
    expect(panelCss).toMatch(/\.work-card-outcome\s*{[^}]*line-clamp: 3/);
    expect(panelCss).toMatch(/aspect-ratio: 2 \/ 1/);
  });

  it("card data has a case study per card and is in sync with the generator", () => {
    expect(cards).toEqual(buildCards());
    for (const c of cards as WorkCard[]) expect(getStudy(c.slug)).toBeTruthy();
  });

  it("shows title, outcome and the number with its label", () => {
    render(<SelectedWork />);
    expect(screen.getByText("Requesting Metric Granularity")).toBeInTheDocument();
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
      thumbnailSrcSet: null,
      thumbnailTone: "light",
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
    expect(container.querySelectorAll("img.work-thumb-real")).toHaveLength(SLUGS.length - missing);
  });

  it("draws the real thumb as a wireframe on the sketch layer, and an image icon only where it is missing", () => {
    const items = (cards as WorkCard[]).map((c, i) => ({ ...c, hasThumbnail: i !== 0 }));
    const { container } = render(<SelectedWork items={items} />);
    const thumbs = Array.from(container.querySelectorAll(".work-thumb"));
    expect(thumbs).toHaveLength(SLUGS.length);
    thumbs.forEach((t, i) => {
      const sketch = t.querySelector(".work-thumb-sketch")!;
      expect(sketch).toHaveAttribute("aria-hidden", "true");
      expect(sketch.textContent).toBe("");
      if (i === 0) {
        expect(sketch).toHaveClass("sketch-image");
        expect(sketch.querySelector("svg.work-thumb-icon")).toHaveAttribute("aria-hidden", "true");
      } else {
        expect(sketch).not.toHaveClass("sketch-image");
        expect(sketch.querySelector("svg")).toBeNull();
        expect(t.querySelector("img.work-thumb-real")).not.toBeNull();
      }
    });
    expect(panelCss).toMatch(/\.panel-layer--sketch img\.work-thumb-real\s*{\s*filter: url\(#work-thumb-wire\)/);
  });

  it("defines the wireframe filter next to the duotones, as dark lines on a transparent ground", () => {
    const { container } = render(<WorkThumbFilters />);
    const wire = container.querySelector("filter#work-thumb-wire")!;
    expect(wire).not.toBeNull();
    expect(wire.querySelectorAll("feConvolveMatrix")).toHaveLength(2);
    expect(container.querySelector("filter#work-thumb-tint-light")).not.toBeNull();
    expect(container.querySelector("filter#work-thumb-tint-dark")).not.toBeNull();
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
