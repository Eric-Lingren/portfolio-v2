import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import type { Testimonial } from "@/content/testimonials";
import { Testimonials } from "./Testimonials";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT_PROPS = ["display", "position", "flex-direction", "padding-top", "min-height", "width", "gap"];
const geometry = (el: Element) =>
  LAYOUT_PROPS.map((p) => `${p}:${getComputedStyle(el).getPropertyValue(p)}`).join(";");

afterEach(() => document.head.querySelectorAll("style").forEach((s) => s.remove()));

const LABELS = [
  "Staff engineer, Standard Metrics",
  "Product manager, Standard Metrics",
  "Designer, Standard Metrics",
  "Engineering manager, Standard Metrics",
  "Lead developer, InsideOut Development",
  "Student, teaching",
];
const fixture = (n: number): Testimonial[] =>
  LABELS.slice(0, n).map((roleLabel, i) => ({
    id: `t${i}`,
    image: `/testimonials/t${i}.png`,
    roleLabel,
    alt: `Redacted praise from a ${roleLabel}`,
  }));

describe("Testimonials", () => {
  it.each([4, 5, 6])("renders %i uniform cards with role labels only", (n) => {
    const { container } = render(<Testimonials manifest={fixture(n)} />);
    const cards = [...container.querySelectorAll("[data-testimonial]")];
    expect(cards).toHaveLength(n);
    expect(new Set(cards.map((c) => c.className)).size).toBe(1);
    expect(cards.map((c) => c.querySelector(".testimonial-role")!.textContent)).toEqual(LABELS.slice(0, n));
    expect(container.querySelector("[data-testimonial-placeholder]")).toBeNull();
  });

  it("gives every image alt text and lazy loading", () => {
    const { container } = render(<Testimonials manifest={fixture(6)} />);
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs).toHaveLength(6);
    for (const img of imgs) {
      expect(img.getAttribute("alt")?.trim()).toBeTruthy();
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });

  it("renders marked placeholders for an empty manifest", () => {
    const { container } = render(<Testimonials manifest={[]} />);
    expect(container.querySelectorAll("[data-testimonial-placeholder]").length).toBeGreaterThanOrEqual(4);
    expect(container.textContent).toContain("Placeholder");
    expect(container.querySelector("img")).toBeNull();
  });

  it("keeps identical geometry in both layers", () => {
    const style = document.createElement("style");
    style.textContent = css + readFileSync(join(process.cwd(), "src/components/panels/testimonials.css"), "utf8");
    document.head.appendChild(style);
    for (const manifest of [fixture(5), []]) {
      const { container, unmount } = render(<Testimonials layers="both" manifest={manifest} />);
      const sketch = container.querySelector('[data-layer="sketch"]')!;
      const polished = container.querySelector('[data-layer="polished"]')!;
      expect(geometry(sketch)).toBe(geometry(polished));
      for (const sel of [".testimonials", ".testimonials-grid", ".testimonial-card"]) {
        expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
      }
      unmount();
    }
  });
});
